from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.county_contact import CountyContact

router = APIRouter()

@router.get("/{state}/{county}/contacts", response_model=List[Dict[str, str]])
def get_county_contacts(
    state: str, 
    county: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Retrieve contact information dynamically from the database for a specific county.
    """
    state_query = state.lower().strip()
    county_query = county.lower().strip()
    
    db_contacts = db.query(CountyContact).filter(
        CountyContact.state == state_query,
        CountyContact.county == county_query
    ).all()
    
    results = [
        {"name": c.name, "phone": c.phone or "", "url": c.url or ""}
        for c in db_contacts
    ]
    
    return results
