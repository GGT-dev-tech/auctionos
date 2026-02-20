from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.auction_event import AuctionEvent
from app.schemas.auction_event import AuctionEvent as AuctionEventSchema

router = APIRouter()

@router.get("/", response_model=List[AuctionEventSchema])
def read_auctions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return db.query(AuctionEvent).offset(skip).limit(limit).all()
