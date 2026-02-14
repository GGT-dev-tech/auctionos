import csv
import os
import sys
from sqlalchemy import text

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.county import County

# Path to the CSV file
# In Docker, this will be at /app/data/netronline_data.csv
# In local dev (from backend/scripts/), it is at ../data/netronline_data.csv
CSV_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'netronline_data.csv')

def import_counties():
    db = SessionLocal()
    try:
        if not os.path.exists(CSV_FILE_PATH):
            print(f"Error: File not found at {CSV_FILE_PATH}")
            return

        print(f"Importing counties from {CSV_FILE_PATH}...")
        
        # 1. Drop and Recreate Table to handle schema change without migration
        print("Recreating 'counties' table schema...")
        db.execute(text("DROP TABLE IF EXISTS counties"))
        db.commit()
        
        # Create table using SQLAlchemy metadata
        from app.db.base import Base, engine
        Base.metadata.create_all(bind=engine)
        print("Table recreated.")

        # 2. Process CSV into Dictionary for Aggregation
        counties_map = {} # Key: (state, county_name) -> List of offices

        print("Reading CSV and aggregating data...")
        with open(CSV_FILE_PATH, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                state = row['State'].strip().upper()
                county_name = row['County'].strip()
                
                key = (state, county_name)
                
                office = {
                    "name": row['Name'].strip() if row['Name'] else "Unknown Office",
                    "phone": row['Phone'].strip() if row['Phone'] else None,
                    "online_url": row['Online_URL'].strip() if row['Online_URL'] else None
                }
                
                if key not in counties_map:
                    counties_map[key] = []
                
                counties_map[key].append(office)

        print(f"Aggregated into {len(counties_map)} unique counties.")

        # 3. Insert into DB
        print("Inserting records...")
        count = 0
        for (state, county_name), offices in counties_map.items():
            county = County(
                state_code=state,
                county_name=county_name,
                offices=offices
            )
            db.add(county)
            count += 1
            
            if count % 1000 == 0:
                print(f"Inserted {count} records...")

        db.commit()
        print(f"Successfully imported {count} unique county records.")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import_counties()
