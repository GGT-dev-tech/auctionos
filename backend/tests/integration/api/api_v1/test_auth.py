from fastapi.testclient import TestClient
from app.core.config import settings

def test_register_new_user(client: TestClient) -> None:
    data = {"email": "test@example.com", "password": "password123", "is_superuser": False}
    r = client.post(f"{settings.API_V1_STR}/auth/register", json=data)
    assert r.status_code == 200
    created_user = r.json()
    assert created_user["email"] == data["email"]
    assert "id" in created_user

def test_login_access_token(client: TestClient) -> None:
    login_data = {"username": "test@example.com", "password": "password123"}
    r = client.post(f"{settings.API_V1_STR}/auth/login/access-token", data=login_data)
    assert r.status_code == 200
    tokens = r.json()
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"
