import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from fastapi import HTTPException

# Assume attom_enrichment is imported successfully
from app.services.attom_enrichment import enrich_property, map_attom_to_db, get_missing_fields
from app.models.property import PropertyDetails

@pytest.fixture
def mock_db():
    db = MagicMock(spec=Session)
    return db

@pytest.fixture
def mock_property():
    prop = PropertyDetails(
        id=1,
        property_id="test-prop-id-123",
        parcel_id="PARCEL-123",
        attom_id="1234567",
        address="123 Test St",
        county="Test County",
        state="TS",
        # some fields are explicitly None to simulate missing
        year_built=None,
        latitude=None,
        longitude=None,
        estimated_value=None,
        lot_size=None,
        bedrooms=None,
        bathrooms=None,
        owner_name=None,
        owner_occupied=None
    )
    return prop

def test_get_missing_fields(mock_property):
    missing = get_missing_fields(mock_property)
    # We set almost all crucial fields to None, so they should be missing
    assert "year_built" in missing
    assert "latitude" in missing
    assert isinstance(missing, list)
    assert len(missing) >= 9

def test_map_attom_to_db(mock_property):
    attom_payload = {
        "property": [
            {
                "identifier": {"attomId": 1234567, "apn": "APN123"},
                "location": {"latitude": 40.7128, "longitude": -74.0060},
                "building": {"yearBuilt": 1990, "rooms": {"beds": 3, "bathsTotal": 2}, "size": {"bldgSize": 1500}},
                "avm": {"amount": {"value": 300000}},
                "owner": {"owner1": {"fullName": "John Doe"}, "ownerOccupied": "Y"}
            }
        ]
    }
    missing_fields = get_missing_fields(mock_property)
    
    update_data = map_attom_to_db(attom_payload, mock_property, missing_fields)
    
    assert update_data["latitude"] == 40.7128
    assert update_data["longitude"] == -74.0060
    assert update_data["year_built"] == 1990
    assert update_data["bedrooms"] == 3
    assert update_data["bathrooms"] == 2
    assert update_data["sqft"] == 1500
    assert update_data["estimated_value"] == 300000
    assert update_data["owner_name"] == "John Doe"
    assert update_data["owner_occupied"] == "Y"


@patch('app.services.attom_enrichment.redis_client')
@patch('app.services.attom_enrichment.requests.get')
def test_enrich_property_cache_miss(mock_get, mock_redis, mock_db, mock_property):
    # Setup mock DB query to return our mock property
    mock_query = MagicMock()
    mock_query.filter.return_value.first.return_value = mock_property
    mock_db.query.return_value = mock_query

    # Setup mock Redis to return None (Cache Miss)
    mock_redis.get.return_value = None

    # Setup mock Response from requests
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "property": [
            {
                "identifier": {"attomId": 1234567, "apn": "APN123"},
                "location": {"latitude": 40.7128, "longitude": -74.0060},
                "building": {"yearBuilt": 1990, "rooms": {"beds": 3, "bathsTotal": 2}, "size": {"bldgSize": 1500}},
                "avm": {"amount": {"value": 300000}},
                "owner": {"owner1": {"fullName": "John Doe"}, "ownerOccupied": "Y"}
            }
        ]
    }
    mock_get.return_value = mock_response

    # Force ATTOM_API_KEY to be set for the test
    with patch('app.services.attom_enrichment.ATTOM_API_KEY', 'test_key'):
        result = enrich_property(mock_db, "test-prop-id-123")

    assert result["status"] == "success"
    assert result["property_id"] == "test-prop-id-123"
    assert result["enriched_fields"]["year_built"] == 1990
    
    # Verify mock calls
    mock_get.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_redis.setex.assert_called_once()

@patch('app.services.attom_enrichment.redis_client')
def test_enrich_property_cache_hit(mock_redis, mock_db, mock_property):
    # Setup mock DB query to return our mock property
    mock_query = MagicMock()
    mock_query.filter.return_value.first.return_value = mock_property
    mock_db.query.return_value = mock_query

    # Setup mock Redis to return a cached JSON payload
    import json
    cached_payload = {
        "property": [
            {
                "identifier": {"attomId": 1234567, "apn": "APN123"},
                "location": {"latitude": 34.0522, "longitude": -118.2437},
                "building": {"yearBuilt": 2000, "rooms": {"beds": 4, "bathsTotal": 3}, "size": {"bldgSize": 2000}},
                "avm": {"amount": {"value": 450000}},
                "owner": {"owner1": {"fullName": "Jane Smith"}, "ownerOccupied": "N"}
            }
        ]
    }
    mock_redis.get.return_value = json.dumps(cached_payload)

    with patch('app.services.attom_enrichment.fetch_attom_data_sync') as mock_fetch:
        result = enrich_property(mock_db, "test-prop-id-123")
        
        # Verify fetch_attom_data_sync was never called because it was a cache hit
        mock_fetch.assert_not_called()

    assert result["status"] == "success"
    assert result["enriched_fields"]["year_built"] == 2000
    mock_db.commit.assert_called_once()
