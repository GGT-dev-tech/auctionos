from typing import List, Any, Optional
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api import deps
from app.schemas.property import PropertyDashboardSchema, PaginatedPropertyResponse
from app.models.user import User

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
    property_type: Optional[str] = None,
    # New Optional Filters
    inventory: Optional[str] = None,
    min_improvements: Optional[float] = None,
    max_improvements: Optional[float] = None,
    availability: Optional[str] = None,
    min_county_appraisal: Optional[float] = None,
    max_county_appraisal: Optional[float] = None,
    min_acreage: Optional[float] = None,
    max_acreage: Optional[float] = None,
    owner_location: Optional[str] = None,
    keyword: Optional[str] = None,
    # Advanced Filters
    added_since: Optional[str] = None,
    is_unavailable: Optional[bool] = None
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
        
    # Apply New Filters
    if inventory:
        where_clauses.append("p.purchase_option_type ILIKE :inventory")
        params["inventory"] = f"%{inventory}%"
    if min_improvements is not None:
        where_clauses.append("p.improvement_value >= :min_improvements")
        params["min_improvements"] = min_improvements
    if max_improvements is not None:
        where_clauses.append("p.improvement_value <= :max_improvements")
        params["max_improvements"] = max_improvements
    if availability:
        where_clauses.append("p.availability_status ILIKE :availability")
        params["availability"] = f"%{availability}%"
    if min_county_appraisal is not None:
        where_clauses.append("p.assessed_value >= :min_county_appraisal")
        params["min_county_appraisal"] = min_county_appraisal
    if max_county_appraisal is not None:
        where_clauses.append("p.assessed_value <= :max_county_appraisal")
        params["max_county_appraisal"] = max_county_appraisal
    if min_acreage is not None:
        where_clauses.append("p.lot_acres >= :min_acreage")
        params["min_acreage"] = min_acreage
    if max_acreage is not None:
        where_clauses.append("p.lot_acres <= :max_acreage")
        params["max_acreage"] = max_acreage
    if owner_location:
        where_clauses.append("p.owner_address ILIKE :owner_location")
        params["owner_location"] = f"%{owner_location}%"
    if keyword:
        # Keyword searches parcel_id, address, zip (assumed in address)
        where_clauses.append("(p.parcel_id ILIKE :keyword OR p.address ILIKE :keyword)")
        params["keyword"] = f"%{keyword}%"
    if is_unavailable is True:
        where_clauses.append("p.availability_status = 'not available'")

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
            p.purchase_option_type,
            p.availability_status,
            p.alternate_owner_address,
            p.state_inventory_entered_date,
            p.qoz_description,
            p.parcel_shape_data,
            p.pin_ppin,
            p.raw_parcel_number,
            p.county_fips,
            p.additional_parcel_numbers,
            p.occupancy_checked_date
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
            "amount_due": r[3],
            "assessed_value": r[4],
            "auction_date": r[5],
            "auction_name": r[6],
            "cs_number": r[7],
            "account_number": r[8],
            "owner_address": r[9],
            "tax_year": r[10],
            "lot_acres": r[11],
            "estimated_value": r[12],
            "land_value": r[13],
            "improvement_value": r[14],
            "property_type": r[15],
            "address": r[16],
            "occupancy": r[17],
            "purchase_option_type": r[18],
            "availability_status": r[19],
            "alternate_owner_address": r[20],
            "state_inventory_entered_date": r[21],
            "qoz_description": r[22],
            "parcel_shape_data": r[23],
            "pin_ppin": r[24],
            "raw_parcel_number": r[25],
            "county_fips": r[26],
            "additional_parcel_numbers": r[27],
            "occupancy_checked_date": r[28]
        }
        for r in result
    ]

    return {"items": items, "total": total}

from fastapi import HTTPException
from pydantic import BaseModel

class PropertyUpdateRequest(BaseModel):
    county: Optional[str] = None
    state: Optional[str] = None
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
    availability_status: Optional[str] = None
    
    # New Extended Detail Fields
    alternate_owner_address: Optional[str] = None
    state_inventory_entered_date: Optional[date] = None
    qoz_description: Optional[str] = None
    parcel_shape_data: Optional[str] = None
    pin_ppin: Optional[str] = None
    raw_parcel_number: Optional[str] = None
    county_fips: Optional[str] = None
    additional_parcel_numbers: Optional[str] = None
    occupancy_checked_date: Optional[date] = None

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
        
    if "availability_status" in update_data:
        old_prop = db.execute(
            text("SELECT property_id, availability_status FROM property_details WHERE parcel_id = :parcel_id"),
            {"parcel_id": parcel_id}
        ).fetchone()
        
        if not old_prop:
            raise HTTPException(status_code=404, detail="Property not found")
            
        old_status = old_prop[1] or "not available"
        new_status = update_data["availability_status"]
        
        if old_status != new_status:
            db.execute(
                text("INSERT INTO property_availability_history (property_id, previous_status, new_status, change_source) VALUES (:prop_id, :prev, :new, 'manual_update')"),
                {"prop_id": old_prop[0], "prev": old_status, "new": new_status}
            )

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

@router.get("/availability-history")
def get_availability_history(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
    limit: int = 100
) -> Any:
    # Busca o histórico de alterações de disponibilidade das propriedades.
    history_query = text(f"""
        SELECT 
            h.id,
            h.property_id,
            p.parcel_id,
            p.address,
            h.previous_status,
            h.new_status,
            h.change_source,
            h.changed_at
        FROM property_availability_history h
        JOIN property_details p ON p.property_id = h.property_id
        ORDER BY h.changed_at DESC
        LIMIT :limit
    """)
    results = db.execute(history_query, {"limit": limit}).fetchall()
    return [dict(r._mapping) for r in results]

@router.get("/{parcel_id}")
def get_property(
    parcel_id: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    query = text("""
        SELECT 
            p.*,
            pah.auction_name as current_auction_name, 
            pah.auction_date as current_auction_date
        FROM property_details p
        LEFT JOIN property_auction_history pah ON pah.property_id = p.property_id
        WHERE p.parcel_id = :parcel_id
        ORDER BY pah.auction_date DESC
        LIMIT 1
    """)
    result = db.execute(query, {"parcel_id": parcel_id}).fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Property not found")
    
    history_query = text("""
        SELECT *
        FROM property_auction_history
        WHERE property_id = :property_id
        ORDER BY auction_date DESC
    """)
    history_results = db.execute(history_query, {"property_id": result.property_id}).fetchall()
    
    data = dict(result._mapping)
    data["auction_history"] = [dict(h._mapping) for h in history_results]
    
    return data
