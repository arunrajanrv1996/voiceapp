from flask_security import UserMixin, RoleMixin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKeyConstraint
from application.database import db


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class UserRoles(db.Model):
    __tablename__ = 'userroles'
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id', ondelete='CASCADE'))
    role_id = db.Column(db.Integer(), db.ForeignKey('role.id', ondelete='CASCADE'))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(255), unique=True)
    image = db.Column(db.String)
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='userroles',
                            backref=db.backref('users', lazy='dynamic'))
    

class UserTranscription(db.Model):
    __tablename__ = 'usertranscription'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    transcription = db.Column(db.String)
    language = db.Column(db.String(255))
    time = db.Column(db.DateTime, default=db.func.current_timestamp())
    user = db.relationship('User', backref=db.backref('user_transcription', lazy='dynamic', cascade='all, delete-orphan'))
    
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
    )

