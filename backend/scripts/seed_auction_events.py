import sys
import os
import random
from datetime import date, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.session import SessionLocal, engine
import app.db.base # Import all models to populate registry
from app.db.base_class import Base
from app.models.auction_event import AuctionEvent, AuctionEventType, AuctionEventStatus

def seed_events():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Clear existing events
    db.query(AuctionEvent).delete()
    db.commit()
    
    states = ["FL", "AR", "AZ", "CA", "TX", "NJ"]
    types = list(AuctionEventType)
    
    events = []
    
    print("Seeding Auction Events...")
    
    for state in states:
        # Create 1-3 events per month for 2026
        for month in range(1, 13):
            num_events = random.randint(0, 3)
            for _ in range(num_events):
                day = random.randint(1, 28)
                start_date = date(2026, month, day)
                
                event_type = random.choice(types)
                county = f"County_{random.randint(1, 20)}"
                
                event = AuctionEvent(
                    state=state,
                    county=county,
                    auction_type=event_type,
                    start_date=start_date,
                    end_date=start_date + timedelta(days=1),
                    status=AuctionEventStatus.UPCOMING,
                    total_assets=random.randint(50, 500)
                )
                
                # State specific logic for realism
                if state == "FL" and event_type == AuctionEventType.TAX_DEED:
                    event.max_interest_rate = 18.0
                elif state == "NJ" and event_type == AuctionEventType.TAX_LIEN:
                    event.max_interest_rate = 18.0
                    event.redemption_period = 24
                
                db.add(event)
                events.append(event)
    
    db.commit()
    print(f"Seeded {len(events)} auction events.")
    db.close()

if __name__ == "__main__":
    seed_events()
