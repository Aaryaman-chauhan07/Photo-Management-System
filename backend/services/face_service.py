import os
import pickle
from deepface import DeepFace
import numpy as np

class FaceRecognitionService:
    """Activity 3.1: Face detection and recognition using DeepFace"""

    def __init__(self):
        # Configure the pipeline models as per Activity 3.1
        self.model_name = "Facenet512" 
        self.detector_backend = "retinaface"
        self.align_model = "mtcnn" # For alignment and landmark extraction

    def process_photo(self, image_path):
        """
        Detects, aligns (MTCNN), and encodes (Facenet512) facial features.
       
        """
        try:
            # 1. Detect and Align using RetinaFace and MTCNN
            faces = DeepFace.extract_faces(
                img_path=image_path,
                detector_backend=self.detector_backend,
                align=True,
                enforce_detection=False
            )

            # 2. Generate 512-dimensional numerical vectors (Embeddings)
            embeddings = DeepFace.represent(
                img_path=image_path,
                model_name=self.model_name,
                detector_backend=self.detector_backend,
                enforce_detection=False
            )

            return faces, embeddings
        except Exception as e:
            print(f"DeepFace Pipeline Error: {e}")
            return [], []