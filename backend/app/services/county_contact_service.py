import csv
from typing import List, Dict, Optional
import os
from functools import lru_cache
from sqlalchemy.orm import Session
from app.models.county_contact import CountyContact
from app.models.state_contact import StateContact

# Constants
CSV_FILE_PATH = os.path.join("data", "contact_data.csv")
EXCLUDED_NAMES = ["NETR Mapping and GIS", "Historic Aerials"]

@lru_cache(maxsize=1)
def _load_csv_data() -> List[Dict[str, str]]:
    """
    Private helper to load and parse the CSV into memory once.
    """
    if not os.path.exists(CSV_FILE_PATH):
        print(f"Warning: CSV file not found at {CSV_FILE_PATH}")
        return []
    
    contacts = []
    try:
        with open(CSV_FILE_PATH, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Basic cleaning
                name = row.get("Name", "").strip()
                
                # Filtering logic: ignore excluded names (partial or exact)
                if any(excluded in name for excluded in EXCLUDED_NAMES):
                    continue
                
                # Ensure fields exist
                contacts.append({
                    "state": row.get("State", "").strip().upper(),
                    "county": row.get("County", "").strip().lower(),
                    "name": name,
                    "phone": row.get("Phone", "").strip(),
                    "url": row.get("Online_URL", "").strip()
                })
    except Exception as e:
        print(f"Error parsing contact_data.csv: {e}")
        return []
        
    return contacts

class CountyContactService:
    @staticmethod
    def get_contacts(state_code: str, county_name: str, db: Optional[Session] = None) -> List[Dict[str, str]]:
        """
        Retrieves filtered contacts for a specific state (ABBR) and county.
        First tries the database, then falls back to CSV.
        """
        state_code = state_code.strip().lower()
        county_name = county_name.strip().lower()

        if db:
            # Query with ILIKE or force lowercase to match our migrated data
            db_contacts = db.query(CountyContact).filter(
                CountyContact.state.ilike(state_code),
                CountyContact.county.ilike(county_name)
            ).all()
            if db_contacts:
                return [{"name": c.name, "phone": c.phone or "", "url": c.url or ""} for c in db_contacts]

        # Fallback to CSV
        all_contacts = _load_csv_data()
        
        matches = [
            {
                "name": c["name"],
                "phone": c["phone"],
                "url": c["url"]
            }
            for c in all_contacts
            if c["state"] == state_code and c["county"] == county_name
        ]
        return matches

    @staticmethod
    def get_counties_for_state(state_code: str, db: Optional[Session] = None) -> List[str]:
        state_code = state_code.strip().lower()
        
        if db:
            db_counties = db.query(CountyContact.county).filter(
                CountyContact.state.ilike(state_code)
            ).distinct().all()
            if db_counties:
                return sorted([c[0].title() for c in db_counties if c[0]])
        
        # Fallback
        all_contacts = _load_csv_data()
        counties = {c["county"].title() for c in all_contacts if c["state"] == state_code and c["county"]}
        return sorted(list(counties))

    @staticmethod
    def get_state_contact(state_code: str, db: Optional[Session] = None) -> Optional[Dict[str, str]]:
        state_code = state_code.strip().lower()
        if db:
            state_contact = db.query(StateContact).filter(
                StateContact.state.ilike(state_code)
            ).first()
            if state_contact:
                return {"state": state_contact.state, "url": state_contact.url or ""}
        return None

# Singleton instance
county_contact_service = CountyContactService()
