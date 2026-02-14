from fastapi.testclient import TestClient
from app.core.config import settings

def test_create_property_with_details_and_media(client: TestClient, superuser_token_headers: dict) -> None:
    data = {
        "title": "Luxury Villa",
        "price": 1000000,
        "details": {
            "bedrooms": 5,
            "bathrooms": 4.5,
            "sqft": 5000
        },
        "media": [
            {
                "media_type": "image",
                "url": "http://example.com/image1.jpg",
                "is_primary": True
            }
        ]
    }
    r = client.post(f"{settings.API_V1_STR}/properties/", headers=superuser_token_headers, json=data)
    assert r.status_code == 200
    created_property = r.json()
    assert created_property["title"] == "Luxury Villa"
    assert created_property["details"]["bedrooms"] == 5
    assert len(created_property["media"]) == 1
    assert created_property["media"][0]["url"] == "http://example.com/image1.jpg"

def test_filter_properties(client: TestClient, superuser_token_headers: dict) -> None:
    # Create two properties in different states
    data1 = {"title": "Prop NY", "state": "NY"}
    data2 = {"title": "Prop CA", "state": "CA"}
    
    client.post(f"{settings.API_V1_STR}/properties/", headers=superuser_token_headers, json=data1)
    client.post(f"{settings.API_V1_STR}/properties/", headers=superuser_token_headers, json=data2)

    # Filter by NY
    r = client.get(f"{settings.API_V1_STR}/properties/?state=NY", headers=superuser_token_headers)
    assert r.status_code == 200
    props = r.json()
    # At least one, and all must be NY
    assert len(props) >= 1
    for p in props:
        assert p["state"] == "NY"
