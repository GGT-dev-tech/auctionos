import logging
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

logger = logging.getLogger(__name__)

class ReconciliationService:
    @staticmethod
    def reconcile_auction_properties(db: Session, auction_id: int):
        """
        Attempts to link properties from the same county/state to an auction
        that has missing property associations.
        """
        # 1. Fetch Auction details
        auction = db.execute(
            text("SELECT id, name, county, state, auction_date, tax_status FROM auction_events WHERE id = :id"),
            {"id": auction_id}
        ).fetchone()

        if not auction:
            return {"error": "Auction not found"}

        auction_id_val, auction_name, county, state, a_date, tax_status = auction

        # 2. Reconcile by Location Match
        # We target properties in the same county/state that are 'available'
        # and don't yet have a link for this specific auction.
        
        reconcile_query = text("""
            INSERT INTO property_auction_history (
                property_id, 
                auction_name, 
                auction_date, 
                auction_id, 
                created_at
            )
            SELECT 
                p.property_id, 
                :auction_name, 
                :auction_date, 
                :auction_id, 
                NOW()
            FROM property_details p
            WHERE p.county ILIKE :county 
              AND p.state = :state
              AND p.availability_status = 'available'
              AND NOT EXISTS (
                  SELECT 1 FROM property_auction_history pah
                  WHERE pah.property_id = p.property_id
                    AND pah.auction_name = :auction_name
              )
            ON CONFLICT (property_id, auction_name) DO NOTHING
        """)

        try:
            result = db.execute(reconcile_query, {
                "auction_id": auction_id_val,
                "auction_name": auction_name,
                "auction_date": a_date,
                "county": county,
                "state": state
            })
            db.commit()
            
            logger.info(f"Reconciled {result.rowcount} properties for auction {auction_id_val} ({auction_name})")
            return {
                "status": "success",
                "linked_count": result.rowcount,
                "auction_name": auction_name
            }
        except Exception as e:
            db.rollback()
            logger.error(f"Reconciliation failed for auction {auction_id}: {str(e)}")
            return {"error": str(e)}

reconciliation_service = ReconciliationService()
