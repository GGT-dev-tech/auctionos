import pytest
import os
from sqlalchemy.orm import Session
from app.services.importer import importer_service
from app.models.property import Property, PropertyStatus

def test_parse_raw_text():
    raw_text = """
    Auction Type: Tax Deed
    Case #: 2024-12345
    Parcel ID: 12-34-56-7890
    Opening Bid: $5,000.00
    Assessed Value: $150,000.00
    Amount
    $6,000.00
    Sold To
    John Doe
    Auction Sold
    02/08/2026
    Property Address:
    123 Main St
    Miami, FL 33101
    """
    
    data = importer_service.parse_raw_text(raw_text)
    
    assert data["case_number"] == "2024-12345"
    assert data["parcel_id"] == "12-34-56-7890"
    assert data["opening_bid"] == 5000.0
    assert data["assessed_value"] == 150000.0
    assert data["amount"] == 6000.0
    assert data["sold_to"] == "John Doe"
    assert data["status"] == PropertyStatus.SOLD
    assert data["status_detail"] == "02/08/2026"
    assert data["property_address"] == "123 Main St Miami, FL 33101"
    assert data["city"] == "Miami"
    assert data["state"] == "FL"
    assert data["zip_code"] == "33101"

def test_import_from_csv(db: Session, tmp_path):
    # Create valid CSV
    csv_content = """auction_date,item_id,raw_text
2026-02-08,123,"Auction Type: Tax Deed
Case #: 2024-999
Parcel ID: 99-99-99
Opening Bid: $100.00
Property Address:
456 Test Ave
Test City, FL 99999
"
"""
    d = tmp_path / "data"
    d.mkdir()
    p = d / "test.csv"
    p.write_text(csv_content, encoding='utf-8')
    
    count = importer_service.import_from_csv(db, str(p))
    assert count == 1
    
    # Verify DB
    prop = db.query(Property).filter(Property.parcel_id == "99-99-99").first()
    assert prop is not None
    assert prop.title == "456 Test Ave Test City, FL 99999"
    assert prop.city == "Test City"
    assert prop.auction_details is not None
    assert prop.auction_details.case_number == "2024-999"
    assert prop.auction_details.opening_bid == 100.0
