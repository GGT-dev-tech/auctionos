from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.config import settings
from app.api.api_v1.api import api_router
# Import base to register all models
from app.db import base  # noqa

from fastapi.staticfiles import StaticFiles
import os

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    redis = aioredis.from_url(settings.REDIS_URL)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    yield

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

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to AuctionOS API"}
