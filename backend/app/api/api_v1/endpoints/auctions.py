from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.api import deps
from app.models.auction_event import AuctionEvent
from app.schemas.auction_event import AuctionEvent, AuctionEventCreate, AuctionEventUpdate
from app.services.import_service import ImportService
from app.models.property import Property

router = APIRouter()

@router.get("/", response_model=List[AuctionEvent])
def read_auction_events(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve auction events.
    """
    events = db.query(AuctionEvent).offset(skip).limit(limit).all()
    # Add properties count
    for event in events:
        event.properties_count = len(event.properties)
    return events

@router.post("/", response_model=AuctionEvent)
def create_auction_event(
    *,
    db: Session = Depends(deps.get_db),
    event_in: AuctionEventCreate,
) -> Any:
    """
    Create new auction event.
    """
    event = AuctionEvent(**event_in.dict())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.put("/{id}", response_model=AuctionEvent)
def update_auction_event(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    event_in: AuctionEventUpdate,
) -> Any:
    """
    Update an auction event.
    """
    event = db.query(AuctionEvent).filter(AuctionEvent.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Auction event not found")
    
    update_data = event_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/{id}", response_model=AuctionEvent)
def read_auction_event(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get auction event by ID.
    """
    event = db.query(AuctionEvent).filter(AuctionEvent.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Auction event not found")
    event.properties_count = len(event.properties)
    return event

@router.delete("/{id}", response_model=AuctionEvent)
def delete_auction_event(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Delete an auction event.
    """
    event = db.query(AuctionEvent).filter(AuctionEvent.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Auction event not found")
    db.delete(event)
    db.commit()
    return event

@router.post("/import-csv", response_model=dict)
async def import_auction_events_csv(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Import auction events from CSV.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")
    
    content = await file.read()
    try:
        # Assuming ImportService will have this method implementing the logic
        result = ImportService.import_auction_events_csv(db, content)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
