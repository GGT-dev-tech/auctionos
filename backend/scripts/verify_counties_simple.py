import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.county import County

def check_db():
    try:
        db = SessionLocal()
        count = db.query(County).count()
        print(f"Total Counties in DB: {count}")
        
        fl_count = db.query(County).filter(County.state_code == 'FL').count()
        print(f"Florida Counties: {fl_count}")
        
        if fl_count == 0:
            print("WARNING: No data found for FL. Please run 'python3 backend/scripts/import_counties.py'")
        else:
            print("SUCCESS: Data is present.")
            
        db.close()
    except Exception as e:
        print(f"Error connecting to DB: {e}")

if __name__ == "__main__":
    check_db()
