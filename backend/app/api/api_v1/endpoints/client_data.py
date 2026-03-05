from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
import os
import shutil
from datetime import datetime
from uuid import uuid4

from app.api import deps
from app.models.client_data import ClientList, ClientNote, ClientAttachment, client_list_property
from app.models.property import PropertyDetails
from pydantic import BaseModel

router = APIRouter()

# UPLOAD_DIR = "/app/uploads"
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Schemas ---
class ClientListCreate(BaseModel):
    name: str

class ClientListResponse(BaseModel):
    id: int
    name: str
    property_count: int
    is_favorite_list: bool
    is_broadcasted: bool
    tags: str | None = None

class ClientListUpdate(BaseModel):
    name: str | None = None
    tags: str | None = None
    is_broadcasted: bool | None = None

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
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Create a new List folder for the client."""
    new_list = ClientList(name=list_in.name, user_id=current_user.id, is_favorite_list=False, is_broadcasted=False, tags=None)
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return {"id": new_list.id, "name": new_list.name, "property_count": 0, "is_favorite_list": new_list.is_favorite_list, "is_broadcasted": new_list.is_broadcasted, "tags": new_list.tags}

@router.get("/lists")
def get_client_lists(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Get all lists for the current client."""
    lists = db.query(ClientList).filter(ClientList.user_id == current_user.id).all()
    results = []
    for lst in lists:
        count = db.query(client_list_property).filter(client_list_property.c.list_id == lst.id).count()
        results.append({"id": lst.id, "name": lst.name, "property_count": count, "is_favorite_list": lst.is_favorite_list, "is_broadcasted": lst.is_broadcasted, "tags": lst.tags})
    return results

