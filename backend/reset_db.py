import os
from flask import Flask
from models import db

def reset():
    app = Flask(__name__)
    
    # Get the absolute path to the backend directory
    base_dir = os.path.abspath(os.path.dirname(__file__))
    instance_dir = os.path.join(base_dir, 'instance')
    
    # Force create the instance folder if it's missing
    if not os.path.exists(instance_dir):
        os.makedirs(instance_dir)
        print(f"Created instance folder at: {instance_dir}")

    # Use an absolute path for the SQLite database
    db_path = os.path.join(instance_dir, 'project.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}' 
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        print(f"Attempting to connect to: {db_path}")
        # Wipe and recreate all models (User, Photo, Face, Identity, Logs)
        db.drop_all()
        db.create_all()
        print("Success! Database has been reset and all tables are ready.")

if __name__ == "__main__":
    reset()