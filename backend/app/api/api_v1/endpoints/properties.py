from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.property import PropertyDetails
from app.schemas.property import PropertyDetails as PropertyDetailsSchema

router = APIRouter()

@router.get("/", response_model=List[PropertyDetailsSchema])
def read_properties(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return db.query(PropertyDetails).offset(skip).limit(limit).all()
