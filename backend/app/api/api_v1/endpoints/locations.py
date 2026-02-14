from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.location import Location
from app.schemas import location as schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Location])
def read_locations(
    db: Session = Depends(deps.get_db),
    q: Optional[str] = None,
    limit: int = 100
):
    """
    Retrieve locations.
    """
    query = db.query(Location)
    if q:
        query = query.filter(Location.name.ilike(f"%{q}%"))
    return query.limit(limit).all()
