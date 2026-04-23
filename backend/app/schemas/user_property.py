from typing import Optional
from pydantic import BaseModel, UUID4
from datetime import datetime, date

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
    
    # Core identification
    parcel_id: Optional[str] = None
    county: Optional[str] = None
    description: Optional[str] = None

    # Detailed Fields
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    sqft: Optional[int] = None
    lot_size: Optional[float] = None
    year_built: Optional[int] = None
    owner_name: Optional[str] = None
    auction_date: Optional[date] = None
    amount_due: Optional[float] = None
    
    # List association
    list_id: Optional[int] = None

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
