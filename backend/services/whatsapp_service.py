import os
import requests

def send_whatsapp_alert(phone_number, message):
    """
    Activity 3.4: WhatsApp Web API integration for automated delivery.
    """
    # Points to your local Node.js WhatsApp bridge (usually port 3001)
    whatsapp_url = os.getenv("WHATSAPP_API_URL", "http://localhost:3001/send")
    
    try:
        payload = {"phone": phone_number, "message": message}
        response = requests.post(whatsapp_url, json=payload)
        
        if response.status_code == 200:
            return True, "WhatsApp alert sent successfully!"
        return False, f"Bridge returned status: {response.status_code}"
    except Exception as e:
        print(f"WhatsApp delivery error: {e}")
        return False, "Failed to connect to WhatsApp bridge."