from app.db.session import SessionLocal
from app.models.property import PropertyDetails
import json

db = SessionLocal()
prop = db.query(PropertyDetails).filter(PropertyDetails.property_id == "78b700dc-fd2e-4748-9a76-3afdab5cb77e").first()

if prop:
    print(json.dumps({
        "property_id": prop.property_id,
        "parcel_id": prop.parcel_id,
        "address": prop.address,
        "county": prop.county,
        "state": prop.state,
        "owner_address": prop.owner_address
    }, indent=2))
else:
    print("Property not found")
db.close()
