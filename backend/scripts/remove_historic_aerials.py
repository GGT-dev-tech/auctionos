import os
import sys
import logging

from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend directory is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.county_contact import CountyContact
from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def remove_historic_aerials(db: Session):
    logger.info("Connecting to Database to sanitize 'Historic Aerials'...")
    
    try:
        # Find all records where the name contains 'Historic Aerials' (case-insensitive)
        records_to_delete = db.query(CountyContact).filter(
            CountyContact.name.ilike('%Historic Aerials%')
        ).all()
        
        count = len(records_to_delete)
        if count == 0:
            logger.info("No 'Historic Aerials' records found. Database is already clean.")
            return

        logger.info(f"Found {count} records matching 'Historic Aerials'. Deleting...")
        
        for record in records_to_delete:
            db.delete(record)
            
        db.commit()
        logger.info(f"Successfully deleted {count} 'Historic Aerials' records from the CountyContacts table.")
            
    except Exception as e:
        logger.error(f"Failed during sanitization: {e}")
        db.rollback()

if __name__ == "__main__":
    db = SessionLocal()
    try:
        remove_historic_aerials(db)
    finally:
        db.close()
