import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, Text
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

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="user_properties")
    company = relationship("Company", backref="user_properties")
