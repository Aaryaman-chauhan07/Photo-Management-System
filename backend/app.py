import os
from flask import Flask
from flask_cors import CORS
from models import db
from routes.photo_routes import photo_bp
from routes.chat_routes import chat_bp
from routes.auth_routes import auth_bp 

app = Flask(__name__)
CORS(app) # Enables frontend-backend communication

# Activity 1.3: Database Path Config
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'drishyamitra.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Activity 2.4: Modular Route Registration
app.register_blueprint(photo_bp, url_prefix='/api/photos')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Activity 2.3: DB Init
    print("Backend live at http://localhost:5000")
    app.run(debug=True, port=5000)