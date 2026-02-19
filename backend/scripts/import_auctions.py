import sys
import os

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.services.import_service import ImportService
# Import from base to ensure all models are registered in metadata
from app.db.base import Base 
from sqlalchemy.orm import configure_mappers

# Force configuration of mappers
# configure_mappers()

def import_csv():
    csv_path = "/app/sample_auctions.csv"
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return

    db = SessionLocal()
    try:
        with open(csv_path, 'rb') as f:
            content = f.read()
            
        print("Starting import...")
        result = ImportService.import_auction_events_csv(db, content)
        print("Import completed successfully!")
        print(f"Created: {result['created']}")
        print(f"Updated: {result['updated']}")
        print(f"Properties Linked: {result['properties_linked']}")
        
    except Exception as e:
        print(f"Error during import: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_csv()
