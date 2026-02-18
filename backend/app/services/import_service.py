
import csv
import io
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.auction_event import AuctionEvent, AuctionEventType, AuctionEventStatus
from app.models.property import Property, PropertyDetails, PropertyStatus, InventoryType
from app.models.location import Location
from app.models.county import County
from app.db.base import Base

class ImportService:
    @staticmethod
    def import_calendar_csv(db: Session, file_content: bytes):
        """
        Imports Auction Calendar CSV (e.g. auctionsAL.csv)
        Headers: Search Link,Name,Short Name,Tax Status,Parcels,County Code,County Name,State,Auction Date,Time,Location,Notes,Register Date,Register Link,List Link,Purchase Info Link
        """
        decoded_content = file_content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded_content))
        
        stats = {"total_rows": 0, "added": 0, "updated": 0, "errors": 0, "error_messages": []}
        
        for row in csv_reader:
            stats["total_rows"] += 1
            try:
                # Basic Mapping
                state = row.get("State", "").strip()
                county_name = row.get("County Name", "").strip()
                auction_date_str = row.get("Auction Date", "").strip()
                
                if not auction_date_str:
                    continue

                try:
                    auction_date = datetime.strptime(auction_date_str, "%Y-%m-%d").date()
                except ValueError:
                    # Try other formats if needed
                    stats["errors"] += 1
                    stats["error_messages"].append(f"Row {stats['total_rows']}: Invalid date format {auction_date_str}")
                    continue

                # Unique Identifier? Maybe State + County + Date + Type
                # or just look for matching event
                
                # Determine Auction Type from "Name" or "Tax Status"
                tax_status = row.get("Tax Status", "").lower()
                auction_type = AuctionEventType.TAX_DEED # Default
                if "lien" in tax_status:
                    auction_type = AuctionEventType.TAX_LIEN
                elif "redeem" in tax_status:
                    auction_type = AuctionEventType.REDEEMABLE_DEED
                
                # Check if event exists
                existing_event = db.query(AuctionEvent).filter(
                    AuctionEvent.state == state,
                    AuctionEvent.county == county_name,
                    AuctionEvent.start_date == auction_date
                ).first()

                if existing_event:
                    # Update
                    existing_event.auction_time = row.get("Time")
                    existing_event.location = row.get("Location")
                    existing_event.registration_link = row.get("Register Link")
                    existing_event.purchase_link = row.get("Purchase Info Link")
                    existing_event.list_link = row.get("List Link")
                    existing_event.notes = row.get("Notes")
                    
                    try:
                        existing_event.parcels_count = int(row.get("Parcels", 0))
                    except:
                        pass
                        
                    stats["updated"] += 1
                else:
                    # Create
                    new_event = AuctionEvent(
                        state=state,
                        county=county_name,
                        start_date=auction_date,
                        auction_type=auction_type,
                        auction_time=row.get("Time"),
                        location=row.get("Location"),
                        registration_link=row.get("Register Link"),
                        purchase_link=row.get("Purchase Info Link"),
                        list_link=row.get("List Link"),
                        notes=row.get("Notes"),
                        status=AuctionEventStatus.UPCOMING
                    )
                    try:
                        new_event.parcels_count = int(row.get("Parcels", 0))
                    except:
                        pass
                        
                    db.add(new_event)
                    stats["added"] += 1
                
            except Exception as e:
                stats["errors"] += 1
                stats["error_messages"].append(f"Row {stats['total_rows']}: {str(e)}")
        
        db.commit()
        return stats

    @staticmethod
    def import_properties_csv(db: Session, file_content: bytes):
        """
        Imports Property Data CSV (e.g. Arkansas-properties...)
        Headers: ... Parcel Id, Parcel Number, Next Auction, Amount Due, ... Coordinates, Legal Description ...
        """
        decoded_content = file_content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded_content))
        
        stats = {"total_rows": 0, "added": 0, "updated": 0, "errors": 0, "error_messages": []}

        for row in csv_reader:
            stats["total_rows"] += 1
            try:
                parcel_id = row.get("Parcel Id") or row.get("Parcel Number")
                if not parcel_id:
                    continue
                
                # Check if property exists
                property = db.query(Property).filter(Property.parcel_id == parcel_id).first()
                
                # Parse Dates
                next_auction_str = row.get("Next Auction")
                next_auction_date = None
                if next_auction_str and next_auction_str != "-":
                    try:
                         next_auction_date = datetime.strptime(next_auction_str, "%Y-%m-%d").date()
                    except:
                        pass # Ignore invalid dates

                # Parse Amounts
                def parse_money(val):
                    if not val: return 0.0
                    clean_val = val.replace("$", "").replace(",", "").strip()
                    if clean_val.lower() in ["n/a", "-", ""]:
                        return 0.0
                    try:
                        return float(clean_val)
                    except:
                        return 0.0

                amount_due = parse_money(row.get("Amount Due"))
                total_value = parse_money(row.get("Total Value"))
                
                # Parse Coordinates "lat,lon"
                coords = row.get("Coordinates", "")
                lat, lon = None, None
                if coords and "," in coords:
                    try:
                        parts = coords.split(",")
                        lat = float(parts[0].strip())
                        lon = float(parts[1].strip())
                    except:
                        pass

                # Mapping Dictionary
                data = {
                    "parcel_id": parcel_id,
                    "parcel_number": row.get("Parcel Number"),
                    "address": row.get("Address"),
                    "city": row.get("City"),
                    "state": row.get("State"),
                    "zip_code": row.get("Zip"),
                    "county": row.get("County"),
                    "owner_name": row.get("Owner Name"),
                    "owner_address": row.get("Owner Address"),
                    "owner_state": row.get("Owner State"),
                    "occupancy": row.get("Occupancy", "Vacant"), # Default?
                    "legal_description": row.get("Legal Description"),
                    "next_auction_date": next_auction_date,
                    "amount_due": amount_due,
                    "total_value": total_value,
                    "latitude": lat,
                    "longitude": lon,
                    "property_type": "land" if "land" in row.get("Parcel Type", "").lower() else "residential",
                    "status": PropertyStatus.ACTIVE,
                    "inventory_type": InventoryType.AUCTION,
                    "tax_status": row.get("Availability", "Available"),
                     # Preserve internal ID if needed, but we rely on parcel_id uniqueness
                }

                if property:
                    # Update basic fields
                    for k, v in data.items():
                        if v is not None:
                            setattr(property, k, v)
                    stats["updated"] += 1
                else:
                    # Create Property
                    property = Property(**data)
                    db.add(property)
                    # flush to get ID if needed for details, though we use relationship
                    stats["added"] += 1
                
                # Handle Property Details (One-to-One)
                # Check for existing details if updating
                # For simplicity here, assume we can access property.details
                
                if not property.details:
                     property.details = PropertyDetails()
                
                details = property.details
                details.legal_description = row.get("Legal Description")
                details.tax_amount = amount_due # Assign amount due to tax amount roughly? Or separate?
                details.total_market_value = total_value
                details.land_value = parse_money(row.get("Land"))
                details.improvement_value = parse_money(row.get("Improvements"))
                details.assessed_value = parse_money(row.get("Assessed Value"))
                
                try:
                    details.lot_acres = float(row.get("Acres", 0))
                except:
                    pass
                
                try:
                    details.sqft = int(float(row.get("Square Feet", 0) or 0))
                except:
                    pass
                
                # Commit strictly at end or batch?
                # db.commit() # Doing inside loop is slow but safer for these small batches in dev

            except Exception as e:
                stats["errors"] += 1
                stats["error_messages"].append(f"Row {stats['total_rows']}: {str(e)}")
        
        db.commit()
        return stats
