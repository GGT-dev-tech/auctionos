from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.base_class import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    action = Column(String(100), nullable=False) # e.g., "login", "view_property", "role_update"
    resource = Column(String(255), nullable=True) # deprecated/legacy, keep for compatibility
    entity_type = Column(String(100), nullable=True, index=True) # e.g., "PropertyDetail", "User"
    entity_id = Column(String(100), nullable=True, index=True)
    details = Column(Text, nullable=True) # JSON or text details
    metadata_json = Column(Text, nullable=True) # New structured JSON metadata
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
