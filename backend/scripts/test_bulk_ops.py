from app.db.session import SessionLocal
from app.api.deps import get_db
from app.models.property import Property, PropertyStatus
from app.models.user import User
from app.models.company import Company
from app.models.note import Note
from app.models.expense import Expense
from app.models.location import Location
from app.models.county import County
from app.schemas.bulk_ops import BulkStatusUpdate, BulkActionType
from app.api.api_v1.endpoints.properties import bulk_update_properties

# Create dummy properties
db = SessionLocal()
try:
    p1 = Property(title="Bulk Test 1", status=PropertyStatus.DRAFT, parcel_id="BULK001")
    p2 = Property(title="Bulk Test 2", status=PropertyStatus.DRAFT, parcel_id="BULK002")
    db.add(p1)
    db.add(p2)
    db.commit()
    db.refresh(p1)
    db.refresh(p2)
    
    ids = [p1.id, p2.id]
    print(f"Created properties: {ids}")
    
    # Test Update Status
    update_data = BulkStatusUpdate(ids=ids, action=BulkActionType.update_status, status=PropertyStatus.ACTIVE)
    result = bulk_update_properties(db=db, bulk_in=update_data)
    print(f"Update Result: {result}")
    
    # Verify
    db.refresh(p1)
    db.refresh(p2)
    print(f"P1 Status: {p1.status}")
    print(f"P2 Status: {p2.status}")
    
    # Test Delete
    delete_data = BulkStatusUpdate(ids=ids, action=BulkActionType.delete)
    result = bulk_update_properties(db=db, bulk_in=delete_data)
    print(f"Delete Result: {result}")
    
    # Verify
    p1_check = db.query(Property).get(p1.id)
    print(f"P1 Exists: {p1_check is not None}")
    
finally:
    db.close()
