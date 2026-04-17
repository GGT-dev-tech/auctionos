import os
import sys
import re
from sqlalchemy import create_engine, text

# Database Connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in environment.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

STATE_MAP = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
    "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri",
    "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
    "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
    "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont",
    "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
}

def fix_metadata():
    with engine.begin() as conn:
        print("\n--- INICIANDO REPARO DE METADADOS DE LEILÕES ---\n")
        
        # 1. Buscar todos os leilões
        query = text("SELECT id, name, county, state FROM auction_events")
        auctions = conn.execute(query).fetchall()
        
        fixed_count = 0
        
        for auction in auctions:
            ae_id, ae_name, ae_county, ae_state = auction
            
            new_state = ae_state
            new_county = ae_county
            
            # Detect State from Name
            # Pattern: ", NC", " NC ", " NC -", " NC,"
            state_match = re.search(r"\b([A-Z]{2})\b", ae_name)
            if state_match:
                code = state_match.group(1)
                if code in STATE_MAP:
                    if code != ae_state:
                         print(f"FIX STATE: ID {ae_id} | '{ae_name}' | {ae_state} -> {code}")
                         new_state = code
            
            # Detect County from Name
            # Pattern: "Rowan County", "Cuyahoga Sheriff Sale", etc.
            # We only fix county if it's currently mismatched and we find a clear 'County Name' string
            county_match = re.search(r"([A-Za-z\s]+)\s+County", ae_name)
            if county_match:
                c_name = county_match.group(1).strip()
                if c_name and c_name != ae_county:
                    # Generic check: if Name says 'X County' but metadata says 'Y'
                    # and X is a known county (optional, but keep it simple for now)
                    print(f"FIX COUNTY: ID {ae_id} | '{ae_name}' | {ae_county} -> {c_name}")
                    new_county = c_name

            # Special cases from user report
            if "Cass, IN" in ae_name:
                if new_state != "IN": 
                    print(f"FIX STATE (Cass): ID {ae_id} | 'IN'")
                    new_state = "IN"
                if new_county != "Cass":
                    print(f"FIX COUNTY (Cass): ID {ae_id} | 'Cass'")
                    new_county = "Cass"

            if new_state != ae_state or new_county != ae_county:
                conn.execute(text("""
                    UPDATE auction_events 
                    SET state = :state, county = :county, updated_at = NOW()
                    WHERE id = :id
                """), {"state": new_state, "county": new_county, "id": ae_id})
                fixed_count += 1
                
        print(f"\n--- SUCESSO ---")
        print(f"Total de leilões com metadados corrigidos: {fixed_count} de {len(auctions)}")

if __name__ == "__main__":
    fix_metadata()
