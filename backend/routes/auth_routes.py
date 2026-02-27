from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os

auth_bp = Blueprint('auth', __name__)
SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret")

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    # Activity 2.5: Secure password hashing
    hashed_pw = generate_password_hash(data['password'])
    return jsonify({"message": "User created"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    # Activity 2.5: Token-based access
    if data.get('username') == 'admin' and data.get('password') == 'password':
        token = jwt.encode({
            'user': 'admin',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY)
        return jsonify({'token': token})
    return jsonify({'message': 'Invalid credentials'}), 401
@auth_bp.route('/test', methods=['GET'])
def auth_test():
    return jsonify({"status": "Auth Blueprint Active - Activity 2.5 Logic Ready"})