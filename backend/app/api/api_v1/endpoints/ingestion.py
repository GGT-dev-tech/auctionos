from typing import Any, List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.property import PropertyCreate, PropertyDetailsCreate, AuctionDetailsCreate
from app.db.repositories.property_repository import PropertyRepository
from app.models.user import User
from app.services.scraper import scraper_service
from app.services.importer import importer_service
from app.services.parcelfair_service import parcelfair_importer
import csv
import io
import re

router = APIRouter()
property_repo = PropertyRepository()

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
    if not text: return None
    match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
    return match.group(group).strip() if match else None

def parse_csv_row(row: dict) -> PropertyCreate:
    """
    Parses a CSV row into a PropertyCreate schema using robust regex logic.
    """
    # The CSV might have everything in 'raw_text' OR split columns.
    # We prioritize raw_text if available for deep parsing, but fallback to columns.
    raw_text = row.get('raw_text', '')
    
    # 1. Parse Basic Fields from raw_text using the robust logic
    # 1. Parse Basic Fields
    item_id = row.get('item_id') 
    
    # Common fields
    auction_type = extract_field(raw_text, r'Auction Type:\s*(.*)')
    case_number = extract_field(raw_text, r'Case #:\s*(.*)')
    certificate_number = extract_field(raw_text, r'Certificate #:\s*(.*)')
    parcel_id = extract_field(raw_text, r'Parcel ID:\s*(.*)')
    sold_to = extract_field(raw_text, r'Sold To\n(.*?)(?=\n)', 1)
    
    # Financials
    opening_bid_str = extract_field(raw_text, r'Opening Bid:\s*(\$[\d,.]+)')
    opening_bid = parse_currency(opening_bid_str) or 0.0
    
    assessed_val_str = extract_field(raw_text, r'Assessed Value:\s*(\$[\d,.]+)')
    assessed_val = parse_currency(assessed_val_str) or 0.0
    
    # Auction Date Parsing
    auction_date_str = row.get('auction_date')
    auction_date = None
    from datetime import datetime, date
    
    if auction_date_str:
        try:
            # Try MM/DD/YYYY
            auction_date = datetime.strptime(auction_date_str.split(' ')[0], '%m/%d/%Y').date()
        except ValueError:
            pass

    # Status Logic
    status = "draft" 
    
    if "Auction Sold" in raw_text:
        status = "sold"
    elif "Auction Starts" in raw_text or auction_date:
        # If we have a date, check if it's future or past
        if auction_date:
            if auction_date >= date.today():
                status = "active"
            else:
                status = "sold"
        else:
            status = "active" # Assume active if "Auction Starts" is present but no date parsed (fallback)

    # Address Parsing (The robust part)
    property_address = row.get('property_address')
    city = row.get('city')
    state = row.get('state')
    zip_code = row.get('zip_code')

    if not property_address:
        # Fallback to regex
        # Use simple lookahead to Assessed Value to capture everything in between
        address_match = re.search(r'Property Address:\s*(.*?)(?=Assessed Value|$)', raw_text, re.DOTALL | re.IGNORECASE)
        if not address_match:
             # Try stricter with newline if above failed (unlikely)
             address_match = re.search(r'Property Address:\s*(.*)', raw_text, re.DOTALL)
        
        if address_match:
            full_address_block = address_match.group(1).strip()
            property_address = full_address_block.replace('\n', ' ').replace('\t', ' ').strip()
            
            # Extract City, State, Zip
            # We use the CLEANED property_address to avoid newline/tab issues
            # Regex now looks for: (City), (State) (Zip) at the end of the string usually, or explicitly structrued.
            # Sample: "1417 MEADOWBROOK RD NE PALM BAY, FL- 32905"
            # We want to find the pattern "CITY, ST ZIP"
            zip_match = re.search(r'([A-Za-z\s\.]+),\s*([A-Z]{2})[-\s]+(\d{5})', property_address)
            if zip_match:
                # Group 1 might capture "RD NE PALM BAY". We want just the City.
                # Heuristic: City is usually the last few words before the comma. 
                # But since we can't easily distinguish "Street City", we take what matches.
                # However, usually there's a clear separation. 
                # Let's try to be smarter. If the match is very long, it might include the street.
                captured_city_part = zip_match.group(1).strip()
                
                # If we captured the whole address "123 ST CITY", we need to split.
                # But "1417" won't match [A-Za-z], so it stops there?
                # "MEADOWBROOK RD NE PALM BAY" -> match.
                # We can try to split by known suffixes or just take the whole thing as city? No.
                # Simple improvement: Take the last 1-3 words?
                # Or just rely on the user to fix if it's messy.
                # For now, let's use the match but trim it if it looks like it includes the street.
                
                city = captured_city_part
                
                # Try to clean city if it has street info (heuristic: looks for " RD ", " ST ", " AVE " etc?)
                # Actually, in "PALM BAY, FL", the regex finds "PALM BAY".
                # In "RD NE PALM BAY, FL", it finds "RD NE PALM BAY".
                # Let's check if we can constrain Group 1 to NOT contain street suffixes if possible, OR
                # We assume the line break in Raw Text was meaningful.
                
                if "\n" in full_address_block:
                     # If raw text had newlines, City is likely on the last line!
                     last_line = full_address_block.split('\n')[-1].strip()
                     # Try parsing City, St Zip from JUST the last line
                     strict_match = re.search(r'([A-Za-z\s\.]+),\s*([A-Z]{2})[-\s]+(\d{5})', last_line)
                     if strict_match:
                         city = strict_match.group(1).strip()
                         state = strict_match.group(2).strip()
                         zip_code = strict_match.group(3).strip()
                     else:
                         # Fallback to the broad search on cleaned address
                         if zip_match:
                            state = zip_match.group(2).strip()
                            zip_code = zip_match.group(3).strip()
                else:
                     if zip_match:
                        state = zip_match.group(2).strip()
                        zip_code = zip_match.group(3).strip()

    title = property_address or f"Property {parcel_id}" or "Unknown Property"

    return PropertyCreate(
        title=title,
        address=property_address,
        city=city,
        state=state or "FL",
        zip_code=zip_code,
        price=opening_bid,
        status=status,
        property_type="residential",
        description=f"Imported from CSV.\n\nRaw Text:\n{raw_text[:1000]}..." if raw_text else "Imported from CSV",
        parcel_id=parcel_id or row.get('Parcel ID') or row.get('APN'),
        details=PropertyDetailsCreate(
            assessed_value=assessed_val,
            legal_description=row.get('Legal Description') or extract_field(raw_text, r'Legal Description:\s*(.*)'),
            account_number=case_number,
            market_value_url=row.get('Market Value URL') or row.get('Zillow Link') or row.get('Link'),
            flood_zone_code=row.get('Flood Zone') or row.get('Flood Code'),
            estimated_value=parse_currency(row.get('Estimated Value') or row.get('Market Value')),
        ),
        auction_details=AuctionDetailsCreate(
            opening_bid=opening_bid,
            case_number=case_number,
            auction_type=auction_type,
            raw_text=raw_text,
            auction_date=auction_date
        )
    )

