from typing import Optional
from pydantic import BaseModel, UUID4
from datetime import datetime

class UserPropertyBase(BaseModel):
    title: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    zip_code: Optional[str] = None
    property_type: Optional[str] = None
    estimated_value: Optional[float] = None
    rent_estimate: Optional[float] = None
    notes: Optional[str] = None

class UserPropertyCreate(UserPropertyBase):
    pass

class UserPropertyUpdate(UserPropertyBase):
    pass

class UserProperty(UserPropertyBase):
    id: UUID4
    user_id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
