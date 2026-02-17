import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import text

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.session import SessionLocal
import app.db.base
from app.models.property import Property

def verify_data():
    db = SessionLocal()
    try:
        count = db.query(Property).count()
        print(f"Total Properties: {count}")
        
        if count > 0:
            prop = db.query(Property).first()
            print("Sample Property:")
            print(f"Parcel ID: {prop.parcel_number}")
            print(f"Owner: {prop.owner_name}")
            print(f"Amount Due: {prop.amount_due}")
            print(f"Tax Sale Year: {prop.tax_sale_year}")
            print(f"Coordinates: {prop.coordinates}")
            
    except Exception as e:
        print(f"Error during verification: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_data()
