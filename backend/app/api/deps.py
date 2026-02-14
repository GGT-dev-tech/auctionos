from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.token import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token"
)

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

from app.models.user_role import UserRole

def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user

def get_current_active_manager(
    current_user: User = Depends(get_current_active_user),
) -> User:
    # Managers and Admins can access manager-level features
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER] and not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges (Manager required)"
        )
    return current_user

def get_current_agent(
    current_user: User = Depends(get_current_active_user),
) -> User:
    print(f"DEBUG: Checking agent permissions. User ID: {current_user.id}, Role: '{current_user.role}'")
    # All authenticated active users (Admin, Manager, Agent) usually have agent-level access
    # But strictly speaking, if we want "at least Agent", that covers everyone in the Enum.
    # If we want to exclude "viewers" if that role existed, we would check.
    # Given the Enum has Admin, Manager, Agent, all of them pass.
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT] and not current_user.is_superuser:
        print(f"DEBUG: Permission denied. Role '{current_user.role}' not in permitted roles")
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges (Agent required)"
        )
    return current_user
