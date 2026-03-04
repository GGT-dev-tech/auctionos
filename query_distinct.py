import os
import sys

# Need to add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import select, text
from app.db.session import SessionLocal

def run():
    db = SessionLocal()
    try:
        res1 = db.execute(text("SELECT DISTINCT property_type FROM property_details")).scalars().all()
        res2 = db.execute(text("SELECT DISTINCT purchase_option_type FROM property_details")).scalars().all()
        print("Property Categories:", res1)
        print("Purchase Option Types:", res2)
    finally:
        db.close()

if __name__ == "__main__":
    run()
