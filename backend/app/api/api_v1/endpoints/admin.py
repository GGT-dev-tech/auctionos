
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Depends
from sqlalchemy import text
import pandas as pd
import io
import uuid
import os
from app.db.gis import get_gis_db, engine
from redis import Redis

router = APIRouter()
redis = Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))

# --- Helper Functions ---

async def process_properties_csv(file_content: bytes, job_id: str):
    try:
        df = pd.read_csv(io.BytesIO(file_content))
        
        # Basic validation (extend based on requirements)
        # required_cols = ["parcel_id"] # Example
        # if not all(col in df.columns for col in required_cols):
        #    raise ValueError("Missing required columns")

        # Rename columns to match DB schema if needed (as per spec)
        # Mapping example: 'Parcel ID' -> 'parcel_id'
        column_mapping = {
            "Parcel ID": "parcel_id",
            "Account": "account",
            "Acres": "acres",
            "Amount Due": "amount_due",
            "Auction Date": "auction_date",
            # Add more mappings
        }
        df.rename(columns=column_mapping, inplace=True)
        
        # Clean data (NaN to None for SQL)
        df = df.where(pd.notnull(df), None)

        with engine.begin() as conn:
            for _, row in df.iterrows():
                # Upsert into properties
                # Construct query dynamically or use defined columns
                # For safety/simplicity in this snippet, we assume columns match schema or we cherry-pick
                
                # Check for existing
                # This is a simplified insertion. Production needs rigorous column matching.
                
                # We will use raw SQL for flexibility with the dynamic schema
                cols = list(row.keys())
                # Filter cols that actually exist in table? 
                # For now, let's assume the CSV is well-formed or we try/except row by row (slow)
                # or better: we explicit map known columns.
                
                # Let's support the explicit columns from the spec
                known_cols = [
                    "parcel_id", "account", "acres", "amount_due", "auction_date", 
                    "county", "description", "owner_address", "parcel_address", "state_code", "status"
                ]
                
                data = {k: row.get(k) for k in known_cols if k in row}
                
                if "parcel_id" not in data or not data["parcel_id"]:
                    continue

                # Construct Insert Statement
                columns = ", ".join(data.keys())
                placeholders = ", ".join([f":{k}" for k in data.keys()])
                updates = ", ".join([f"{k} = EXCLUDED.{k}" for k in data.keys() if k != "parcel_id"])
                
                query = text(f"""
                    INSERT INTO properties ({columns}) VALUES ({placeholders})
                    ON CONFLICT (parcel_id) DO UPDATE SET {updates}
                """)
                
                conn.execute(query, data)

        redis.set(f"import_status:{job_id}", f"success: {len(df)} rows processed", ex=3600)
    except Exception as e:
        print(f"Import Error: {e}")
        redis.set(f"import_status:{job_id}", f"error: {str(e)}", ex=3600)

async def process_auctions_csv(file_content: bytes, job_id: str):
    try:
        df = pd.read_csv(io.BytesIO(file_content))
        # Spec mapping
        df.rename(columns={"Search Link": "search_link", "Auction Date": "auction_date", "Name": "name"}, inplace=True)
        df = df.where(pd.notnull(df), None)

        with engine.begin() as conn:
            for _, row in df.iterrows():
                # Insert Auction
                # Assuming 'name' and 'auction_date' are present
                if 'name' not in row or 'auction_date' not in row:
                    continue

                query = text("""
                    INSERT INTO auctions (name, auction_date, search_link, county_name, state)
                    VALUES (:name, :auction_date, :search_link, :county_name, :state)
                    RETURNING id
                """)
                # Map subset
                auction_data = {
                    "name": row.get("name"),
                    "auction_date": row.get("auction_date"),
                    "search_link": row.get("search_link"),
                    "county_name": row.get("County"),
                    "state": row.get("State")
                }
                
                result = conn.execute(query, auction_data)
                auction_id = result.scalar()

                # Link Parcels if present
                if 'Parcels' in row and row['Parcels']:
                    parcels = str(row['Parcels']).split(',')
                    for p_id in parcels:
                        p_id = p_id.strip()
                        # Link
                        link_query = text("""
                            INSERT INTO property_auction_links (property_parcel_id, auction_id)
                            VALUES (:pid, :aid) ON CONFLICT DO NOTHING
                        """)
                        conn.execute(link_query, {"pid": p_id, "aid": auction_id})
                        
                        # Update status
                        status_query = text("UPDATE properties SET status = 'pending_auction' WHERE parcel_id = :pid")
                        conn.execute(status_query, {"pid": p_id})

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

@router.patch("/properties/{parcel_id}/status")
def update_property_status(parcel_id: str, data: dict, db=Depends(get_gis_db)):
    new_status = data.get('status')
    if not new_status:
        raise HTTPException(400, "Status required")

    try:
        query = text("UPDATE properties SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE parcel_id = :pid")
        db.execute(query, {"status": new_status, "pid": parcel_id})
        os.environ.get('REDIS_URL') # Placeholder for cache invalidation logic logic
        db.commit()
        return {"status": "updated"}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))
