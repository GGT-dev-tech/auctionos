from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict
from app.models.property import PropertyStatus, PropertyType, MediaType

# Shared properties
class MediaBase(BaseModel):
    media_type: Optional[str] = MediaType.IMAGE
    url: str
    is_primary: Optional[bool] = False

class MediaCreate(MediaBase):
    pass

class Media(MediaBase):
    id: int
    property_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PropertyDetailsBase(BaseModel):
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    sqft: Optional[int] = None
    lot_size: Optional[float] = None
    year_built: Optional[int] = None
    
    # New Fields
    state_parcel_id: Optional[str] = None
    account_number: Optional[str] = None
    attom_id: Optional[str] = None
    
    use_code: Optional[str] = None
    use_description: Optional[str] = None
    zoning: Optional[str] = None
    zoning_description: Optional[str] = None
    legal_description: Optional[str] = None
    subdivision: Optional[str] = None
    
    num_stories: Optional[int] = None
    num_units: Optional[int] = None
    structure_style: Optional[str] = None
    building_area_sqft: Optional[int] = None
    
    lot_acres: Optional[float] = None
    
    assessed_value: Optional[float] = None
    land_value: Optional[float] = None
    improvement_value: Optional[float] = None
    tax_amount: Optional[float] = None
    tax_year: Optional[int] = None
    homestead_exemption: Optional[bool] = None
    
    last_sale_date: Optional[date] = None
    last_sale_price: Optional[float] = None
    last_transfer_date: Optional[date] = None
    
    flood_zone_code: Optional[str] = None
    is_qoz: Optional[bool] = None

    estimated_value: Optional[float] = None
    rental_value: Optional[float] = None
    legal_tags: Optional[str] = None

class PropertyDetailsCreate(PropertyDetailsBase):
    pass

class PropertyDetails(PropertyDetailsBase):
    id: int
    property_id: str
    model_config = ConfigDict(from_attributes=True)

class AuctionDetailsBase(BaseModel):
    auction_date: Optional[date] = None
    auction_start: Optional[datetime] = None
    auction_end: Optional[datetime] = None
    reserve_price: Optional[float] = None
    
    scraped_file: Optional[str] = None
    status_detail: Optional[str] = None
    amount: Optional[float] = None
    sold_to: Optional[str] = None
    auction_type: Optional[str] = None
    case_number: Optional[str] = None
    certificate_number: Optional[str] = None
    opening_bid: Optional[float] = None
    raw_text: Optional[str] = None

class AuctionDetailsCreate(AuctionDetailsBase):
    pass

class AuctionDetails(AuctionDetailsBase):
    id: int
    property_id: str
    model_config = ConfigDict(from_attributes=True)

class PropertyBase(BaseModel):
    title: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    county: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = PropertyStatus.ACTIVE
    property_type: Optional[str] = PropertyType.RESIDENTIAL
    description: Optional[str] = None
    parcel_id: Optional[str] = None
    smart_tag: Optional[str] = None

class PropertyCreate(PropertyBase):
    details: Optional[PropertyDetailsCreate] = None
    media: Optional[List[MediaCreate]] = None
    auction_details: Optional[AuctionDetailsCreate] = None

class PropertyUpdate(PropertyBase):
    title: Optional[str] = None
    details: Optional[PropertyDetailsCreate] = None

class Property(PropertyBase):
    id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    details: Optional[PropertyDetails] = None
    media: List[Media] = []
    auction_details: Optional[AuctionDetails] = None

    model_config = ConfigDict(from_attributes=True)
