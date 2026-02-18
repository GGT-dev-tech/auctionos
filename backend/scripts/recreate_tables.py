
from app.db.session import engine
from app.db.base import Base
from app.models.property import Property, PropertyDetails, Media, AuctionDetails
from app.models.auction_event import AuctionEvent

def recreate_tables():
    print("Dropping tables...")
    # Be careful with dependencies
    AuctionEvent.__table__.drop(engine, checkfirst=True)
    PropertyDetails.__table__.drop(engine, checkfirst=True)
    AuctionDetails.__table__.drop(engine, checkfirst=True)
    Property.__table__.drop(engine, checkfirst=True)
    
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables recreated successfully.")

if __name__ == "__main__":
    recreate_tables()
