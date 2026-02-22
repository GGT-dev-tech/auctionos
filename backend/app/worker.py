import os
from celery import Celery

# Railway sets REDIS_URL globally with password auth. Local docker-compose sets CELERY_BROKER_URL explicitly.
redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
broker_url = os.getenv("CELERY_BROKER_URL", redis_url)
backend_url = os.getenv("CELERY_RESULT_BACKEND", redis_url)

celery_app = Celery(
    "worker",
    broker=broker_url,
    backend=backend_url,
    include=["app.tasks"]
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
