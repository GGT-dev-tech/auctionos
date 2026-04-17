import os
from sqlalchemy import create_engine, text

# Production Connection
DATABASE_URL = "postgresql://postgres:JbEkstWQnhmNJQLMoXCefBntLFHsfSOx@crossover.proxy.rlwy.net:43302/railway"

def get_mapping():
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    
    try:
        parcels = [
            '0235320003',
            '0235330000',
            '71-08-11-361-011.000-026',
            '31-08-27-0-000-001.048'
        ]
        
        print("Mapping Parcel IDs to Internal IDs...")
        query = text("SELECT id, parcel_id, state FROM property_details WHERE parcel_id IN :parcels")
        results = conn.execute(query, {"parcels": tuple(parcels)}).fetchall()
        
        for r in results:
            print(f"Prop ID: {r[0]} | Parcel: {r[1]} | State: {r[2]}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    get_mapping()
