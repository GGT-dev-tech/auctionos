from fastapi.testclient import TestClient
from app.core.config import settings

def test_create_property(client: TestClient, superuser_token_headers: dict) -> None:
    data = {"title": "Test Property", "price": 500000, "city": "Test City", "state": "TC"}
    r = client.post(f"{settings.API_V1_STR}/properties/", headers=superuser_token_headers, json=data)
    assert r.status_code == 200
    created_property = r.json()
    assert created_property["title"] == "Test Property"
    assert "id" in created_property

def test_read_properties(client: TestClient, superuser_token_headers: dict) -> None:
    r = client.get(f"{settings.API_V1_STR}/properties/", headers=superuser_token_headers)
    assert r.status_code == 200
    properties = r.json()
    assert isinstance(properties, list)
    assert len(properties) >= 1

def test_read_property(client: TestClient, superuser_token_headers: dict) -> None:
    # First create a property
    data = {"title": "Read Test Property", "price": 100000}
    r_create = client.post(f"{settings.API_V1_STR}/properties/", headers=superuser_token_headers, json=data)
    created_id = r_create.json()["id"]

    # Now read it
    r = client.get(f"{settings.API_V1_STR}/properties/{created_id}", headers=superuser_token_headers)
    assert r.status_code == 200
    assert r.json()["title"] == "Read Test Property"

def test_update_property(client: TestClient, superuser_token_headers: dict) -> None:
    # Create
    data = {"title": "Update Test Property", "price": 100}
    r_create = client.post(f"{settings.API_V1_STR}/properties/", headers=superuser_token_headers, json=data)
    created_id = r_create.json()["id"]

    # Update
    update_data = {"title": "Updated Title", "price": 200}
    r = client.put(f"{settings.API_V1_STR}/properties/{created_id}", headers=superuser_token_headers, json=update_data)
    assert r.status_code == 200
    updated_prop = r.json()
    assert updated_prop["title"] == "Updated Title"
    assert updated_prop["price"] == 200

def test_delete_property(client: TestClient, superuser_token_headers: dict) -> None:
     # Create
    data = {"title": "Delete Test Property", "price": 100}
    r_create = client.post(f"{settings.API_V1_STR}/properties/", headers=superuser_token_headers, json=data)
    created_id = r_create.json()["id"]

    # Delete
    r = client.delete(f"{settings.API_V1_STR}/properties/{created_id}", headers=superuser_token_headers)
    assert r.status_code == 200
    
    # Verify deletion (should return 404)
    r_get = client.get(f"{settings.API_V1_STR}/properties/{created_id}", headers=superuser_token_headers)
    assert r_get.status_code == 404
