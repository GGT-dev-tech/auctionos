import csv
import sys
import os

# Add parent directory to path so we can import app modules
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.location import Location

def seed_locations():
    csv_path = "migration/fips_data.csv"
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    db = SessionLocal()
    try:
        with open(csv_path, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            count = 0
            for row in reader:
                fips = row['fips']
                name = row['name']
                state = row['state']
                
                # Check if exists
                existing = db.query(Location).filter(Location.fips == fips).first()
                if not existing:
                    location = Location(fips=fips, name=name, state=state)
                    db.add(location)
                    count += 1
            
            db.commit()
            print(f"Successfully seeded {count} locations.")
    except Exception as e:
        print(f"Error seeding locations: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_locations()
