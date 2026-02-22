from typing import List, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api import deps
from app.schemas.property import PropertyDashboardSchema, PaginatedPropertyResponse

router = APIRouter()

@router.get("/", response_model=PaginatedPropertyResponse)
def read_properties(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    county: Optional[str] = None,
    state: Optional[str] = None,
    auction_name: Optional[str] = None,
    min_amount_due: Optional[float] = None,
    max_amount_due: Optional[float] = None,
    property_category: Optional[str] = None,
    occupancy: Optional[str] = None,
    tax_year: Optional[int] = None,
    property_type: Optional[str] = None
) -> Any:
    
    # 1. Build Base Filter Query
    where_clauses = ["1=1"]
    params = {"skip": skip, "limit": limit}

    if county:
        where_clauses.append("p.county ILIKE :county")
        params["county"] = f"%{county}%"
    if state:
        where_clauses.append("p.state ILIKE :state")
        params["state"] = f"%{state}%"
    if auction_name:
        where_clauses.append("pah.auction_name ILIKE :auction_name")
        params["auction_name"] = f"%{auction_name}%"
    if min_amount_due is not None:
        where_clauses.append("p.amount_due >= :min_amount_due")
        params["min_amount_due"] = min_amount_due
    if max_amount_due is not None:
        where_clauses.append("p.amount_due <= :max_amount_due")
        params["max_amount_due"] = max_amount_due
    if property_category:
        where_clauses.append("p.property_category = :property_category")
        params["property_category"] = property_category
    if occupancy:
        where_clauses.append("p.occupancy ILIKE :occupancy")
        params["occupancy"] = f"%{occupancy}%"
    if tax_year:
        where_clauses.append("p.tax_year = :tax_year")
        params["tax_year"] = tax_year
    if property_type:
        where_clauses.append("p.property_type ILIKE :property_type")
        params["property_type"] = f"%{property_type}%"

    where_str = " AND ".join(where_clauses)

    # 2. Get Total Count (with same filters)
    count_query = f"SELECT count(*) FROM property_details p LEFT JOIN property_auction_history pah ON pah.property_id = p.property_id WHERE {where_str}"
    total = db.execute(text(count_query), params).scalar()

    # 3. Get Items
    items_query = f"""
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
            p.occupancy,
            p.purchase_option_type
        FROM property_details p
        LEFT JOIN property_auction_history pah ON pah.property_id = p.property_id
        WHERE {where_str}
        ORDER BY pah.auction_date ASC NULLS LAST 
        OFFSET :skip LIMIT :limit
    """
    
    result = db.execute(text(items_query), params).fetchall()
    
    items = [
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
            "occupancy": r[18],
            "purchase_option_type": r[19]
        }
        for r in result
    ]

    return {"items": items, "total": total}

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
