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

@celery_app.task(acks_late=True)
def resolve_property_auction_links_task(job_id: str):
    """
    Background trigger: Resolves loosely coupled text constraints into strong Foreign Key relations.
    """
    logger.info(f"Starting auction linkage resolution for job: {job_id}")
    try:
        from app.db.session import engine
        from sqlalchemy import text
        with engine.begin() as conn:
            query = text("""
                UPDATE property_auction_history pah
                SET auction_id = ae.id
                FROM auction_events ae
                WHERE pah.auction_id IS NULL 
                  AND pah.auction_name = ae.name 
                  AND pah.auction_date = ae.auction_date;
            """)
            result = conn.execute(query)
            logger.info(f"Linkage complete. Rows updated: {result.rowcount}")
        return {"status": "success", "linked_rows": result.rowcount}
    except Exception as e:
        logger.error(f"Failed to resolve linkages: {e}")
        return {"status": "error", "message": str(e)}
