import sys
import os
import pandas as pd
from sqlalchemy import create_engine, text

# Get engine
db_url = os.environ.get("DATABASE_URL")
if not db_url:
    print("No DATABASE_URL set.")
    sys.exit(1)
engine = create_engine(db_url)

print("Loading property details CSV...")
try:
    df_csv = pd.read_csv("data/postgres_property_details.csv", usecols=["property_id", "parcel_id"], dtype=str)
except Exception as e:
    print(f"Failed to load CSV: {e}")
    sys.exit(1)

# map csv_uuid -> parcel_id
csv_map = dict(zip(df_csv['property_id'], df_csv['parcel_id']))
print(f"Loaded {len(csv_map)} properties from CSV.")

print("Loading Real property IDs from Database...")
with engine.connect() as conn:
    rows = conn.execute(text("SELECT property_id, parcel_id FROM property_details")).fetchall()
    
# map parcel_id -> real_db_uuid
db_map = {str(r[1]): str(r[0]) for r in rows if r[1]}
print(f"Loaded {len(db_map)} properties from DB.")

# Prepare updates
update_mapping = []
for csv_uuid, parcel_id in csv_map.items():
    if not parcel_id or str(parcel_id) == 'nan': continue
    real_uuid = db_map.get(parcel_id)
    if real_uuid and real_uuid != csv_uuid:
        update_mapping.append({"real_id": real_uuid, "csv_id": csv_uuid})

print(f"Found {len(update_mapping)} history records that need their UUIDs translated.")

# Execute updates
if update_mapping:
    with engine.begin() as conn:
        print("Creating temporary mapping table...")
        conn.execute(text("CREATE TEMP TABLE temp_uuid_mapping (csv_id VARCHAR(36), real_id VARCHAR(36)) ON COMMIT DROP"))
        
        # Insert mappings using pandas for extreme speed
        print("Uploading mapping to SQL via pandas...")
        df_updates = pd.DataFrame(update_mapping)
        df_updates.to_sql('temp_uuid_mapping', con=conn, if_exists='append', index=False, method='multi', chunksize=2000)
        print("Mapping uploaded successfully.")
        
        print("Running bulk UPDATE to fix property_auction_history...")
        print("Cleaning up duplicated orphaned records before update...")
        # If real_id already has this auction_name, delete the csv_id's history record
        conn.execute(text("""
            DELETE FROM property_auction_history h
            USING temp_uuid_mapping m, property_auction_history h2
            WHERE h.property_id = m.csv_id
              AND h2.property_id = m.real_id
              AND h.auction_name = h2.auction_name
        """))
        
        # If multiple csv_ids map to the same real_id and auction_name, keep only one
        conn.execute(text("""
            DELETE FROM property_auction_history h
            USING temp_uuid_mapping m
            WHERE h.property_id = m.csv_id
              AND h.id NOT IN (
                  SELECT MIN(h_sub.id)
                  FROM property_auction_history h_sub
                  JOIN temp_uuid_mapping m_sub ON h_sub.property_id = m_sub.csv_id
                  GROUP BY m_sub.real_id, h_sub.auction_name
              )
        """))

        print("Running bulk UPDATE to fix property_auction_history...")
        res = conn.execute(text("""
            UPDATE property_auction_history h
            SET property_id = m.real_id
            FROM temp_uuid_mapping m
            WHERE h.property_id = m.csv_id
        """))
        print(f"Updated {res.rowcount} records successfully!")
        
        print("Updating is_processed to TRUE for all valid properties...")
        conn.execute(text("""
            UPDATE property_details 
            SET is_processed = true, import_error_msg = null 
            WHERE is_processed = false OR is_processed IS NULL
        """))
        
print("Done.")
