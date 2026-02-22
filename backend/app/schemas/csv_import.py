from pydantic import BaseModel, Field, validator, root_validator
from typing import Optional, Union, List, Any
from datetime import datetime
import pandas as pd

def parse_date(v):
    if v is None or pd.isna(v) or v == '':
        return None
    try:
        # Pydantic's default date parser is quite good, but we can add custom logic here
        # For now let Pydantic handle ISO strings
        return v
    except:
        return None

import re

def parse_float(v):
    if v is None or pd.isna(v) or v == '':
        return None
    if isinstance(v, str):
        # Extract the first numeric match (handles "$1,500.00" -> 1500.00 or "0.19 acres" -> 0.19)
        clean_str = v.replace(',', '')
        match = re.search(r'[-+]?\d*\.?\d+', clean_str)
        if match:
            return float(match.group())
        return None
    return float(v)

class PropertyCSVRow(BaseModel):
    parcel_id: str = Field(alias="Parcel ID")
    address: Optional[str] = Field(None, alias="parcel_address")
    type: Optional[str] = Field("residential")
    description: Optional[str] = None
    
    # Financials
    amount_due: Optional[float] = None
    total_value: Optional[float] = Field(None, alias="total_value")
    land_value: Optional[float] = None
    improvements: Optional[float] = None
    estimated_arv: Optional[float] = None
    estimated_rent: Optional[float] = None
    taxes_due_auction: Optional[float] = None

    # Location
    county: Optional[str] = None
    state_code: Optional[str] = None
    coordinates: Optional[str] = None # coordinates: "lat, lon" or "lat lon"

    # Auction Info
    auction_date: Optional[str] = None # Keep as string for initial parsing
    auction_name: Optional[str] = None
    auction_info_link: Optional[str] = None
    auction_list_link: Optional[str] = None
    
    # Details
    account: Optional[str] = None
    acres: Optional[float] = None
    tax_sale_year: Optional[Union[float, int]] = None
    date: Optional[str] = None
    cs_number: Optional[str] = None
    parcel_code: Optional[str] = None
    map_link: Optional[str] = None
    property_category: Optional[str] = None
    purchase_option_type: Optional[str] = None
    vacancy: Optional[str] = None
    owner_address: Optional[str] = None

    @validator('amount_due', 'total_value', 'land_value', 'improvements', 'estimated_arv', 'estimated_rent', 'taxes_due_auction', 'acres', pre=True)
    def clean_floats(cls, v):
        return parse_float(v)

    @validator('parcel_id')
    def validate_parcel_id(cls, v):
        if not v or pd.isna(v):
            raise ValueError('Parcel ID is required')
        return str(v).strip()

class AuctionCSVRow(BaseModel):
    name: str = Field(alias="Name")
    short_name: Optional[str] = Field(None, alias="Short Name")
    tax_status: Optional[str] = Field(None, alias="Tax Status")
    parcels: Any = Field(None, alias="Parcels")
    
    county_code: Any = Field(None, alias="County Code")
    county_name: Optional[str] = Field(None, alias="County Name")
    state: Optional[str] = Field(None, alias="State")
    
    auction_date: Optional[str] = Field(None, alias="Auction Date")
    time: Optional[str] = Field(None, alias="Time")
    location: Optional[str] = Field(None, alias="Location")
    notes: Optional[str] = Field(None, alias="Notes")
    
    search_link: Optional[str] = Field(None, alias="Search Link")
    register_date: Optional[str] = Field(None, alias="Register Date")
    register_link: Optional[str] = Field(None, alias="Register Link")
    list_link: Optional[str] = Field(None, alias="List Link")
    purchase_info_link: Optional[str] = Field(None, alias="Purchase Info Link")

    @validator('name')
    def validate_name(cls, v):
        if not v or pd.isna(v):
            raise ValueError('Auction Name is required')
        return str(v).strip()
