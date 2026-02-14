import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class TransactionType(str, enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    PAYMENT = "payment"
    REFUND = "refund"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    property_id = Column(String(36), ForeignKey("properties.id"), nullable=True, index=True)
    
    amount = Column(Float, nullable=False)
    type = Column(String(50), default=TransactionType.PAYMENT)
    description = Column(String(500), nullable=True)
    category = Column(String(50), nullable=True) # Matches ExpenseCategory if applicable
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    company = relationship("Company", backref="transactions")
    property = relationship("Property")
