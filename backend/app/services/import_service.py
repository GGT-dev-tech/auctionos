import pandas as pd
import io
import uuid
import logging
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.csv_import import PropertyCSVRow, AuctionCSVRow
from app.db.gis import engine
from datetime import datetime
from redis import Redis
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

redis = Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))

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
                        
                        # 1. Upsert Property
                        prop_data = {
                            "parcel_id": validated_data.parcel_id,
                            "address": validated_data.address,
                            "owner_address": validated_data.owner_address,
                            "county": validated_data.county,
                            "state": validated_data.state_code,
                            "description": validated_data.description,
                            "amount_due": validated_data.amount_due,
                            # "next_auction_date": ... (parse from string if needed)
                            "occupancy": validated_data.vacancy,
                            "tax_sale_year": int(validated_data.tax_sale_year) if validated_data.tax_sale_year else None,
                            "cs_number": validated_data.cs_number,
                            "parcel_code": validated_data.parcel_code,
                            "map_link": validated_data.map_link,
                            "property_type": validated_data.type,
                            "status": "active"
                        }

                        # Handle Coordinates
                        if validated_data.coordinates:
                            try:
                                clean_coords = validated_data.coordinates.replace(',', ' ').strip()
                                parts = clean_coords.split()
                                if len(parts) >= 2:
                                    prop_data["latitude"] = float(parts[0])
                                    prop_data["longitude"] = float(parts[1])
                            except:
                                pass

                        # SQL Upsert Property
                        fields = ", ".join(prop_data.keys())
                        placeholders = ", ".join([f":{k}" for k in prop_data.keys()])
                        updates = ", ".join([f"{k} = EXCLUDED.{k}" for k in prop_data.keys() if k != "parcel_id"])
                        
                        query_p = text(f"""
                            INSERT INTO properties ({fields}) VALUES ({placeholders})
                            ON CONFLICT (parcel_id) DO UPDATE SET {updates}
                            RETURNING id
                        """)
                        res = conn.execute(query_p, prop_data)
                        property_id = res.scalar()

                        # 2. Upsert Property Details
                        details_data = {
                            "property_id": property_id,
                            "account_number": validated_data.account,
                            "lot_acres": validated_data.acres,
                            "estimated_arv": validated_data.estimated_arv,
                            "estimated_rent": validated_data.estimated_rent,
                            "improvement_value": validated_data.improvements,
                            "land_value": validated_data.land_value,
                            "total_market_value": validated_data.total_value,
                            "property_category": validated_data.property_category,
                            "purchase_option_type": validated_data.purchase_option_type,
                            "updated_at": datetime.utcnow()
                        }
                        
                        # Check exist
                        existing_pd = conn.execute(text("SELECT id FROM property_details WHERE property_id = :pid"), {"pid": property_id}).fetchone()
                        
                        fields_pd = ", ".join(details_data.keys())
                        placeholders_pd = ", ".join([f":{k}" for k in details_data.keys()])
                        
                        if existing_pd:
                            updates_pd = ", ".join([f"{k} = :{k}" for k in details_data.keys() if k != "property_id"])
                            query_pd = text(f"UPDATE property_details SET {updates_pd} WHERE property_id = :property_id")
                            conn.execute(query_pd, details_data)
                        else:
                            query_pd = text(f"INSERT INTO property_details ({fields_pd}) VALUES ({placeholders_pd})")
                            conn.execute(query_pd, details_data)

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
            
        except Exception as e:
            logger.error(f"Import Job Failed: {e}")
            redis.set(f"import_status:{job_id}", f"Critical Error: {str(e)}", ex=3600)

    @staticmethod
    async def process_auctions_csv(file_content: bytes, job_id: str):
         # Similar implementation for Auctions using AuctionCSVRow
         pass

import_service = ImportService()
