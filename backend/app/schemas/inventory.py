from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.inventory import InventoryStatus
from app.schemas.property import Property

# --- Folder Schemas ---
class InventoryFolderBase(BaseModel):
    name: str
    parent_id: Optional[str] = None
    is_system: Optional[bool] = False

class InventoryFolderCreate(InventoryFolderBase):
    pass

class InventoryFolderUpdate(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[str] = None

class InventoryFolder(InventoryFolderBase):
    id: str
    company_id: int
    created_at: datetime
    updated_at: datetime
    # children: List['InventoryFolder'] = [] # Circular ref handling if needed

    model_config = ConfigDict(from_attributes=True)

# --- Item Schemas ---
class InventoryItemBase(BaseModel):
    folder_id: Optional[str] = None
    status: Optional[str] = InventoryStatus.INTERESTED
    user_notes: Optional[str] = None
    tags: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    property_id: str

class InventoryItemUpdate(BaseModel):
    folder_id: Optional[str] = None
    status: Optional[str] = None
    user_notes: Optional[str] = None
    tags: Optional[str] = None

class InventoryItem(InventoryItemBase):
    id: str
    company_id: int
    property_id: str
    created_at: datetime
    updated_at: datetime
    
    property: Optional[Property] = None # Include Property details

    model_config = ConfigDict(from_attributes=True)
