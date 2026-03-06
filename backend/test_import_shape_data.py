import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.import_service import import_service
from app.db.session import engine
from sqlalchemy import text

async def main():
    csv_file_path = "data/appraisals_miamidade.csv"
    job_id = "test_job_123"
    
    print(f"Starting import of {csv_file_path}")
    
    try:
        # First ensure there are some matching properties to tie this data to
        with engine.begin() as conn:
            # Check if any properties exist at all
            count = conn.execute(text("SELECT COUNT(*) FROM property_details")).scalar()
            print(f"Total properties in DB: {count}")
            
            # If nothing, create a dummy property for the first row to test ingestion
            if count == 0:
                print("No properties found. Creating dummy property '34-2104-005-1720' to test ingestion...")
                conn.execute(text("""
                    INSERT INTO property_details (property_id, parcel_id, address, availability_status)
                    VALUES ('dummy-uuid-1', '34-2104-005-1720', 'Test Address', 'available')
                    ON CONFLICT (parcel_id) DO NOTHING
                """))
                
                print("Creating dummy property '30-3121-015-0105' to test ingestion...")
                conn.execute(text("""
                    INSERT INTO property_details (property_id, parcel_id, address, availability_status)
                    VALUES ('dummy-uuid-2', '30-3121-015-0105', 'Test Address 2', 'available')
                    ON CONFLICT (parcel_id) DO NOTHING
                """))

        print("Executing shape data CSV process...")
        # Since process_shape_data_csv_file is async but import_service handles sync/async in different ways 
        # based on our changes, we call it directly here. Our implementation is async.
        await import_service.process_shape_data_csv_file(csv_file_path, job_id)
        
        # Verify ingestion
        with engine.begin() as conn:
            shape_count = conn.execute(text("SELECT COUNT(*) FROM property_shape_data")).scalar()
            print(f"Total shape data rows inserted: {shape_count}")
            
            sample = conn.execute(text("SELECT property_id, category, subcategory, value FROM property_shape_data LIMIT 5")).fetchall()
            print("Sample data:")
            for s in sample:
                print(s)
                
    except Exception as e:
        print(f"Error during import test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
