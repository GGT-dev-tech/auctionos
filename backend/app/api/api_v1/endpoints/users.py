from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings
from app.core import security
from app.models.user import User
from app.models.user_role import UserRole
from app.models.company import Company
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve users.
    Admin: All users.
    Manager: Users belonging to companies managed by this manager.
    """
    if current_user.is_superuser or current_user.role == UserRole.ADMIN:
        users = db.query(User).offset(skip).limit(limit).all()
    elif current_user.role == UserRole.MANAGER:
        # Get users from all companies the manager owns or is linked to
        # Simplification: Managers see users in companies they are linked to
        company_ids = [c.id for c in current_user.companies]
        if not company_ids:
            return []
        # Query users who have at least one company in common
        users = db.query(User).join(User.companies).filter(Company.id.in_(company_ids)).distinct().offset(skip).limit(limit).all()
    else:
        # Agents usually only see themselves in a user list or maybe peers? 
        # For security, restrict "List Users" to Admin/Manager.
        # But if Agents need to select a "Responsible" person, they might need a list.
        # For now, restrict to Admin/Manager or return only self.
        if current_user.role == UserRole.AGENT:
             return [current_user]
        else:
             return [current_user]
             
    return users

@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_superuser), # Only Admin creates users for now
) -> Any:
    """
    Create new user. (Admin only)
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    # Handle Company Linking
    companies = []
    if user_in.company_ids:
        companies = db.query(Company).filter(Company.id.in_(user_in.company_ids)).all()
        if len(companies) != len(user_in.company_ids):
             raise HTTPException(status_code=400, detail="One or more companies not found")

    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        is_superuser=user_in.is_superuser,
        role=user_in.role,
        companies=companies
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    password: str = Body(None),
    email: EmailStr = Body(None),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    current_user_data = jsonable_encoder(current_user)
    user_in = UserUpdate(**current_user_data)
    if password is not None:
        user_in.password = password
    if email is not None:
        user_in.email = email
    
    # Do not allow updating role/companies via /me
    
    if user_in.email:
        current_user.email = user_in.email
    if user_in.password:
        current_user.hashed_password = security.get_password_hash(user_in.password)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user
