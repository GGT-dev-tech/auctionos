import os
import sys
import pandas as pd
from sqlalchemy import create_engine, text

# Database Connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in environment.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
CSV_FILE = "backend/data/postgres_property_details.csv"

def sync_statuses():
    if not os.path.exists(CSV_FILE):
        print(f"ERROR: {CSV_FILE} not found.")
        return

    print(f"\n--- SINCRONIZANDO STATUS DE PROPRIEDADES A PARTIR DE {CSV_FILE} ---\n")
    
    # We use chunking to handle large files
    chunk_size = 500
    updated_count = 0
    total_processed = 0
    
    # Define columns since CSV might not have headers or we want to be explicit
    # Based on our previous check, column 12 (0-indexed) is availability
    # But usually it's better to load the whole row if we have a header
    
    with engine.connect() as conn:
        for chunk in pd.read_csv(CSV_FILE, chunksize=chunk_size, dtype=str):
            # If CSV has no headers, use column indices. 
            # Let's check headers first. 
            # Our previous grep showed headers might be missing or different.
            # Head of file: property_id,parcel_id,address,county,state,lot_acres,property_category,estimated_value,assessed_value,tax_year,owner_name,property_type,availability,purchase_option_type,is_processed
            
            # Map parcel_id -> availability
            status_map = {}
            for _, row in chunk.iterrows():
                p_id = row.get('parcel_id')
                status = row.get('availability_status')
                if p_id and status:
                    status_map[p_id.strip()] = status.strip().lower()
            
            if not status_map:
                continue

            # Bulk update
            # We only update if it matches 'available' or 'not available' to follow logic
            for pid, status in status_map.items():
                # Map 'available' -> 'available'
                # But allow 'sold' from CSV to be 'not available' or 'sold' if needed
                # User specifically wants 'available' from CSV to reflect in DB
                if status == 'available':
                    result = conn.execute(text("""
                        UPDATE property_details 
                        SET availability_status = 'available' 
                        WHERE parcel_id = :pid AND availability_status != 'available'
                    """), {"pid": pid})
                    if result.rowcount > 0:
                        updated_count += result.rowcount
            
            conn.commit()
            total_processed += len(chunk)
            print(f"Processados: {total_processed}... Corrigidos para 'available': {updated_count}")

    print(f"\n--- SUCESSO ---")
    print(f"Total de propriedades corrigidas para 'available': {updated_count}")

if __name__ == "__main__":
    sync_statuses()
