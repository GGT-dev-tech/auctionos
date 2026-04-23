import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, Text, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class UserProperty(Base):
    __tablename__ = "user_properties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=True)
    address = Column(String(500), nullable=True)
    state = Column(String(100), nullable=True)
    city = Column(String(255), nullable=True)
    zip_code = Column(String(50), nullable=True)
    property_type = Column(String(100), nullable=True)
    
    estimated_value = Column(Float, nullable=True)
    rent_estimate = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    # Detailed Fields
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Float, nullable=True)
    sqft = Column(Integer, nullable=True)
    year_built = Column(Integer, nullable=True)
    owner_name = Column(String(255), nullable=True)
    auction_date = Column(Date, nullable=True)
    amount_due = Column(Float, nullable=True)
    
    # Export to List
    list_id = Column(Integer, ForeignKey("client_lists.id", ondelete="SET NULL"), nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="user_properties")
    company = relationship("Company", backref="user_properties")
