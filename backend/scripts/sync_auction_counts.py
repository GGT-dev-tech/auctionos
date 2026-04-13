import sys
import os
from sqlalchemy import text, create_engine

# Database setup
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable is not set.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

def sync_counts():
    print("-" * 50)
    print("SYNCING AUCTION PROPERTY COUNTS")
    print("-" * 50)
    
    sync_query = text("""
        UPDATE auction_events ae
        SET parcels_count = (
            SELECT count(*)
            FROM property_auction_history pah
            JOIN property_details p ON p.property_id = pah.property_id
            WHERE pah.auction_id = ae.id
            AND p.availability_status = 'available'
        )
    """)
    
    try:
        with engine.begin() as conn:
            result = conn.execute(sync_query)
            print(f"Success: Updated counts for all auctions.")
            print(f"Affected rows: {result.rowcount}")
    except Exception as e:
        print(f"Error syncing counts: {e}")
    print("-" * 50)

if __name__ == "__main__":
    sync_counts()
