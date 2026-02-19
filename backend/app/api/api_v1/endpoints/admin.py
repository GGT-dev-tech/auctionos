
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Depends
from sqlalchemy import text
import pandas as pd
import io
import uuid
import os
from app.db.gis import get_gis_db, engine
from redis import Redis
from datetime import datetime

router = APIRouter()
redis = Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))

# --- Helper Functions ---

def parse_date(date_str):
    if pd.isna(date_str):
        return None
    try:
        return pd.to_datetime(date_str).strftime('%Y-%m-%d')
    except:
        return None

def parse_float(val):
    if pd.isna(val):
        return None
    try:
        if isinstance(val, str):
            val = val.replace('$', '').replace(',', '')
        return float(val)
    except:
        return None

async def process_properties_csv(file_content: bytes, job_id: str):
    try:
        df = pd.read_csv(io.BytesIO(file_content))
        
        # Mapping from CSV Header -> DB Field (Table)
        # Table: properties (p), property_details (pd), property_auction_history (pah)
        
        with engine.begin() as conn:
            for _, row in df.iterrows():
                # 1. Prepare Property Data (Upsert)
                parcel_id = str(row.get("Parcel ID", "")).strip()
                if not parcel_id: 
                    continue

                lat, lon = None, None
                coords = row.get("coordinates")
                if coords and isinstance(coords, str) and ',' in coords:
                    try:
                        parts = coords.split(',')
                        lat = float(parts[0].strip())
                        lon = float(parts[1].strip())
                    except:
                        pass

                prop_data = {
                    "parcel_id": parcel_id,
                    "title": f"{row.get('parcel_address', 'Unknown Address')}",
                    "address": row.get("parcel_address"),
                    "owner_address": row.get("owner_address"),
                    "county": row.get("county"),
                    "state": row.get("state_code"),
                    "description": row.get("description"),
                    "amount_due": parse_float(row.get("amount_due")),
                    "next_auction_date": parse_date(row.get("auction_date")),
                    "occupancy": row.get("vacancy"),
                    "tax_sale_year": int(row.get("tax_sale_year")) if pd.notna(row.get("tax_sale_year")) else None,
                    "cs_number": row.get("cs_number"),
                    "parcel_code": row.get("parcel_code"),
                    "map_link": row.get("map_link"),
                    "property_type": row.get("type", "residential").lower(), # Map if needed
                    "latitude": lat,
                    "longitude": lon,
                    "status": "active"
                }

                # Upsert Property
                fields = ", ".join(prop_data.keys())
                placeholders = ", ".join([f":{k}" for k in prop_data.keys()])
                updates = ", ".join([f"{k} = EXCLUDED.{k}" for k in prop_data.keys() if k != "parcel_id"])
                
                query_p = text(f"""
                    INSERT INTO properties ({fields}) VALUES ({placeholders})
                    ON CONFLICT (parcel_id) DO UPDATE SET {updates}
                    RETURNING id
                """)
                res = conn.execute(query_p, prop_data)
                property_id = res.scalar()

                # 2. Prepare Property Details Data (Upsert)
                details_data = {
                    "property_id": property_id,
                    "account_number": row.get("account"),
                    "lot_acres": parse_float(row.get("acres")),
                    "estimated_arv": parse_float(row.get("estimated_arv")),
                    "estimated_rent": parse_float(row.get("estimated_rent")),
                    "improvement_value": parse_float(row.get("improvements")),
                    "land_value": parse_float(row.get("land_value")),
                    "total_market_value": parse_float(row.get("total_value")),
                    "property_category": row.get("property_category"),
                    "purchase_option_type": row.get("purchase_option_type"),
                    "updated_at": datetime.utcnow() # timestamp for change tracking
                }
                
                # Filter None values to avoid overwriting with NULL if we want partial updates? 
                # For import, explicit overwrite is usually desired.
                
                fields_pd = ", ".join(details_data.keys())
                placeholders_pd = ", ".join([f":{k}" for k in details_data.keys()])
                
                # Check if exists
                existing_pd = conn.execute(text("SELECT id FROM property_details WHERE property_id = :pid"), {"pid": property_id}).fetchone()
                
                if existing_pd:
                    updates_pd = ", ".join([f"{k} = :{k}" for k in details_data.keys() if k != "property_id"])
                    query_pd = text(f"UPDATE property_details SET {updates_pd} WHERE property_id = :property_id")
                    conn.execute(query_pd, details_data)
                else:
                    query_pd = text(f"INSERT INTO property_details ({fields_pd}) VALUES ({placeholders_pd})")
                    conn.execute(query_pd, details_data)

                # 3. Add Auction History (Insert)
                # "auction_name","auction_info_link","auction_list_link","taxes_due_auction"
                history_data = {
                    "property_id": property_id,
                    "auction_name": row.get("auction_name"),
                    "auction_date": parse_date(row.get("auction_date")),
                    "info_link": row.get("auction_info_link"),
                    "list_link": row.get("auction_list_link"),
                    "taxes_due": parse_float(row.get("taxes_due_auction")),
                }
                
                if history_data["auction_name"] or history_data["auction_date"]:
                     fields_h = ", ".join(history_data.keys())
                     placeholders_h = ", ".join([f":{k}" for k in history_data.keys()])
                     query_h = text(f"INSERT INTO property_auction_history ({fields_h}) VALUES ({placeholders_h})")
                     conn.execute(query_h, history_data)

        redis.set(f"import_status:{job_id}", f"success: {len(df)} properties processed", ex=3600)
    except Exception as e:
        print(f"Import Error: {e}")
        redis.set(f"import_status:{job_id}", f"error: {str(e)}", ex=3600)

