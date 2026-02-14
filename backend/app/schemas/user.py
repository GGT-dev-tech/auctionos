from typing import Optional, List
from pydantic import BaseModel, EmailStr
from app.models.user_role import UserRole
from app.schemas.company import Company

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    role: UserRole = UserRole.AGENT

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str
    company_ids: List[int] = []

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None
    role: Optional[UserRole] = None
    company_ids: Optional[List[int]] = None

# Properties to return via API
class User(UserBase):
    id: int
    companies: List[Company] = []

    class Config:
        from_attributes = True
