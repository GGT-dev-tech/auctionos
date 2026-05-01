from app.db.session import SessionLocal
from sqlalchemy import text
from app.models.property import PropertyDetails

db = SessionLocal()
p = db.query(PropertyDetails).filter(PropertyDetails.id == 419612).first()
try:
    auction = db.execute(text("""
        SELECT 
            pah.amount_due, 
            pah.assessed_value,
            pah.auction_date,
            ae.url as auction_url,
            ae.status as auction_status,
            ae.case_number
        FROM property_auction_history pah
        LEFT JOIN auction_events ae ON pah.auction_id = ae.id
        WHERE pah.property_id = :prop_id
        ORDER BY pah.auction_date ASC
        LIMIT 1
    """), {"prop_id": p.id}).fetchone()
    
    print("Auction:", auction)
    print("case_number:", auction.case_number if auction else None)
    
except Exception as e:
    import traceback
    traceback.print_exc()
