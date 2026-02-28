from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False

class UserCreate(UserBase):
    email: EmailStr
    password: str
    role: Optional[str] = "client"
    full_name: Optional[str] = None

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int
    role: Optional[str] = "client"

    class Config:
        from_attributes = True
