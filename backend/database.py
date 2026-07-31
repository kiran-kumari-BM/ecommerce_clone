from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Ensure this URL matches your local database setup.
# Format: postgresql://username:password@localhost/databasename
# If you don't have a password, you can often just use: postgresql://localhost/dummy_zon_db
SQLALCHEMY_DATABASE_URL = "postgresql://localhost/dummy_zon_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()