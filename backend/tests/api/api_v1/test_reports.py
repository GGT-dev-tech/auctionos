import os
import pytest
from fastapi.testclient import TestClient
from app.core.config import settings

def test_generate_report(client: TestClient, superuser_token_headers: dict):
    # 1. Create a property
    prop_data = {
        "title": "Report Test Property",
        "status": "active",
        "property_type": "land",
        "price": 50000,
        "parcel_id": "REPORT-123"
    }
    r = client.post(
        f"{settings.API_V1_STR}/properties/",
        headers=superuser_token_headers,
        json=prop_data,
    )
    assert r.status_code == 200
    prop_id = r.json()["id"]

    # 2. Generate Report
    r = client.get(
        f"{settings.API_V1_STR}/reports/{prop_id}/pdf",
        headers=superuser_token_headers
    )
    assert r.status_code == 200
    data = r.json()
    assert "url" in data
    assert "report_" in data["url"]
    
    # 3. Verify file exists
    url = data["url"]
    filename = os.path.basename(url)
    filepath = f"/app/data/reports/{filename}"
    assert os.path.exists(filepath)
    
    # Cleanup
    os.remove(filepath)
