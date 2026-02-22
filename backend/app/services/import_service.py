import pandas as pd
import io
import uuid
import logging
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.csv_import import PropertyCSVRow, AuctionCSVRow
from app.db.session import engine
from datetime import datetime
from redis import Redis
import os

import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_redis_url():
    # Railway injects explicit components for the Redis plugin.
    # We forcefully reconstruct the URL to bypass any dirty 'REDIS_URL' overrides the user might have saved.
    pwd = os.getenv("REDISPASSWORD")
    host = os.getenv("REDISHOST")
    port = os.getenv("REDISPORT", "6379")
    if pwd and host:
        return f"redis://:{pwd}@{host}:{port}/0"
    return os.getenv("REDIS_URL", "redis://redis:6379/0")

redis = Redis.from_url(get_redis_url())

class ImportService:
    @staticmethod
    async def process_properties_csv(file_content: bytes, job_id: str):
        try:
            # Read CSV
            df = pd.read_csv(io.BytesIO(file_content))
            total_rows = len(df)
            success_count = 0
            errors = []

            with engine.begin() as conn:
                for index, row in df.iterrows():
                    try:
                        # Validation via Pydantic
                        # Replace NaN with None for Pydantic
                        row_dict = row.where(pd.notnull(row), None).to_dict()
                        
                        # Handle potential alias mapping if CSV headers don't match exactly?
                        # For now assume headers match expected aliases in Schema
                        
                        validated_data = PropertyCSVRow(**row_dict)
                        # 1. Unified Upsert to PropertyDetails
                        details_data = {
                            "property_id": str(uuid.uuid4()), # Fallback UUID for new inserts
                            "parcel_id": validated_data.parcel_id,
                            "address": validated_data.address,
                            "owner_address": validated_data.owner_address,
                            "county": validated_data.county,
                            "state": validated_data.state_code,
                            "description": validated_data.description,
                            "amount_due": validated_data.amount_due,
                            "occupancy": validated_data.vacancy,
                            "tax_sale_year": int(float(validated_data.tax_sale_year)) if validated_data.tax_sale_year else None,
                            "cs_number": validated_data.cs_number,
                            "property_type": validated_data.type,
                            "status": "active",
                            "account_number": validated_data.account,
                            "lot_acres": validated_data.acres,
                            "estimated_arv": validated_data.estimated_arv,
                            "estimated_rent": validated_data.estimated_rent,
                            "improvement_value": validated_data.improvements,
                            "land_value": validated_data.land_value,
                            "assessed_value": validated_data.total_value,
                            "property_category": validated_data.property_category,
                            "purchase_option_type": validated_data.purchase_option_type
                        }

                        # Handle Coordinates
                        if validated_data.coordinates:
                            try:
                                clean_coords = validated_data.coordinates.replace(',', ' ').strip()
                                parts = clean_coords.split()
                                if len(parts) >= 2:
                                    details_data["latitude"] = float(parts[0])
                                    details_data["longitude"] = float(parts[1])
                            except:
                                pass

                        fields_pd = ", ".join(details_data.keys())
                        placeholders_pd = ", ".join([f":{k}" for k in details_data.keys()])
                        updates_pd = ", ".join([f"{k} = EXCLUDED.{k}" for k in details_data.keys() if k not in ["property_id", "parcel_id"]])
                        
                        query_pd = text(f"""
                            INSERT INTO property_details ({fields_pd}) VALUES ({placeholders_pd})
                            ON CONFLICT (parcel_id) DO UPDATE SET {updates_pd}
                            RETURNING property_id
                        """)
                        res = conn.execute(query_pd, details_data)
                        final_property_id = res.scalar()

                        # 3. Upsert Property Auction History (Dynamic Context)
                        if validated_data.auction_name and validated_data.auction_date:
                            def parse_auction_date(d_str):
                                try: return datetime.strptime(d_str.strip(), "%m/%d/%Y").date()
                                except: pass
                                try: return datetime.strptime(d_str.strip(), "%Y-%m-%d").date()
                                except: return None
                                
                            parsed_date = parse_auction_date(validated_data.auction_date)
                            
                            history_data = {
                                "property_id": final_property_id,
                                "auction_name": validated_data.auction_name,
                                "auction_date": parsed_date,
                                "taxes_due": validated_data.taxes_due_auction,
                                "info_link": validated_data.auction_info_link,
                                "list_link": validated_data.auction_list_link,
                                "created_at": datetime.utcnow()
                            }
                            
                            # Determine if record exists
                            existing_hist = conn.execute(
                                text("SELECT id FROM property_auction_history WHERE property_id = :pid AND auction_name = :aname"),
                                {"pid": str(final_property_id), "aname": validated_data.auction_name}
                            ).fetchone()

                            if existing_hist:
                                updates_h = ", ".join([f"{k} = :{k}" for k in history_data.keys() if k not in ["property_id", "auction_name", "created_at"]])
                                if updates_h:
                                    query_h = text(f"UPDATE property_auction_history SET {updates_h} WHERE id = :hid")
                                    conn.execute(query_h, {**history_data, "hid": existing_hist[0]})
                            else:
                                fields_h = ", ".join(history_data.keys())
                                placeholders_h = ", ".join([f":{k}" for k in history_data.keys()])
                                query_h = text(f"INSERT INTO property_auction_history ({fields_h}) VALUES ({placeholders_h})")
                                conn.execute(query_h, history_data)

                        success_count += 1
                        
                    except Exception as e:
                        errors.append(f"Row {index + 2}: {str(e)}")

            # Final Status Update
            if errors:
                status_msg = f"Completed with errors. Success: {success_count}/{total_rows}. Errors: {len(errors)}"
                # Could store errors in Redis list for download
                redis.set(f"import_errors:{job_id}", str(errors), ex=3600)
            else:
                status_msg = f"Success: {success_count} properties processed"
                
            redis.set(f"import_status:{job_id}", status_msg, ex=3600)
            
            # TRIGGER EVENT: Link imported properties to their auctions automatically
            from app.tasks import resolve_property_auction_links_task
            resolve_property_auction_links_task.delay(job_id)
            
        except Exception as e:
            logger.error(f"Import Job Failed: {e}")
            redis.set(f"import_status:{job_id}", f"Critical Error: {str(e)}", ex=3600)

    @staticmethod
    async def process_auctions_csv(file_content: bytes, job_id: str):
        try:
            df = pd.read_csv(io.BytesIO(file_content))
            total_rows = len(df)
            success_count = 0
            errors = []

            with engine.begin() as conn:
                for index, row in df.iterrows():
                    try:
                        row_dict = row.where(pd.notnull(row), None).to_dict()
                        validated_data = AuctionCSVRow(**row_dict)
                        
                        # Parse dates
                        def parse_dt(d_str):
                            if not d_str or d_str.strip() == "" or d_str == "N/A": return None
                            try: return datetime.strptime(d_str.strip(), "%Y-%m-%d").date()
                            except: return None
                            
                        a_date = parse_dt(validated_data.auction_date)
                        if not a_date:
                            raise ValueError(f"Invalid or missing auction date: {validated_data.auction_date}")
                            
                        r_date = parse_dt(validated_data.register_date)

                        auction_data = {
                            "name": validated_data.name,
                            "short_name": validated_data.short_name,
                            "auction_date": a_date,
                            "time": validated_data.time,
                            "location": validated_data.location,
                            "county": validated_data.county_name,
                            "county_code": validated_data.county_code,
                            "state": validated_data.state,
                            "tax_status": validated_data.tax_status,
                            "parcels_count": int(float(validated_data.parcels)) if validated_data.parcels else 0,
                            "notes": validated_data.notes,
                            "search_link": validated_data.search_link,
                            "register_date": r_date,
                            "register_link": validated_data.register_link,
                            "list_link": validated_data.list_link,
                            "purchase_info_link": validated_data.purchase_info_link,
                            "updated_at": datetime.utcnow()
                        }
                        
                        # Check exist by name and date
                        existing = conn.execute(
                            text("SELECT id FROM auction_events WHERE name = :name AND auction_date = :auction_date"), 
                            {"name": auction_data["name"], "auction_date": auction_data["auction_date"]}
                        ).fetchone()
                        
                        if existing:
                            updates = ", ".join([f"{k} = :{k}" for k in auction_data.keys() if k not in ["name", "auction_date"]])
                            query = text(f"UPDATE auction_events SET {updates} WHERE id = :id")
                            update_params = {**auction_data, "id": existing[0]}
                            conn.execute(query, update_params)
                        else:
                            auction_data["created_at"] = datetime.utcnow()
                            fields = ", ".join(auction_data.keys())
                            placeholders = ", ".join([f":{k}" for k in auction_data.keys()])
                            query = text(f"INSERT INTO auction_events ({fields}) VALUES ({placeholders})")
                            conn.execute(query, auction_data)

                        success_count += 1
                        
                    except Exception as e:
                        logger.error(f"Row {index + 2} failed: {str(e)}")
                        errors.append(f"Row {index + 2}: {str(e)}")

            if errors:
                status_msg = f"Completed with errors. Success: {success_count}/{total_rows}. Errors: {len(errors)}"
                redis.set(f"import_errors:{job_id}", str(errors), ex=3600)
            else:
                status_msg = f"Success: {success_count} auctions processed"
            
            redis.set(f"import_auctions_status:{job_id}", status_msg, ex=3600)
            
        except Exception as e:
            logger.error(f"Auctions Import Job Failed: {e}")
            redis.set(f"import_auctions_status:{job_id}", f"Critical Error: {str(e)}", ex=3600)

import_service = ImportService()
