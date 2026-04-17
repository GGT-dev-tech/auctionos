import pandas as pd
from sqlalchemy import create_engine, text, String, Float, Integer, Date
import sys
import os
import re

# Database connection string
DB_URL = "postgresql://postgres:JbEkstWQnhmNJQLMoXCefBntLFHsfSOx@crossover.proxy.rlwy.net:43302/railway"
CSV_PATH = "/Users/gustavo/Downloads/auctionos/backend/data/postgres_property_details.csv"

def run_update():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}")
        return

    print(f"Reading CSV: {CSV_PATH}...")
    
    cols_to_read = [
        'parcel_id', 'cs_number', 'pin', 'owner_name', 
        'land_value', 'building_value', 'occupancy_status',
        'next_auction', 'inventory_type', 'property_category',
        'lot_acres', 'tax_year'
    ]
    
    try:
        df = pd.read_csv(CSV_PATH, usecols=lambda x: x in cols_to_read, dtype={
            'parcel_id': str,
            'cs_number': str,
            'pin': str,
            'owner_name': str,
            'occupancy_status': str,
            'next_auction': str,
            'inventory_type': str,
            'property_category': str
        }, low_memory=False)
    except Exception as e:
        print(f"Failed to read CSV with cols: {e}")
        df = pd.read_csv(CSV_PATH)

    print(f"Loaded {len(df)} rows.")

    # Data Cleaning
    print("Cleaning data...")
    
    def clean_currency(val):
        if pd.isna(val) or val == 'nan': return None
        if isinstance(val, str):
            val = val.replace('$', '').replace(',', '').strip()
            if not val or val == '-': return None
        try:
            return float(val)
        except:
            return None

    df['land_value'] = df['land_value'].apply(clean_currency)
    df['building_value'] = df['building_value'].apply(clean_currency)
    df['lot_acres'] = df['lot_acres'].apply(clean_currency)
    df['tax_year'] = pd.to_numeric(df['tax_year'], errors='coerce')

    # Strict Date Extraction for next_auction
    # Matches MM/DD/YYYY or M/D/YYYY
    date_pattern = r'^\d{1,2}/\d{1,2}/\d{4}$'
    def validate_date(val):
        if pd.isna(val) or val == 'nan': return None
        val = str(val).strip()
        if re.match(date_pattern, val):
            try:
                return pd.to_datetime(val).date()
            except:
                return None
        return None

    print("Extracting valid dates from CSV next_auction column...")
    df['next_auction_date'] = df['next_auction'].apply(validate_date)
    valid_count = df['next_auction_date'].notnull().sum()
    print(f"Found {valid_count} valid dates.")

    # Category Mapping
    if 'inventory_type' in df.columns and 'property_category' in df.columns:
        df['property_category'] = df['inventory_type'].fillna(df['property_category'])
    elif 'inventory_type' in df.columns:
        df['property_category'] = df['inventory_type']

    # Rename for DB target columns
    mapping = {
        'pin': 'pin_ppin',
        'building_value': 'improvement_value',
        'occupancy_status': 'occupancy'
    }
    df.rename(columns=mapping, inplace=True)

    # Force text columns
    text_cols = ['cs_number', 'pin_ppin', 'owner_name', 'occupancy', 'property_category']
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).replace({'nan': None, 'None': None, '': None})

    # Prepare final columns
    target_cols = [
        'parcel_id', 'cs_number', 'pin_ppin', 'owner_name', 
        'land_value', 'improvement_value', 'occupancy',
        'next_auction_date', 'property_category', 'lot_acres', 'tax_year'
    ]
    df = df[[c for c in target_cols if c in df.columns]]

    engine = create_engine(DB_URL)
    
    print("Uploading to staging table 'tmp_metadata_final_fix'...")
    sql_types = {
        'parcel_id': String(100),
        'cs_number': String(100),
        'pin_ppin': String(100),
        'owner_name': String(255),
        'land_value': Float(),
        'improvement_value': Float(),
        'occupancy': String(100),
        'next_auction_date': Date(),
        'property_category': String(100),
        'lot_acres': Float(),
        'tax_year': Integer()
    }
    df.to_sql('tmp_metadata_final_fix', engine, if_exists='replace', index=False, dtype=sql_types)

    # Perform UPDATE - STRICT OVERWRITE for next_auction_date
    print("Executing strict batch update from CSV...")
    update_sql = """
    UPDATE property_details p
    SET 
        cs_number = COALESCE(t.cs_number, p.cs_number),
        pin_ppin = COALESCE(t.pin_ppin, p.pin_ppin),
        owner_name = COALESCE(t.owner_name, p.owner_name),
        land_value = COALESCE(t.land_value, p.land_value),
        improvement_value = COALESCE(t.improvement_value, p.improvement_value),
        occupancy = COALESCE(t.occupancy, p.occupancy),
        next_auction_date = t.next_auction_date, -- STRICT OVERWRITE: ignore what's in DB
        property_category = COALESCE(t.property_category, p.property_category),
        lot_acres = COALESCE(t.lot_acres, p.lot_acres),
        tax_year = COALESCE(t.tax_year, p.tax_year)
    FROM tmp_metadata_final_fix t
    WHERE p.parcel_id = t.parcel_id;
    """
    
    with engine.begin() as conn:
        result = conn.execute(text(update_sql))
        print(f"Update complete. Rows affected: {result.rowcount}")
        
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE tmp_metadata_final_fix"))

    print("Done!")

if __name__ == "__main__":
    run_update()
