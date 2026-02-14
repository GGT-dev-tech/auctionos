from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.transaction import TransactionType

class TransactionBase(BaseModel):
    amount: float
    type: str = TransactionType.PAYMENT
    description: Optional[str] = None
    category: Optional[str] = None
    property_id: Optional[str] = None

class TransactionCreate(TransactionBase):
    company_id: int

class Transaction(TransactionBase):
    id: str
    company_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class FinanceStats(BaseModel):
    total_balance: float
    total_invested: float
    total_expenses: float
    available_limit: float
    realized_roi: float = 0.0
    default_bid_percentage: float = 0.70

class DepositRequest(BaseModel):
    company_id: int
    amount: float
    description: Optional[str] = "Fund deposit"
