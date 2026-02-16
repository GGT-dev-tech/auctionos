
import csv
import sys
import os
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.db.base import Base # Import base to register all models
from app.models.property import Property, InventoryType, PropertyDetails
from app.models.auction import Auction
from app.models.company import Company
from app.models.expense import Expense
from app.models.note import Note
from app.models.price_notice import PriceNotice
from app.models.user import User
# from app.models.location import Location # if needed

def parse_currency(value):
    if not value or value == '-' or value == 'N/A':
        return 0.0
    try:
        # Remove currency symbols and commas
        clean_value = str(value).replace('$', '').replace(',', '').strip()
        if not clean_value:
            return 0.0
        return float(clean_value)
    except (ValueError, TypeError):
        return 0.0

def parse_date(value):
    if not value:
        return None
    try:
        # Try ISO format first
        return datetime.fromisoformat(value.replace('Z', '+00:00')).date()
    except ValueError:
        try:
            # Try simple date
            return datetime.strptime(value, '%Y-%m-%d').date()
        except ValueError:
            return None

def import_auctions(csv_path: str, db: Session):
    print(f"Importing Auctions from {csv_path}...")
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        count = 0
        skipped = 0
        for row in reader:
            auction_date = parse_date(row.get('Auction Date'))
            name = row.get('Name')
            county = row.get('County Name')
            
            # Check if exists
            exists = db.query(Auction).filter(
                Auction.name == name,
                Auction.auction_date == auction_date,
                Auction.county == county
            ).first()
            
            if exists:
                skipped += 1
                continue

            auction = Auction(
                name=name,
                short_name=row.get('Short Name'),
                state=row.get('State'),
                county=county,
                auction_date=auction_date,
                time=row.get('Time'),
                location=row.get('Location'),
                tax_status=row.get('Tax Status'),
                parcels_count=int(row.get('Parcels', 0)),
                notes=row.get('Notes'),
                search_link=row.get('Search Link'),
                register_link=row.get('Register Link'),
                list_link=row.get('List Link'),
                info_link=row.get('Purchase Info Link')
            )
            db.add(auction)
            count += 1
        db.commit()
    print(f"Imported {count} auctions. Skipped {skipped}.")

def import_properties_arkansas(csv_path: str, db: Session):
    print(f"Importing Properties (OTC) from {csv_path}...")
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        count = 0
        skipped = 0
        seen_ids = set()
        
        for row in reader:
            parcel_id = row.get('Parcel Number')
            
            if not parcel_id:
                continue
                
            if parcel_id in seen_ids:
                skipped += 1
                continue
            
            # Check existence
            existing = db.query(Property).filter(Property.parcel_id == parcel_id).first()
            if existing:
                skipped += 1
                seen_ids.add(parcel_id)
                continue

            # Coordinates parsing "lat,lon"
            lat, lon = None, None
            coords = row.get('Coordinates')
            if coords and ',' in coords:
                try:
                    lat_str, lon_str = coords.split(',')
                    lat = float(lat_str.strip())
                    lon = float(lon_str.strip())
                except ValueError:
                    pass

            property = Property(
                parcel_id=parcel_id,
                title=f"Property {parcel_id}", # Default title
                address=row.get('Address'),
                city=row.get('City'),
                state=row.get('State'),
                zip_code=row.get('Zip'),
                county=row.get('County'),
                # price=?, 
                status='active', # Default
                inventory_type=InventoryType.OTC,
                tax_status=row.get('Status'), # e.g. Deed
                next_auction_date=parse_date(row.get('Next Auction')),
                amount_due=parse_currency(row.get('Amount Due')),
                legal_description=row.get('Legal Description'),
                owner_name=row.get('Owner Name'),
                owner_address=f"{row.get('Owner Address', '')} {row.get('Owner City', '')} {row.get('Owner State', '')} {row.get('Owner Zip', '')}".strip(),
                latitude=lat,
                longitude=lon,
                # polygon= # Not in CSV, will default to point if needed or null
            )
            
            # Details
            details = PropertyDetails(
                total_market_value=parse_currency(row.get('Total Value')),
                land_value=parse_currency(row.get('Land')),
                improvement_value=parse_currency(row.get('Improvements')),
                assessed_value=parse_currency(row.get('Assessed Value')),
                lot_acres=float(row.get('Acres')) if row.get('Acres') and row.get('Acres') != '-' and row.get('Acres') != 'N/A' else None,
                tax_year=int(row.get('Tax Sale Year')) if row.get('Tax Sale Year') and row.get('Tax Sale Year').isdigit() else None,
            )
            property.details = details
            
            db.add(property)
            seen_ids.add(parcel_id)
            count += 1
            if count % 100 == 0:
                print(f"Processed {count} records...")
                try:
                    db.commit() # Commit in chunks to avoid large transactions
                except Exception as e:
                    db.rollback()
                    print(f"Error committing chunk: {e}")
                
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Error committing final chunk: {e}")
            
    print(f"Imported {count} properties from Arkansas CSV. Skipped {skipped}.")

def import_properties_leiloes(csv_path: str, db: Session):
    print(f"Importing Properties (Auction) from {csv_path}...")
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        count = 0
        skipped = 0
        seen_ids = set()
        
        for row in reader:
            # Map columns
            # Estado,Nome do Leilão,Tipo de Parcela,Data do Leilão,Condado,Parcela,Valor Devido,Local
            parcel_id = row.get('Parcela')
            
            if not parcel_id or parcel_id == '-': 
                continue # Skip invalid
            
            if parcel_id in seen_ids:
                skipped += 1
                continue
                
            # Check existence in DB
            existing = db.query(Property).filter(Property.parcel_id == parcel_id).first()
            if existing:
                skipped += 1
                seen_ids.add(parcel_id)
                continue

            property = Property(
                parcel_id=parcel_id,
                title=f"Auction Property {parcel_id}",
                state=row.get('Estado'),
                county=row.get('Condado'),
                amount_due=parse_currency(row.get('Valor Devido')),
                next_auction_date=parse_date(row.get('Data do Leilão')),
                inventory_type=InventoryType.AUCTION,
                # Missing address, lat/lon in this CSV summary?
                # We might need to fetch more data or this is just a lead
            )
            
            db.add(property)
            seen_ids.add(parcel_id)
            count += 1
            if count % 100 == 0:
                try:
                    db.commit()
                except Exception as e:
                    db.rollback()
                    print(f"Error committing chunk: {e}")
            
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Error committing final chunk: {e}")

    print(f"Imported {count} properties from Leiloes CSV. Skipped {skipped}.")

if __name__ == "__main__":
    db = SessionLocal()
    
    # host path
    # base_path = "/Users/gustavo/Downloads/auctionos/migrationParcelFair"
    # container path (assuming copied to backend/)
    base_path = "migrationParcelFair"
    
    try:
        import_auctions(f"{base_path}/auctionsAL.csv", db)
        import_properties_arkansas(f"{base_path}/Arkansas-properties-all-2026-02-16.csv", db)
        import_properties_leiloes(f"{base_path}/leiloes-filtrados-2026-02-16.csv", db)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()
