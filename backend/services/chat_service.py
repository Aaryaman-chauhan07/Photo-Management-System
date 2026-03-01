import os
import json
import requests
from groq import Groq

def process_chat_query(user_message):
    """
    Activity 3.2 & 3.4: Develop AI Chat Assistant and integrate WhatsApp Web API routing.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        return {"action": "reply", "message": "Groq API key missing on server."}

    client = Groq(api_key=groq_api_key)

    system_prompt = """
    You are the Drishyamitra AI assistant. Analyze the user's message.
    1. If they ask to send photos via email/Gmail, extract 'name' and 'email'.
       Respond strictly in JSON: {"action": "send_via_gmail", "name": "extracted_name", "email": "extracted_email", "message": "Ready to send via Gmail."}
    2. If they ask to send photos via WhatsApp, extract 'name' and 'phone'.
       Respond strictly in JSON: {"action": "send_via_whatsapp", "name": "extracted_name", "phone": "extracted_phone", "message": "Ready to send via WhatsApp."}
    3. For general chat, respond with: {"action": "reply", "message": "Your response here."}
    """

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant", 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        response_data = json.loads(completion.choices[0].message.content)

        # Activity 3.4: WhatsApp Bridge Integration Routing
        if response_data.get("action") == "send_via_whatsapp":
            bridge_url = "http://localhost:6000/api/whatsapp"
            try:
                # Attempt to ping the Node.js bridge
                requests.post(bridge_url, json=response_data, timeout=5)
            except requests.exceptions.RequestException as e:
                print(f"WhatsApp Bridge Error: {e}")
                response_data["message"] = "AI processed the request, but the WhatsApp bridge (port 6000) is unreachable."

        return response_data

    except Exception as e:
        print(f"Groq API Error: {e}")
        return {"action": "reply", "message": "I'm having trouble connecting to my AI core."}