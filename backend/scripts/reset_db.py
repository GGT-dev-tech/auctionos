import sys
import os

# Add backend directory to sys.path so we can import app modules
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.property import Property, PropertyDetails, Media, AuctionDetails
from app.models.note import Note
from app.models.expense import Expense
from app.models.user import User
from sqlalchemy import text

def reset_db():
    db = SessionLocal()
    try:
        print("⚠ WARNING: This will DELETE ALL properties, diagrams, and related data.")
        confirm = input("Type 'DELETE' to confirm: ")
        if confirm != "DELETE":
            print("Aborted.")
            return

        # Delete in order of dependencies (though cascade should handle it technically, manual is safer for clean wipe)
        # Actually with cascade we just need to delete Properties. 
        # But let's be thorough.
        
        print("Deleting Media...")
        db.query(Media).delete()
        
        print("Deleting Details...")
        db.query(PropertyDetails).delete()
        
        print("Deleting Auction Details...")
        db.query(AuctionDetails).delete()
        
        print("Deleting Notes...")
        db.query(Note).delete()
        
        print("Deleting Expenses...")
        db.query(Expense).delete()

        print("Deleting Properties...")
        db.query(Property).delete()
        
        db.commit()
        print("✅ Database Reset Complete (Users Preserved).")
        
    except Exception as e:
        print(f"❌ Error resetting DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_db()
