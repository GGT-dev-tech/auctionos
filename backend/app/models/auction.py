import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Auction(Base):
    __tablename__ = "auctions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    short_name = Column(String(255), nullable=True)
    state = Column(String(100), index=True, nullable=True)
    county = Column(String(100), index=True, nullable=True)
    
    auction_date = Column(Date, nullable=True, index=True)
    time = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    
    tax_status = Column(String(50), nullable=True) # e.g. Quit Claim, Tax Deed
    parcels_count = Column(Integer, default=0)
    
    notes = Column(Text, nullable=True)
    
    # Links
    search_link = Column(String(500), nullable=True)
    register_link = Column(String(500), nullable=True)
    list_link = Column(String(500), nullable=True)
    info_link = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
