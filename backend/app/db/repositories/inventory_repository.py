from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.inventory import InventoryFolder, InventoryItem, InventoryStatus
from app.schemas.inventory import InventoryFolderCreate, InventoryFolderUpdate, InventoryItemCreate, InventoryItemUpdate

class InventoryRepository:
    def get_folders_by_company(self, db: Session, company_id: int) -> List[InventoryFolder]:
        return db.query(InventoryFolder).filter(InventoryFolder.company_id == company_id).all()

    def create_folder(self, db: Session, obj_in: InventoryFolderCreate, company_id: int) -> InventoryFolder:
        db_obj = InventoryFolder(
            name=obj_in.name,
            parent_id=obj_in.parent_id,
            is_system=obj_in.is_system,
            company_id=company_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_items_by_company(self, db: Session, company_id: int, folder_id: Optional[str] = None, status: Optional[str] = None) -> List[InventoryItem]:
        query = db.query(InventoryItem).filter(InventoryItem.company_id == company_id)
        if folder_id:
            query = query.filter(InventoryItem.folder_id == folder_id)
        if status:
            query = query.filter(InventoryItem.status == status)
        return query.all()

    def create_item(self, db: Session, obj_in: InventoryItemCreate, company_id: int) -> InventoryItem:
        db_obj = InventoryItem(
            company_id=company_id,
            property_id=obj_in.property_id,
            folder_id=obj_in.folder_id,
            status=obj_in.status if obj_in.status else InventoryStatus.INTERESTED,
            user_notes=obj_in.user_notes,
            tags=obj_in.tags
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_item(self, db: Session, item_id: str, obj_in: InventoryItemUpdate) -> Optional[InventoryItem]:
        db_obj = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
        if not db_obj:
            return None
        
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete_item(self, db: Session, item_id: str) -> bool:
        db_obj = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
        if not db_obj:
            return False
        db.delete(db_obj)
        db.commit()
        return True

inventory_repo = InventoryRepository()
