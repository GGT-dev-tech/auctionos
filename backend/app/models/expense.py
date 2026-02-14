import uuid
from datetime import date
from sqlalchemy import Column, String, Float, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class ExpenseCategory(str, enum.Enum):
    REHAB = "Projetos / Obra"
    TAX = "Condominio / IPTU"
    UTILITIES = "Agua / Luz / Gas"
    INSURANCE = "Seguro / Alarmes"
    OTHER = "Outros"
    INTERNET = "Internet"
    CLEANING = "Limpeza / Jardinagem"

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    property_id = Column(String(36), ForeignKey("properties.id"), nullable=False)
    
    category = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, default=date.today)
    description = Column(String(255), nullable=True)

    property = relationship("Property", back_populates="expenses")
