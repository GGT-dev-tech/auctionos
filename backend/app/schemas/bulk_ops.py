from typing import List, Optional
from pydantic import BaseModel
from enum import Enum

class BulkActionType(str, Enum):
    update_status = 'update_status'
    delete = 'delete'

class BulkStatusUpdate(BaseModel):
    ids: List[str]
    action: BulkActionType
    status: Optional[str] = None
