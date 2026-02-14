from app.db.base_class import Base

# Import all models here so that Alembic can detect them
from app.models.user import User  # noqa
from app.models.property import Property, PropertyDetails, Media, AuctionDetails  # noqa
from app.models.location import Location  # noqa
from app.models.expense import Expense  # noqa
from app.models.note import Note  # noqa
from app.models.county import County  # noqa