@router.get("/broadcasted")
def get_broadcasted_lists(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Get all lists broadcasted by admins."""
    # Logic: Only admins can broadcast, so we fetch lists where is_broadcasted=True
    # and they belong to an admin user (though currently any admin is fine).
    broadcasted = db.query(ClientList).filter(ClientList.is_broadcasted == True).all()
    results = []
    for lst in broadcasted:
        count = db.query(client_list_property).filter(client_list_property.c.list_id == lst.id).count()
        results.append({"id": lst.id, "name": lst.name, "property_count": count, "is_broadcasted": True})
    return results

@router.post("/broadcasted/{list_id}/import")
def import_broadcasted_list(
    *,
    db: Session = Depends(deps.get_db),
    list_id: int,
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Clone a broadcasted list into the client's own library."""
    source_list = db.query(ClientList).filter(ClientList.id == list_id, ClientList.is_broadcasted == True).first()
    if not source_list:
        raise HTTPException(status_code=404, detail="Broadcasted list not found")
    
    # Create copy
    new_list = ClientList(name=f"Imported: {source_list.name}", user_id=current_user.id, is_broadcasted=False)
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    
    # Copy relations
    for prop in source_list.properties:
        new_list.properties.append(prop)
    db.commit()
    
    return {"id": new_list.id, "name": new_list.name}

@router.put("/lists/{list_id}", response_model=ClientListResponse)
def update_client_list(
    *,
    db: Session = Depends(deps.get_db),
    list_id: int,
    list_in: ClientListUpdate,
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Update a list's name."""
    lst = db.query(ClientList).filter(ClientList.id == list_id, ClientList.user_id == current_user.id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found or not owned by you")
    if lst.is_favorite_list and list_in.name:
        raise HTTPException(status_code=400, detail="Cannot rename the Favorites list")
    
    if list_in.name is not None and not lst.is_favorite_list:
        lst.name = list_in.name
    if list_in.tags is not None:
        lst.tags = list_in.tags
    if list_in.is_broadcasted is not None:
        if current_user.role not in ['admin', 'superuser']:
             raise HTTPException(status_code=403, detail="Only admins can broadcast lists")
        lst.is_broadcasted = list_in.is_broadcasted

    db.commit()
    count = db.query(client_list_property).filter(client_list_property.c.list_id == lst.id).count()
    return {"id": lst.id, "name": lst.name, "property_count": count, "is_favorite_list": lst.is_favorite_list, "is_broadcasted": lst.is_broadcasted, "tags": lst.tags}

@router.delete("/lists/{list_id}")
def delete_client_list(
    *,
    db: Session = Depends(deps.get_db),
    list_id: int,
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Delete a client list."""
    lst = db.query(ClientList).filter(ClientList.id == list_id, ClientList.user_id == current_user.id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found or not owned by you")
    if lst.is_favorite_list:
        raise HTTPException(status_code=400, detail="Cannot delete the Favorites list")
    
    db.delete(lst)
    db.commit()
    return {"ok": True}

@router.post("/lists/{list_id}/properties/{property_id}")
def add_property_to_list(
    *,
    db: Session = Depends(deps.get_db),
    list_id: int,
    property_id: int,
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Add a scraped property to a specific client list."""
    lst = db.query(ClientList).filter(ClientList.id == list_id, ClientList.user_id == current_user.id).first()
    prop = db.query(PropertyDetails).filter(PropertyDetails.id == property_id).first()
    if not lst or not prop:
        raise HTTPException(status_code=404, detail="List (owned by you) or Property not found")
    
    if prop not in lst.properties:
        lst.properties.append(prop)
        db.commit()
    return {"ok": True}

@router.post("/lists/standard/add/{property_id}")
def add_property_to_standard_list(
    *,
    db: Session = Depends(deps.get_db),
    property_id: int,
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Add a property to an auto-managed State/County Standard List."""
    prop = db.query(PropertyDetails).filter(PropertyDetails.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    state = prop.state or "Unknown State"
    county = prop.county or "Unknown County"
    list_name = f"{state} - {county}"

    # Find or create the standard list
    lst = db.query(ClientList).filter(
        ClientList.user_id == current_user.id,
        ClientList.name == list_name,
        ClientList.tags == "STANDARD"
    ).first()

    if not lst:
        lst = ClientList(name=list_name, user_id=current_user.id, is_favorite_list=False, is_broadcasted=False, tags="STANDARD")
        db.add(lst)
        db.commit()
        db.refresh(lst)

    if prop not in lst.properties:
        lst.properties.append(prop)
        db.commit()
    
    # Return the new list info so frontend can react if needed
    count = db.query(client_list_property).filter(client_list_property.c.list_id == lst.id).count()
    return {"ok": True, "list": {"id": lst.id, "name": lst.name, "property_count": count, "tags": lst.tags}}

@router.get("/lists/{list_id}/properties")
def get_list_properties(
    *,
    db: Session = Depends(deps.get_db),
    list_id: int,
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Get all properties in a specific list."""
    lst = db.query(ClientList).filter(ClientList.id == list_id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    
    # Check ownership or broadcast status
    if lst.user_id != current_user.id and not lst.is_broadcasted:
        raise HTTPException(status_code=403, detail="Not authorized to view this list")
    
    # We want the same detailed view as the properties database
    results = []
    for p in lst.properties:
        # Get latest auction info if available
        auction_query = text("""
            SELECT auction_name, auction_date 
            FROM property_auction_history 
            WHERE property_id = :prop_id 
            ORDER BY auction_date DESC LIMIT 1
        """)
        auction = db.execute(auction_query, {"prop_id": p.property_id}).fetchone()
        
        # Build dict matching PropertyDashboardSchema/Frontend expectations
        prop_dict = {
            "id": p.id,
            "parcel_id": p.parcel_id,
            "address": p.address,
            "owner_address": p.owner_address,
            "county": p.county,
            "state": p.state,
            "state_code": p.state, # compatibility for some views
            "description": p.description or p.legal_description,
            "amount_due": p.amount_due,
            "lot_acres": p.lot_acres,
            "improvement_value": p.improvement_value,
            "assessed_value": p.assessed_value,
            "availability_status": p.availability_status,
            "auction_name": auction[0] if auction else None,
            "auction_date": auction[1] if auction else None,
            "property_type": p.property_type,
            "occupancy": p.occupancy
        }
        results.append(prop_dict)
        
    return results

@router.post("/lists/{list_id}/move/{property_id}")
def move_property_between_lists(
    *,
    db: Session = Depends(deps.get_db),
    list_id: int,
    property_id: int,
    target_list_id: int,
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Move a property from one list to another."""
    source_list = db.query(ClientList).filter(ClientList.id == list_id, ClientList.user_id == current_user.id).first()
    target_list = db.query(ClientList).filter(ClientList.id == target_list_id, ClientList.user_id == current_user.id).first()
    prop = db.query(PropertyDetails).filter(PropertyDetails.id == property_id).first()

    if not source_list or not target_list or not prop:
        raise HTTPException(status_code=404, detail="Source, Target list or Property not found")
    
    if prop in source_list.properties:
        source_list.properties.remove(prop)
    
    if prop not in target_list.properties:
        target_list.properties.append(prop)
    
    db.commit()
    return {"ok": True}

@router.delete("/lists/{list_id}/properties/{property_id}")
def remove_property_from_list(
    *,
    db: Session = Depends(deps.get_db),
    list_id: int,
    property_id: int,
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Remove a property from a specific client list."""
    lst = db.query(ClientList).filter(ClientList.id == list_id, ClientList.user_id == current_user.id).first()
    prop = db.query(PropertyDetails).filter(PropertyDetails.id == property_id).first()
    if not lst or not prop:
        raise HTTPException(status_code=404, detail="List (owned by you) or Property not found")
    
    if prop in lst.properties:
        lst.properties.remove(prop)
        db.commit()
    return {"ok": True}

@router.post("/favorites/toggle/{property_id}")
def toggle_favorite(
    *,
    db: Session = Depends(deps.get_db),
    property_id: int,
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Toggle a property in the user's auto-generated Favorites list."""
    prop = db.query(PropertyDetails).filter(PropertyDetails.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    fav_list = db.query(ClientList).filter(ClientList.user_id == current_user.id, ClientList.is_favorite_list == True).first()
    if not fav_list:
        fav_list = ClientList(name="Favorites", user_id=current_user.id, is_favorite_list=True)
        db.add(fav_list)
        db.commit()
        db.refresh(fav_list)

    if prop in fav_list.properties:
        fav_list.properties.remove(prop)
        is_favorite = False
    else:
        fav_list.properties.append(prop)
        is_favorite = True

    db.commit()
    return {"is_favorite": is_favorite}

@router.get("/favorites")
def get_favorites(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Get all property IDs that are favorited by the user."""
    fav_list = db.query(ClientList).filter(ClientList.user_id == current_user.id, ClientList.is_favorite_list == True).first()
    if not fav_list:
        return []
    
    return [p.id for p in fav_list.properties]

@router.post("/notes", response_model=ClientNoteResponse)
def create_client_note(
    *,
    db: Session = Depends(deps.get_db),
    note_in: ClientNoteCreate,
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Write or update a private note on a property."""
    # Check for existing note to perform an 'upsert'
    existing_note = db.query(ClientNote).filter(
        ClientNote.user_id == current_user.id,
        ClientNote.property_id == note_in.property_id
    ).first()
    
    if existing_note:
        existing_note.note_text = note_in.note_text
        existing_note.created_at = datetime.now()
        db.commit()
        db.refresh(existing_note)
        return existing_note
    
    note = ClientNote(user_id=current_user.id, property_id=note_in.property_id, note_text=note_in.note_text)
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
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """Upload a file attachment for a property, stored locally."""
    # Validations
    MAX_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".txt", ".csv"}
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File extension {file_ext} not allowed")

    # Read a chunk to check size if possible or use file.size (FastAPI 0.100+)
    # For compatibility, we'll check after upload or via content-length if available
    
    unique_filename = f"{uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    size = 0
    with open(file_path, "wb") as buffer:
        while content := file.file.read(1024 * 1024): # 1MB chunks
            size += len(content)
            if size > MAX_SIZE:
                os.remove(file_path)
                raise HTTPException(status_code=400, detail="File too large (Max 10MB)")
            buffer.write(content)
        
    attachment = ClientAttachment(
        user_id=current_user.id,
        property_id=property_id,
        filename=file.filename,
        file_path=f"/uploads/{unique_filename}"
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment
