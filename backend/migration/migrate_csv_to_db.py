import csv
import sqlite3
import os
import re
import glob

DB_NAME = 'real_estate_data.db'

def init_db():
    """Initializes the SQLite database and creates the table."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS auctions (
        id TEXT PRIMARY KEY,
        auction_date DATE,
        scraped_file TEXT,
        status TEXT,
        status_detail TEXT,
        amount REAL,
        sold_to TEXT,
        auction_type TEXT,
        case_number TEXT,
        certificate_number TEXT,
        opening_bid REAL,
        parcel_id TEXT,
        property_address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        assessed_value REAL,
        raw_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database {DB_NAME} initialized.")

def parse_currency(value):
    """Parses currency string to float."""
    if not value:
        return None
    try:
        return float(value.replace('$', '').replace(',', '').strip())
    except ValueError:
        return None

def extract_field(text, pattern, group=1):
    """Extracts a field using regex."""
    match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
    return match.group(group).strip() if match else None

def parse_raw_text(raw_text):
    """Parses the raw_text field to extract structured data."""
    data = {}
    
    # Common fields
    data['auction_type'] = extract_field(raw_text, r'Auction Type:\s*(.*)')
    data['case_number'] = extract_field(raw_text, r'Case #:\s*(.*)')
    data['certificate_number'] = extract_field(raw_text, r'Certificate #:\s*(.*)')
    data['parcel_id'] = extract_field(raw_text, r'Parcel ID:\s*(.*)')
    data['sold_to'] = extract_field(raw_text, r'Sold To\n(.*?)(?=\n)', 1)
    
    # Financials
    opening_bid_str = extract_field(raw_text, r'Opening Bid:\s*(\$[\d,.]+)')
    data['opening_bid'] = parse_currency(opening_bid_str)
    
    assessed_value_str = extract_field(raw_text, r'Assessed Value:\s*(\$[\d,.]+)')
    data['assessed_value'] = parse_currency(assessed_value_str)
    
    amount_str = extract_field(raw_text, r'Amount\n(\$[\d,.]+)')
    data['amount'] = parse_currency(amount_str)
    
    # Status
    # Captures "Auction Sold", "Auction Starts", "Auction Status\nRedeemed", etc.
    # Logic: Look for the first line or specific keywords
    if "Auction Sold" in raw_text:
        data['status'] = "Sold"
        # Extract date/time of sale if present on next line
        match = re.search(r'Auction Sold\n(.*)', raw_text)
        data['status_detail'] = match.group(1).strip() if match else None
    elif "Auction Starts" in raw_text:
        data['status'] = "Starts"
        match = re.search(r'Auction Starts\n(.*)', raw_text)
        data['status_detail'] = match.group(1).strip() if match else None
    elif "Redeemed" in raw_text:
        data['status'] = "Redeemed"
    elif "Canceled" in raw_text:
        data['status'] = "Canceled"
    else:
        data['status'] = "Unknown"

    # Address Parsing (Tricky due to multiline)
    # Strategy: Find "Property Address:" and read until "Assessed Value" or other markers, 
    # or look for the City/State/Zip line usually at the end of address block.
    
    address_match = re.search(r'Property Address:\s*(.*?)(?=\n.*(?:Assessed Value|$))', raw_text, re.DOTALL)
    if not address_match:
         # Fallback: try to capture until end if assessed value is missing
         address_match = re.search(r'Property Address:\s*(.*)', raw_text, re.DOTALL)

    if address_match:
        full_address_block = address_match.group(1).strip()
        # Clean up newlines if it's broken up
        data['property_address'] = full_address_block.replace('\n', ' ').replace('\t', ' ').strip()
        
        # Try to extract City, State, Zip from the last part of the address block
        # Pattern like: CITY, FL- 33333 or CITY, FL 33333
        # Looking for <City>, <State>[- ] <Zip>
        zip_match = re.search(r'([A-Za-z\s]+),\s*([A-Z]{2})[-\s]+(\d{5})', full_address_block)
        if zip_match:
            data['city'] = zip_match.group(1).strip()
            data['state'] = zip_match.group(2).strip()
            data['zip_code'] = zip_match.group(3).strip()
    
    return data

def process_files():
    """Reads all CSV files and inserts them into the DB."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    csv_files = glob.glob("*.csv")
    print(f"Found {len(csv_files)} CSV files.")
    
    inserted_count = 0
    updated_count = 0
    
    for filename in csv_files:
        print(f"Processing {filename}...")
        try:
            with open(filename, 'r', encoding='utf-8', errors='replace') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    item_id = row.get('item_id')
                    auction_date = row.get('auction_date')
                    raw_text = row.get('raw_text', '')
                    
                    if not item_id:
                        continue
                        
                    parsed_data = parse_raw_text(raw_text)
                    
                    # Prepare tuple for insertion
                    data_tuple = (
                        item_id,
                        auction_date,
                        filename,
                        parsed_data.get('status'),
                        parsed_data.get('status_detail'),
                        parsed_data.get('amount'),
                        parsed_data.get('sold_to'),
                        parsed_data.get('auction_type'),
                        parsed_data.get('case_number'),
                        parsed_data.get('certificate_number'),
                        parsed_data.get('opening_bid'),
                        parsed_data.get('parcel_id'),
                        parsed_data.get('property_address'),
                        parsed_data.get('city'),
                        parsed_data.get('state'),
                        parsed_data.get('zip_code'),
                        parsed_data.get('assessed_value'),
                        raw_text
                    )
                    
                    # Upsert (Insert or Replace)
                    cursor.execute('''
                    INSERT OR REPLACE INTO auctions (
                        id, auction_date, scraped_file, status, status_detail, amount, sold_to,
                        auction_type, case_number, certificate_number, opening_bid, parcel_id,
                        property_address, city, state, zip_code, assessed_value, raw_text
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', data_tuple)
                    
                    inserted_count += 1
                    
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    conn.commit()
    conn.close()
    print(f"Migration complete. Processed {inserted_count} records.")

if __name__ == "__main__":
    init_db()
    process_files()
