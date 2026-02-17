from typing import Any, List, Optional, Dict
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.models.auction import Auction
from app.schemas.auction import Auction as AuctionSchema

router = APIRouter()

@router.get("/calendar", response_model=Dict[str, List[AuctionSchema]]) # Returns date string -> list of auctions
def get_auction_calendar(
    db: Session = Depends(deps.get_db),
    start_date: Optional[date] = Query(None, description="Start date for calendar view"),
    end_date: Optional[date] = Query(None, description="End date for calendar view"),
    state: Optional[str] = Query(None, description="Filter by state"),
) -> Any:
    """
    Get auctions for calendar view, grouped by date.
    """
    query = db.query(Auction)
    
    if start_date:
        query = query.filter(Auction.auction_date >= start_date)
    
    if end_date:
        query = query.filter(Auction.auction_date <= end_date)
        
    if state:
        query = query.filter(Auction.state == state)
        
    auctions = query.order_by(Auction.auction_date).all()
    
    # Group by date for easier frontend consumption
    calendar_data = {}
    for auction in auctions:
        if auction.auction_date:
            date_str = auction.auction_date.isoformat()
            if date_str not in calendar_data:
                calendar_data[date_str] = []
            calendar_data[date_str].append(auction)
            
    return calendar_data

@router.get("/", response_model=List[AuctionSchema])
def get_auctions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    state: Optional[str] = None
) -> Any:
    """
    Get a list of auctions.
    """
    query = db.query(Auction)
    if state:
        query = query.filter(Auction.state == state)
    return query.offset(skip).limit(limit).all()

# --- New Endpoints for AuctionEvent (Calendar Feature) ---

from app.models.auction_event import AuctionEvent, AuctionEventType
from app.schemas.auction_event import AuctionEvent as AuctionEventSchema

@router.get("/events/overview", response_model=Dict[str, Dict[str, Dict[str, int]]])
def get_auction_calendar_overview(
    db: Session = Depends(deps.get_db),
    year: int = Query(2026, description="Year to fetch overview for")
) -> Any:
    """
    Get aggregated auction counts for the heatmap.
    Structure: { "FL": { "1": { "tax_deed": 5, "tax_lien": 2 }, "2": ... } }
    """
    # Group by State, Month, Type
    # This might need raw SQL or careful SQLAlchemy grouping
    # For now, we will fetch relevant events and aggregate in Python for simplicity
    
    start_date = date(year, 1, 1)
    end_date = date(year, 12, 31)
    
    events = db.query(AuctionEvent).filter(
        AuctionEvent.start_date >= start_date,
        AuctionEvent.start_date <= end_date
    ).all()
    
    # Aggregate
    overview = {} # State -> Month (1-12) -> Type -> Count
    
    for event in events:
        state = event.state
        if not state: continue
        
        month = str(event.start_date.month)
        auct_type = event.auction_type.value # Enum to string
        
        if state not in overview:
            overview[state] = {}
        if month not in overview[state]:
            overview[state][month] = {}
        if auct_type not in overview[state][month]:
            overview[state][month][auct_type] = 0
            
        overview[state][month][auct_type] += 1
        
    return overview

@router.get("/events/{state}", response_model=List[AuctionEventSchema])
def get_state_auctions(
    state: str,
    db: Session = Depends(deps.get_db),
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None)
) -> Any:
    """
    Get detailed auction events for a specific state.
    """
    query = db.query(AuctionEvent).filter(AuctionEvent.state == state)
    
    if year:
        # Simple filter, ideally should adhere to start/end ranges
        start_of_year = date(year, 1, 1)
        end_of_year = date(year, 12, 31)
        query = query.filter(AuctionEvent.start_date >= start_of_year, AuctionEvent.start_date <= end_of_year)
        
    if month and year:
         # Filter for specific month
         # Construct range for that month
        import calendar
        last_day = calendar.monthrange(year, month)[1]
        start_of_month = date(year, month, 1)
        end_of_month = date(year, month, last_day)
        query = query.filter(AuctionEvent.start_date >= start_of_month, AuctionEvent.start_date <= end_of_month)

    return query.order_by(AuctionEvent.start_date).all()

