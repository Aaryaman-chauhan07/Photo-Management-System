from flask import Blueprint, request, jsonify
import groq
import os

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/ask', methods=['POST'])
def chat_assistant():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return jsonify({"response": "Activity 3.2 Error: No Groq API Key found in .env"}), 500
    
    client = groq.Client(api_key=api_key)
    # Activity 2.1: Chatbot functionality logic
    data = request.json
    completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": data.get('query')}]
    )
    return jsonify({"response": completion.choices[0].message.content})