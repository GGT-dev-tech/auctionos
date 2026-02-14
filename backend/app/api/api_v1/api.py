from fastapi import APIRouter
from app.api.api_v1.endpoints import (
    auth,
    users,
    properties,
    ingestion,
    media,
    notes,
    expenses,
    reports,
    companies,
    dashboard,
    counties,
    inventory,
)

api_router = APIRouter()
api_router.include_router(auth.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
api_router.include_router(media.router, prefix="/media", tags=["media"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(counties.router, prefix="/counties", tags=["counties"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
