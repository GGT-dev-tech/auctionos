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
