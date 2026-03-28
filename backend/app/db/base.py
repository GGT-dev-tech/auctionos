from app.db.base_class import Base

# Import all models here so that Alembic can detect them
from app.models.user import User  # noqa
from app.models.property import PropertyDetails, PropertyAuctionHistory, PropertyAvailabilityHistory
from app.models.county_contact import CountyContact
from app.models.auction_event import AuctionEvent  # noqa
from app.models.client_data import ClientList, ClientNote, ClientAttachment
from app.models.system_announcement import SystemAnnouncement
from app.models.state_contact import StateContact
from app.models.scoring import PropertyScore  # noqa — ML scoring engine
