from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.note import Note
from app.schemas.note import NoteCreate, Note as NoteSchema
from app.db.base_class import Base

router = APIRouter()

@router.get("/{property_id}", response_model=List[NoteSchema])
def read_notes(
    property_id: str,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get notes for a property.
    """
    notes = db.query(Note).filter(Note.property_id == property_id).order_by(Note.created_at.desc()).all()
    return notes

@router.post("/", response_model=NoteSchema)
def create_note(
    *,
    db: Session = Depends(deps.get_db),
    note_in: NoteCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new note.
    """
    note = Note(
        property_id=note_in.property_id,
        user_id=current_user.id,
        content=note_in.content
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{id}", response_model=NoteSchema)
def delete_note(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a note.
    """
    note = db.query(Note).filter(Note.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Only allow author or admin/agent to delete? For now, allow all active users or author specific
    # Let's restrict to author or admin
    if current_user.id != note.user_id and not current_user.is_superuser and current_user.role != 'admin':
         raise HTTPException(status_code=400, detail="Not enough permissions")

    db.delete(note)
    db.commit()
    return note
