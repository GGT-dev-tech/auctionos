from fastapi import APIRouter
from typing import Any

router = APIRouter()

@router.get("/")
def read_gis() -> Any:
    return {"message": "GIS placeholder"}
