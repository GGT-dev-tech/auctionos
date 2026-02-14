from typing import Optional
from datetime import date
from pydantic import BaseModel, ConfigDict
from app.models.expense import ExpenseCategory

class ExpenseBase(BaseModel):
    category: str
    amount: float
    date: Optional[date] = None
    description: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    property_id: str

class ExpenseUpdate(ExpenseBase):
    category: Optional[str] = None
    amount: Optional[float] = None

class Expense(ExpenseBase):
    id: str
    property_id: str
    
    model_config = ConfigDict(from_attributes=True)
