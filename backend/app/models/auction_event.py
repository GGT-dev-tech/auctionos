import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Date, Enum, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class AuctionEventType(str, enum.Enum):
    TAX_DEED = "tax_deed"
    TAX_LIEN = "tax_lien"
    FORECLOSURE = "foreclosure"
    SHERIFF_SALE = "sheriff_sale"
    REDEEMABLE_DEED = "redeemable_deed"

class AuctionEventStatus(str, enum.Enum):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class AuctionEvent(Base):
    __tablename__ = "auction_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    state = Column(String(2), index=True, nullable=False) # e.g. "FL", "AR"
    county = Column(String(100), index=True, nullable=False)
    auction_type = Column(String(50), default=AuctionEventType.TAX_DEED, nullable=False)
    
    start_date = Column(Date, index=True, nullable=False)
    end_date = Column(Date, nullable=True)
    
    status = Column(String(50), default=AuctionEventStatus.UPCOMING)
    
    # Specifics
    max_interest_rate = Column(Float, nullable=True) # e.g. 18.0 for 18%
    redemption_period = Column(Integer, nullable=True) # In months
    
    # Computed/Cached counts (can be updated via background job)
    total_assets = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    properties = relationship("Property", back_populates="auction_event")
