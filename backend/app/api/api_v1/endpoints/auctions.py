from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
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

@router.get("/calendar")
def get_auction_calendar(
    db: Session = Depends(deps.get_db)
) -> Any:
    # We use a raw SQL query or SQLAlchemy wrapper to format the events for FullCalendar
    query = text("""
        SELECT 
            id as auction_id,
            name as event_title,
            auction_date as event_date,
            time as event_time,
            location as event_location,
            notes as event_notes,
            0 as property_count, -- Placeholder until linking table is fully populated
            '' as linked_properties,
            '' as statuses,
            register_link,
            list_link
        FROM auction_events
        ORDER BY auction_date ASC
    """)
    results = db.execute(query).fetchall()
    
    # Convert Row objects to dict for JSON serialization
    return [dict(r._mapping) for r in results]
