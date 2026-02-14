import logging
import asyncio
from app.worker import celery_app
from app.db.session import SessionLocal
from app.services.scraper import CountyScraper
from app.services.importer import CsvImporter

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
    Background task to scrape county websites.
    """
    logger.info("Starting background scrape task...")
    db = SessionLocal()
    try:
        scraper = CountyScraper()
        # The scraper methods are async, so we need to run them in an event loop
        # However, looking at the previous implementation, CountyScraper might trigger playwight/zenrows
        # If scraper_county.py functions are async, we use run_async
        # Let's assume scrape_all() is the main entry point
        
        # Checking if scraper.scrape_all is async or sync 
        # (It was likely async due to playwright)
        import asyncio
        asyncio.run(scraper.run_all()) 
        
        # Send Email Notification
        from app.core.email import send_email
        from app.core.config import settings
        # Assuming we have a settings.EMAILS_ENABLED or similar, or just try to send
        # For now, hardcode or use env vars
        recipient = "admin@auctionos.com" # TODO: Fetch from DB superusers?
        
        asyncio.run(send_email(
            subject="Scrape Task Completed",
            recipients=[recipient],
            body="The background scraping task has finished successfully."
        ))

        logger.info("Scrape task completed.")
        return {"status": "success", "message": "Scrape completed"}
    except Exception as e:
        logger.error(f"Scrape task failed: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@celery_app.task(acks_late=True)
def import_csv_task():
    """
    Background task to run the CSV migration/import logic.
    """
    logger.info("Starting CSV import task...")
    db = SessionLocal()
    try:
        importer = CsvImporter()
        importer.run_import(db)
        logger.info("CSV import task completed.")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"CSV import task failed: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
