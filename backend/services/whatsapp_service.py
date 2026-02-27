import requests
import os
from models import db, DeliveryHistory, Config

class WhatsAppService:
    """WhatsApp automation service using whatsapp-web.js or equivalent"""

    def __init__(self, api_url=None):
        """Initialize with API endpoint or from configuration"""
        self.api_url = api_url or Config.WHATSAPP_API_URL
        self.timeout = 30

    def _format_number(self, number):
        """Formats phone number with country code (e.g., +911234567890)"""
        # Logic to ensure number ends with @c.us or proper WhatsApp format
        clean_num = "".join(filter(str.isdigit, number))
        return f"{clean_num}@c.us"

    def send_photo_message(self, recipient_number, message, photo_path, photo_id):
        """Sends text and photo via WhatsApp API"""
        try:
            chat_id = self._format_number(recipient_number)
            
            # Prepare payload for the automation handler
            payload = {
                'number': chat_id,
                'message': message,
                'photo_url': photo_path # Or base64 encoded image string
            }

            response = requests.post(
                f"{self.api_url}/send-photo",
                json=payload,
                timeout=self.timeout
            )

            if response.status_code == 200:
                # Log success to DeliveryHistory
                self._log_delivery(photo_id, recipient_number, 'WhatsApp', 'Sent')
                return {"status": "success", "message_id": response.json().get('id')}
            else:
                self._log_delivery(photo_id, recipient_number, 'WhatsApp', 'Failed')
                return {"status": "error", "message": "API rejection"}

        except Exception as e:
            # Retry mechanism or error reporting
            self._log_delivery(photo_id, recipient_number, 'WhatsApp', 'Error')
            return {"status": "error", "message": str(e)}

    def _log_delivery(self, photo_id, recipient, type, status):
        """Updates the database with delivery status logs"""
        new_log = DeliveryHistory(
            photo_id=photo_id, 
            recipient=recipient, 
            delivery_type=type, 
            status=status
        )
        db.session.add(new_log)
        db.session.commit()