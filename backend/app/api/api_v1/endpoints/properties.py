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
            pah.auction_name
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
            "auction_name": r[7]
        }
        for r in result
    ]
