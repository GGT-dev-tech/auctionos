import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.county_contact import CountyContact
from app.db.session import SessionLocal

db = SessionLocal()

state_q = "fl"
county_q = "lake"

print(f"Checking '{state_q}', '{county_q}'...")
contacts = db.query(CountyContact).filter(CountyContact.state == state_q, CountyContact.county == county_q).all()
print(f"Contacts: {len(contacts)}")
for c in contacts:
    print(f" - {c.name}: {c.url}")

print("\nSample records:")
sample = db.query(CountyContact).limit(10).all()
for c in sample:
    print(f"State: '{c.state}', County: '{c.county}', Name: '{c.name}'")
