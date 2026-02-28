import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

# 1. BULLETPROOF ENV LOADER: Force Python to find the .env file in the backend directory
basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
env_path = os.path.join(basedir, '.env')
load_dotenv(env_path)

def send_photo_via_gmail(to_email, photo_paths):
    """
    Activity 3.3: Implements Delivery using Gmail Services and SMTP.
    """
    # 2. BULLETPROOF VARIABLES: Check for both name variations just to be safe
    sender_email = os.getenv("GMAIL_USER") or os.getenv("GMAIL_EMAIL")
    sender_password = os.getenv("GMAIL_PASS") or os.getenv("GMAIL_PASSWORD")

    if not sender_email or not sender_password:
        return False, "Gmail services credentials not configured on server. Check if your file is named exactly '.env'."

    try:
        msg = EmailMessage()
        msg['Subject'] = 'Your Photos from Drishyamitra'
        msg['From'] = sender_email
        msg['To'] = to_email
        msg.set_content("Here are the photos you requested via Drishyamitra's Gmail services!")

        # Attach each photo
        for path in photo_paths:
            if os.path.exists(path):
                with open(path, 'rb') as f:
                    img_data = f.read()
                    file_name = os.path.basename(path)
                    msg.add_attachment(img_data, maintype='image', subtype='jpeg', filename=file_name)

        # Connect to Gmail SMTP server
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
            
        return True, "Sent successfully via Gmail services!"
    except Exception as e:
        print(f"Gmail SMTP Error: {e}")
        return False, str(e)