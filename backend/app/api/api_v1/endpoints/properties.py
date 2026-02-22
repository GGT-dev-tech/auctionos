from typing import List, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api import deps
from app.schemas.property import PropertyDashboardSchema

router = APIRouter()

@router.get("/", response_model=List[PropertyDashboardSchema])
def read_properties(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    county: Optional[str] = None,
    state: Optional[str] = None,
    auction_name: Optional[str] = None
) -> Any:
    
    query = """
        SELECT 
            p.parcel_id, 
            p.county, 
            p.state as state_code, 
            p.status, 
            p.amount_due, 
            p.assessed_value,
            pah.auction_date, 
            pah.auction_name,
            p.cs_number,
            p.account_number,
            p.owner_address,
            p.tax_year,
            p.lot_acres,
            p.estimated_value,
            p.land_value,
            p.improvement_value,
            p.property_type,
            p.address,
            p.description,
            p.occupancy,
            p.purchase_option_type
        FROM property_details p
        LEFT JOIN property_auction_history pah ON pah.property_id = p.property_id
        WHERE 1=1
    """
    params = {"skip": skip, "limit": limit}
    
    if county:
        query += " AND p.county ILIKE :county"
        params["county"] = f"%{county}%"
    if state:
        query += " AND p.state ILIKE :state"
        params["state"] = f"%{state}%"
    if auction_name:
        query += " AND pah.auction_name ILIKE :auction_name"
        params["auction_name"] = f"%{auction_name}%"
        
    query += " ORDER BY pah.auction_date ASC NULLS LAST OFFSET :skip LIMIT :limit"
    
    result = db.execute(text(query), params).fetchall()
    
    return [
        {
            "parcel_id": r[0] if r[0] else "",
            "county": r[1],
            "state_code": r[2],
            "status": r[3],
            "amount_due": r[4],
            "assessed_value": r[5],
            "auction_date": r[6],
            "auction_name": r[7],
            "cs_number": r[8],
            "account_number": r[9],
            "owner_address": r[10],
            "tax_year": r[11],
            "lot_acres": r[12],
            "estimated_value": r[13],
            "land_value": r[14],
            "improvement_value": r[15],
            "property_type": r[16],
            "address": r[17],
            "description": r[18],
            "occupancy": r[19],
            "purchase_option_type": r[20]
        }
        for r in result
    ]

from fastapi import HTTPException
from pydantic import BaseModel

class PropertyUpdateRequest(BaseModel):
    county: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None
    amount_due: Optional[float] = None
    assessed_value: Optional[float] = None
    cs_number: Optional[str] = None
    account_number: Optional[str] = None
    owner_address: Optional[str] = None
    tax_year: Optional[int] = None
    lot_acres: Optional[float] = None
    estimated_value: Optional[float] = None
    land_value: Optional[float] = None
    improvement_value: Optional[float] = None
    property_type: Optional[str] = None
    address: Optional[str] = None
    occupancy: Optional[str] = None

@router.put("/{parcel_id}", response_model=dict)
def update_property(
    parcel_id: str,
    property_in: PropertyUpdateRequest,
    db: Session = Depends(deps.get_db)
) -> Any:
    # Build dynamic update query
    update_data = property_in.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
        
    set_clause = ", ".join([f"{k} = :{k}" for k in update_data.keys()])
    query = text(f"UPDATE property_details SET {set_clause} WHERE parcel_id = :parcel_id RETURNING property_id")
    params = {**update_data, "parcel_id": parcel_id}
    
    result = db.execute(query, params).fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Property not found")
        
    db.commit()
    return {"message": "Property updated successfully", "parcel_id": parcel_id}

@router.delete("/{parcel_id}", response_model=dict)
def delete_property(
    parcel_id: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    # Property Auction History is linked via property_id, so we must query property_id first
    sel_query = text("SELECT property_id FROM property_details WHERE parcel_id = :parcel_id")
    prop = db.execute(sel_query, {"parcel_id": parcel_id}).fetchone()
    
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    # Delete Auction History entries first
    db.execute(text("DELETE FROM property_auction_history WHERE property_id = :property_id"), {"property_id": prop[0]})
    # Delete from Property Details
    db.execute(text("DELETE FROM property_details WHERE parcel_id = :parcel_id"), {"parcel_id": parcel_id})
    db.commit()
    
    return {"message": "Property deleted successfully", "parcel_id": parcel_id}
