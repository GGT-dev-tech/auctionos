import pytest
from fastapi.testclient import TestClient
from app.core.config import settings

def test_patch_property(client: TestClient, superuser_token_headers: dict):
    # Create
    r = client.post(
        f"{settings.API_V1_STR}/properties/",
        headers=superuser_token_headers,
        json={"title": "Patch Me", "status": "draft", "property_type": "land", "price": 100}
    )
    prop_id = r.json()["id"]
    
    # Patch
    r = client.patch(
        f"{settings.API_V1_STR}/properties/{prop_id}",
        headers=superuser_token_headers,
        json={"status": "active"}
    )
    assert r.status_code == 200
    assert r.json()["status"] == "active"
    assert r.json()["title"] == "Patch Me"

def test_bulk_status_update(client: TestClient, superuser_token_headers: dict):
    # Create 2 props
    ids = []
    for i in range(2):
        r = client.post(
            f"{settings.API_V1_STR}/properties/",
            headers=superuser_token_headers,
            json={"title": f"Bulk {i}", "status": "draft", "property_type": "land", "price": 100}
        )
        ids.append(r.json()["id"])
        
    # Bulk update
    r = client.post(
        f"{settings.API_V1_STR}/properties/bulk-status",
        headers=superuser_token_headers,
        json={"ids": ids, "status": "sold"}
    )
    assert r.status_code == 200
    assert r.json()["updated"] == 2
    
    # Verify
    r = client.get(f"{settings.API_V1_STR}/properties/{ids[0]}", headers=superuser_token_headers)
    assert r.json()["status"] == "sold"
    r = client.get(f"{settings.API_V1_STR}/properties/{ids[1]}", headers=superuser_token_headers)
    assert r.json()["status"] == "sold"
