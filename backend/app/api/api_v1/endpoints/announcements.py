from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.system_announcement import SystemAnnouncement
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class AnnouncementCreate(BaseModel):
    title: str
    message: str
    type: str

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=AnnouncementResponse)
def create_announcement(
    *,
    db: Session = Depends(deps.get_db),
    # TODO: Add Depends(deps.get_current_active_superuser) after login system is established
    announcement_in: AnnouncementCreate,
) -> Any:
    """
    Create a new system announcement.
    """
    announcement = SystemAnnouncement(
        title=announcement_in.title,
        message=announcement_in.message,
        type=announcement_in.type
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement

@router.get("/", response_model=List[AnnouncementResponse])
def get_active_announcements(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve active system announcements to display on Client Dashboards.
    """
    announcements = db.query(SystemAnnouncement).filter(
        SystemAnnouncement.is_active == True
    ).order_by(SystemAnnouncement.created_at.desc()).offset(skip).limit(limit).all()
    return announcements

@router.delete("/{id}")
def delete_announcement(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Hard delete or deactivate an announcement.
    """
    announcement = db.query(SystemAnnouncement).filter(SystemAnnouncement.id == id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    db.delete(announcement)
    db.commit()
    return {"ok": True}
