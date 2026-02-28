import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import datetime

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Activity 4.5: Enables handshake with React

# --- 1. CONFIGURATION (Fixes image_8de581.png) ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'drishyamitra.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'ibm-drishyamitra-secret-2026'
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create upload folder if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Initialize Extensions (Fixes image_8de99d.png)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- 2. DATABASE MODELS ---

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(200), nullable=False)
    identity = db.Column(db.String(100), default='Unknown')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class DeliveryLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipient = db.Column(db.String(100))
    type = db.Column(db.String(50)) # WhatsApp or Email
    status = db.Column(db.String(50)) # Sent or Failed
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Create Database tables
with app.app_context():
    db.create_all()

# --- 3. AUTHENTICATION ROUTES (Activity 2.5) ---

# --- 4. ROUTES ---
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    try:
        # 1. Explicitly check if the email is taken
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"message": "That email is already registered."}), 400
            
        # 2. Explicitly check if the username is taken
        if User.query.filter_by(username=data.get('username')).first():
            return jsonify({"message": "That username is already taken. Try another."}), 400

        # 3. If both are new, create the user
        hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_user = User(username=data.get('username'), email=data['email'], password=hashed_pw)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Success"}), 201

    except Exception as e:
        db.session.rollback() # Protect the database from locking up
        return jsonify({"message": f"Server Error: {str(e)}"}), 500
# Activity 2.5: Login Route
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        token = create_access_token(identity=user.id)
        return jsonify({"token": token, "username": user.username})
    return jsonify({"message": "Invalid credentials"}), 401

# --- 4. PHOTO & DETECTION ROUTES ---

@app.route('/api/photos/upload', methods=['POST'])
def upload_photo():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    
    file = request.files['file']
    filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    # Activity 3.1: Trigger DeepFace Processing (Mocked for speed)
    new_photo = Photo(url=f"/uploads/{filename}", identity="Pramodh") 
    db.session.add(new_photo)
    db.session.commit()
    
    return jsonify({"message": "File uploaded and analyzed", "url": new_photo.url}), 201

@app.route('/api/photos/list', methods=['GET'])
def list_photos():
    photos = Photo.query.order_by(Photo.timestamp.desc()).all()
    return jsonify([{
        "id": p.id, 
        "url": p.url, 
        "identity": p.identity, 
        "timestamp": p.timestamp.isoformat()
    } for p in photos])

@app.route('/api/photos/identities', methods=['GET'])
def get_identities():
    # Activity 4.4: Identity Center Logic
    results = db.session.query(Photo.identity, db.func.count(Photo.id)).group_by(Photo.identity).all()
    return jsonify([{"name": r[0], "count": r[1]} for r in results])

# --- 5. AI CHAT & LOGS ---

@app.route('/api/chat/ask', methods=['POST'])
def ask_ai():
    # Activity 4.3: AI Assistant logic (Groq link)
    query = request.json.get('query', '')
    # Placeholder for Groq API call logic
    return jsonify({"response": f"I've analyzed your logs. Found 3 detections of {query}."})

@app.route('/api/delivery/history', methods=['GET'])
def delivery_history():
    logs = DeliveryLog.query.order_by(DeliveryLog.timestamp.desc()).all()
    return jsonify([{
        "id": l.id, "recipient": l.recipient, "type": l.type, 
        "status": l.status, "timestamp": l.timestamp.isoformat()
    } for l in logs])

# Serving Uploaded Files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(port=5000, debug=True)