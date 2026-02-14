from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.county import County
from pydantic import BaseModel

router = APIRouter()

class OfficeSchema(BaseModel):
    name: str | None
    phone: str | None
    online_url: str | None

class CountySchema(BaseModel):
    id: int
    state_code: str
    county_name: str
    offices: List[OfficeSchema] | None

    class Config:
        from_attributes = True

@router.get("/{state_code}", response_model=List[CountySchema])
def get_counties_by_state(
    state_code: str,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all counties for a specific state.
    """
    input_code = state_code.strip().upper()
    print(f"DEBUG: Endpoint called with raw='{state_code}', processed='{input_code}'")
    
    # Try exact match first
    counties = db.query(County).filter(County.state_code == input_code).all()
    
    # If not found, try debug query to see what's in DB for a known state
    if not counties and input_code == 'FL':
        sample = db.query(County).limit(1).first()
        print(f"DEBUG: Sample record in DB: {sample.state_code if sample else 'None'}")
        count = db.query(County).count()
        print(f"DEBUG: Total counties in DB: {count}")

    print(f"DEBUG: Found {len(counties)} counties for {input_code}")
    return counties
