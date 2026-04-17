from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.models.lead import Lead
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.post("/submit", response_model=dict)
def submit_lead(
    *,
    db: Session = Depends(deps.get_db),
    lead_in: schemas.LeadCreate,
) -> Any:
    """
    Public endpoint to capture a lead from the landing pages/funnel.
    """
    # Check if lead already exists
    lead = db.query(Lead).filter(Lead.email == lead_in.email).first()
    if lead:
        # If it exists, append new notes or update source if we want
        # For a simple marketing funnel, we might just ignore or append
        note_addition = f"\nRe-submitted via: {lead_in.source}"
        if lead_in.notes:
            note_addition += f" - {lead_in.notes}"
        lead.notes = (lead.notes or "") + note_addition
        db.add(lead)
    else:
        new_lead = Lead(
            email=lead_in.email,
            full_name=lead_in.full_name,
            source=lead_in.source,
            notes=lead_in.notes,
        )
        db.add(new_lead)
        
    db.commit()
    
    return {"status": "success", "message": "Lead captured successfully"}

@router.get("/all", response_model=List[schemas.LeadRead])
def get_leads(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Admin-only endpoint to retrieve captured leads.
    """
    leads = db.query(Lead).order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()
    return leads
