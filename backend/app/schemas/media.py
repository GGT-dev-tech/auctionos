from typing import Optional
from pydantic import BaseModel

class MediaBase(BaseModel):
    media_type: str
    url: str
    is_primary: bool = False

class MediaCreate(MediaBase):
    pass

class MediaUpdate(MediaBase):
    pass

class Media(MediaBase):
    id: int
    property_id: str

    class Config:
        from_attributes = True