async def process_auctions_csv(file_content: bytes, job_id: str):
    try:
        df = pd.read_csv(io.BytesIO(file_content))
        df = df.where(pd.notnull(df), None)

        with engine.begin() as conn:
            for _, row in df.iterrows():
                # 'Search Link','Name','Short Name','Tax Status','Parcels','County Code',
                # 'County Name','State','Auction Date','Time','Location','Notes',
                # 'Register Date','Register Link','List Link','Purchase Info Link'
                
                auction_data = {
                    "name": row.get("Name"),
                    "short_name": row.get("Short Name"),
                    "auction_date": parse_date(row.get("Auction Date")),
                    "time": row.get("Time"),
                    "location": row.get("Location"),
                    "county": row.get("County Name"),
                    "state": row.get("State"),
                    "notes": row.get("Notes"), # Could preserve Tax Status here too if needed
                    "search_link": row.get("Search Link"),
                    "register_date": parse_date(row.get("Register Date")),
                    "register_link": row.get("Register Link"),
                    "list_link": row.get("List Link"),
                    "purchase_info_link": row.get("Purchase Info Link")
                }

                if not auction_data["name"] or not auction_data["auction_date"]:
                    continue

                # Upsert Auction Event (assuming Name + Date is unique-ish? or just insert)
                # For now, let's Insert and return ID. If same name/date exists, we might duplicate. 
                # Better to align on some unique constraint, but schema doesn't force it.
                
                fields = ", ".join(auction_data.keys())
                placeholders = ", ".join([f":{k}" for k in auction_data.keys()])
                
                query = text(f"""
                    INSERT INTO auction_events ({fields}) VALUES ({placeholders})
                    RETURNING id
                """)
                result = conn.execute(query, auction_data)
                auction_id = result.scalar()

                # Link Parcels
                parcels_str = row.get("Parcels")
                if parcels_str:
                    # Clean up: remove brackets if any, split by comma
                    parcels_str = str(parcels_str).replace('[','').replace(']','').replace("'", "")
                    parcels = [p.strip() for p in parcels_str.split(',') if p.strip()]
                    
                    for p_code_or_id in parcels:
                        # Try to find property by parcel_id or parcel_code
                        # For now assume it's parcel_id
                        
                        # Find property_id from properties table
                        prop_res = conn.execute(text("SELECT id FROM properties WHERE parcel_id = :pid"), {"pid": p_code_or_id}).fetchone()
                        if prop_res:
                            prop_id = prop_res[0]
                            # Update Property with auction_event_id
                            conn.execute(text("UPDATE properties SET auction_event_id = :aid WHERE id = :pid"), {"aid": auction_id, "pid": prop_id})

        redis.set(f"import_auctions_status:{job_id}", f"success: {len(df)} auctions processed", ex=3600)
    except Exception as e:
        print(f"Auction Import Error: {e}")
        redis.set(f"import_auctions_status:{job_id}", f"error: {str(e)}", ex=3600)

# --- Endpoints ---

@router.post("/import-properties")
async def import_properties(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(400, detail="Must be a CSV file")
    
    content = await file.read()
    job_id = str(uuid.uuid4())
    redis.set(f"import_status:{job_id}", "pending")
    background_tasks.add_task(process_properties_csv, content, job_id)
    return {"job_id": job_id, "status": "processing"}

@router.post("/import-auctions")
async def import_auctions(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(400, detail="Must be a CSV file")
    
    content = await file.read()
    job_id = str(uuid.uuid4())
    redis.set(f"import_auctions_status:{job_id}", "pending")
    background_tasks.add_task(process_auctions_csv, content, job_id)
    return {"job_id": job_id, "status": "processing"}

@router.get("/import-status/{job_id}")
def get_import_status(job_id: str):
    status = redis.get(f"import_status:{job_id}") or redis.get(f"import_auctions_status:{job_id}")
    if not status:
        raise HTTPException(404, detail="Job not found")
    return {"status": status.decode()}

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
            SELECT p.*, pd.lot_acres, pd.estimated_arv, pd.total_market_value, pd.purchase_option_type
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
def create_property(data: dict, db=Depends(get_gis_db)):
    try:
        # Simplified manual create - mostly for testing
        if "parcel_id" not in data:
            raise HTTPException(400, "parcel_id is required")

        # Basic insert similar to import logic would go here
        # For brevity, reusing the simple insert but ideally calling a shared service function
        cols = list(data.keys())
        cols_str = ", ".join(cols)
        vals_str = ", ".join([f":{k}" for k in cols])
        
        query = text(f"INSERT INTO properties ({cols_str}) VALUES ({vals_str}) RETURNING parcel_id")
        db.execute(query, data)
        db.commit()
        return {"status": "created", "parcel_id": data["parcel_id"]}
    except Exception as e:
        db.rollback()
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
