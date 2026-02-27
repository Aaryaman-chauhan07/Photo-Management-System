import os
import json
from deepface import DeepFace
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_faces_from_image(img_path):
    """Detects faces using RetinaFace."""
    try:
        faces = DeepFace.extract_faces(img_path=img_path, detector_backend='retinaface', enforce_detection=False)
        return faces
    except Exception as e:
        print(f"AI Detection Error: {e}")
        return []

def get_chat_response(user_query, context=""):
    """Determines user intent (Search, Email, or Chat)."""
    try:
        system_prompt = (
            "You are Drishyamitra Assistant. Reply ONLY in raw JSON. "
            "1. Search: {'action': 'search', 'person': 'Name'} "
            "2. Email: {'action': 'send_email', 'email': 'address', 'message': 'text'} "
            "3. Chat: {'action': 'chat', 'message': 'text'}"
        )
        completion = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": f"Context: {context}\nQuery: {user_query}"}],
            model="mixtral-8x7b-32768",
            temperature=0.1
        )
        return json.loads(completion.choices[0].message.content.strip())
    except Exception as e:
        return {"action": "chat", "message": f"AI Error: {str(e)}"}