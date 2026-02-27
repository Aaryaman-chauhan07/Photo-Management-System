from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

# Fixes the 'ImportError: cannot import name User'
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False) # Store hashed passwords

class Photo(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    identity = db.Column(db.String(100), default='Unknown')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Face(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    photo_id = db.Column(db.String(36), db.ForeignKey('photo.id'), nullable=False)
    bounding_box = db.Column(db.Text, nullable=False)

class Identity(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DeliveryLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipient = db.Column(db.String(255), nullable=False)
    method = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default='Pending')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)