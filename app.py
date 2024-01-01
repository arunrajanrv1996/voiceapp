import os
from flask import Flask
from flask_security import Security, SQLAlchemySessionUserDatastore
from application.models import db, User, Role
from application.config import LocalDevelopmentConfig
from sqlalchemy import text

app = None

#function for syncing the sequence
def sync_sequence():
    with db.engine.connect() as connection:
        result = connection.execute(text("SELECT setval(pg_get_serial_sequence('role', 'id'), (SELECT MAX(id) FROM role)+1);"))

#function for creating the app
def create_app():
    app = Flask(__name__, template_folder="templates")
    if os.getenv("ENV", "development") == "production":
        raise Exception("Currently no production config is setup.")
    else:
        print("Staring Local Development")
        app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    app.app_context().push()
    user_datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
    app.security = Security(app, user_datastore)
    with app.app_context():
        db.create_all()
        sync_sequence()  # Add this line
        # Check if roles exist before adding them
        if not Role.query.filter_by(name='admin').first():
            r1 = Role(name='admin', description='Administrator')
            db.session.add(r1)

        if not Role.query.filter_by(name='user').first():
            r2 = Role(name='user', description='User')
            db.session.add(r2)

        db.session.commit()
    return app

app= create_app()

# Import all the controllers so they are loaded
from application.controllers import *

if __name__ == "__main__":
    # Run the Flask app
    app.run(debug=True)
