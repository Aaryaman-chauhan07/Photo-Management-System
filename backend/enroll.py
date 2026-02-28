from app import create_app, db
from models import Person, Face, Photo
from deepface import DeepFace
import os

app = create_app()

def enroll_person(name, image_path):
    """
    Creates a new Person and links their AI embedding to the Person table.
    """
    with app.app_context():
        print(f"[*] Enrolling {name}...")
        
        # 1. Generate Embedding
        res = DeepFace.represent(img_path=image_path, model_name="VGG-Face")[0]
        embedding = res["embedding"]
        
        # 2. Create Person Entry
        new_person = Person(name=name)
        db.session.add(new_person)
        db.session.flush()
        
        # 3. Create a reference Face entry
        ref_face = Face(embedding=embedding, person_id=new_person.id, photo_id=None)
        db.session.add(ref_face)
        
        db.session.commit()
        print(f"[✔] Successfully enrolled {name} with ID: {new_person.id}")

if __name__ == "__main__":
    # Change these to your actual name and a path to a clear photo of your face
    enroll_person("Alice", "data/photos/alice_reference.jpg")