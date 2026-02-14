from sqlalchemy import Column, Integer, String
from app.db.base_class import Base

class Location(Base):
    __tablename__ = "locations"

    fips = Column(String(10), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    state = Column(String(2), nullable=False)
