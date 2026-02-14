from typing import List
from pydantic import BaseModel
from app.schemas.property import PropertyStatus

class BulkStatusUpdate(BaseModel):
    ids: List[str]
    status: PropertyStatus
