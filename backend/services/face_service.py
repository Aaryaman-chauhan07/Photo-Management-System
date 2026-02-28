import os
from deepface import DeepFace
from scipy.spatial.distance import cosine
from models import db, Face, Person

# Facenet512 requires a tighter threshold than VGG-Face (usually around 0.30)
MATCH_THRESHOLD = 0.30 

def detect_and_recognize(photo_id, image_path):
    """
    Activity 3.1: Uses MTCNN to detect faces and Facenet512 to generate embeddings.
    """
    try:
        print(f"[*] AI starting detection on: {image_path}")
        
        # Upgraded to Facenet512 and MTCNN as per Milestone 3 requirements
        results = DeepFace.represent(
            img_path=image_path, 
            model_name="Facenet512", 
            detector_backend="mtcnn", 
            enforce_detection=True # Forces it to actually look for a face
        )
        
        identity_names = []
        
        for res in results:
            embedding = res["embedding"]
            match_found = False
            
            # Compare against all enrolled persons in the database
            known_faces = Face.query.filter(Face.person_id.isnot(None)).all()
            for known in known_faces:
                # Using Cosine Similarity to find the closest match
                if cosine(embedding, known.embedding) < MATCH_THRESHOLD:
                    person = Person.query.get(known.person_id)
                    identity_names.append(person.name)
                    
                    # Link this new face to the identified person
                    new_face = Face(embedding=embedding, photo_id=photo_id, person_id=person.id)
                    db.session.add(new_face)
                    match_found = True
                    break
            
            if not match_found:
                # Face detected, but not recognized in the database
                new_face = Face(embedding=embedding, photo_id=photo_id, person_id=None)
                db.session.add(new_face)
                identity_names.append("Unknown Face")

        db.session.commit()
        final_result = ", ".join(identity_names)
        print(f"[+] AI Detection Success: {final_result}")
        return final_result

    except ValueError:
        print("[-] AI Error: No face detected in the image.")
        return "No Face Detected"
    except Exception as e:
        print(f"[-] AI Critical Error: {str(e)}")
        return "Detection Error"