from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Table, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

# Association table for User-Company Many-to-Many relationship
user_company = Table(
    "user_company",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("company_id", Integer, ForeignKey("companies.id"), primary_key=True),
)

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nullable for initial migration safety
    balance = Column(Float, default=0.0)
    default_bid_percentage = Column(Float, default=0.70)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id], back_populates="owned_companies")
    users = relationship("User", secondary=user_company, back_populates="companies")
    properties = relationship("Property", back_populates="company")
