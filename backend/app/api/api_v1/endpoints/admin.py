from fastapi import APIRouter
from typing import Any

router = APIRouter()

@router.get("/")
def read_admin() -> Any:
    return {"message": "Admin placeholder"}
