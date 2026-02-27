import csv
import logging
from typing import List, Dict, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

CONTACTS_DATA_PATH = Path("data/contact_data.csv")

class ContactService:
    _instance = None
    _contacts_cache: List[Dict[str, str]] = []

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ContactService, cls).__new__(cls)
            cls._instance._load_data()
        return cls._instance

    def _load_data(self):
        """Loads and caches the contact data from CSV."""
        if not CONTACTS_DATA_PATH.exists():
            logger.warning(f"Contact data file not found at {CONTACTS_DATA_PATH}. Contacts API will return empty results.")
            self._contacts_cache = []
            return

        try:
            with open(CONTACTS_DATA_PATH, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                contacts = []
                for row in reader:
                    # The user requested to ignore lines containing "NETR Mapping and GIS"
                    if "NETR Mapping and GIS" not in row.get('Name', ''):
                        contacts.append(row)
                self._contacts_cache = contacts
                logger.info(f"Successfully loaded {len(self._contacts_cache)} contact records.")
        except Exception as e:
            logger.error(f"Failed to load contact records: {e}")
            self._contacts_cache = []

    def get_county_contacts(self, state: str, county: str) -> List[Dict[str, str]]:
        """
        Returns a list of contacts for the specific state and county.
        Both strings are made lowercase and stripped for a robust comparison.
        """
        state_query = state.lower().strip()
        county_query = county.lower().strip()
        
        results = []
        for contact in self._contacts_cache:
            if (contact.get('State', '').lower().strip() == state_query and
                contact.get('County', '').lower().strip() == county_query):
                results.append({
                    "name": contact.get('Name', ''),
                    "phone": contact.get('Phone', ''),
                    "url": contact.get('Online_URL', '')
                })
        return results

# Singleton instance
contact_service = ContactService()
