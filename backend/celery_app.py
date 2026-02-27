from celery import Celery
import os

# Initialize Celery with Redis as the message broker
celery = Celery(
    'drishyamitra_tasks',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0')
)

@celery.task
def process_photo_async(photo_id, photo_path):
    """
    Background worker for batch face recognition and organization.
    """
    # Import inside task to avoid circular imports
    from services.face_service import FaceRecognitionService
    ai_service = FaceRecognitionService()
    
    # Process through the DeepFace pipeline (Activity 3.1)
    faces, embeddings = ai_service.process_photo(photo_path)
    
    # Categorize photos into person-specific directories based on results
    # ... logic for folder organization ...
    return f"Processed photo {photo_id}: {len(faces)} faces found."