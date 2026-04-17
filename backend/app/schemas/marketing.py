from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Shared properties
class LeadBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None

# Properties to receive via API on creation
class LeadCreate(LeadBase):
    pass

# Properties to return via API
class LeadRead(LeadBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
