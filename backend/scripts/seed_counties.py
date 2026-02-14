import sys
import os
import logging

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.county import County
from scripts.import_counties import import_counties

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_and_seed_counties():
    db = SessionLocal()
    try:
        count = db.query(County).count()
        logger.info(f"Checking county data... Found {count} records.")
        
        if count == 0:
            logger.info("No county data found. Starting import...")
            import_counties()
        else:
            logger.info("County data exists. Skipping import.")
            
    except Exception as e:
        logger.error(f"Error checking county data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_and_seed_counties()
