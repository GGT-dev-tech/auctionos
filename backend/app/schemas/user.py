from typing import Optional, Literal
from pydantic import BaseModel, EmailStr

VALID_ROLES = Literal["client", "consultant", "admin", "superuser"]

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None

class UserCreate(UserBase):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "client"      # accepts any string; validated in endpoint

class UserUpdate(UserBase):
    password: Optional[str] = None
    role: Optional[str] = None

class User(UserBase):
    id: int
    role: Optional[str] = "client"
    full_name: Optional[str] = None
    active_company_id: Optional[int] = None

    class Config:
        from_attributes = True

