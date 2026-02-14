import csv
import re
import os
import glob
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.property import Property, PropertyDetails, AuctionDetails, PropertyStatus, PropertyType
from app.db.base import Base

DATA_DIR = "/app/data"

class CsvImporter:
    def parse_currency(self, value: Optional[str]) -> Optional[float]:
        if not value:
            return None
        try:
            return float(value.replace('$', '').replace(',', '').strip())
        except ValueError:
            return None

    def extract_field(self, text: str, pattern: str, group: int = 1) -> Optional[str]:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        return match.group(group).strip() if match else None

    def parse_raw_text(self, raw_text: str) -> Dict[str, Any]:
        data = {}
        
        # Common fields
        data['auction_type'] = self.extract_field(raw_text, r'Auction Type:\s*(.*)')
        data['case_number'] = self.extract_field(raw_text, r'Case #:\s*(.*)')
        data['certificate_number'] = self.extract_field(raw_text, r'Certificate #:\s*(.*)')
        data['parcel_id'] = self.extract_field(raw_text, r'Parcel ID:\s*(.*)')
        data['sold_to'] = self.extract_field(raw_text, r'Sold To\n(.*?)(?=\n)', 1)
        
        # Financials
        opening_bid_str = self.extract_field(raw_text, r'Opening Bid:\s*(\$[\d,.]+)')
        data['opening_bid'] = self.parse_currency(opening_bid_str)
        
        assessed_value_str = self.extract_field(raw_text, r'Assessed Value:\s*(\$[\d,.]+)')
        data['assessed_value'] = self.parse_currency(assessed_value_str)
        
        amount_str = self.extract_field(raw_text, r'Amount\s*\n\s*(\$[\d,.]+)')
        data['amount'] = self.parse_currency(amount_str)
        
        # Status
        if "Auction Sold" in raw_text:
            data['status'] = PropertyStatus.SOLD
            match = re.search(r'Auction Sold\n(.*)', raw_text)
            data['status_detail'] = match.group(1).strip() if match else None
        elif "Auction Starts" in raw_text:
            data['status'] = PropertyStatus.ACTIVE
            match = re.search(r'Auction Starts\n(.*)', raw_text)
            data['status_detail'] = match.group(1).strip() if match else None
        elif "Redeemed" in raw_text:
            data['status'] = PropertyStatus.INACTIVE
            data['status_detail'] = "Redeemed"
        elif "Canceled" in raw_text:
            data['status'] = PropertyStatus.INACTIVE
            data['status_detail'] = "Canceled"
        else:
            data['status'] = PropertyStatus.PENDING
            data['status_detail'] = "Unknown"

        # Address Parsing
        # Use non-greedy match (.*?) to stop at the lookahead
        address_block_match = re.search(r'Property Address:\s*(.*?)(?=\s*(?:Assessed Value|$))', raw_text, re.DOTALL | re.IGNORECASE)
        
        if address_block_match:
            raw_block = address_block_match.group(1).strip()
            # Split into lines and filter empty
            lines = [line.strip() for line in raw_block.split('\n') if line.strip()]
            
            if lines:
                # Try to parse the last line as City, State Zip
                last_line = lines[-1]
                # Relaxed regex to match migration/migrate_csv_to_db.py
                # Looking for <City>, <State> <Zip> anywhere in the line
                zip_match = re.search(r'([A-Za-z\s\.]+),\s*([A-Z]{2})\s*[-\s]?\s*(\d{5}(?:-\d{4})?)', last_line, re.IGNORECASE)
                
                if zip_match:
                    data['city'] = zip_match.group(1).strip()
                    data['state'] = zip_match.group(2).upper().strip()
                    data['zip_code'] = zip_match.group(3).strip()
                    
                    # Full address is join of all lines
                    cleaned_address = ' '.join(lines)
                    data['property_address'] = cleaned_address
                else:
                    # Fallback: couldn't parse city/state/zip
                    data['city'] = None
                    data['state'] = None
                    data['zip_code'] = None
                    data['property_address'] = ' '.join(lines)
            else:
                data['property_address'] = None
                data['city'] = None
                data['state'] = None
                data['zip_code'] = None
        else:
            data['property_address'] = None
            data['city'] = None
            data['state'] = None
            data['zip_code'] = None
            
        return data

    def import_from_csv(self, db: Session, file_path: str) -> int:
        count = 0
        try:
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    raw_text = row.get('raw_text', '')
                    auction_date = row.get('auction_date')
                    parsed = self.parse_raw_text(raw_text)
                    
                    # Duplicate check: Parcel ID or Case Number
                    # If parcel_id exists, update. If not, check case number?
                    # Let's prioritize parcel_id.
                    
                    parcel_id = parsed.get('parcel_id')
                    case_number = parsed.get('case_number')
                    
                    existing_prop = None
                    if parcel_id:
                        existing_prop = db.query(Property).filter(Property.parcel_id == parcel_id).first()
                    
                    # Infer county from filename
                    filename = os.path.basename(file_path)
                    county_name = None
                    if "_co_" in filename:
                        # e.g. adams_co_20260209.csv -> adams -> Adams County
                        base = filename.split("_co_")[0]
                        county_name = base.capitalize() + " County"
                    
                    # Create or Update
                    if not existing_prop:
                        # Create Property
                        prop = Property(
                            title=parsed.get('property_address') or f"Auction Item {case_number}",
                            address=parsed.get('property_address'),
                            city=parsed.get('city'),
                            state=parsed.get('state'),
                            zip_code=parsed.get('zip_code'),
                            county=county_name,
                            price=parsed.get('opening_bid'), # Use opening bid as price?
                            status=parsed.get('status'),
                            parcel_id=parcel_id,
                            description=f"Imported from {os.path.basename(file_path)}"
                        )
                        db.add(prop)
                        db.commit()
                        db.refresh(prop)
                        existing_prop = prop
                    else:
                        # Update key fields
                        existing_prop.title = parsed.get('property_address') or existing_prop.title
                        existing_prop.address = parsed.get('property_address')
                        existing_prop.city = parsed.get('city')
                        existing_prop.state = parsed.get('state')
                        existing_prop.zip_code = parsed.get('zip_code')
                        existing_prop.county = county_name or existing_prop.county
                        existing_prop.price = parsed.get('opening_bid')
                        existing_prop.status = parsed.get('status')
                        db.add(existing_prop)
                        db.flush()
                        db.refresh(existing_prop)

                    # Create/Update AuctionDetails
                    # Check if exists
                    existing_details = db.query(AuctionDetails).filter(AuctionDetails.property_id == existing_prop.id).first()
                    if not existing_details:
                        details = AuctionDetails(
                            property_id=existing_prop.id,
                            auction_date=datetime.strptime(auction_date, "%Y-%m-%d").date() if auction_date else None,
                            scraped_file=os.path.basename(file_path),
                            status_detail=parsed.get('status_detail'),
                            amount=parsed.get('amount'),
                            sold_to=parsed.get('sold_to'),
                            auction_type=parsed.get('auction_type'),
                            case_number=case_number,
                            certificate_number=parsed.get('certificate_number'),
                            opening_bid=parsed.get('opening_bid'),
                            raw_text=raw_text
                        )
                        db.add(details)
                    else:
                        # Update details
                        existing_details.amount = parsed.get('amount')
                        existing_details.status_detail = parsed.get('status_detail')
                        existing_details.sold_to = parsed.get('sold_to')
                        existing_details.opening_bid = parsed.get('opening_bid')

                    # Create/Update PropertyDetails (Valuation)
                    existing_prop_details = db.query(PropertyDetails).filter(PropertyDetails.property_id == existing_prop.id).first()
                    if not existing_prop_details:
                         prop_details = PropertyDetails(
                             property_id=existing_prop.id,
                             estimated_value=parsed.get('assessed_value')
                         )
                         db.add(prop_details)
                    else:
                        if parsed.get('assessed_value'):
                            existing_prop_details.estimated_value = parsed.get('assessed_value')
                    
                    db.commit()
                    count += 1
                    
        except Exception as e:
            print(f"Error importing {file_path}: {e}")
            db.rollback()
        
        return count

    def run_import(self, db: Session):
        csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
        total = 0
        for f in csv_files:
            total += self.import_from_csv(db, f)
        return total

importer_service = CsvImporter()
