from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    photos = db.relationship('Photo', backref='owner', lazy=True, cascade="all, delete-orphan")

class Person(db.Model):
    __tablename__ = 'persons'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    faces = db.relationship('Face', backref='person_identity', lazy=True)

class Photo(db.Model):
    __tablename__ = 'photos'
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    faces = db.relationship('Face', backref='source_photo', lazy=True, cascade="all, delete-orphan")
    deliveries = db.relationship('DeliveryHistory', backref='photo', lazy=True, cascade="all, delete-orphan")

class Face(db.Model):
    __tablename__ = 'faces'
    id = db.Column(db.Integer, primary_key=True)
    embedding = db.Column(db.JSON, nullable=True) 
    photo_id = db.Column(db.Integer, db.ForeignKey('photos.id'), nullable=True)
    person_id = db.Column(db.Integer, db.ForeignKey('persons.id'), nullable=True)

class DeliveryHistory(db.Model):
    __tablename__ = 'delivery_history'
    id = db.Column(db.Integer, primary_key=True)
    activity_type = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='SUCCESS')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    photo_id = db.Column(db.Integer, db.ForeignKey('photos.id'), nullable=False)