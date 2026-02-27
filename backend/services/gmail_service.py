import os
import base64
import pickle
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from models import db, DeliveryHistory

# Define scopes for Gmail API
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

class GmailService:
    """Gmail API service for sending emails with attachments"""

    def __init__(self, credentials_path='credentials.json'):
        self.credentials_path = credentials_path
        self.service = self._get_service()

    def _get_service(self):
        """Authenticate and return Gmail service"""
        creds = None
        token_path = 'token.pickle'
        
        # Load token if exists
        if os.path.exists(token_path):
            with open(token_path, 'rb') as token:
                creds = pickle.load(token)
        
        # If no valid credentials, authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(self.credentials_path):
                    print("Error: credentials.json not found.")
                    return None
                flow = InstalledAppFlow.from_client_secrets_file(self.credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save credentials
            with open(token_path, 'wb') as token:
                pickle.dump(creds, token)
        
        return build('gmail', 'v1', credentials=creds) if creds else None

    def send_photo_email(self, recipient_email, photo_path, photo_id):
        """Composes and sends email with attachments"""
        if not self.service:
            return {"status": "error", "message": "Gmail Service not initialized."}

        try:
            # Create the message container
            message = MIMEMultipart()
            message['to'] = recipient_email
            message['subject'] = "Drishyamitra: Shared Photo Attached"
            
            body = "Hello! Here is the photo you requested from your Drishyamitra management system."
            message.attach(MIMEText(body, 'plain'))

            # Fetch and attach image from storage
            with open(photo_path, 'rb') as f:
                img_data = f.read()
                image = MIMEImage(img_data, name=os.path.basename(photo_path))
                message.attach(image)

            # Encode and send
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            self.service.users().messages().send(userId="me", body={'raw': raw_message}).execute()

            # Log to DeliveryHistory model
            new_log = DeliveryHistory(photo_id=photo_id, recipient=recipient_email, delivery_type='Email', status='Sent')
            db.session.add(new_log)
            db.session.commit()

            return {"status": "success", "message": "Email sent successfully."}

        except Exception as e:
            # Error handling for invalid recipients or quota
            return {"status": "error", "message": f"Failed to send: {str(e)}"}