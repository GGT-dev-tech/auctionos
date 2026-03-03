from fastapi import APIRouter
from app.api.api_v1.endpoints import (
    auth, users, properties, dashboard, auctions, gis, admin, counties, announcements, client_data
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(auctions.router, prefix="/auctions", tags=["auctions"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(gis.router, prefix="/gis", tags=["gis"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(counties.router, prefix="/counties", tags=["counties"])
api_router.include_router(announcements.router, prefix="/admin/announcements", tags=["announcements"])
api_router.include_router(client_data.router, prefix="/client-data", tags=["client_portal"])
