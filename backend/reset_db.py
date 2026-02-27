import os
from start_server import create_app
from models import db

app = create_app()
with app.app_context():
    # Force delete and recreate tables
    db.drop_all()
    db.create_all()
    print("Database columns (including filepath) fixed!")