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
