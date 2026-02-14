import csv
import os
from typing import Dict, Optional, Tuple

class SmartTagService:
    _instance = None
    _fips_data: Dict[Tuple[str, str], str] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SmartTagService, cls).__new__(cls)
            cls._instance._load_fips_data()
        return cls._instance

    def _load_fips_data(self):
        """Loads FIPS data from CSV into a dictionary {(State, County): FIPS}"""
        csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "migration", "fips_data.csv")
        
        try:
            with open(csv_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    state = row['state'].strip().upper()
                    name = row['name'].strip().upper()
                    fips = row['fips'].strip()
                    
                    if state != 'NA': # Skip state-only rows if they don't have county data, or handle differently
                         # The CSV has 'Autauga County' as name. We need to handle 'County' suffix potentially
                         # But let's verify if input will have 'County'
                         pass
                    
                    # Store both with and without "County" to be safe?
                    # valid rows: state='AL', name='Autauga County'
                    if state and state != 'NA':
                        self._fips_data[(state, name)] = fips
                        # Also store without ' County' suffix if present
                        if ' COUNTY' in name:
                            clean_name = name.replace(' COUNTY', '').strip()
                            self._fips_data[(state, clean_name)] = fips
                            
        except Exception as e:
            print(f"Error loading FIPS data: {e}")

    def get_fips_code(self, state: str, county: str) -> Optional[str]:
        """Returns FIPS code for state and county"""
        if not state or not county:
            return None
            
        state = state.upper().strip()
        county = county.upper().strip()
        
        return self._fips_data.get((state, county))

    def generate_tag(self, state: str, county: str, parcel_id: str, property_id: int) -> str:
        """
        Generates Smart Tag: [FIPS][ParcelID]-[SystemID]
        User format request: State(2) County(3) ParcelID SystemID(5)
        FIPS in CSV is usually 4 or 5 digits (State+County).
        Example: 1001 for Autauga, AL (01 001).
        
        If FIPS not found, defaults to '00000'.
        """
        fips = self.get_fips_code(state, county)
        if not fips:
            # Fallback or error? For now fallback to 00000
            fips = "00000"
        else:
            # Ensure it's padded to 5 digits if needed (though CSV seems to have 4 for AL? 1001. standard is 5)
            # 1001 -> 01001
            fips = fips.zfill(5)

        # Sanitize parcel_id (remove special chars?)
        # User said "la no campo que tiver recebendo o parcel id, tem que gravar pra depois integrar"
        # Let's keep it clean, maybe strictly alphanumeric?
        # User example just says "parcelid"
        parcel = parcel_id.replace('-', '').replace(' ', '') if parcel_id else "UNKNOWN"
        
        # System ID padded to 5 digits
        sys_id = str(property_id).zfill(5)
        
        return f"{fips}-{parcel}-{sys_id}"

smart_tag_service = SmartTagService()
