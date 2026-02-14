from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.expense import Expense
from app.schemas.expense import Expense as ExpenseSchema, ExpenseCreate, ExpenseUpdate
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=ExpenseSchema)
def create_expense(
    *,
    db: Session = Depends(deps.get_db),
    expense_in: ExpenseCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new expense.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="Not enough permissions")
        
    expense = Expense(**expense_in.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.get("/property/{property_id}", response_model=List[ExpenseSchema])
def read_expenses_by_property(
    property_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get expenses for a specific property.
    """
    expenses = db.query(Expense).filter(Expense.property_id == property_id).all()
    return expenses

@router.delete("/{id}", response_model=ExpenseSchema)
def delete_expense(
    id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete an expense.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="Not enough permissions")
        
    expense = db.query(Expense).filter(Expense.id == id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    db.delete(expense)
    db.commit()
    return expense
