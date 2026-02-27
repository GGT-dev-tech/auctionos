from app.db.base_class import Base

# Import all models here so that Alembic can detect them
from app.models.user import User  # noqa
from app.models.property import PropertyDetails, PropertyAuctionHistory, PropertyAvailabilityHistory
from app.models.county_contact import CountyContact
from app.models.auction_event import AuctionEvent  # noqa
