import asyncio
import os
import sys

# Define correct backend path for docker
sys.path.append('/app')

from app.services.import_service import import_service
from app.db.session import SessionLocal

async def run_import():
    with open('/app/auctionsCO.csv', 'rb') as f:
        content = f.read()
    await import_service.process_auctions_csv(content, 'test-job-local')
    print("Import process completed.")

if __name__ == '__main__':
    asyncio.run(run_import())
