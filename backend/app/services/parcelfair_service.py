import csv
import io
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.property import Property
from app.models.auction_event import AuctionEvent, AuctionEventType, AuctionEventStatus

class ParcelFairImporter:
    def parse_currency(self, value: Any) -> float:
        if not value or value == 'N/A' or value == '-':
            return 0.0
        if isinstance(value, float) or isinstance(value, int):
            return float(value)
        return float(str(value).replace('$', '').replace(',', '').strip())

    def parse_int(self, value: Any) -> Optional[int]:
        if not value or value == 'N/A' or value == '-':
            return None
        try:
            return int(value)
        except ValueError:
            return None

    def import_csv(self, db: Session, file_content: str, import_type: str = "properties") -> Dict[str, Any]:
        """
        Parses CSV content and updates/creates records based on import type.
        """
        if import_type == "calendar":
            return self.import_auction_calendar(db, file_content)
        elif import_type == "properties":
            return self.import_properties(db, file_content)
        else:
            raise ValueError(f"Unknown import type: {import_type}")

    def import_auction_calendar(self, db: Session, file_content: str) -> Dict[str, Any]:
        reader = csv.DictReader(io.StringIO(file_content))
        stats = {
            "total_rows": 0, "added": 0, "updated": 0, "skipped": 0, "errors": 0, "error_messages": []
        }

        for row in reader:
            stats["total_rows"] += 1
            try:
                # Fields: State, County Name, Auction Date, Tax Status, Time, Location
                state = row.get('State')
                county = row.get('County Name')
                date_str = row.get('Auction Date')
                tax_status = row.get('Tax Status')
                
                if not state or not county or not date_str:
                    stats["skipped"] += 1
                    continue

                # Parse Date
                try:
                    start_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                except ValueError:
                    stats["errors"] += 1
                    stats["error_messages"].append(f"Row {stats['total_rows']}: Invalid Date {date_str}")
                    continue

                # Map Type
                auction_type = AuctionEventType.TAX_DEED # Default
                if 'Lien' in tax_status or 'lien' in tax_status.lower():
                    auction_type = AuctionEventType.TAX_LIEN
                elif 'Redeemable' in tax_status:
                    auction_type = AuctionEventType.REDEEMABLE_DEED
                
                # Check Existing
                existing = db.query(AuctionEvent).filter(
                    AuctionEvent.state == state,
                    AuctionEvent.county == county,
                    AuctionEvent.auction_type == auction_type,
                    AuctionEvent.start_date == start_date
                ).first()

                if existing:
                    # Update info
                    existing.status = AuctionEventStatus.ACTIVE
                    stats["updated"] += 1
                else:
                    # Create New
                    new_event = AuctionEvent(
                        state=state,
                        county=county,
                        auction_type=auction_type,
                        status=AuctionEventStatus.ACTIVE,
                        start_date=start_date,
                        total_assets=0 # Will be updated when properties are imported
                    )
                    db.add(new_event)
                    stats["added"] += 1
            
            except Exception as e:
                stats["errors"] += 1
                stats["error_messages"].append(f"Row {stats['total_rows']}: {str(e)}")

        db.commit()
        return stats

    def import_properties(self, db: Session, file_content: str) -> Dict[str, Any]:
        """
        Parses Property CSV content and updates/creates properties and auction events.
        """
        reader = csv.DictReader(io.StringIO(file_content))
        
        stats = {
            "total_rows": 0,
            "added": 0,
            "updated": 0,
            "skipped": 0,
            "errors": 0,
            "error_messages": []
        }
        
        auction_cache: Dict[tuple, AuctionEvent] = {}
        
        for row in reader:
            stats["total_rows"] += 1
            try:
                # 1. Handle Auction Event
                state = row.get('State', 'AR')
                # For now, group by State + 'OTC' if no specific date logic provided in CSV
                # (Logic adapted from script)
                auction_key = (state, 'OTC')
                
                if auction_key not in auction_cache:
                    # Try to find existing first
                    # In a real scenario, might check DB for active auction in this state
                    # For simplicity/idempotency, we fetch or create a generic container
                    
                    existing_auction = db.query(AuctionEvent).filter(
                        AuctionEvent.state == state,
                        AuctionEvent.auction_type == AuctionEventType.TAX_DEED, # Default
                        AuctionEvent.status == AuctionEventStatus.ACTIVE
                    ).first()
                    
                    if existing_auction:
                        auction_cache[auction_key] = existing_auction
                    else:
                        new_auction = AuctionEvent(
                            state=state,
                            county="Multiple",
                            auction_type=AuctionEventType.TAX_DEED,
                            status=AuctionEventStatus.ACTIVE,
                            start_date=datetime.now().date(),
                            total_assets=0
                        )
                        db.add(new_auction)
                        db.flush()
                        auction_cache[auction_key] = new_auction
                
                auction_event = auction_cache[auction_key]
                
                # 2. Check for Existing Property
                parcel_number = row.get('Parcel Number')
                if not parcel_number:
                     stats["skipped"] += 1
                     continue

                existing_prop = db.query(Property).filter(Property.parcel_number == parcel_number).first()
                
                if existing_prop:
                    # UPDATE existing
                    # Update fields that might change
                    existing_prop.amount_due = self.parse_currency(row.get('Amount Due'))
                    existing_prop.assessed_value = self.parse_currency(row.get('Assessed Value'))
                    existing_prop.status = 'active' # Re-activate if found in new list?
                    if not existing_prop.auction_event_id:
                        existing_prop.auction_event_id = auction_event.id
                        auction_event.total_assets += 1
                        
                    stats["updated"] += 1
                else:
                    # CREATE new
                    prop = Property(
                        address=row.get('Address'),
                        city=row.get('City'),
                        state=row.get('State'),
                        zip_code=row.get('Zip'),
                        county=row.get('County'),
                        owner_name=row.get('Owner Name'),
                        
                        parcel_number=parcel_number,
                        cs_number=row.get('CS'),
                        tax_sale_year=self.parse_int(row.get('Tax Sale Year')),
                        delinquent_year=self.parse_int(row.get('Delinquent Year')),
                        amount_due=self.parse_currency(row.get('Amount Due')),
                        total_value=self.parse_currency(row.get('Total Value')),
                        land_value=self.parse_currency(row.get('Land')),
                        improvement_value=self.parse_currency(row.get('Improvements')),
                        assessed_value=self.parse_currency(row.get('Assessed Value')),
                        parcel_type=row.get('Parcel Type'),
                        legal_description=row.get('Legal Description'),
                        opportunity_zone=row.get('Opportunity Zone'),
                        coordinates=row.get('Coordinates'),
                        
                        auction_event_id=auction_event.id,
                        status='active'
                    )
                    db.add(prop)
                    auction_event.total_assets += 1
                    stats["added"] += 1
                
            except Exception as e:
                stats["errors"] += 1
                stats["error_messages"].append(f"Row {stats['total_rows']}: {str(e)}")
        
        db.commit()
        return stats

parcelfair_importer = ParcelFairImporter()