@router.post("/upload-csv", response_model=dict)
async def upload_properties_csv(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Upload a CSV file to bulk create properties.
    Checks for duplicates based on Parcel ID or Address.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV.")

    contents = await file.read()
    decoded = contents.decode('utf-8', errors='replace')
    
    # Use csv.DictReader
    # Note: If the CSV has a header row, DictReader uses it.
    csv_reader = csv.DictReader(io.StringIO(decoded))
    
    count = 0
    duplicates = 0
    errors = []
    
    for row in csv_reader:
        try:
            property_in = parse_csv_row(row)
            
            # DUPLICATE CHECK
            # 1. Check by Parcel ID if usage
            if property_in.parcel_id:
                existing = property_repo.get_by_parcel_id(db, parcel_id=property_in.parcel_id)
                if existing:
                    duplicates += 1
                    continue
            
            # 2. Check by Address if Parcel ID was missing or check failed?
            # Usually strict parcel_id check is enough, but some scrapes might lack it.
            if property_in.address and not property_in.parcel_id:
                 existing_addr = property_repo.get_by_address(db, address=property_in.address)
                 if existing_addr:
                     duplicates += 1
                     continue

            # Create in DB
            property_repo.create(db, obj_in=property_in)
            count += 1
        except Exception as e:
            errors.append(f"Row error: {str(e)}")
            continue

    return {
        "message": f"Import complete.",
        "imported_count": count,
        "duplicates_skipped": duplicates,
        "errors": errors[:5]
    }
@router.post("/scrape", response_model=dict)
async def trigger_scrape(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Trigger the background scraper for all counties.
    """
    background_tasks.add_task(scraper_service.run_all)
    return {"message": "Scraping started in the background."}

@router.post("/import", response_model=dict)
async def trigger_import(
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Trigger the background import from scraped CSV files.
    """
    background_tasks.add_task(importer_service.run_import, db)
    return {"message": "Import started in the background."}

@router.post("/import-parcelfair", response_model=dict)
async def import_parcelfair_csv(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Import ParcelFair CSV data.
    Updates existing properties by Parcel Number, creates new ones.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV.")

    contents = await file.read()
    decoded = contents.decode('utf-8', errors='replace')
    
    try:
        stats = parcelfair_importer.import_csv(db, decoded)
        return {
            "message": "Import processed successfully.",
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
