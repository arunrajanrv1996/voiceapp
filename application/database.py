from sqlalchemy.ext.declarative import declarative_base
from flask_sqlalchemy import SQLAlchemy
# from sqlalchemy import create_engine
# import pyodbc as odbc

# connection_string = "Driver={ODBC Driver 18 for SQL Server};Server=tcp:voiceanalyser-server.database.windows.net,1433;Database=voiceanalyzer;Uid=arunrajanrv;Pwd=Kingarun18;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
# connect = odbc.connect(connection_string)

engine = None
Base = declarative_base()
db = SQLAlchemy()