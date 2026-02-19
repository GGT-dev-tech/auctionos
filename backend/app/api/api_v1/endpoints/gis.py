from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from geojson import Feature, dumps as geojson_dumps
import os
import json
from app.services.snapshot_service import SnapshotService
from app.db.gis import get_gis_db

router = APIRouter()

# GET /geojson uses shared get_gis_db now"

@router.post("/{parcel_id}/snapshot")
async def generate_snapshot(parcel_id: str, background_tasks: BackgroundTasks):
    """
    Triggers the background task to generate map and facade snapshots.
    """
    background_tasks.add_task(SnapshotService.generate_snapshot, parcel_id)
    return {"status": "processing", "message": "Snapshot generation queued"}

@router.post("/{parcel_id}/update-images")
def update_images(parcel_id: str, data: dict, db=Depends(get_gis_db)):
    """
    Updates the image URLs for a property. Called by the worker.
    """
    try:
        query = text("""
            UPDATE properties 
            SET map_snapshot_url = :map_url, 
                facade_image_url = :facade_url,
                updated_at = CURRENT_TIMESTAMP
            WHERE parcel_id = :parcel_id
        """)
        db.execute(query, {
            "parcel_id": parcel_id, 
            "map_url": data.get("map_snapshot_url"), 
            "facade_url": data.get("facade_image_url")
        })
        db.commit() # Ensure we commit the update if using a transaction-bound connection
        return {"status": "success"}
    except Exception as e:
        print(f"Update Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
