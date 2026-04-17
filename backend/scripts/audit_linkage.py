import sys
import os
from sqlalchemy import text, create_engine

# Database setup
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable is not set.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

def audit_linkage():
    print("-" * 60)
    print("AUDIT: AUCTION EVENT LINKAGE INTEGRITY")
    print("-" * 60)
    
    with engine.connect() as conn:
        # 1. Total records
        total_auctions = conn.execute(text("SELECT count(*) FROM auction_events")).scalar()
        total_history = conn.execute(text("SELECT count(*) FROM property_auction_history")).scalar()
        
        # 2. Check for NULL auction_id in history
        null_ids = conn.execute(text("SELECT count(*) FROM property_auction_history WHERE auction_id IS NULL")).scalar()
        
        # 3. Check for auction_ids that don't exist in auction_events
        invalid_ids = conn.execute(text("""
            SELECT count(*) FROM property_auction_history 
            WHERE auction_id IS NOT NULL 
            AND auction_id NOT IN (SELECT id FROM auction_events)
        """)).scalar()
        
        # 4. Sample check: Match by name/date vs ID
        matching_by_name = conn.execute(text("""
            SELECT count(*) FROM property_auction_history pah
            JOIN auction_events ae ON (pah.auction_name = ae.name OR pah.auction_name = ae.short_name)
            AND pah.auction_date = ae.auction_date
        """)).scalar()

        print(f"{'Total Auctions in System':<40}: {total_auctions:,}")
        print(f"{'Total Links in History':<40}: {total_history:,}")
        print("-" * 60)
        print(f"{'Links with NULL auction_id':<40}: {null_ids:,}")
        print(f"{'Links with INVALID auction_id':<40}: {invalid_ids:,}")
        print(f"{'Links that match by NAME/DATE':<40}: {matching_by_name:,}")
        print("-" * 60)
        
        if null_ids > 0 or invalid_ids > 0:
            print("\nSAMPLE OF ORPHANED LINKS (Name/Date sample):")
            sample = conn.execute(text("""
                SELECT auction_name, auction_date, count(*) 
                FROM property_auction_history 
                WHERE auction_id IS NULL 
                GROUP BY auction_name, auction_date 
                LIMIT 5
            """)).fetchall()
            for r in sample:
                print(f" - {r[0]} ({r[1]}): {r[2]} properties")

if __name__ == "__main__":
    try:
        audit_linkage()
    except Exception as e:
        print(f"Error during audit: {e}")
