from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any

from app import schemas, models
from app.models.company import Company
from app.models.user import User
from app.api import deps
from app.models.user_role import UserRole

router = APIRouter()

@router.post("/", response_model=schemas.Company)
def create_company(
    *,
    db: Session = Depends(deps.get_db),
    company_in: schemas.CompanyCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new company (Admin only).
    """
    company = db.query(Company).filter(Company.name == company_in.name).first()
    if company:
        raise HTTPException(
            status_code=400,
            detail="The company with this name already exists in the system.",
        )
    company = Company(
        name=company_in.name,
        owner_id=company_in.owner_id
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

@router.get("/", response_model=List[schemas.Company])
def read_companies(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve companies.
    Admins see all.
    Managers/Agents see companies they belong to.
    """
    if current_user.is_superuser or current_user.role == UserRole.ADMIN:
        companies = db.query(Company).offset(skip).limit(limit).all()
    else:
        # Return only companies the user is linked to
        companies = current_user.companies
    return companies

@router.put("/{company_id}", response_model=schemas.Company)
def update_company(
    *,
    db: Session = Depends(deps.get_db),
    company_id: int,
    company_in: schemas.CompanyUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a company. (Admin only)
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found",
        )
    
    if company_in.name is not None:
        company.name = company_in.name
    if company_in.owner_id is not None:
        company.owner_id = company_in.owner_id

    db.add(company)
    db.commit()
    db.refresh(company)
    return company

@router.delete("/{company_id}", response_model=schemas.Company)
def delete_company(
    *,
    db: Session = Depends(deps.get_db),
    company_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a company. (Admin only)
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found",
        )
    db.delete(company)
    db.commit()
    return company

@router.post("/{company_id}/link-user", response_model=schemas.Company)
def link_user_to_company(
    *,
    db: Session = Depends(deps.get_db),
    company_id: int,
    user_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Link a user to a company (Admin only).
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user not in company.users:
        company.users.append(user)
        db.commit()
        db.refresh(company)
        
    return company
