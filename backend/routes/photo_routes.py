from flask import Blueprint, request, jsonify, send_from_directory
from models import db, Photo, Face, Person
from ai_utils import extract_faces_from_image
import os, json

photo_bp = Blueprint('photos', __name__)
UPLOAD_FOLDER = 'uploads'

@photo_bp.route('/list', methods=['GET'])
def get_photos():
    """This stops the 404 error on the gallery."""
    photos = Photo.query.all()
    return jsonify([{"id": p.id, "url": f"/api/photos/view/{p.filename}", "people": [f.person.name for f in p.faces if f.person]} for p in photos]), 200

@photo_bp.route('/upload', methods=['POST'])
def upload_photo():
    file = request.files.get('file')
    if not file: return jsonify({"msg": "No file"}), 400
    
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
        
    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)

    new_photo = Photo(filename=file.filename, filepath=path)
    db.session.add(new_photo)
    db.session.commit()

    faces = extract_faces_from_image(path)
    for f in faces:
        db.session.add(Face(photo_id=new_photo.id, bounding_box=json.dumps(f.get('facial_area', {}))))
    db.session.commit()
    return jsonify({"msg": "Success", "faces": len(faces)}), 201

@photo_bp.route('/view/<filename>')
def view_photo(filename):
    return send_from_directory(os.path.abspath(UPLOAD_FOLDER), filename)