import os
import numpy as np
import json
from deepface import DeepFace
from models import db, Face, Person, Photo

# Advanced Configuration
MODEL_NAME = "Facenet512" 
DETECTOR_BACKEND = "retinaface"
ALIGN_BACKEND = "mtcnn"

def detect_and_recognize(photo_id, image_path):
    print(f"--- Processing Photo ID: {photo_id} ---")
    try:
        results = DeepFace.represent(
            img_path=image_path,
            model_name="Facenet512",
            detector_backend="retinaface",
            align=True,
            enforce_detection=False
        )

        print(f"AI found {len(results)} faces.")

        for res in results:
            embedding = res["embedding"]
            matched_person_id = find_match(embedding)
            print(f"Match found: {matched_person_id}") # This will tell us if it recognized someone
            
            new_face = Face(
                photo_id=photo_id,
                embedding=json.dumps(embedding), 
                person_id=matched_person_id
            )
            db.session.add(new_face)
        
        db.session.commit()
        return f"Detected {len(results)} face(s)"
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        return "Recognition failed"

def find_match(new_embedding, threshold=0.4):
    """
    Compares vectors using Cosine Similarity (1 - Cosine Distance).
    """
    all_faces = Face.query.filter(Face.person_id != None).all()
    
    best_match = None
    min_dist = 1.0 

    for face in all_faces:
        if not face.embedding: continue
        
        stored_vec = np.array(json.loads(face.embedding))
        new_vec = np.array(new_embedding)
        
        # Calculate Cosine Distance
        dist = 1 - (np.dot(new_vec, stored_vec) / (np.linalg.norm(new_vec) * np.linalg.norm(stored_vec)))
        
        if dist < threshold and dist < min_dist:
            min_dist = dist
            best_match = face.person_id
            
    return best_match