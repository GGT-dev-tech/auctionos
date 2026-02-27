from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime
from uuid import uuid4

from app.api import deps
from app.models.client_data import ClientList, ClientNote, ClientAttachment, client_list_property
from app.models.property import PropertyDetails
from pydantic import BaseModel

router = APIRouter()

UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Schemas ---
class ClientListCreate(BaseModel):
    name: str

class ClientListResponse(BaseModel):
    id: int
    name: str
    property_count: int

class ClientNoteCreate(BaseModel):
    property_id: int
    note_text: str

class ClientNoteResponse(BaseModel):
    id: int
    property_id: int
    note_text: str
    created_at: datetime

class ClientAttachmentResponse(BaseModel):
    id: int
    property_id: int
    filename: str
    file_path: str
    created_at: datetime

# --- Endpoints ---

@router.post("/lists", response_model=ClientListResponse)
def create_client_list(
    *,
    db: Session = Depends(deps.get_db),
    list_in: ClientListCreate,
    # current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Create a new List folder for the client."""
    # Mocking user_id=1 for now until full Client auth is rolled out
    new_list = ClientList(name=list_in.name, user_id=1)
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return {"id": new_list.id, "name": new_list.name, "property_count": 0}

@router.get("/lists")
def get_client_lists(
    db: Session = Depends(deps.get_db),
) -> Any:
    """Get all lists for the current client."""
    lists = db.query(ClientList).filter(ClientList.user_id == 1).all()
    results = []
    for lst in lists:
        count = db.query(client_list_property).filter(client_list_property.c.list_id == lst.id).count()
        results.append({"id": lst.id, "name": lst.name, "property_count": count})
    return results

@router.post("/lists/{list_id}/properties/{property_id}")
def add_property_to_list(
    *,
    db: Session = Depends(deps.get_db),
    list_id: int,
    property_id: int,
) -> Any:
    """Add a scraped property to a specific client list."""
    lst = db.query(ClientList).filter(ClientList.id == list_id).first()
    prop = db.query(PropertyDetails).filter(PropertyDetails.id == property_id).first()
    if not lst or not prop:
        raise HTTPException(status_code=404, detail="List or Property not found")
    
    lst.properties.append(prop)
    db.commit()
    return {"ok": True}

@router.post("/notes", response_model=ClientNoteResponse)
def create_client_note(
    *,
    db: Session = Depends(deps.get_db),
    note_in: ClientNoteCreate,
) -> Any:
    """Write a private note on a property."""
    note = ClientNote(user_id=1, property_id=note_in.property_id, note_text=note_in.note_text)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.post("/attachments", response_model=ClientAttachmentResponse)
async def upload_attachment(
    *,
    db: Session = Depends(deps.get_db),
    property_id: int = Form(...),
    file: UploadFile = File(...),
) -> Any:
    """Upload a file attachment for a property, stored locally."""
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    attachment = ClientAttachment(
        user_id=1,
        property_id=property_id,
        filename=file.filename,
        file_path=f"/uploads/{unique_filename}"
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment
