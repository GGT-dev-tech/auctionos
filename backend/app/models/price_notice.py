import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class PriceNoticeStatus(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    TRIGGERED = "triggered"

class PriceNotice(Base):
    __tablename__ = "price_notices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    property_id = Column(String(36), ForeignKey("properties.id"), nullable=False, index=True)
    
    status = Column(String(50), default=PriceNoticeStatus.ACTIVE)
    note = Column(Text, nullable=True)
    
    # Optional criteria
    target_price = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="price_notices")
    property = relationship("Property", back_populates="price_notices")
