import logging
from datetime import datetime, timedelta
from sqlalchemy import text
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

def transition_past_auctions():
    """
    Finds properties that are currently 'available' and linked to an auction
    that occurred yesterday or earlier. Transitions their status to 'sold'
    and logs the change in the history table.
    """
    db = SessionLocal()
    try:
        # We define "past" as strictly before today. 
        # So if today is the 15th, an auction on the 14th will be transitioned today.
        today = datetime.now().date()
        
        # 1. Find eligible properties
        try:
            query = text("""
                SELECT p.property_id, pah.auction_date 
                FROM property_details p
                JOIN property_auction_history pah ON p.property_id = pah.property_id
                WHERE p.availability_status = 'available' 
                  AND pah.auction_date < :today
            """)
            results = db.execute(query, {"today": today}).fetchall()
        except Exception as query_err:
            logger.error(f"Auto-Transition: Could not execute query: {query_err}")
            return {"status": "error", "message": f"Query Error: {str(query_err)}"}
        
        if not results:
            logger.info("Auto-Transition: No past auction properties to transition today.")
            return {"status": "success", "processed": 0, "message": "No eligible properties found."}

        count = 0
        for row in results:
            prop_id = row[0]
            
            # 2. Update Status
            update_q = text("""
                UPDATE property_details 
                SET availability_status = 'sold' 
                WHERE property_id = :prop_id
            """)
            db.execute(update_q, {"prop_id": prop_id})
            
            # 3. Log Audit Trail
            audit_q = text("""
                INSERT INTO property_availability_history 
                (property_id, previous_status, new_status, change_source) 
                VALUES (:prop_id, 'available', 'sold', 'system_auto_transition')
            """)
            db.execute(audit_q, {"prop_id": prop_id})
            
            count += 1
            
        db.commit()
        logger.info(f"Auto-Transition: Successfully transitioned {count} properties to 'sold' status.")
        return {"status": "success", "processed": count}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Auto-Transition: Failed with error: {str(e)}")
        return {"status": "error", "message": f"Transaction Error: {str(e)}"}
    finally:
        db.close()
