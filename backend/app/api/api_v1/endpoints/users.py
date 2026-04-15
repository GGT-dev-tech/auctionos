from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from app.models.activity_log import ActivityLog

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    return db.query(User).offset(skip).limit(limit).all()

@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    email = user_in.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="The user with this username already exists.")
    
    user = User(
        email=email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_superuser=user_in.is_superuser,
        role=user_in.role if hasattr(user_in, 'role') else "client",
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
    if password is not None:
        current_user.hashed_password = security.get_password_hash(password)
    if email is not None:
        current_user.email = email.strip().lower()
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    return current_user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_in.email is not None:
        user.email = user_in.email.strip().lower()
    if user_in.password is not None:
        user.hashed_password = security.get_password_hash(user_in.password)
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.role is not None:
        user.role = user_in.role
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", response_model=UserSchema)
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return user

@router.get("/{user_id}/logs")
def read_user_logs(
    user_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    return db.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/logs/all")
def read_all_logs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 200,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Fetch global activity logs for Admin visualization"""
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()
    # Need to return user details as well
    result = []
    for log in logs:
        user = db.query(User).filter(User.id == log.user_id).first()
        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource": log.resource,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at,
            "user": {"email": user.email, "full_name": user.full_name} if user else None
        })
    return result
