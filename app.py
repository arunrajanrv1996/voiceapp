import os
from flask import Flask
from flask_security import Security, SQLAlchemySessionUserDatastore
from application.models import db, User, Role
from application.config import LocalDevelopmentConfig
from flask_restful import Api
from flask_cors import CORS

app = None
api = None


def create_app():
    app = Flask(__name__, template_folder="templates")
    if os.getenv("ENV", "development") == "production":
        raise Exception("Currently no production config is setup.")
    else:
        print("Staring Local Development")
        app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    app.app_context().push()
    api = Api(app)
    CORS(app)
    app.app_context().push()
    user_datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
    app.security = Security(app, user_datastore)
    with app.app_context():
        db.create_all()
        # Check if roles exist before adding them
        if not Role.query.filter_by(name='admin').first():
            r1 = Role(name='admin', description='Administrator')
            db.session.add(r1)

        if not Role.query.filter_by(name='user').first():
            r2 = Role(name='user', description='User')
            db.session.add(r2)

        db.session.commit()
    return app, api


app, api= create_app()

# Import all the controllers so they are loaded
from application.controllers import *



if __name__ == "__main__":
    db.create_all()
    # Run the Flask app
    app.run(host='0.0.0.0', port=8000)