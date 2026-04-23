import logging
from datetime import datetime, timedelta
from sqlalchemy import text
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)


def transition_past_auctions():
    """
    Transitions properties to 'unavailable' when they are:
    1. Currently 'available'
    2. Linked to at least one auction event via property_auction_history
    3. ALL linked auctions have dates strictly before today (no future/current auction)

    This prevents marking properties as unavailable if they have an upcoming auction
    scheduled (e.g., rescheduled or multi-event properties).
    """
    db = SessionLocal()
    try:
        today = datetime.now().date()

        # Update past auction events to inactive
        try:
            auction_update_result = db.execute(text("""
                UPDATE auction_events
                SET status = 'inactive'
                WHERE auction_date < :today
                  AND (status IS NULL OR status != 'inactive')
            """), {"today": today})
            auctions_updated = auction_update_result.rowcount
            logger.info(f"Auto-Transition: {auctions_updated} past auction events marked as 'inactive'.")
        except Exception as e:
            logger.error(f"Auto-Transition: Error updating auction_events status: {e}")

        # Find properties that:
        # - are currently 'available' (case-insensitive to be safe)
        # - have at least one past auction (auction_date < today)
        # - do NOT have any FUTURE auction scheduled (auction_date >= today)
        query = text("""
            SELECT DISTINCT p.property_id
            FROM property_details p
            INNER JOIN property_auction_history pah
                ON pah.property_id = p.property_id
            INNER JOIN auction_events ae
                ON ae.id = pah.auction_id
                AND ae.auction_date < :today
            WHERE LOWER(p.availability_status) = 'available'
              AND NOT EXISTS (
                  SELECT 1
                  FROM property_auction_history pah_future
                  INNER JOIN auction_events ae_future
                      ON ae_future.id = pah_future.auction_id
                  WHERE pah_future.property_id = p.property_id
                    AND ae_future.auction_date >= :today
              )
        """)

        try:
            results = db.execute(query, {"today": today}).fetchall()
        except Exception as query_err:
            logger.error(f"Auto-Transition: Query error: {query_err}")
            return {"status": "error", "message": f"Query Error: {str(query_err)}"}

        if not results:
            logger.info("Auto-Transition: No past-auction properties to transition today.")
            return {"status": "success", "processed": 0, "message": "No eligible properties found."}

        count = 0
        for row in results:
            prop_id = row[0]

            # Update status to unavailable
            db.execute(text("""
                UPDATE property_details
                SET availability_status = 'unavailable'
                WHERE property_id = :prop_id
                  AND LOWER(availability_status) = 'available'
            """), {"prop_id": prop_id})

            # Audit trail
            db.execute(text("""
                INSERT INTO property_availability_history
                    (property_id, previous_status, new_status, change_source)
                VALUES (:prop_id, 'available', 'unavailable', 'system_auto_past_auction')
            """), {"prop_id": prop_id})

            count += 1

        db.commit()
        logger.info(f"Auto-Transition: {count} properties → 'unavailable' (past auction linkage).")
        return {"status": "success", "processed": count}

    except Exception as e:
        db.rollback()
        logger.error(f"Auto-Transition: Failed — {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
