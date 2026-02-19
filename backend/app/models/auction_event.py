from datetime import date, datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Date, Text, Float, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class AuctionEvent(Base):
    __tablename__ = "auction_events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    short_name = Column(String(100), nullable=True)
    auction_date = Column(Date, nullable=False)
    time = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    county = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Links
    search_link = Column(String(500), nullable=True)
    register_date = Column(Date, nullable=True)
    register_link = Column(String(500), nullable=True)
    list_link = Column(String(500), nullable=True)
    purchase_info_link = Column(String(500), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    properties = relationship("Property", back_populates="auction_event")
