from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.user_property import UserProperty
from app.schemas.user_property import UserProperty as UserPropertySchema, UserPropertyCreate, UserPropertyUpdate

router = APIRouter()

@router.get("/", response_model=List[UserPropertySchema])
def read_user_properties(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve user properties for the active company.
    """
    if not current_user.active_company_id:
        return []
        
    properties = db.query(UserProperty).filter(
        UserProperty.company_id == current_user.active_company_id,
        UserProperty.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return properties

@router.post("/", response_model=UserPropertySchema)
def create_user_property(
    *,
    db: Session = Depends(deps.get_db),
    property_in: UserPropertyCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new user property.
    """
    if not current_user.active_company_id:
        raise HTTPException(status_code=400, detail="User must belong to a company to create properties")

    property_data = property_in.model_dump(exclude_unset=True) if hasattr(property_in, 'model_dump') else property_in.dict(exclude_unset=True)
    
    db_obj = UserProperty(
        **property_data,
        user_id=current_user.id,
        company_id=current_user.active_company_id
    )
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=UserPropertySchema)
def update_user_property(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    property_in: UserPropertyUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a user property.
    """
    db_obj = db.query(UserProperty).filter(
        UserProperty.id == id,
        UserProperty.company_id == current_user.active_company_id,
        UserProperty.user_id == current_user.id
    ).first()
    
    if not db_obj:
        raise HTTPException(status_code=404, detail="Property not found")
        
    update_data = property_in.model_dump(exclude_unset=True) if hasattr(property_in, 'model_dump') else property_in.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.delete("/{id}")
def delete_user_property(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a user property.
    """
    db_obj = db.query(UserProperty).filter(
        UserProperty.id == id,
        UserProperty.company_id == current_user.active_company_id,
        UserProperty.user_id == current_user.id
    ).first()
    
    if not db_obj:
        raise HTTPException(status_code=404, detail="Property not found")
        
    db.delete(db_obj)
    db.commit()
    return {"status": "success"}
