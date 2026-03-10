from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.state_contact import StateContact

router = APIRouter()

@router.get("/contacts", response_model=List[Dict[str, str]])
def get_state_contacts(db: Session = Depends(deps.get_db)) -> Any:
    """
    Retrieve contact information/urls for all states from the database.
    """
    contacts = db.query(StateContact).all()
    results = [
        {
            "state": c.state,
            "url": c.url or ""
        }
        for c in contacts
    ]
    return results
