from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class CompanyBase(BaseModel):
    name: str

# Properties to receive via API on creation
class CompanyCreate(CompanyBase):
    owner_id: Optional[int] = None

# Properties to receive via API on update
class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    owner_id: Optional[int] = None

# Properties to return via API
class Company(CompanyBase):
    id: int
    owner_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
