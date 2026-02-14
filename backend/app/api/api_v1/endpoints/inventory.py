from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.repositories.inventory_repository import inventory_repo
from app.schemas.inventory import InventoryFolder, InventoryFolderCreate, InventoryItem, InventoryItemCreate, InventoryItemUpdate
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/folders", response_model=List[InventoryFolder])
def read_folders(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    company_id: Optional[int] = None # Optional override if admin/manager
) -> Any:
    """
    Retrieve inventory folders.
    """
    # Logic to determine company context
    cid = company_id if company_id else (current_user.companies[0].id if current_user.companies else None)
    if not cid:
        return []

    return inventory_repo.get_folders_by_company(db=db, company_id=cid)

@router.post("/folders", response_model=InventoryFolder)
def create_folder(
    *,
    db: Session = Depends(deps.get_db),
    folder_in: InventoryFolderCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new inventory folder.
    """
    cid = current_user.companies[0].id if current_user.companies else None
    if not cid:
         raise HTTPException(status_code=400, detail="User must belong to a company")
         
    return inventory_repo.create_folder(db=db, obj_in=folder_in, company_id=cid)

@router.get("/items", response_model=List[InventoryItem])
def read_items(
    db: Session = Depends(deps.get_db),
    folder_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve inventory items.
    """
    cid = current_user.companies[0].id if current_user.companies else None
    if not cid:
        return []
        
    return inventory_repo.get_items_by_company(db=db, company_id=cid, folder_id=folder_id, status=status)

@router.post("/items", response_model=InventoryItem)
def create_item(
    *,
    db: Session = Depends(deps.get_db),
    item_in: InventoryItemCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add property to inventory.
    """
    cid = current_user.companies[0].id if current_user.companies else None
    if not cid:
         raise HTTPException(status_code=400, detail="User must belong to a company")
         
    return inventory_repo.create_item(db=db, obj_in=item_in, company_id=cid)

@router.patch("/items/{item_id}", response_model=InventoryItem)
def update_item(
    *,
    db: Session = Depends(deps.get_db),
    item_id: str,
    item_in: InventoryItemUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update inventory item (move folder, change status, notes).
    """
    item = inventory_repo.update_item(db=db, item_id=item_id, obj_in=item_in)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.delete("/items/{item_id}", response_model=dict)
def delete_item(
    *,
    db: Session = Depends(deps.get_db),
    item_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove item from inventory.
    """
    if inventory_repo.delete_item(db=db, item_id=item_id):
        return {"ok": True}
    raise HTTPException(status_code=404, detail="Item not found")
