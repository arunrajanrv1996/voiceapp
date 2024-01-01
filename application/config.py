import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config():
    DEBUG = False
    SQLITE_DB_DIR = None
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig(Config):
    # SQLITE_DB_DIR = os.path.join(basedir, "../db_directory")
    # SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "database.sqlite3")
    SQLALCHEMY_DATABASE_URI = "postgres://udznklyretrcll:bc6cfe72c4106455053b9f57fbb27c94597bc59542b358962961f20fe96cc274@ec2-3-217-146-37.compute-1.amazonaws.com:5432/d5e1b2u023q7d9"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY =  "493a1a0c-792a-44f4-869b-2dd2ddc247f3"
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