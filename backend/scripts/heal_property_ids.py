import sys
import os
import pandas as pd
from sqlalchemy import text, create_engine

# Database setup
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable is not set.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
CSV_PATH = "backend/data/postgres_property_details.csv"

def heal_ids():
    print("-" * 50)
    print("STARTING PROPERTY ID HEALING (UUID SYNC)")
    print("-" * 50)
    
    # 1. Load CSV
    print(f"Loading CSV: {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH, usecols=['property_id', 'parcel_id'])
    df = df.dropna(subset=['property_id', 'parcel_id'])
    print(f"Loaded {len(df):,} items from CSV.")

    with engine.begin() as conn:
        # 2. Create temporary table
        print("Creating temporary table...")
        conn.execute(text("DROP TABLE IF EXISTS tmp_id_healing"))
        conn.execute(text("CREATE TABLE tmp_id_healing (property_id VARCHAR(255), parcel_id VARCHAR(255))"))
        
        # 3. Batch Insert into temp table
        print("Uploading data to temp table...")
        # Use pandas to_sql for speed (if available) or raw batch
        df.to_sql('tmp_id_healing', conn, if_exists='append', index=False, method='multi', chunksize=5000)
        
        # 4. Perform the HEAL (Update joining by parcel_id)
        print("Performing the HEAL (Unified Update)...")
        update_query = text("""
            UPDATE property_details p
            SET property_id = tmp.property_id
            FROM tmp_id_healing tmp
            WHERE p.parcel_id = tmp.parcel_id
            AND p.property_id != tmp.property_id
        """)
        result = conn.execute(update_query)
        print(f"Successfully healed {result.rowcount:,} property IDs.")
        
        # 5. Cleanup
        conn.execute(text("DROP TABLE tmp_id_healing"))

    print("-" * 50)
    print("HEALING COMPLETE")
    print("-" * 50)

if __name__ == "__main__":
    try:
        heal_ids()
    except Exception as e:
        print(f"Error during healing: {e}")
