from typing import List, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.auction_event import AuctionEvent as AuctionEventSchema
from app.db.repositories.auction_repository import auction_repo

router = APIRouter()

@router.get("/", response_model=List[AuctionEventSchema])
def read_auctions(
    db: Session = Depends(deps.get_db),
    name: Optional[str] = Query(None, description="Filtro por nome"),
    state: Optional[str] = Query(None, description="Filtro por estado"),
    county: Optional[str] = Query(None, description="Filtro por condado (county_name)"),
    is_presential: Optional[bool] = Query(None, description="True para presencial, False para online"),
    sort_by_date: bool = Query(True, description="Ordenar por auction_date ascendente"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    return auction_repo.get_multi(
        db, 
        skip=skip, 
        limit=limit,
        name=name,
        state=state,
        county=county,
        is_presential=is_presential,
        sort_by_date=sort_by_date
    )

@router.get("/calendar")
def get_auction_calendar(
    db: Session = Depends(deps.get_db),
    name: Optional[str] = Query(None, description="Filtro por nome"),
    state: Optional[str] = Query(None, description="Filtro por estado"),
    county: Optional[str] = Query(None, description="Filtro por condado (county_name)"),
    is_presential: Optional[bool] = Query(None, description="True para presencial, False para online"),
) -> Any:
    return auction_repo.get_calendar_events(
        db,
        name=name,
        state=state,
        county=county,
        is_presential=is_presential
    )
