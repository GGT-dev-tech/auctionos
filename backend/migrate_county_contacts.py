import csv
import os
import sys

# Add backend directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.county_contact import CountyContact
from app.utils.state_mapper import STATE_MAPPING

REVERSE_MAPPING = {v: k for k, v in STATE_MAPPING.items()}

def run_migration():
    db = SessionLocal()
    csv_path = os.path.join(os.path.dirname(__file__), "data", "contact_data.csv")
    
    if not os.path.exists(csv_path):
        print(f"CSV not found at {csv_path}")
        return

    print("Parsing contact_data.csv...")
    inserted = 0
    skipped = 0
    
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            state_abbr = row.get("State", "").strip().upper()
            county = row.get("County", "").strip().lower()
            name = row.get("Name", "").strip()
            phone = row.get("Phone", "").strip()
            url = row.get("Online_URL", "").strip()
            
            name_lower = name.lower()
            if "netronline" in name_lower or "aerials" in name_lower:
                skipped += 1
                continue
                
            state_full = REVERSE_MAPPING.get(state_abbr, state_abbr)
            state_full = state_full.lower().strip()
            
            # Check if exists
            exists = db.query(CountyContact).filter_by(
                state=state_full,
                county=county,
                name=name
            ).first()
            
            if not exists:
                new_contact = CountyContact(
                    state=state_full,
                    county=county,
                    name=name,
                    phone=phone,
                    url=url
                )
                db.add(new_contact)
                inserted += 1
            else:
                exists.phone = phone
                exists.url = url
                
        db.commit()
    print(f"Migration complete. Inserted {inserted} new county contacts. Skipped {skipped} rows.")

if __name__ == "__main__":
    run_migration()
