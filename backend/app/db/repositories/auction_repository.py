from typing import List
from sqlalchemy.orm import Session
from app.models.auction_event import AuctionEvent

class AuctionRepository:
    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[AuctionEvent]:
        return db.query(AuctionEvent).offset(skip).limit(limit).all()

auction_repo = AuctionRepository()
