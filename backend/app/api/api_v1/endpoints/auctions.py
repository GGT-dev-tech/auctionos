from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.auction_event import AuctionEvent as AuctionEventSchema
from app.db.repositories.auction_repository import auction_repo

router = APIRouter()

@router.get("/", response_model=List[AuctionEventSchema])
def read_auctions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return auction_repo.get_multi(db, skip=skip, limit=limit)
