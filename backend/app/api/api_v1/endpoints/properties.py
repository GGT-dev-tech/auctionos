from typing import List, Any, Optional
from datetime import date
from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
import re
from app.api import deps
from app.schemas.property import PropertyDashboardSchema, PaginatedPropertyResponse
from app.models.user import User
from app.services.reconciliation_service import reconciliation_service
import uuid

router = APIRouter()

@router.get("/", response_model=PaginatedPropertyResponse)
def read_properties(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    county: Optional[str] = None,
    state: Optional[str] = None,
    auction_name: Optional[str] = None,
    auction_date: Optional[str] = None,
    sort_field: Optional[str] = None,
    sort_order: Optional[str] = "asc",
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
    if auction_date:
        where_clauses.append("pah.auction_date::text LIKE :auction_date")
        params["auction_date"] = f"{auction_date}%"
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
    
    # Phase 36: Intelligent Search & Fuzzy Matching
    if keyword:
        k = keyword.strip()
        
        # 1. Detect 5-digit ZIP Codes
        if re.fullmatch(r'\d{5}', k):
            where_clauses.append("p.address ILIKE :zip_keyword")
            params["zip_keyword"] = f"%{k}%"
            
        # 2. Detect Parcel IDs (digits and dashes, typical formats)
        elif re.match(r'^[\d\-A-Z]+$', k.upper()) and len(k) > 4:
            # Strip dashes for a "clean" search if the user included them
            clean_k = k.replace('-', '')
            
            where_clauses.append('''
                (
                    REPLACE(p.parcel_id, '-', '') ILIKE :clean_k OR 
                    REPLACE(p.pin_ppin, '-', '') ILIKE :clean_k OR
                    REPLACE(p.raw_parcel_number, '-', '') ILIKE :clean_k OR
                    p.parcel_id ILIKE :keyword OR
                    p.pin_ppin ILIKE :keyword
                )
            ''')
            params["clean_k"] = f"%{clean_k}%"
            params["keyword"] = f"%{k}%"
            
        # 3. Default "Fuzzy" / Broad Match (Addresses, Counties, etc.)
        else:
            # Replace spaces with wildcards to handle slight typos (e.g., "123Main" -> "123%Main")
            fuzzy_k = "%".join(k.split()) 
            
            where_clauses.append('''
                (
                    p.address ILIKE :fuzzy_k OR 
                    p.county ILIKE :fuzzy_k OR
                    p.owner_address ILIKE :fuzzy_k OR
                    p.description ILIKE :fuzzy_k OR
                    p.legal_description ILIKE :fuzzy_k OR
                    p.parcel_id ILIKE :keyword
                )
            ''')
            params["fuzzy_k"] = f"%{fuzzy_k}%"
            params["keyword"] = f"%{k}%"

    if is_unavailable is True:
        where_clauses.append("p.availability_status = 'not available'")

    where_str = " AND ".join(where_clauses)

    # 2. Get Total Count (with same filters)
    # We use a subquery for history to ensure 1:1 row ratio per property
    history_subquery = "(SELECT DISTINCT ON (property_id) * FROM property_auction_history ORDER BY property_id, auction_date DESC)"
    
    count_query = f"SELECT count(*) FROM property_details p LEFT JOIN {history_subquery} pah ON pah.property_id = p.property_id WHERE {where_str}"
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
            p.occupancy_checked_date,
            p.redfin_url,
            p.redfin_estimate,
            p.lot_sqft,
            p.sewer_type,
            p.water_type,
            p.property_type_detail,
            p.import_error_msg,
            p.is_processed,
            p.map_link
        FROM property_details p
        LEFT JOIN {history_subquery} pah ON pah.property_id = p.property_id
        WHERE {where_str}
        ORDER BY {"{order_by_clause}"}
        OFFSET :skip LIMIT :limit
    """
    
    # Ensure safe ordering
    sort_map = {
        "deal_grade": "p.assessed_value", 
        "parcel_id": "p.parcel_id",
        "cs_number": "p.cs_number",
        "account_number": "p.account_number",
        "owner_address": "p.owner_address",
        "county": "p.county",
        "state_code": "p.state",
        "availability_status": "p.availability_status",
        "tax_year": "p.tax_year",
        "amount_due": "p.amount_due",
        "lot_acres": "p.lot_acres",
        "assessed_value": "p.assessed_value",
        "land_value": "p.land_value",
        "improvement_value": "p.improvement_value",
        "property_type": "p.property_type",
        "address": "p.address",
        "auction_name": "pah.auction_name",
        "auction_date": "pah.auction_date",
        "occupancy": "p.occupancy"
    }

    order_by_clause = "pah.auction_date ASC NULLS LAST, p.parcel_id ASC"
    if sort_field and sort_field in sort_map:
        safe_col = sort_map[sort_field]
        safe_dir = "DESC" if sort_order and sort_order.lower() == "desc" else "ASC"
        order_by_clause = f"{safe_col} {safe_dir} NULLS LAST, p.parcel_id ASC"

    # Format the query with the safe order_by_clause
    items_query = items_query.format(order_by_clause=order_by_clause)

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
            "occupancy_checked_date": r[28],
            "redfin_url": r[29],
            "redfin_estimate": r[30],
            "lot_sqft": r[31],
            "sewer_type": r[32],
            "water_type": r[33],
            "property_type_detail": r[34],
            "import_error_msg": r[35],
            "is_processed": bool(r[36]) if r[36] is not None else False,
            "map_link": r[37]
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

    # V3 Extended Fields
    redfin_url: Optional[str] = None
    redfin_estimate: Optional[float] = None
    lot_sqft: Optional[float] = None
    sewer_type: Optional[str] = None
    water_type: Optional[str] = None
    property_type_detail: Optional[str] = None
    import_error_msg: Optional[str] = None
    is_processed: Optional[bool] = False

class PropertyCreateRequest(PropertyUpdateRequest):
    parcel_id: str  # Required for creation

@router.post("/", response_model=dict)
def create_property(
    property_in: PropertyCreateRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    import uuid
    
    # Check if parcel_id already exists
    exists = db.execute(text("SELECT 1 FROM property_details WHERE parcel_id = :parcel_id"), {"parcel_id": property_in.parcel_id}).fetchone()
    if exists:
        raise HTTPException(status_code=400, detail="A property with this Parcel ID already exists.")
        
    create_data = property_in.dict(exclude_unset=True)
    prop_id = str(uuid.uuid4())
    create_data["property_id"] = prop_id
    
    if "availability_status" not in create_data:
        create_data["availability_status"] = "available"
        
    keys = list(create_data.keys())
    columns = ", ".join(keys)
    values_placeholders = ", ".join([f":{k}" for k in keys])
    
    query = text(f"INSERT INTO property_details ({columns}) VALUES ({values_placeholders})")
    
    try:
        db.execute(query, create_data)
        
        # Log creation
        db.execute(
            text("INSERT INTO property_availability_history (property_id, previous_status, new_status, change_source) VALUES (:prop_id, 'new_entry', :status, 'manual_creation')"),
            {"prop_id": prop_id, "status": create_data["availability_status"]}
        )
        
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
        
    return {"message": "Property created successfully", "parcel_id": property_in.parcel_id}

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

@router.post("/{parcel_id}/purchase", response_model=dict)
def purchase_property_action(
    parcel_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Executes an atomic transaction that validates state transitions 
    and reserves/purchases the property, auditing the action.
    """
    try:
        # 1. Start explicit transaction block
        with db.begin_nested():
            # Apply row-level SELECT FOR UPDATE to ensure concurrency safety
            sel_query = text("SELECT property_id, availability_status FROM property_details WHERE parcel_id = :parcel_id FOR UPDATE")
            prop = db.execute(sel_query, {"parcel_id": parcel_id}).fetchone()
            
            if not prop:
                raise HTTPException(status_code=404, detail="Property not found")
                
            prop_id = prop[0]
            current_status = prop[1] or "not available"
            
            # State Transition Validation
            if current_status != "available":
                raise HTTPException(status_code=400, detail=f"Cannot purchase property. Current state is '{current_status}'. Must be 'available'.")
                
            # Perform atomic update
            new_status = "purchased"
            update_q = text("UPDATE property_details SET availability_status = :new_status WHERE property_id = :prop_id")
            db.execute(update_q, {"new_status": new_status, "prop_id": prop_id})
            
            # Write Audit Trail History
            audit_q = text(
                "INSERT INTO property_availability_history (property_id, previous_status, new_status, change_source) "
                "VALUES (:prop_id, :prev, :new, 'purchase_transaction')"
            )
            db.execute(audit_q, {"prop_id": prop_id, "prev": current_status, "new": new_status})
            
        # Commit the transaction block completely
        db.commit()
    except HTTPException:
        # Allow intentional HTTP validations to rise through gracefully
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Transaction completely failed due to concurrent modification or database error")
        
    return {
        "message": "Property Successfully Transacted",
        "parcel_id": parcel_id,
        "new_status": "purchased"
    }


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
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    # Use explicit columns to avoid ambiguity and facilitate dict conversion
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
    
    # Use mapping for safe access
    row_map = result._mapping
    data = dict(row_map)
    prop_id_int = row_map.get('id')
    
    # Fetch History
    history_query = text("""
        SELECT *
        FROM property_auction_history
        WHERE property_id = :property_id
        ORDER BY auction_date DESC
    """)
    history_results = db.execute(history_query, {"property_id": data.get('property_id')}).fetchall()
    data["auction_history"] = [dict(h._mapping) for h in history_results]
    
    # Initialize defaults for resilience
    data["notes"] = ""
    data["attachments"] = []

    # Fetch Notes and Attachments only if we have a valid int ID and user
    if prop_id_int and current_user:
        try:
            # Fetch Notes (Latest/Single per user)
            notes_query = text("""
                SELECT note_text FROM client_notes 
                WHERE user_id = :user_id AND property_id = :prop_id 
                ORDER BY created_at DESC LIMIT 1
            """)
            note_row = db.execute(notes_query, {"user_id": current_user.id, "prop_id": prop_id_int}).fetchone()
            if note_row:
                data["notes"] = note_row[0]
            
            # Fetch Attachments
            att_query = text("""
                SELECT filename, file_path FROM client_attachments 
                WHERE user_id = :user_id AND property_id = :prop_id
            """)
            att_rows = db.execute(att_query, {"user_id": current_user.id, "prop_id": prop_id_int}).fetchall()
            data["attachments"] = [dict(a._mapping) for a in att_rows]
        except Exception as e:
            # Log error but don't fail the whole request
            print(f"Error fetching notes/attachments: {e}")
    
    # Calculate Recommended Next Steps
    next_steps = []
    if data.get("availability_status") == "available":
        next_steps.append({"action": "Review Auction Details", "priority": "high", "type": "info"})
    if data.get("amount_due") and data.get("amount_due") > 0:
        next_steps.append({"action": "Calculate ROI with Taxes", "priority": "medium", "type": "calculate"})
    if not data.get("occupancy"):
        next_steps.append({"action": "Verify Occupancy", "priority": "medium", "type": "verify"})
    
    data["recommended_next_steps"] = next_steps

    # Fetch persisted ML score if available
    import json as _json
    score_row = db.execute(
        text("SELECT deal_score, rating, score_factors, model_version, updated_at FROM property_scores WHERE parcel_id = :parcel_id"),
        {"parcel_id": parcel_id}
    ).fetchone()
    if score_row:
        data["deal_score"] = score_row[0]
        data["deal_rating"] = score_row[1]
        data["score_factors"] = _json.loads(score_row[2]) if score_row[2] else []
        data["score_model_version"] = score_row[3]
        data["score_updated_at"] = score_row[4].isoformat() if score_row[4] else None
    else:
        data["deal_score"] = None
        data["deal_rating"] = None
        data["score_factors"] = []
        data["score_model_version"] = None
        data["score_updated_at"] = None

    return data

@router.get("/{parcel_id}/redirect/auction")
def get_auction_redirect(
    parcel_id: str,
    db: Session = Depends(deps.get_db),
    # current_user = Depends(deps.get_current_active_user)
) -> Any:
    """
    Resolves the auction link, logs the redirection effort, and returns the URL.
    """
    query = text("""
        SELECT pah.info_link, pah.list_link, p.property_id
        FROM property_details p
        LEFT JOIN property_auction_history pah ON pah.property_id = p.property_id
        WHERE p.parcel_id = :parcel_id
        ORDER BY pah.auction_date DESC
        LIMIT 1
    """)
    res = db.execute(query, {"parcel_id": parcel_id}).fetchone()
    if not res:
        raise HTTPException(status_code=404, detail="Property or Auction history not found")
    
    url = res[0] or res[1]
    if not url:
        raise HTTPException(status_code=400, detail="No auction link associated with this property")
    
    # Log action for audit
    db.execute(
        text("INSERT INTO property_availability_history (property_id, previous_status, new_status, change_source) VALUES (:prop_id, :status, :status, 'auction_redirect_click')"),
        {"prop_id": res[2], "status": "available"} # dummy status check for logging
    )
    db.commit()
    
    return {"url": url}

@router.post("/{parcel_id}/log-action")
def log_property_action(
    parcel_id: str,
    action: str = Form(...),
    db: Session = Depends(deps.get_db),
) -> Any:
    """Log generic user actions on a property for audit."""
    prop = db.execute(text("SELECT property_id FROM property_details WHERE parcel_id = :parcel_id"), {"parcel_id": parcel_id}).fetchone()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    db.execute(
        text("INSERT INTO property_availability_history (property_id, previous_status, new_status, change_source) VALUES (:prop_id, 'audit', 'audit', :action)"),
        {"prop_id": prop[0], "action": f"user_action_{action}"}
    )
    db.commit()
    return {"ok": True}

@router.post("/reconcile/{auction_id}", response_model=dict)
def reconcile_auction_properties(
    auction_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Triggers a reconciliation job to link available properties to a specific auction
    based on matching County and State locations.
    """
    result = reconciliation_service.reconcile_auction_properties(db, auction_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
