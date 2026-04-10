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
                  AND (pah.auction_name = ae.name OR pah.auction_name = ae.short_name)
                  AND pah.auction_date = ae.auction_date;
            """)
            result = conn.execute(query)
            logger.info(f"Linkage complete. Rows updated: {result.rowcount}")
        return {"status": "success", "linked_rows": result.rowcount}
    except Exception as e:
        logger.error(f"Failed to resolve linkages: {e}")
        return {"status": "error", "message": str(e)}

@celery_app.task(acks_late=True, name="app.tasks.reconcile_property_statuses_task")
def reconcile_property_statuses_task():
    """
    Automatic task to reconcile property statuses based on passed auction dates.
    Runs daily via Celery Beat.
    """
    logger.info("Starting automatic status reconciliation task.")
    from app.db.session import engine
    from sqlalchemy import text
    from datetime import datetime
    
    current_date = datetime.utcnow().date()
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    try:
        with engine.begin() as conn:
            # 1. Update status
            update_query = text("""
                UPDATE property_details p
                SET availability_status = 'unavailable'
                FROM property_auction_history pah
                WHERE p.property_id = pah.property_id
                  AND pah.auction_date < :current_date
                  AND p.availability_status = 'available';
            """)
            result = conn.execute(update_query, {"current_date": current_date})
            
            # 2. Log History
            if result.rowcount > 0:
                history_query = text("""
                    INSERT INTO property_availability_history (property_id, previous_status, new_status, change_source, changed_at)
                    SELECT p.property_id, 'available', 'unavailable', 'auto_reconciliation_past_auction', :now
                    FROM property_details p
                    JOIN property_auction_history pah ON p.property_id = pah.property_id
                    WHERE pah.auction_date < :current_date
                      AND p.availability_status = 'unavailable'
                      AND NOT EXISTS (
                          SELECT 1 FROM property_availability_history pah2 
                          WHERE pah2.property_id = p.property_id 
                          AND pah2.change_source = 'auto_reconciliation_past_auction'
                          AND pah2.changed_at > :today_start
                      );
                """)
                conn.execute(history_query, {"current_date": current_date, "now": now, "today_start": today_start})
                
            logger.info(f"Auto-reconciliation complete. Updated {result.rowcount} properties.")
            return {"status": "success", "updated_count": result.rowcount}
    except Exception as e:
        logger.error(f"Auto-reconciliation failed: {e}")
        return {"status": "error", "message": str(e)}
