import os
from datetime import timedelta
basedir = os.path.abspath(os.path.dirname(__file__))

# define a base config class
class Config():
    DEBUG = False
    SQLITE_DB_DIR = None
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False

# define a local development config
class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("DB_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY =  "493a1a0c-792a-44f4-869b-2dd2ddc247f3"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    SECURITY_PASSWORD_HASH = "bcrypt"
    SECURITY_PASSWORD_SALT = "60ec0acf-bc9a-4c37-bab9-b885960e1068"
    DEBUG = True
    SECURITY_REGISTERABLE = True
    SECURITY_CONFIRMABLE = False
    SECURITY_SEND_REGISTER_EMAIL = False
    SECURITY_USERNAME_ENABLE=True
    SECURITY_USERNAME_REQUIRED=True
    SESSION_COOKIE_SECURE=True
    SECURITY_UNAUTHORIZED_VIEW = None
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'