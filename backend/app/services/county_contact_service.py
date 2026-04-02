import csv
from typing import List, Dict, Optional
import os
from functools import lru_cache

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
    def get_contacts(state_code: str, county_name: str) -> List[Dict[str, str]]:
        """
        Retrieves filtered contacts for a specific state (ABBR) and county.
        """
        all_contacts = _load_csv_data()
        
        # Normalize inputs
        state_code = state_code.strip().upper()
        county_name = county_name.strip().lower()
        
        # Filter matching state and county
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

# Singleton instance
county_contact_service = CountyContactService()
