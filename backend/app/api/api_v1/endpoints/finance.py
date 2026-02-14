from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.models.user import User
from app.models.company import Company
from app.models.transaction import Transaction, TransactionType
from app.models.expense import Expense
from app.schemas.finance import Transaction as TransactionSchema, TransactionCreate, FinanceStats, DepositRequest

router = APIRouter()

@router.get("/stats", response_model=FinanceStats)
def get_finance_stats(
    *,
    db: Session = Depends(deps.get_db),
    company_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get financial statistics for a company.
    """
    # Verify access
    user_company_ids = [c.id for c in current_user.companies]
    if company_id not in user_company_ids and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Calculate Total Invested (Total of non-refund payments)
    total_invested = db.query(func.sum(Transaction.amount)).filter(
        Transaction.company_id == company_id,
        Transaction.type == TransactionType.PAYMENT
    ).scalar() or 0.0

    # Calculate Total Expenses from existing Expense model linked to properties owned by this company
    from app.models.property import Property
    total_expenses = db.query(func.sum(Expense.amount)).join(Property).filter(
        Property.company_id == company_id
    ).scalar() or 0.0

    return FinanceStats(
        total_balance=company.balance,
        total_invested=total_invested,
        total_expenses=total_expenses,
        available_limit=company.balance - total_invested # Simplified limit
    )

@router.get("/transactions", response_model=List[TransactionSchema])
def get_transactions(
    *,
    db: Session = Depends(deps.get_db),
    company_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get transaction history for a company.
    """
    # Verify access
    user_company_ids = [c.id for c in current_user.companies]
    if company_id not in user_company_ids and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    transactions = db.query(Transaction).filter(
        Transaction.company_id == company_id
    ).order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    
    return transactions

@router.post("/deposit", response_model=TransactionSchema)
def deposit_funds(
    *,
    db: Session = Depends(deps.get_db),
    deposit_in: DepositRequest,
    current_user: User = Depends(deps.get_current_active_superuser), # Restriction: Admin only for deposits
) -> Any:
    """
    Deposit funds into a company wallet.
    """
    company = db.query(Company).filter(Company.id == deposit_in.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Update balance
    company.balance += deposit_in.amount
    db.add(company)

    # Create transaction
    transaction = Transaction(
        company_id=deposit_in.company_id,
        amount=deposit_in.amount,
        type=TransactionType.DEPOSIT,
        description=deposit_in.description
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return transaction
