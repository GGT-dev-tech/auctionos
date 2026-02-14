import shutil
import os
import uuid
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.property import Property, Media
from app.schemas.media import Media as MediaSchema

router = APIRouter()

UPLOAD_DIR = "/app/data/media"

@router.post("/{property_id}/upload", response_model=List[MediaSchema])
async def upload_media(
    property_id: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Upload media files for a property.
    """
    # Check property exists
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    if not current_user.is_superuser:
         raise HTTPException(status_code=400, detail="Not enough permissions")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    uploaded_media = []

    for file in files:
        # Generate unique filename
        filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Create Media record
        # Determine type (image/video)
        media_type = "image"
        if file.content_type and "video" in file.content_type:
            media_type = "video"
        elif file.content_type and "pdf" in file.content_type:
            media_type = "document"

        media_item = Media(
            property_id=property_id,
            media_type=media_type,
            url=f"/static/media/{filename}", # Verify static file serving setup later
            is_primary=False # Logic for primary? Maybe first one?
        )
        db.add(media_item)
        db.commit()
        db.refresh(media_item)
        uploaded_media.append(media_item)

    return uploaded_media

@router.delete("/{media_id}", response_model=MediaSchema)
def delete_media(
    media_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a media item.
    """
    if not current_user.is_superuser:
         raise HTTPException(status_code=400, detail="Not enough permissions")
         
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
        
    # Delete file from disk
    # url is /static/media/filename
    filename = os.path.basename(media.url)
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        
    db.delete(media)
    db.commit()
    
    return media
