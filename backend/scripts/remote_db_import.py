import sys
import os
import uuid
import asyncio
import logging

# 1. Environment Handling (MUST happen before app imports)
# This allows overriding the DATABASE_URL even if it's already in .env or settings
if "DATABASE_URL" in os.environ:
    print(f"Using DATABASE_URL from environment.")
elif len(sys.argv) > 2 and sys.argv[2].startswith("postgresql"):
    os.environ["DATABASE_URL"] = sys.argv[2]
    print(f"Using DATABASE_URL from command line argument.")

# Add app to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.import_service import import_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_import(file_path: str):
    if not os.path.exists(file_path):
        # Try relative to app root
        root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        alt_path = os.path.join(root_path, file_path)
        if os.path.exists(alt_path):
            file_path = alt_path
        else:
            print(f"Error: File not found at {file_path}")
            sys.exit(1)

    job_id = f"remote-{str(uuid.uuid4())[:8]}"
    print(f"Starting REMOTE import for {file_path}")
    print(f"Job ID: {job_id}")
    print(f"Target DB: {os.environ.get('DATABASE_URL', 'Default from config')}")
    
    try:
        await import_service.process_properties_csv_file(file_path, job_id)
        print("\nRemote import process completed successfully.")
        print("Check the Production UI to see the results.")
    except Exception as e:
        print(f"Failed to run remote import: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Option A: DATABASE_URL='your_url' python scripts/remote_db_import.py data/your_file.csv")
        print("  Option B: python scripts/remote_db_import.py data/your_file.csv 'your_url'")
        sys.exit(1)
    
    file_path = sys.argv[1]
    asyncio.run(run_import(file_path))
