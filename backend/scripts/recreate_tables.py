import sys
import os

# Add backend directory to sys.path so we can import app modules
sys.path.append(os.getcwd())

from app.db.session import engine
from app.db.base import Base
# Import all models to ensure they are registered with Base.metadata
from app.models.property import Property, PropertyDetails, Media, AuctionDetails, PropertyAuctionHistory
from app.models.user import User
from app.models.company import Company
from app.models.note import Note
from app.models.expense import Expense

def recreate_tables():
    print("⚠ WARNING: This will DROP ALL TABLES and RECREATE them.")
    # For automation, we skip prompt if env var set, otherwise ask
    if os.environ.get("FORCE_RECREATE") != "true":
        confirm = input("Type 'DELETE' to confirm: ")
        if confirm != "DELETE":
            print("Aborted.")
            return

    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Tables dropped.")

    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables recreated successfully.")

if __name__ == "__main__":
    recreate_tables()
