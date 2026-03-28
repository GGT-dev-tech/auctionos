from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.config import settings
from app.api.api_v1.api import api_router
# Import base to register all models (including new property_scores)
from app.db import base  # noqa
from app.db.base_class import Base
from app.db.session import engine

from fastapi.staticfiles import StaticFiles
import os

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
from contextlib import asynccontextmanager

import asyncio
from app.services.status_updater import transition_past_auctions

async def run_daily_task():
    while True:
        try:
            # Run the transition task in a separate thread so it doesn't block
            await asyncio.to_thread(transition_past_auctions)
        except Exception as e:
            print(f"Error in daily background task: {e}")
            
        # Sleep for 12 hours before checking again
        await asyncio.sleep(12 * 3600)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create any new tables (e.g., property_scores) on startup
    Base.metadata.create_all(bind=engine)

    redis = aioredis.from_url(settings.REDIS_URL)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    
    # Start the background task loop
    task = asyncio.create_task(run_daily_task())
    
    yield
    
    # Cancel the task when shutting down
    task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Always include standard development and production origins
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://auctionos.up.railway.app",
    "https://auctionos-production.up.railway.app"
]

if settings.BACKEND_CORS_ORIGINS:
    origins.extend([str(origin) for origin in settings.BACKEND_CORS_ORIGINS])

# Deduplicate
origins = list(set(origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directory exists
static_dir = os.path.join(os.getcwd(), "data")
os.makedirs(static_dir, exist_ok=True)

import uuid
from fastapi import Request
from app.core.logger import request_id_var, logger

@app.middleware("http")
async def log_requests(request: Request, call_next):
    req_id = str(uuid.uuid4())
    token = request_id_var.set(req_id)
    
    # Log start of request (we avoid logging health checks/static to keep it clean, but for now log all)
    if not request.url.path.startswith("/static"):
        logger.info(f"Incoming request", extra={"method": request.method, "path": request.url.path})
    
    response = await call_next(request)
    
    if not request.url.path.startswith("/static"):
        logger.info(f"Request completed", extra={"status_code": response.status_code})
    
    request_id_var.reset(token)
    return response

# Mount static files
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Mount client upload files
uploads_dir = os.path.join(os.getcwd(), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to AuctionOS API"}
