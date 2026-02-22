import sys
import os
import uuid
import asyncio
import logging

# Add app to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.import_service import import_service
from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_import(file_path: str):
    if not os.path.exists(file_path):
        # Try relative to app root if not absolute
        root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        alt_path = os.path.join(root_path, file_path)
        if os.path.exists(alt_path):
            file_path = alt_path
        else:
            print(f"Error: File not found at {file_path}")
            sys.exit(1)

    job_id = f"cli-{str(uuid.uuid4())[:8]}"
    print(f"Starting direct import for {file_path}")
    print(f"Job ID: {job_id}")
    
    try:
        await import_service.process_properties_csv_file(file_path, job_id)
        print("\nImport process completed.")
        print("Check the UI Property List to see the results.")
    except Exception as e:
        print(f"Failed to run import: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/direct_property_import.py <path_to_csv>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    asyncio.run(run_import(file_path))
