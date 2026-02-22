import asyncio
import sys
import logging
from app.services.import_service import import_service
from app.db.session import SessionLocal
import traceback

logging.basicConfig(level=logging.DEBUG)

async def main():
    try:
        with open('/app/detail_AR_147341.csv', 'rb') as f:
            content = f.read()
            
        print("Running import_service...")
        # Simulate job ID
        job_id = "test_job_123"
        await import_service.process_properties_csv(content, job_id)
        
        # Check redis for errors
        from app.services.import_service import redis
        errors = redis.get(f"import_errors:{job_id}")
        status = redis.get(f"import_status:{job_id}")
        print(f"Status: {status}")
        if errors:
            print(f"Errors: {errors.decode('utf-8')}")
            
    except Exception as e:
        print(f"Crash: {e}")
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(main())
