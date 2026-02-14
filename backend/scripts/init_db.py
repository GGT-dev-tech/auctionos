import sys
import os

# Add backend directory to sys.path
sys.path.append(os.getcwd())

from app.db.session import engine
from app.db.base import Base

def init_db():
    print("Creating all tables in the database...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init_db()
