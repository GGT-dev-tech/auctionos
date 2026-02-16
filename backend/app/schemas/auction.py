from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

class AuctionBase(BaseModel):
    name: str
    short_name: Optional[str] = None
    state: Optional[str] = None
    county: Optional[str] = None
    auction_date: Optional[date] = None
    time: Optional[str] = None
    location: Optional[str] = None
    tax_status: Optional[str] = None
    parcels_count: Optional[int] = 0
    notes: Optional[str] = None
    search_link: Optional[str] = None
    register_link: Optional[str] = None
    list_link: Optional[str] = None
    info_link: Optional[str] = None

class AuctionCreate(AuctionBase):
    pass

class AuctionUpdate(AuctionBase):
    pass

class Auction(AuctionBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
