import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.app.services.import_service import import_service

async def run_import():
    with open('auctionsCO.csv', 'rb') as f:
        content = f.read()
    await import_service.process_auctions_csv(content, 'test-job-local')
    print("Import process unblocked successfully.")

if __name__ == '__main__':
    asyncio.run(run_import())
