from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel
from app.models.auction_event import AuctionEventType, AuctionEventStatus

# Shared properties
class AuctionEventBase(BaseModel):
    state: str
    county: str
    auction_type: AuctionEventType = AuctionEventType.TAX_DEED
    start_date: date
    end_date: Optional[date] = None
    status: AuctionEventStatus = AuctionEventStatus.UPCOMING
    max_interest_rate: Optional[float] = None
    redemption_period: Optional[int] = None

# Properties to receive on item creation
class AuctionEventCreate(AuctionEventBase):
    pass

# Properties to receive on item update
class AuctionEventUpdate(AuctionEventBase):
    state: Optional[str] = None
    county: Optional[str] = None
    start_date: Optional[date] = None
    auction_type: Optional[AuctionEventType] = None

# Properties shared by models stored in DB
class AuctionEventInDBBase(AuctionEventBase):
    id: str
    total_assets: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Properties to return to client
class AuctionEvent(AuctionEventInDBBase):
    pass
