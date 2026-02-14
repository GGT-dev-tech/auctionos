import csv
import requests
import glob
import os
import sys

# Configuration
API_URL = "http://localhost:8000/api/v1"
# We could allow passing token as argument or env var
ADMIN_EMAIL = "admin@auctionpro.com"
ADMIN_PASSWORD = "password"

def get_access_token():
    try:
        response = requests.post(f"{API_URL}/auth/login/access-token", data={
            "username": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        response.raise_for_status()
        return response.json()["access_token"]
    except Exception as e:
        print(f"Failed to login: {e}")
        sys.exit(1)

def parse_csv_row(row):
    """Maps CSV row to PropertyCreate schema."""
    # This logic mirrors migrate_csv_to_db.py but targets the Pydantic schema
    
    # Extract raw text parsing if needed, but assuming the CSV might be pre-processed or we use the regex logic here?
    # For simplicity, let's assume the CSV columns match what migrate_csv_to_db produced, OR we re-implement the parsing logic.
    # Given the user wants to populate 'pre-forms', we should try to map as much as possible.
    
    # Simple mapping for now based on standard CSV columns if they exist, 
    # or failing that, use the raw_text parsing logic from before?
    # Let's assume the CSV *is* the raw scraped output.
    
    # To keep this script clean, let's just use the 'raw_text' column if available to do the regex parsing again?
    # Or strict column mapping.
    
    # Let's implement a robust parser based on the previous script's logic since we want to handle the same files.
    import re
    
    raw_text = row.get('raw_text', '')
    
    def extract(pattern, group=1):
        match = re.search(pattern, raw_text, re.IGNORECASE | re.MULTILINE)
        return match.group(group).strip() if match else None

    # Parse Address
    address = row.get('property_address')
    city = row.get('city')
    state = row.get('state')
    zip_code = row.get('zip_code')
    
    # If explicit columns are missing, try parsing
    if not address:
        addr_match = re.search(r'Property Address:\s*(.*?)(?=\n.*(?:Assessed Value|$))', raw_text, re.DOTALL)
        if addr_match:
             block = addr_match.group(1).strip()
             address = block.replace('\n', ' ').strip()
             # Try zip
             zip_match = re.search(r'([A-Za-z\s]+),\s*([A-Z]{2})[-\s]+(\d{5})', block)
             if zip_match:
                 city = zip_match.group(1).strip()
                 state = zip_match.group(2).strip()
                 zip_code = zip_match.group(3).strip()

    # Parse Financials
    opening_bid_str = extract(r'Opening Bid:\s*(\$[\d,.]+)')
    opening_bid = float(opening_bid_str.replace('$', '').replace(',', '')) if opening_bid_str else 0
    
    assessed_val_str = extract(r'Assessed Value:\s*(\$[\d,.]+)')
    assessed_val = float(assessed_val_str.replace('$', '').replace(',', '')) if assessed_val_str else 0

    return {
        "title": address or "Unknown Property",
        "address": address,
        "city": city or "Miami",
        "state": state or "FL",
        "zip_code": zip_code,
        "price": opening_bid,
        "status": "draft", # Import as draft
        "property_type": "residential",
        "description": f"Imported from {row.get('scraped_file', 'CSV')}. \n\n{raw_text[:500]}...",
        "parcel_id": extract(r'Parcel ID:\s*(.*)'),
        "details": {
            "assessed_value": assessed_val,
            "legal_description": extract(r'Legal Description:\s*(.*)'),
            "case_number": extract(r'Case #:\s*(.*)')
        },
        "auction_details": {
            "opening_bid": opening_bid,
            "case_number": extract(r'Case #:\s*(.*)'),
            "auction_type": extract(r'Auction Type:\s*(.*)'),
            "raw_text": raw_text
        }
    }

def import_csvs():
    token = get_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    files = glob.glob("*.csv")
    print(f"Found {len(files)} CSV files.")
    
    count = 0
    for filename in files:
        print(f"Processing {filename}...")
        with open(filename, 'r', encoding='utf-8', errors='replace') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    property_data = parse_csv_row(row)
                    # POST to API
                    res = requests.post(f"{API_URL}/properties/", json=property_data, headers=headers)
                    if res.status_code in [200, 201]:
                        print(f"Created/Updated: {property_data['title']}")
                        count += 1
                    else:
                        print(f"Failed to create {property_data['title']}: {res.text}")
                except Exception as e:
                    print(f"Error processing row: {e}")
                    
    print(f"Import complete. {count} properties imported.")

if __name__ == "__main__":
    import_csvs()
