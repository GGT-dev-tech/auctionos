from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class NoteBase(BaseModel):
    content: str

class NoteCreate(NoteBase):
    property_id: str

class NoteUpdate(NoteBase):
    pass

class Note(NoteBase):
    id: int
    property_id: str
    user_id: int
    created_at: datetime
    
    # Optional: Include User info if needed
    # user: User

    class Config:
        from_attributes = True
