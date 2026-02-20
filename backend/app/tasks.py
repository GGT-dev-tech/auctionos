import logging
import asyncio
from app.worker import celery_app
from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Helper to run async code in sync Celery task
def run_async(coro):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)

@celery_app.task(acks_late=True)
def scrape_county_task():
    """
    Background task to scrape county websites. (Temporarily disabled for migration)
    """
    logger.info("Scrape task disabled during architecture simplification.")
    return {"status": "success", "message": "Scrape disabled"}

@celery_app.task(acks_late=True)
def import_csv_task():
    """
    Background task to run the CSV migration/import logic. (Temporarily disabled for migration)
    """
    logger.info("CSV import task disabled during architecture simplification.")
    return {"status": "success"}
