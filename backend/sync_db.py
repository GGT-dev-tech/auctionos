import asyncio
from app.db.base import Base
from app.db.session import engine

# This script creates missing tables directly using SQLAlchemy without Alembic migrations.
# This is useful when the local SQLite schema history is broken or missing a column
# that Alembic expects.

def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init_db()
