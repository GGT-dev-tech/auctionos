import csv
import sys
import os
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.session import SessionLocal, engine
import app.db.base # Import all models to populate registry
from app.db.base_class import Base
from app.models.property import Property
from app.models.auction_event import AuctionEvent, AuctionEventType, AuctionEventStatus

CSV_FILE_PATH = "/Users/gustavo/Downloads/auctionos/migrationParcelFair/Arkansas-properties-all-2026-02-16.csv"

def parse_currency(value):
    if not value or value == 'N/A' or value == '-':
        return 0.0
    return float(value.replace('$', '').replace(',', ''))

def parse_int(value):
    if not value or value == 'N/A' or value == '-':
        return None
    try:
        return int(value)
    except ValueError:
        return None

def parse_date(value):
    if not value or value == '-':
        return None
    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except ValueError:
        return None

def import_csv():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print(f"Reading CSV from {CSV_FILE_PATH}...")
    
    auction_cache = {} # (state, date, type) -> AuctionEvent
    
    properties_to_add = []
    
    try:
        with open(CSV_FILE_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                # 1. Handle Auction Event
                state = row.get('State', 'AR')
                next_auction_str = row.get('Next Auction')
                auction_date = None
                
                # Try to parse 'Next Auction' if it's a date, otherwise it might be a status like 'Available'
                # In the provided CSV sample, 'Next Auction' seems to be missing or '-' for available items.
                # However, logic requires us to link properties to auctions.
                # Let's check 'Tax Sale Year' and create a placeholder auction if needed.
                
                # For now, let's create a generic "OTC / Available" event container if no specific auction date
                auction_key = (state, 'OTC')
                
                if next_auction_str and next_auction_str != '-':
                     # If there was a date, we'd parse it. 
                     # For this specific CSV, it seems mostly OTC/Available.
                     pass

                if auction_key not in auction_cache:
                    auction = AuctionEvent(
                        state=state,
                        county="Multiple", # Placeholder
                        auction_type=AuctionEventType.TAX_DEED, # Defaulting
                        status=AuctionEventStatus.ACTIVE,
                        start_date=datetime.now().date(), # Placeholder
                        total_assets=0
                    )
                    db.add(auction)
                    db.flush() # Get ID
                    auction_cache[auction_key] = auction
                
                auction_event = auction_cache[auction_key]
                auction_event.total_assets += 1
                
                # 2. Map Property Fields
                prop = Property(
                    address=row.get('Address'),
                    city=row.get('City'),
                    state=row.get('State'),
                    zip_code=row.get('Zip'),
                    county=row.get('County'),
                    owner_name=row.get('Owner Name'),
                    
                    # New Fields
                    parcel_number=row.get('Parcel Number'),
                    cs_number=row.get('CS'),
                    tax_sale_year=parse_int(row.get('Tax Sale Year')),
                    delinquent_year=parse_int(row.get('Delinquent Year')),
                    amount_due=parse_currency(row.get('Amount Due')),
                    total_value=parse_currency(row.get('Total Value')),
                    land_value=parse_currency(row.get('Land')),
                    improvement_value=parse_currency(row.get('Improvements')),
                    assessed_value=parse_currency(row.get('Assessed Value')),
                    parcel_type=row.get('Parcel Type'),
                    legal_description=row.get('Legal Description'),
                    opportunity_zone=row.get('Opportunity Zone'),
                    coordinates=row.get('Coordinates'),
                    
                    auction_event_id=auction_event.id
                )
                properties_to_add.append(prop)
                
                if len(properties_to_add) >= 100:
                    db.bulk_save_objects(properties_to_add)
                    db.commit() # Commit batch
                    properties_to_add = [] # Reset list
            
            if properties_to_add:
                db.bulk_save_objects(properties_to_add)
                
            db.commit()
            print("Import successful!")
            
    except Exception as e:
        print(f"Error importing CSV: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import_csv()
