from flask import Blueprint, request, jsonify
from ai_utils import get_chat_response

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/message', methods=['POST'])
def handle_chat():
    data = request.get_json()
    user_msg = data.get('message')
    
    # AI Logic call
    ai_logic = get_chat_response(user_msg)
    
    return jsonify({
        "action": ai_logic.get("action"),
        "response": ai_logic.get("message") if ai_logic.get("action") == "chat" else f"Triggered {ai_logic.get('action')}..."
    }), 200