from fastapi import APIRouter
from typing import Any

router = APIRouter()

@router.get("/")
def get_dashboard() -> Any:
    return {"message": "Dashboard placeholder"}
