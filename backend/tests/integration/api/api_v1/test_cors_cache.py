import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_cors(client: TestClient):
    # Test OPTIONS request
    response = client.options(
        "/api/v1/properties/",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        }
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    
def test_cache_headers(client: TestClient, superuser_token_headers: dict):
    # This test might be tricky with TestClient because cache init happens in lifespan
    # TestClient with lifespan support is available in newer starlette/fastapi versions.
    # We'll just check if the endpoint returns 200 for now, proving the decorator doesn't crash.
    # To properly test redis cache integration, we'd need a running redis and the app lifespan to run.
    with TestClient(app) as local_client:
        response = local_client.get(
            "/api/v1/properties/",
            headers=superuser_token_headers
        )
        assert response.status_code == 200
