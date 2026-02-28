import os
import json
from groq import Groq

def process_chat_query(user_message):
    """
    Activity 3.2: Develop AI Chat Assistant using Groq API for NLU.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        return {"action": "reply", "message": "Groq API key missing on server."}

    client = Groq(api_key=groq_api_key)

    system_prompt = """
    You are the Drishyamitra AI assistant. Analyze the user's message.
    If they ask to send photos, extract the 'name' and the 'email'.
    Respond strictly in JSON format:
    {"action": "send_via_gmail", "name": "extracted_name", "email": "extracted_email", "message": "Ready to send via Gmail."}
    If it's just a general chat, respond with:
    {"action": "reply", "message": "Your conversational response here."}
    """

    try:
        completion = client.chat.completions.create(
            # FIXED: Swapped to the new, supported Groq model
            model="llama-3.1-8b-instant", 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        response_data = json.loads(completion.choices[0].message.content)
        return response_data
    except Exception as e:
        print(f"Groq API Error: {e}")
        return {"action": "reply", "message": "I'm having trouble connecting to my AI core."}