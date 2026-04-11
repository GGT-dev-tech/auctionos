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
        # Load and force string types for categorical columns
        # Use low_memory=False to handle potential mixed types reliably
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
    
    # 1. Currency & Numeric Cleaning
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

    # 2. Strict Date Validation for next_auction
    # Matches MM/DD/YYYY or M/D/YYYY
    date_pattern = r'^\d{1,2}/\d{1,2}/\d{4}$'
    def validate_date(val):
        if pd.isna(val) or val == 'nan': return None
        val = str(val).strip()
        if re.match(date_pattern, val):
            try:
                # Try to parse it to ensure it's a real date
                return pd.to_datetime(val).date()
            except:
                return None
        return None

    print("Validating Next Auction dates...")
    df['next_auction_date'] = df['next_auction'].apply(validate_date)
    valid_count = df['next_auction_date'].notnull().sum()
    print(f"Found {valid_count} valid auction dates. Others (owner names, text) discarded.")

    # 3. Category Mapping
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

    # Force all text columns to be cleaned strings
    text_cols = ['cs_number', 'pin_ppin', 'owner_name', 'occupancy', 'property_category']
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).replace({'nan': None, 'None': None, '': None})

    # Prepare for upload
    target_cols = [
        'parcel_id', 'cs_number', 'pin_ppin', 'owner_name', 
        'land_value', 'improvement_value', 'occupancy',
        'next_auction_date', 'property_category', 'lot_acres', 'tax_year'
    ]
    final_cols = [c for c in target_cols if c in df.columns]
    df = df[final_cols]

    # Database connection
    engine = create_engine(DB_URL)
    
    # Upload to staging table
    print("Uploading to staging table 'tmp_metadata_update_v6'...")
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
    current_sql_types = {k: v for k, v in sql_types.items() if k in df.columns}
    
    df.to_sql('tmp_metadata_update_v6', engine, if_exists='replace', index=False, dtype=current_sql_types)

    # Perform UPDATE
    set_clauses = []
    for col in final_cols:
        if col == 'parcel_id': continue
        # use COALESCE to keep existing data if CSV is null, or overwrite if CSV has data
        set_clauses.append(f"{col} = COALESCE(t.{col}, p.{col})")
    
    update_sql = f"""
    UPDATE property_details p
    SET 
        {", ".join(set_clauses)}
    FROM tmp_metadata_update_v6 t
    WHERE p.parcel_id = t.parcel_id;
    """
    
    print("Executing batch update...")
    with engine.begin() as conn:
        result = conn.execute(text(update_sql))
        print(f"Update complete. Rows affected: {result.rowcount}")
        
    print("Cleaning up staging table...")
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE tmp_metadata_update_v6"))

    print("Done!")

if __name__ == "__main__":
    run_update()
