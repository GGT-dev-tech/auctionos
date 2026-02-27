from typing import Any, List, Dict
from fastapi import APIRouter
from app.services.contact_service import contact_service

router = APIRouter()

@router.get("/{state}/{county}/contacts", response_model=List[Dict[str, str]])
def get_county_contacts(state: str, county: str) -> Any:
    """
    Retrieve contact information directly derived from contact_data.csv for a specific county.
    """
    contacts = contact_service.get_county_contacts(state, county)
    return contacts
