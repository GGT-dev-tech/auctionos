from fastapi import APIRouter
from app.api.api_v1.endpoints import (
    auth,
    users,
    auth, users, companies, properties, inventory, locations,
    finance, reports, dashboard, auctions, gis, notes, counties
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(finance.router, prefix="/finance", tags=["finance"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(auctions.router, prefix="/auctions", tags=["auctions"])
api_router.include_router(gis.router, prefix="/gis", tags=["gis"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(counties.router, prefix="/counties", tags=["counties"])
