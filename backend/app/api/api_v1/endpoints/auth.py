from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, User as UserSchema

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserSchema)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        is_superuser=user_in.is_superuser,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/reset-admin-prod")
def reset_admin_production(secret: str, db: Session = Depends(deps.get_db)):
    """
    TEMPORARY ENDPOINT: Resets the admin user in production.
    """
    if secret != "ResetAdmin2026Secure!":
        raise HTTPException(status_code=403, detail="Invalid secret")
    
    from app.models.user_role import UserRole
    email = "admin@auctionpro.com"
    temp_password = "AdminSecurePass123!"
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        existing_user.hashed_password = security.get_password_hash(temp_password)
        existing_user.role = UserRole.ADMIN
        existing_user.is_superuser = True
        msg = f"Usuário existente '{email}' atualizado com a senha: {temp_password}"
    else:
        new_user = User(
            email=email,
            hashed_password=security.get_password_hash(temp_password),
            role=UserRole.ADMIN,
            is_superuser=True,
            is_active=True
        )
        db.add(new_user)
        msg = f"Novo usuário admin '{email}' criado com a senha: {temp_password}"
    
    db.commit()
    return {"message": "Success", "details": msg}
