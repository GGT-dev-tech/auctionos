from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.county_contact import CountyContact

router = APIRouter()
STATE_ABBREVIATIONS = {
    'alabama': 'al', 'alaska': 'ak', 'arizona': 'az', 'arkansas': 'ar', 'california': 'ca', 'colorado': 'co',
    'connecticut': 'ct', 'delaware': 'de', 'florida': 'fl', 'georgia': 'ga', 'hawaii': 'hi', 'idaho': 'id',
    'illinois': 'il', 'indiana': 'in', 'iowa': 'ia', 'kansas': 'ks', 'kentucky': 'ky', 'louisiana': 'la',
    'maine': 'me', 'maryland': 'md', 'massachusetts': 'ma', 'michigan': 'mi', 'minnesota': 'mn', 'mississippi': 'ms',
    'missouri': 'mo', 'montana': 'mt', 'nebraska': 'ne', 'nevada': 'nv', 'new hampshire': 'nh', 'new jersey': 'nj',
    'new mexico': 'nm', 'new york': 'ny', 'north carolina': 'nc', 'north dakota': 'nd', 'ohio': 'oh', 'oklahoma': 'ok',
    'oregon': 'or', 'pennsylvania': 'pa', 'rhode island': 'ri', 'south carolina': 'sc', 'south dakota': 'sd',
    'tennessee': 'tn', 'texas': 'tx', 'utah': 'ut', 'vermont': 'vt', 'virginia': 'va', 'washington': 'wa',
    'west virginia': 'wv', 'wisconsin': 'wi', 'wyoming': 'wy'
}

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
    state_query = STATE_ABBREVIATIONS.get(state_query, state_query)
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
