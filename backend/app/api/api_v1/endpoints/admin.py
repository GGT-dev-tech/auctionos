from fastapi import APIRouter, File, UploadFile, BackgroundTasks, HTTPException, Depends
from typing import Any
import uuid
import os
from app.services.import_service import import_service
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()
redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
import redis
redis_client = redis.Redis.from_url(redis_url)

@router.post("/import/properties")
async def import_properties(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Must be a CSV file")
        
    job_id = str(uuid.uuid4())
    temp_dir = "/app/data/temp_imports"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = f"{temp_dir}/{job_id}.csv"
    
    # Save file to shared volume for worker access
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    redis_client.set(f"import_status:{job_id}", "pending", ex=3600)
    
    # IMPORT TASK: Move to Celery instead of FastAPI BackgroundTasks
    from app.tasks import import_properties_celery_task
    import_properties_celery_task.delay(file_path, job_id)
    
    return {"message": "Import started", "job_id": job_id}

@router.post("/import/auctions")
async def import_auctions(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Must be a CSV file")
        
    job_id = str(uuid.uuid4())
    content = await file.read()
    
    redis_client.set(f"import_auctions_status:{job_id}", "pending", ex=3600)
    background_tasks.add_task(import_service.process_auctions_csv, content, job_id)
    
    return {"message": "Import started", "job_id": job_id}

@router.get("/import/status/{job_id}")
async def get_import_status(
    job_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    status = redis_client.get(f"import_status:{job_id}")
    if status is None:
        status = redis_client.get(f"import_auctions_status:{job_id}")
        
    if status is None:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {"job_id": job_id, "status": status.decode('utf-8')}

@router.post("/trigger-auto-transition")
async def trigger_auto_transition(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(deps.get_db)
) -> Any:
    from sqlalchemy import text
    try:
        # Check if there are any properties past auction_date at all
        query = text("""
            WITH latest_auctions AS (
                SELECT property_id, MAX(auction_date) as max_date
                FROM property_auction_history
                GROUP BY property_id
            )
            SELECT COUNT(*), MIN(la.max_date), MAX(la.max_date)
            FROM property_details p
            JOIN latest_auctions la ON p.property_id = la.property_id
            WHERE p.availability_status IN ('available', 'Available', 'AVAILABLE')
        """)
        results = db.execute(query).fetchone()
        
        return {
            "status": "success",
            "debug": True,
            "total_available_properties_with_history": results[0] if results else 0,
            "min_auction_date": str(results[1]) if results and results[1] else None,
            "max_auction_date": str(results[2]) if results and results[2] else None,
            "today_date": str(datetime.now().date())
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/debug-auto-transition")
def debug_auto_transition(
    limit: int = 5,
    db: Session = Depends(deps.get_db)
):
    from sqlalchemy import text
    query = text("""
        WITH latest_auctions AS (
            SELECT property_id, MAX(auction_date) as max_date
            FROM property_auction_history
            GROUP BY property_id
        )
        SELECT p.property_id, p.availability_status, la.max_date
        FROM property_details p
        LEFT JOIN latest_auctions la ON p.property_id = la.property_id
        WHERE p.availability_status ILIKE '%available%'
        LIMIT :limit
    """)
    results = db.execute(query, {"limit": limit}).fetchall()
    return [{"property_id": r[0], "status": r[1], "max_date": r[2]} for r in results]
