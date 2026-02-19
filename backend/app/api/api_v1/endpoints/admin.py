
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Depends
from sqlalchemy import text
import pandas as pd
import io
import uuid
import os
from app.db.gis import get_gis_db, engine
from redis import Redis
from datetime import datetime
from app.services.import_service import ImportService
from app.schemas.property import PropertyManualCreate
from pydantic import ValidationError, validator

router = APIRouter()
redis = Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))

# --- Helper Functions (Deprecated - handled in ImportService) ---

async def process_properties_csv(file_content: bytes, job_id: str):
    await ImportService.process_properties_csv(file_content, job_id)

async def process_auctions_csv(file_content: bytes, job_id: str):
    await ImportService.process_auctions_csv(file_content, job_id)

# --- Endpoints ---

@router.post("/import-properties")
async def import_properties(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(400, detail="Must be a CSV file")
    
    content = await file.read()
    job_id = str(uuid.uuid4())
    redis.set(f"import_status:{job_id}", "pending")
    
    # Offload to Background Task via Service
    background_tasks.add_task(ImportService.process_properties_csv, content, job_id)
    
    return {"job_id": job_id, "status": "processing"}

@router.post("/import-auctions")
async def import_auctions(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(400, detail="Must be a CSV file")
    
    content = await file.read()
    job_id = str(uuid.uuid4())
    redis.set(f"import_auctions_status:{job_id}", "pending")
    
    background_tasks.add_task(ImportService.process_auctions_csv, content, job_id)
    
    return {"job_id": job_id, "status": "processing"}

@router.get("/import-status/{job_id}")
def get_import_status(job_id: str):
    # Check both keys as user might poll either
    status = redis.get(f"import_status:{job_id}") or redis.get(f"import_auctions_status:{job_id}")
    errors = redis.get(f"import_errors:{job_id}")
    
    if not status:
        raise HTTPException(404, detail="Job not found")
        
    response = {"status": status.decode()}
    if errors:
        response["errors"] = eval(errors.decode()) # strict eval or json.loads if json
        
    return response

@router.get("/properties", response_model=list)
def list_properties(
    skip: int = 0, 
    limit: int = 100, 
    county: str = None, 
    state: str = None, 
    min_acres: float = None,
    max_price: float = None,
    auction_date_from: str = None,
    auction_date_to: str = None,
    db=Depends(get_gis_db)
):
    try:
        # Build dynamic query with Filters
        base_query = """
            SELECT p.*, 
                   pd.lot_acres, 
                   pd.estimated_arv, 
                   pd.estimated_rent,
                   pd.land_value,
                   pd.improvement_value,
                   pd.total_market_value, 
                   pd.purchase_option_type
            FROM properties p
            LEFT JOIN property_details pd ON p.id = pd.property_id
            WHERE p.deleted_at IS NULL
        """
        params = {"skip": skip, "limit": limit}

        if county:
            base_query += " AND p.county ILIKE :county"
            params["county"] = f"%{county}%"
        if state:
            base_query += " AND p.state = :state"
            params["state"] = state
        if min_acres:
            base_query += " AND pd.lot_acres >= :min_acres"
            params["min_acres"] = min_acres
        if max_price:
            base_query += " AND p.amount_due <= :max_price"
            params["max_price"] = max_price
        if auction_date_from:
            base_query += " AND p.next_auction_date >= :date_from"
            params["date_from"] = auction_date_from
        if auction_date_to:
            base_query += " AND p.next_auction_date <= :date_to"
            params["date_to"] = auction_date_to

        base_query += " ORDER BY p.created_at DESC OFFSET :skip LIMIT :limit"

        result = db.execute(text(base_query), params).fetchall()
        return [dict(row._mapping) for row in result]
    except Exception as e:
        print(f"List Error: {e}")
        raise HTTPException(500, str(e))

@router.post("/properties")
def create_property(data: PropertyManualCreate, db=Depends(get_gis_db)):
    try:
        with engine.begin() as conn:
            # 1. Properties Table
            prop_data = {
                "parcel_id": data.parcel_id,
                "title": data.owner_name or "Unknown Owner",
                "address": data.parcel_address,
                "owner_address": data.owner_address,
                "owner_name": data.owner_name,
                "county": data.county,
                "state": data.state_code,
                "description": data.description,
                "amount_due": data.amount_due,
                "next_auction_date": data.auction_date,
                "occupancy": data.occupancy,
                "tax_sale_year": data.tax_sale_year,
                "cs_number": data.cs_number,
                "parcel_code": data.parcel_code,
                "map_link": data.map_link,
                "property_type": (data.property_category or "residential").lower(),
                "status": "active"
            }
            
            # Remove None values
            prop_data = {k: v for k, v in prop_data.items() if v is not None}

            fields = ", ".join(prop_data.keys())
            placeholders = ", ".join([f":{k}" for k in prop_data.keys()])
            
            query_p = text(f"""
                INSERT INTO properties ({fields}) VALUES ({placeholders})
                ON CONFLICT (parcel_id) DO UPDATE SET 
                updated_at = CURRENT_TIMESTAMP
                RETURNING id
            """)
            res = conn.execute(query_p, prop_data)
            property_id = res.scalar()

            # 2. Property Details Table
            details_data = {
                "property_id": property_id,
                "account_number": data.account,
                "lot_acres": data.acres,
                "estimated_arv": data.estimated_arv,
                "estimated_rent": data.estimated_rent,
                "improvement_value": data.improvement_value,
                "land_value": data.land_value,
                "total_market_value": data.total_value,
                "property_category": data.property_category,
                "purchase_option_type": data.purchase_option_type,
                "updated_at": datetime.utcnow()
            }
             # Remove None values
            details_data = {k: v for k, v in details_data.items() if v is not None}

            fields_pd = ", ".join(details_data.keys())
            placeholders_pd = ", ".join([f":{k}" for k in details_data.keys()])
            
            # Upsert Details
            # Check if exists
            existing_pd = conn.execute(text("SELECT id FROM property_details WHERE property_id = :pid"), {"pid": property_id}).fetchone()
            
            if existing_pd:
                updates_pd = ", ".join([f"{k} = :{k}" for k in details_data.keys() if k != "property_id"])
                query_pd = text(f"UPDATE property_details SET {updates_pd} WHERE property_id = :property_id")
                conn.execute(query_pd, details_data)
            else:
                query_pd = text(f"INSERT INTO property_details ({fields_pd}) VALUES ({placeholders_pd})")
                conn.execute(query_pd, details_data)

            # 3. Auction History (if provided)
            # Only insert if auction info is present
            if data.auction_name or data.auction_date:
                 history_data = {
                    "property_id": property_id,
                    "auction_name": data.auction_name,
                    "auction_date": data.auction_date,
                    "taxes_due": data.taxes_due_auction,
                }
                 # Check if this exact auction event exists to prevent duplicates on multi-click
                 check_h = text("""
                    SELECT id FROM property_auction_history 
                    WHERE property_id = :property_id 
                    AND (auction_date = :auction_date OR auction_date IS NULL)
                    AND (auction_name = :auction_name OR auction_name IS NULL)
                 """)
                 existing_h = conn.execute(check_h, {
                     "property_id": property_id, 
                     "auction_date": data.auction_date, 
                     "auction_name": data.auction_name
                 }).fetchone()

                 if not existing_h:
                     fields_h = ", ".join(history_data.keys())
                     placeholders_h = ", ".join([f":{k}" for k in history_data.keys()])
                     query_h = text(f"INSERT INTO property_auction_history ({fields_h}) VALUES ({placeholders_h})")
                     conn.execute(query_h, history_data)

        return {"status": "created", "parcel_id": data.parcel_id}

    except Exception as e:
        print(f"Create Error: {e}")
        raise HTTPException(500, str(e))

@router.get("/properties/{parcel_id}")
def get_property_details(parcel_id: str, db=Depends(get_gis_db)):
    try:
        query = text("SELECT * FROM properties WHERE parcel_id = :pid")
        row = db.execute(query, {"pid": parcel_id}).fetchone()
        if not row:
            raise HTTPException(404, "Property not found")
        
        prop = dict(row._mapping)
        
        # Details
        det_query = text("SELECT * FROM property_details WHERE property_id = :pid")
        det_row = db.execute(det_query, {"pid": prop['id']}).fetchone()
        if det_row:
             prop.update(dict(det_row._mapping))

        # History
        hist_query = text("SELECT * FROM property_auction_history WHERE property_id = :pid ORDER BY auction_date DESC")
        hist_rows = db.execute(hist_query, {"pid": prop['id']}).fetchall()
        prop["history"] = [dict(r._mapping) for r in hist_rows]
        
        return prop
    except Exception as e:
        raise HTTPException(500, str(e))

@router.patch("/properties/{parcel_id}/status")
def update_property_status(parcel_id: str, data: dict, db=Depends(get_gis_db)):
    new_status = data.get('status')
    auction_id = data.get('auction_id')
    
    try:
        if new_status:
            query = text("UPDATE properties SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE parcel_id = :pid")
            db.execute(query, {"status": new_status, "pid": parcel_id})
        
        if auction_id:
             # Link to auction logic
             pass

        db.commit()
        return {"status": "updated"}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))
