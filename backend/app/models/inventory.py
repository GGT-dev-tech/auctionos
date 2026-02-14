import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base
import enum

class InventoryStatus(str, enum.Enum):
    INTERESTED = "interested"
    DUE_DILIGENCE = "due_diligence"
    BID_READY = "bid_ready"
    WON = "won"
    LOST = "lost"
    ARCHIVED = "archived"

class InventoryFolder(Base):
    __tablename__ = "inventory_folders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    parent_id = Column(String(36), ForeignKey("inventory_folders.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company")
    parent = relationship("InventoryFolder", remote_side=[id], backref="children")
    items = relationship("InventoryItem", back_populates="folder", cascade="all, delete-orphan")

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    folder_id = Column(String(36), ForeignKey("inventory_folders.id"), nullable=True) # Nullable for 'Inbox' or Unsorted
    property_id = Column(String(36), ForeignKey("properties.id"), nullable=False)
    
    status = Column(String(50), default=InventoryStatus.INTERESTED)
    user_notes = Column(Text, nullable=True)
    tags = Column(String(500), nullable=True) # JSON or comma-separated
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company")
    folder = relationship("InventoryFolder", back_populates="items")
    property = relationship("Property")
