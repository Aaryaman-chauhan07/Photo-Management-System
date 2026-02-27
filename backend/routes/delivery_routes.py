from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

delivery_bp = Blueprint('delivery', __name__)

@delivery_bp.route('/email', methods=['POST'])
@jwt_required()
def send_email():
    data = request.get_json()
    recipient_email = data.get('email')
    subject = data.get('subject', 'Your Photos from Drishyamitra')
    message_body = data.get('message', 'Hello! Here are your requested photos from Drishyamitra.')
    
    if not recipient_email:
        return jsonify({"msg": "Recipient email is required"}), 400

    # --- MOCK EMAIL DELIVERY FOR TESTING ---
    # This prints the email to your VS Code terminal instead of sending it over the internet.
    print("\n" + "="*50)
    print("📧 MOCK EMAIL INTERCEPTED!")
    print(f"To:      {recipient_email}")
    print(f"Subject: {subject}")
    print(f"Message: {message_body}")
    print("="*50 + "\n")

    return jsonify({"msg": f"Mock email successfully 'sent' to {recipient_email} (check your terminal)"}), 200
        

@delivery_bp.route('/whatsapp', methods=['POST'])
@jwt_required()
def send_whatsapp():
    data = request.get_json()
    phone_number = data.get('phone')
    message = data.get('message', 'Hello from Drishyamitra!')
    
    if not phone_number:
        return jsonify({"msg": "Phone number is required"}), 400
        
    # --- MOCK WHATSAPP DELIVERY FOR TESTING ---
    print("\n" + "="*50)
    print("📱 MOCK WHATSAPP MESSAGE INTERCEPTED!")
    print(f"To:      {phone_number}")
    print(f"Message: {message}")
    print("="*50 + "\n")
        
    return jsonify({
        "msg": f"Mock WhatsApp delivery triggered for {phone_number}. (Check your terminal)"
    }), 200