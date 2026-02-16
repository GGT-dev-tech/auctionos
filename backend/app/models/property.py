import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Enum, Text, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class PropertyStatus(str, enum.Enum):
    ACTIVE = "active"
    SOLD = "sold"
    PENDING = "pending"
    INACTIVE = "inactive"
    DRAFT = "draft"

class PropertyType(str, enum.Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    LAND = "land"

class InventoryType(str, enum.Enum):
    AUCTION = "auction"
    OTC = "otc"
    LAND_BANK = "land_bank"

class TaxStatus(str, enum.Enum):
    TAX_DEED = "tax_deed"
    REDEEMABLE_DEED = "redeemable_deed"
    QUIT_CLAIM = "quit_claim"
    LIEN = "lien"
    AVAILABLE = "available"

class Property(Base):
    __tablename__ = "properties"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    address = Column(String(255), nullable=True)
    city = Column(String(100), index=True, nullable=True)
    state = Column(String(100), index=True, nullable=True)
    zip_code = Column(String(20), index=True, nullable=True)
    county = Column(String(100), index=True, nullable=True)
    price = Column(Float, nullable=True)
    status = Column(String(50), default=PropertyStatus.ACTIVE)
    property_type = Column(String(50), default=PropertyType.RESIDENTIAL)
    description = Column(Text, nullable=True)
    parcel_id = Column(String(100), index=True, nullable=True, unique=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    smart_tag = Column(String(50), unique=True, index=True, nullable=True)
    local_id = Column(Integer, autoincrement=True, unique=True, nullable=True)
    
    # New Fields for ParcelFair Migration
    polygon = Column(Text, nullable=True) # GeoJSON string
    inventory_type = Column(String(50), default=InventoryType.AUCTION, nullable=True)
    tax_status = Column(String(50), nullable=True)
    next_auction_date = Column(Date, nullable=True, index=True)
    amount_due = Column(Float, nullable=True)
    legal_description = Column(Text, nullable=True) # Denormalized for easy access or distinct from Details
    owner_name = Column(String(255), nullable=True)
    owner_address = Column(String(255), nullable=True)
    
    # Ownership
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    company = relationship("Company", back_populates="properties")
    details = relationship("PropertyDetails", uselist=False, back_populates="property", cascade="all, delete-orphan")
    media = relationship("Media", back_populates="property", cascade="all, delete-orphan")
    auction_details = relationship("AuctionDetails", uselist=False, back_populates="property", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="property", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="property", cascade="all, delete-orphan")
    price_notices = relationship("PriceNotice", back_populates="property", cascade="all, delete-orphan")

class PropertyDetails(Base):
    __tablename__ = "property_details"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(String(36), ForeignKey("properties.id"), unique=True, nullable=False)
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Float, nullable=True)
    sqft = Column(Integer, nullable=True)
    lot_size = Column(Float, nullable=True)
    year_built = Column(Integer, nullable=True)
    
    # Identification
    state_parcel_id = Column(String(100), nullable=True)
    account_number = Column(String(100), nullable=True)
    attom_id = Column(String(100), nullable=True) # ll_uuid

    # Legal & Zoning
    use_code = Column(String(50), nullable=True)
    use_description = Column(String(255), nullable=True)
    zoning = Column(String(50), nullable=True)
    zoning_description = Column(String(255), nullable=True)
    legal_description = Column(Text, nullable=True)
    subdivision = Column(String(100), nullable=True)

    # Structure
    num_stories = Column(Integer, nullable=True)
    num_units = Column(Integer, nullable=True)
    structure_style = Column(String(100), nullable=True)
    building_area_sqft = Column(Integer, nullable=True)

    # Land
    lot_acres = Column(Float, nullable=True)

    # Valuation & Tax
    assessed_value = Column(Float, nullable=True) # parval
    land_value = Column(Float, nullable=True)
    improvement_value = Column(Float, nullable=True)
    total_market_value = Column(Float, nullable=True) # New field for Total Value from CSV
    tax_amount = Column(Float, nullable=True)
    tax_year = Column(Integer, nullable=True)
    homestead_exemption = Column(Boolean, default=False)

    # History
    last_sale_date = Column(Date, nullable=True)
    last_sale_price = Column(Float, nullable=True)
    last_transfer_date = Column(Date, nullable=True)

    # Risk
    flood_zone_code = Column(String(20), nullable=True)
    is_qoz = Column(Boolean, default=False)
    
    # Valuation data (Legacy/Computed)
    estimated_value = Column(Float, nullable=True)
    rental_value = Column(Float, nullable=True)
    market_value_url = Column(String(500), nullable=True)
    
    # Legal
    legal_tags = Column(String(500), nullable=True) # JSON or comma-separated list of tags
    
    # External Links & Descriptions
    appraisal_desc = Column(Text, nullable=True)
    regrid_url = Column(String(500), nullable=True)
    fema_url = Column(String(500), nullable=True)
    zillow_url = Column(String(500), nullable=True)
    gsi_url = Column(String(500), nullable=True)
    gsi_data = Column(Text, nullable=True) # JSON storage
    max_bid = Column(Float, nullable=True)
    
    property = relationship("Property", back_populates="details")

class MediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"
    DOCUMENT = "document"

class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(String(36), ForeignKey("properties.id"), nullable=False)
    media_type = Column(String(50), default=MediaType.IMAGE)
    url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="media")

class AuctionDetails(Base):
    __tablename__ = "auction_details"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(String(36), ForeignKey("properties.id"), unique=True, nullable=False)
    auction_date = Column(Date, nullable=True)
    
    # Online Auction Fields
    auction_start = Column(DateTime, nullable=True)
    auction_end = Column(DateTime, nullable=True)
    reserve_price = Column(Float, nullable=True)

    scraped_file = Column(String(255), nullable=True)
    status_detail = Column(String(255), nullable=True)
    amount = Column(Float, nullable=True)
    sold_to = Column(String(255), nullable=True)
    auction_type = Column(String(100), nullable=True)
    case_number = Column(String(100), index=True, nullable=True)
    certificate_number = Column(String(100), nullable=True)
    opening_bid = Column(Float, nullable=True)
    
    # Store raw text from binding/scraping for reference
    raw_text = Column(Text, nullable=True)

    property = relationship("Property", back_populates="auction_details")
