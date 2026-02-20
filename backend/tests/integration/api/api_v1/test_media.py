import os
import pytest
from fastapi.testclient import TestClient
from app.core.config import settings

def test_upload_media(client: TestClient, superuser_token_headers: dict, db):
    # 1. Create a property
    prop_data = {
        "title": "Test Property for Upload",
        "status": "active",
        "property_type": "residential",
        "price": 100000
    }
    r = client.post(
        f"{settings.API_V1_STR}/properties/",
        headers=superuser_token_headers,
        json=prop_data,
    )
    assert r.status_code == 200
    prop_id = r.json()["id"]

    # 2. Upload a file
    file_content = b"fake image content"
    files = {
        "files": ("test_image.jpg", file_content, "image/jpeg")
    }
    
    r = client.post(
        f"{settings.API_V1_STR}/media/{prop_id}/upload",
        headers=superuser_token_headers,
        files=files
    )
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 1
    assert data[0]["media_type"] == "image"
    assert "test_image.jpg" in data[0]["url"]
    
    # 3. Verify file exists
    # url is /static/media/uuid_filename
    url = data[0]["url"]
    filename = os.path.basename(url)
    filepath = f"/app/data/media/{filename}"
    assert os.path.exists(filepath)
    
    # 4. Cleanup
    os.remove(filepath)
