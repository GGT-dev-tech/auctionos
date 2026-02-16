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
    inventory_type: Optional[str] = Query(None, description="Filter by Inventory Type (auction, otc, etc.)"),
    status: Optional[str] = Query("active", description="Filter by status (active, sold, etc.)"),
    limit: int = 500,
) -> Any:
    """
    Search properties within a bounding box (viewport).
    """
    query = db.query(Property)

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

    # Optimization: Only select necessary fields for map pins if performance is an issue later
    # For now, return full objects up to limit
    properties = query.limit(limit).all()
    
    return properties
