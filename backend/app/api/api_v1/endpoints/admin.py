from fastapi import APIRouter, File, UploadFile, BackgroundTasks, HTTPException, Depends
from typing import Any
import uuid
import os
from app.services.import_service import import_service
from app.api import deps
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

@router.post("/import/history")
async def import_history(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Must be a CSV file")
        
    job_id = str(uuid.uuid4())
    content = await file.read()
    
    redis_client.set(f"import_history_status:{job_id}", "pending", ex=3600)
    background_tasks.add_task(import_service.process_history_mapping_csv, content, job_id)
    
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
        status = redis_client.get(f"import_history_status:{job_id}")
        
    if status is None:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {"job_id": job_id, "status": status.decode('utf-8')}

@router.post("/trigger-auto-transition")
async def trigger_auto_transition(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Manually triggers the background task that transitions properties from
    past auctions to 'unavailable'.
    """
    from app.services.status_updater import transition_past_auctions
    result = transition_past_auctions()
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("message"))
    return result


# ─── Consultant Applications Management ──────────────────────────────────────

@router.get("/consultants")
def list_consultant_applications(
    status: str = None,     # e.g. 'pending', 'verified', 'rejected'
    limit: int = 50,
    skip: int = 0,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Admin: list all consultant applications."""
    from app.db.session import SessionLocal
    from sqlalchemy import text

    if current_user.role not in ("admin", "superuser"):
        raise HTTPException(status_code=403, detail="Admin access required")

    db = SessionLocal()
    try:
        where = "WHERE verification_status = :status" if status else ""
        params: dict = {"limit": limit, "skip": skip}
        if status:
            params["status"] = status

        rows = db.execute(
            text(f"""
                SELECT c.*, u.email AS user_email, u.role AS user_role
                FROM consultants c
                LEFT JOIN users u ON c.user_id = u.id
                {where}
                ORDER BY c.created_at DESC
                LIMIT :limit OFFSET :skip
            """),
            params
        ).fetchall()

        return {
            "items": [dict(r._mapping) for r in rows],
            "total": len(rows),
        }
    finally:
        db.close()


@router.put("/consultants/{consultant_id}/verify")
def verify_consultant(
    consultant_id: int,
    body: dict,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Admin: approve or reject a consultant application."""
    from app.db.session import SessionLocal
    from sqlalchemy import text

    if current_user.role not in ("admin", "superuser"):
        raise HTTPException(status_code=403, detail="Admin access required")

    new_status = body.get("status", "verified")
    if new_status not in ("verified", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="Invalid status. Use: verified, rejected, pending")

    db = SessionLocal()
    try:
        result = db.execute(
            text("UPDATE consultants SET verification_status = :s WHERE id = :id RETURNING id, name, email, verification_status"),
            {"s": new_status, "id": consultant_id}
        ).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Consultant not found")

        # If approved: also update the linked user's role to 'consultant'
        if new_status == "verified":
            row = db.execute(text("SELECT user_id FROM consultants WHERE id = :id"), {"id": consultant_id}).fetchone()
            if row and row[0]:
                db.execute(text("UPDATE users SET role = 'consultant' WHERE id = :uid"), {"uid": row[0]})

        db.commit()
        return dict(result._mapping)
    finally:
        db.close()


@router.delete("/consultants/{consultant_id}")
def delete_consultant_application(
    consultant_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Admin: delete a consultant application."""
    from app.db.session import SessionLocal
    from sqlalchemy import text

    if current_user.role not in ("admin", "superuser"):
        raise HTTPException(status_code=403, detail="Admin access required")

    db = SessionLocal()
    try:
        result = db.execute(
            text("DELETE FROM consultants WHERE id = :id RETURNING id"),
            {"id": consultant_id}
        ).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Consultant not found")
        db.commit()
        return {"deleted": consultant_id}
    finally:
        db.close()

