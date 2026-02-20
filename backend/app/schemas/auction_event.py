from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel

class AuctionEventBase(BaseModel):
    name: str
    short_name: Optional[str] = None
    auction_date: date
    time: Optional[str] = None
    location: Optional[str] = None
    county: Optional[str] = None
    state: Optional[str] = None
    notes: Optional[str] = None
    search_link: Optional[str] = None
    register_date: Optional[date] = None
    register_link: Optional[str] = None
    list_link: Optional[str] = None
    purchase_info_link: Optional[str] = None

class AuctionEventCreate(AuctionEventBase):
    pass

class AuctionEventUpdate(AuctionEventBase):
    pass

class AuctionEvent(AuctionEventBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
