import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from flask import Flask, request, jsonify, send_from_directory
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Models and Services
from models import db, User, Photo, Face, Person, DeliveryHistory
from services.face_service import detect_and_recognize
from services.chat_service import process_chat_query
from services.gmail_service import send_photo_via_gmail

def create_app():
    app = Flask(__name__)
    
    # Activity 4.1: Support credentials for React frontend communication
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Configuration
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'drishyamitra.db')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'ibm-secret-2026')
    app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'data', 'photos')
    
    # Ensure the upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    bcrypt = Bcrypt(app)
    jwt = JWTManager(app)

    # --- ROUTES ---

    @app.route('/data/photos/<path:filename>')
    def serve_photos(filename):
        # Activity 2.4: Serves local photo files to the public Ngrok tunnel
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/api/auth/signup', methods=['POST'])
    def signup():
        data = request.json
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({"message": "User already exists"}), 400
            
        hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_user = User(username=data.get('username'), email=data['email'], password=hashed_pw)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Success"}), 201

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.json
        user = User.query.filter_by(email=data.get('email')).first()
        if user and bcrypt.check_password_hash(user.password, data.get('password')):
            token = create_access_token(identity=str(user.id))
            return jsonify({"token": token, "username": user.username}), 200
        return jsonify({"message": "Invalid Credentials"}), 401

    @app.route('/api/photos/upload', methods=['POST'])
    @jwt_required()
    def upload():
        user_id = int(get_jwt_identity())
        file = request.files.get('file')
        if not file:
            return jsonify({"message": "No file uploaded"}), 400
            
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        new_photo = Photo(url=f"data/photos/{filename}", user_id=user_id)
        db.session.add(new_photo)
        db.session.flush()

        # Activity 3.1: Face detection and recognition logic
        detection_result = detect_and_recognize(new_photo.id, filepath)

        # Activity 3.5: Log activity to database
        log = DeliveryHistory(activity_type=f"Recognition: {detection_result}", photo_id=new_photo.id)
        db.session.add(log)
        db.session.commit()
        
        return jsonify({"message": detection_result}), 201

    @app.route('/api/photos/list', methods=['GET'])
    @jwt_required()
    def list_photos():
        user_id = int(get_jwt_identity())
        photos = Photo.query.filter_by(user_id=user_id).order_by(Photo.timestamp.desc()).all()
        results = []
        for p in photos:
            identity = "Unknown"
            face_rec = Face.query.filter_by(photo_id=p.id).first()
            if face_rec and face_rec.person_identity:
                identity = face_rec.person_identity.name
            elif face_rec and not face_rec.person_identity:
                identity = "Unknown Face"
            elif not face_rec:
                identity = "No Face Detected"
                
            results.append({"id": p.id, "url": p.url, "identity": identity})
        return jsonify(results), 200

    @app.route('/api/photos/<int:photo_id>', methods=['DELETE'])
    @jwt_required()
    def delete_photo(photo_id):
        # FIX: Cleanup related records first to avoid Foreign Key errors
        user_id = int(get_jwt_identity())
        photo = Photo.query.filter_by(id=photo_id, user_id=user_id).first()
        
        if photo:
            Face.query.filter_by(photo_id=photo_id).delete()
            DeliveryHistory.query.filter_by(photo_id=photo_id).delete()
            db.session.delete(photo)
            db.session.commit()
            return jsonify({"message": "Deleted"}), 200
                
        return jsonify({"message": "Not found"}), 404

    @app.route('/api/history', methods=['GET'])
    @jwt_required()
    def get_history():
        # Activity 3.5: Fetch logs for the Delivery History dashboard
        user_id = int(get_jwt_identity())
        logs = db.session.query(DeliveryHistory).join(Photo).filter(Photo.user_id == user_id).order_by(DeliveryHistory.timestamp.desc()).all()
        return jsonify([{
            "id": l.id, "type": l.activity_type, "status": l.status, 
            "time": l.timestamp.strftime("%Y-%m-%d %H:%M")
        } for l in logs]), 200

    @app.route('/api/photos/<int:photo_id>/label', methods=['POST'])
    @jwt_required()
    def label_photo(photo_id):
        # FIX: Ensure Face record exists before labeling
        user_id = int(get_jwt_identity())
        new_name = request.json.get('name')

        if not new_name:
            return jsonify({"message": "Name is required"}), 400

        photo = Photo.query.filter_by(id=photo_id, user_id=user_id).first()
        if not photo:
            return jsonify({"message": "Photo not found"}), 404

        face = Face.query.filter_by(photo_id=photo.id).first()
        if not face:
            # Create a missing face record if necessary
            face = Face(photo_id=photo.id)
            db.session.add(face)
            db.session.flush()

        person = Person.query.filter(Person.name.ilike(new_name)).first()
        if not person:
            person = Person(name=new_name)
            db.session.add(person)
            db.session.flush()

        face.person_id = person.id
        db.session.commit()
        return jsonify({"message": f"Successfully labeled as {new_name}"}), 200

    @app.route('/api/chat', methods=['POST'])
    @jwt_required()
    def chat():
        user_id = int(get_jwt_identity())
        user_message = request.json.get('message')
        
        # Activity 3.2: AI NLU parsing via Groq
        intent = process_chat_query(user_message)
        action = intent.get("action")
        
        # Activity 3.4: WhatsApp Bridge Logic
        if action == "send_via_whatsapp":
            target_name = intent.get("name")
            target_phone = intent.get("phone")
            
            if not target_name or not target_phone:
                return jsonify({"reply": "I need both a name and a phone number."}), 200
            
            clean_phone = "".join(filter(lambda x: x.isdigit() or x == '+', target_phone)).replace(" ", "")
            person = Person.query.filter(Person.name.ilike(f"%{target_name}%")).first()
            
            if not person:
                return jsonify({"reply": f"No one named {target_name} found."}), 200
                
            photo = Photo.query.join(Face).filter(Face.person_id == person.id, Photo.user_id == user_id).first()
            if not photo:
                return jsonify({"reply": f"No photos of {target_name} found."}), 200

            # CRITICAL: Use the Public Ngrok URL for Twilio
            public_url = os.getenv("PUBLIC_URL", "http://localhost:5000").rstrip('/')
            full_media_url = f"{public_url}/{photo.url}"

            bridge_url = "http://localhost:6000/api/whatsapp"
            payload = {
                "phone": clean_phone,
                "message": f"Drishyamitra Alert: Photo of {target_name} identified.",
                "mediaUrl": full_media_url
            }
            
            try:
                response = requests.post(bridge_url, json=payload, timeout=5)
                if response.status_code == 200:
                    db.session.add(DeliveryHistory(activity_type=f"WhatsApp sent to {clean_phone}", photo_id=photo.id))
                    db.session.commit()
                    return jsonify({"reply": f"[SUCCESS] Forwarded to WhatsApp Bridge for {target_name}!"}), 200
            except:
                return jsonify({"reply": "WhatsApp Bridge Error: Could not reach port 6000."}), 200

        # Activity 3.3: Gmail Integration
        elif action == "send_via_gmail":
            target_name = intent.get("name")
            target_email = intent.get("email")
            
            person = Person.query.filter(Person.name.ilike(f"%{target_name}%")).first()
            if person:
                faces = Face.query.filter_by(person_id=person.id).all()
                photo_ids = [face.photo_id for face in faces]
                photos = Photo.query.filter(Photo.id.in_(photo_ids), Photo.user_id==user_id).all()
                
                if photos:
                    # FIX: Use absolute paths for Gmail attachments
                    photo_paths = [os.path.join(app.config['UPLOAD_FOLDER'], os.path.basename(p.url)) for p in photos]
                    success, msg = send_photo_via_gmail(target_email, photo_paths)
                    
                    if success:
                        db.session.add(DeliveryHistory(activity_type=f"Gmail sent to {target_email}", photo_id=photos[0].id))
                        db.session.commit()
                        return jsonify({"reply": f"[SUCCESS] Sent {len(photos)} photos to {target_email}!"}), 200
            
            return jsonify({"reply": f"Could not complete Gmail request for {target_name}."}), 200

        return jsonify({"reply": intent.get("message", "I didn't quite catch that.")}), 200

    # Activity 2.3: Ensure database schema is created
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)