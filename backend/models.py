from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    photos = db.relationship('Photo', backref='owner', lazy=True)

class Person(db.Model):
    # This MUST come before Face because Face refers to it
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    faces = db.relationship('Face', backref='source_photo', lazy=True, cascade="all, delete-orphan")

class Face(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    photo_id = db.Column(db.Integer, db.ForeignKey('photo.id'), nullable=False)
    # This refers to 'person.id', which is why the Person class must exist!
    person_id = db.Column(db.Integer, db.ForeignKey('person.id'), nullable=True)
    embedding = db.Column(db.Text, nullable=True) # For DeepFace vectors
    
    person_identity = db.relationship('Person', backref='detected_faces')

class DeliveryHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    activity_type = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='SUCCESS')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    photo_id = db.Column(db.Integer, db.ForeignKey('photo.id'), nullable=True)