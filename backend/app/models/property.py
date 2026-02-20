import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, Date, DateTime
from app.db.base_class import Base

class PropertyDetails(Base):
    __tablename__ = "property_details"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(String(36), nullable=False)
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Float, nullable=True)
    sqft = Column(Integer, nullable=True)
    lot_size = Column(Float, nullable=True)
    year_built = Column(Integer, nullable=True)
    estimated_value = Column(Float, nullable=True)
    rental_value = Column(Float, nullable=True)
    state_parcel_id = Column(String(100), nullable=True)
    account_number = Column(String(100), nullable=True)
    attom_id = Column(String(100), nullable=True)
    use_code = Column(String(50), nullable=True)
    use_description = Column(String(255), nullable=True)
    zoning = Column(String(50), nullable=True)
    zoning_description = Column(String(255), nullable=True)
    legal_description = Column(Text, nullable=True)
    subdivision = Column(String(100), nullable=True)
    num_stories = Column(Integer, nullable=True)
    num_units = Column(Integer, nullable=True)
    structure_style = Column(String(100), nullable=True)
    building_area_sqft = Column(Integer, nullable=True)
    lot_acres = Column(Float, nullable=True)
    assessed_value = Column(Float, nullable=True)
    land_value = Column(Float, nullable=True)
    improvement_value = Column(Float, nullable=True)
    tax_amount = Column(Float, nullable=True)
    tax_year = Column(Integer, nullable=True)
    homestead_exemption = Column(Boolean, nullable=True)
    last_sale_date = Column(Date, nullable=True)
    last_sale_price = Column(Float, nullable=True)
    last_transfer_date = Column(Date, nullable=True)
    flood_zone_code = Column(String(20), nullable=True)
    is_qoz = Column(Boolean, nullable=True)
    legal_tags = Column(String(500), nullable=True)
    market_value_url = Column(String(500), nullable=True)
    appraisal_desc = Column(Text, nullable=True)
    regrid_url = Column(String(500), nullable=True)
    fema_url = Column(String(500), nullable=True)
    zillow_url = Column(String(500), nullable=True)
    gsi_url = Column(String(500), nullable=True)
    gsi_data = Column(Text, nullable=True)
    max_bid = Column(Float, nullable=True)


class PropertyAuctionHistory(Base):
    __tablename__ = "property_auction_history"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(String(36), nullable=False)
    auction_name = Column(String(255), nullable=True)
    auction_date = Column(Date, nullable=True)
    location = Column(String(255), nullable=True)
    listed_as = Column(String(255), nullable=True)
    taxes_due = Column(Float, nullable=True)
    info_link = Column(String(500), nullable=True)
    list_link = Column(String(500), nullable=True)
    created_at = Column(DateTime, nullable=True)
