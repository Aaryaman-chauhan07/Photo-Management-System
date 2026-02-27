from flask import Blueprint, request, jsonify
from deepface import DeepFace
from models import db, Photo, Face, Identity
import os

photo_bp = Blueprint('photos', __name__)

@photo_bp.route('/upload', methods=['POST'])
def upload_and_recognize():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    # Save the photo to your local upload folder
    upload_path = os.path.join('uploads', file.filename)
    file.save(upload_path)
    
    # Create the Photo record in the database
    new_photo = Photo(url=f"/uploads/{file.filename}")
    db.session.add(new_photo)
    db.session.commit()

    try:
        # Activity 3.1: DeepFace Face Detection
        results = DeepFace.represent(img_path=upload_path, model_name="Facenet512", enforce_detection=False)
        
        for face_data in results:
            # Create a new Face entry linked to the photo
            new_face = Face(photo_id=new_photo.id, embedding=str(face_data['embedding']))
            db.session.add(new_face)
        
        db.session.commit()
        return jsonify({"message": "Photo processed", "photo_id": new_photo.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@photo_bp.route('/list', methods=['GET']) # This makes it /api/photos/list
def get_photos():
    photos = Photo.query.all()
    return jsonify([p.to_dict() for p in photos])


photo_bp = Blueprint('photos', __name__)

@photo_bp.route('/list', methods=['GET']) # MUST be GET for browser check
def list_photos():
    photos = Photo.query.all()
    # Activity 2.1: Returning structured JSON data
    return jsonify([{"id": p.id, "url": p.url} for p in photos])