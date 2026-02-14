import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.db.session import SessionLocal
from app.main import app
from app.core.config import settings

# Use the same DB for simplicity in this setup, or configure a test DB
# Ideally, use a separate test database.
# For now, we assume the environment is set up for testing or we use a SQLite fast db for unit tests
# But since we want integration tests with MySQL, we use the real one or a test one.

@pytest.fixture(scope="session")
def db() -> Generator:
    yield SessionLocal()

@pytest.fixture(scope="module")
def client() -> Generator:
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict:
    login_data = {"username": "admin@example.com", "password": "password123"}
    # First ensure the user exists
    client.post(f"{settings.API_V1_STR}/auth/register", json={"email": "admin@example.com", "password": "password123", "is_superuser": True})
    
    r = client.post(f"{settings.API_V1_STR}/auth/login/access-token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers
