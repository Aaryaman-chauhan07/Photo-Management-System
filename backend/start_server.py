import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from models import db
# These blueprints must exist in your routes folder
from routes.auth_routes import auth_bp
from routes.photo_routes import photo_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///drishyamitra.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'secret_key')
    
    db.init_app(app)
    CORS(app) # Fixes "Network Error"
    JWTManager(app)
    
    # Registering Blueprints - Activity 2.4
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(photo_bp, url_prefix='/api/photos')

    @app.route('/')
    def home():
        return jsonify({
            "status": "success",
            "message": "Drishyamitra Backend is running perfectly! Connect your React frontend to use the API."
        }), 200

    with app.app_context():
        db.create_all() # Activity 2.3

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)