import re

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

    # Address Parsing
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
