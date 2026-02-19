
import csv
import io
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.property import Property, PropertyDetails, PropertyStatus, PropertyAuctionHistory

logger = logging.getLogger(__name__)

class ImportService:
    @staticmethod
    def _parse_float(val):
        if not val: return 0.0
        clean = str(val).replace('$', '').replace(',', '').strip()
        if clean.lower() in ['n/a', '-', '', 'none']: return 0.0
        try:
            return float(clean)
        except:
            return 0.0

    @staticmethod
    def _parse_date(val):
        if not val: return None
        for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%d-%b-%y", "%d-%b-%Y"):
            try:
                return datetime.strptime(val, fmt).date()
            except:
                continue
        return None

    @staticmethod
    def import_properties_csv(db: Session, file_content: bytes):
        decoded_content = file_content.decode('utf-8', errors='replace')
        csv_reader = csv.DictReader(io.StringIO(decoded_content))
        
        # Normalize headers (lowercase, strip) - optional but good practice
        # For now, rely on user providing exact headers or we check varied cases
        
        stats = {"total_rows": 0, "added": 0, "updated": 0, "errors": 0, "error_messages": []}

        for row in csv_reader:
            stats["total_rows"] += 1
            try:
                # Key identifier: Parcel ID (or Parcel Number?)
                parcel_id = row.get("Parcel ID") or row.get("Parcel Number") or row.get("parcel_code")
                if not parcel_id:
                     # fallback
                     parcel_id = row.get("account") # Maybe?
                
                if not parcel_id:
                    stats["errors"] += 1
                    stats["error_messages"].append(f"Row {stats['total_rows']}: Missing Parcel ID")
                    continue
                
                # Check exist
                prop = db.query(Property).filter(Property.parcel_id == parcel_id).first()

                # Parse Coordinates
                lat, lon = None, None
                coords = row.get("coordinates")
                if coords and ',' in coords:
                    try:
                        parts = coords.split(',')
                        lat = float(parts[0].strip())
                        lon = float(parts[1].strip())
                    except:
                        pass
                
                # Property Data
                prop_data = {
                    "parcel_id": parcel_id,
                    "parcel_code": row.get("parcel_code"), 
                    "address": row.get("parcel_address") or row.get("Address"),
                    "owner_name": row.get("owner_name") or row.get("Owner Name"),
                    "owner_address": row.get("owner_address"),
                    "amount_due": ImportService._parse_float(row.get("amount_due") or row.get("Amount Due") or row.get("Amt Due")),
                    "next_auction_date": ImportService._parse_date(row.get("auction_date") or row.get("Next Auction") or row.get("Auction Date")),
                    "tax_sale_year": int(row.get("tax_sale_year")) if row.get("tax_sale_year", "").isdigit() else None,
                    "cs_number": row.get("cs_number"),
                    "county": row.get("county") or row.get("County"),
                    "state": row.get("state_code") or row.get("State"),
                    "occupancy": row.get("vacancy") or row.get("Occupancy") or row.get("Occupancy Status"), 
                    "map_link": row.get("map_link"),
                    "description": row.get("description"),
                    "latitude": lat,
                    "longitude": lon,
                    "property_type": row.get("type", "residential").lower(),
                    # Default status if new
                    "status": PropertyStatus.ACTIVE 
                }

                if prop:
                    for k, v in prop_data.items():
                        if v is not None:
                            setattr(prop, k, v)
                    stats["updated"] += 1
                else:
                    prop = Property(**prop_data)
                    db.add(prop)
                    stats["added"] += 1
                
                # Details Data
                if not prop.details:
                    prop.details = PropertyDetails(property_id=prop.id)
                
                det = prop.details
                det.account_number = row.get("account")
                det.lot_acres = ImportService._parse_float(row.get("acres") or row.get("Acres"))
                det.estimated_arv = ImportService._parse_float(row.get("estimated_arv"))
                det.estimated_rent = ImportService._parse_float(row.get("estimated_rent"))
                det.improvement_value = ImportService._parse_float(row.get("improvements"))
                det.land_value = ImportService._parse_float(row.get("land_value"))
                det.total_market_value = ImportService._parse_float(row.get("total_value"))
                det.property_category = row.get("property_category")
                det.purchase_option_type = row.get("purchase_option_type")
                # det.tax_amount = ImportService._parse_float(row.get("taxes_due_auction")) 

                db.flush()

            except Exception as e:
                stats["errors"] += 1
                stats["error_messages"].append(f"Row {stats['total_rows']}: {str(e)}")
        
        db.commit()
        return stats

    @staticmethod
    def import_auction_history_csv(db: Session, file_content: bytes):
        decoded_content = file_content.decode('utf-8', errors='replace')
        csv_reader = csv.DictReader(io.StringIO(decoded_content))
        
        stats = {"total_rows": 0, "added": 0, "updated": 0, "errors": 0, "error_messages": []}

        for row in csv_reader:
            stats["total_rows"] += 1
            try:
                # Link to property via "Listed As" -> Parcel ID
                listed_as = row.get("Listed As")
                if not listed_as:
                    # Try linking by Auction Name? No, too risky.
                    # Without link, maybe create Orphan property?
                    # The user said "deviation for auction information that this property is listed... utilize tables..."
                    # It implies connection.
                    stats["errors"] += 1
                    stats["error_messages"].append(f"Row {stats['total_rows']}: Missing 'Listed As' (Parcel ID)")
                    continue
                
                prop = db.query(Property).filter(Property.parcel_id == listed_as).first()
                if not prop:
                    # Maybe try cleaning?
                    # or error?
                    stats["errors"] += 1
                    stats["error_messages"].append(f"Row {stats['total_rows']}: Property not found for 'Listed As': {listed_as}")
                    continue

                # Create History Record
                # Check duplicate? (Same auction_name + date?)
                auction_date = ImportService._parse_date(row.get("Date"))
                auction_name = row.get("Auction Name")
                
                existing = db.query(PropertyAuctionHistory).filter(
                    PropertyAuctionHistory.property_id == prop.id,
                    PropertyAuctionHistory.auction_name == auction_name,
                    PropertyAuctionHistory.auction_date == auction_date
                ).first()
                
                data = {
                    "property_id": prop.id,
                    "auction_name": auction_name,
                    "auction_date": auction_date,
                    "location": row.get("Where"),
                    "listed_as": listed_as,
                    "taxes_due": ImportService._parse_float(row.get("Taxes Due")),
                    "info_link": row.get("Info Link"),
                    "list_link": row.get("List Link")
                }
                
                if existing:
                    for k, v in data.items():
                        setattr(existing, k, v)
                    stats["updated"] += 1
                else:
                    history = PropertyAuctionHistory(**data)
                    db.add(history)
                    stats["added"] += 1

            except Exception as e:
                stats["errors"] += 1
                stats["error_messages"].append(f"Row {stats['total_rows']}: {str(e)}")
                
        db.commit()
        return stats
