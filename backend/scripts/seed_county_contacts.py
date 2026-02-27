import os
import sys
import csv
import logging
from typing import List, Dict

from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend directory is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.county_contact import CountyContact
from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CONTACTS_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data/contact_data.csv")

def seed_county_contacts(db: Session):
    if not os.path.exists(CONTACTS_DATA_PATH):
        logger.error(f"Contact data file not found at {CONTACTS_DATA_PATH}.")
        return

    logger.info("Starting CSV parsing...")
    
    try:
        with open(CONTACTS_DATA_PATH, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # Use chunks for faster inserts
            chunk_size = 500
            current_chunk = []
            
            total_inserted = 0
            
            # Fast clear just in case to be idempotent for testing
            logger.info("Clearing old county_contacts table records...")
            db.query(CountyContact).delete()
            db.commit()

            for row in reader:
                name = row.get('Name', '')
                # Filter out NETR
                if "NETR Mapping and GIS" not in name:
                    state = row.get('State', '').lower().strip()
                    county = row.get('County', '').lower().strip()
                    phone = row.get('Phone', '').strip()
                    url = row.get('Online_URL', '').strip()

                    contact = CountyContact(
                        state=state,
                        county=county,
                        name=name,
                        phone=phone,
                        url=url
                    )
                    current_chunk.append(contact)

                    if len(current_chunk) >= chunk_size:
                        db.bulk_save_objects(current_chunk)
                        db.commit()
                        total_inserted += len(current_chunk)
                        logger.info(f"Inserted {total_inserted} records...")
                        current_chunk = []
            
            # Insert remainder
            if current_chunk:
                db.bulk_save_objects(current_chunk)
                db.commit()
                total_inserted += len(current_chunk)
                logger.info(f"Inserted remainder. Total inserted: {total_inserted} records.")

            logger.info("Successfully completed seeding County Contacts to PostgreSQL.")
            
    except Exception as e:
        logger.error(f"Failed during seeding: {e}")
        db.rollback()

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_county_contacts(db)
    finally:
        db.close()
