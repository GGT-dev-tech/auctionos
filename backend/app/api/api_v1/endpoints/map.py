from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.property import Property, PropertyStatus, InventoryType
from app.schemas.property import Property as PropertySchema

router = APIRouter()

@router.get("/search", response_model=List[PropertySchema])
def search_properties_map(
    db: Session = Depends(deps.get_db),
    north: float = Query(..., description="Northern latitude boundary"),
    south: float = Query(..., description="Southern latitude boundary"),
    east: float = Query(..., description="Eastern longitude boundary"),
    west: float = Query(..., description="Western longitude boundary"),
    inventory_type: Optional[str] = Query(None, description="Filter by Inventory Type"),
    status: Optional[str] = Query("active", description="Filter by status"),
    # New Filters
    min_appraisal: Optional[float] = None, max_appraisal: Optional[float] = None,
    min_amount_due: Optional[float] = None, max_amount_due: Optional[float] = None,
    min_acreage: Optional[float] = None, max_acreage: Optional[float] = None,
    occupancy: Optional[str] = None,
    owner_state: Optional[str] = None,
    improvements: Optional[bool] = None,
    keyword: Optional[str] = None,
    limit: int = 500,
) -> Any:
    """
    Search properties within a bounding box (viewport).
    """
    query = db.query(Property)
    
    # Needs join for details filters
    need_details = any([
        min_appraisal is not None, max_appraisal is not None, 
        min_acreage is not None, max_acreage is not None,
        improvements is not None
    ])
    
    if need_details:
         from app.models.property import PropertyDetails
         query = query.join(PropertyDetails, Property.id == PropertyDetails.property_id, isouter=True)

    # Bounding Box Filter (Simple Rectangular)
    query = query.filter(
        Property.latitude <= north,
        Property.latitude >= south,
        Property.longitude <= east,
        Property.longitude >= west
    )

    # Optional Filters
    if status and status != "all":
        query = query.filter(Property.status == status)
    
    if inventory_type:
        query = query.filter(Property.inventory_type == inventory_type)
        
    # Advanced Filters
    if min_appraisal is not None:
        query = query.filter(PropertyDetails.total_market_value >= min_appraisal)
    if max_appraisal is not None:
        query = query.filter(PropertyDetails.total_market_value <= max_appraisal)
        
    if min_amount_due is not None:
        query = query.filter(Property.amount_due >= min_amount_due)
    if max_amount_due is not None:
        query = query.filter(Property.amount_due <= max_amount_due)

    if min_acreage is not None:
        query = query.filter(PropertyDetails.lot_acres >= min_acreage)
    if max_acreage is not None:
        query = query.filter(PropertyDetails.lot_acres <= max_acreage)

    if occupancy:
        query = query.filter(Property.occupancy == occupancy)
        
    if owner_state:
        query = query.filter(Property.owner_state == owner_state)

    if improvements is not None:
        if improvements:
            query = query.filter(PropertyDetails.improvement_value > 0)
        else:
            query = query.filter((PropertyDetails.improvement_value == 0) | (PropertyDetails.improvement_value == None))

    if keyword:
        term = f"%{keyword}%"
        from sqlalchemy import or_
        query = query.filter(or_(
            Property.title.ilike(term),
            Property.parcel_id.ilike(term),
            Property.address.ilike(term),
            Property.owner_name.ilike(term)
        ))

    # Optimization: Only select necessary fields for map pins if performance is an issue later
    # For now, return full objects up to limit
    properties = query.limit(limit).all()
    
    return properties
