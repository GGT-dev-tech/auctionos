from app.db.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()
query = text("""
    SELECT al.*, u.email, u.full_name, u.role
    FROM activity_logs al
    JOIN users u ON u.id = al.user_id
    WHERE al.company_id = :cid OR u.id = :uid
    ORDER BY al.created_at DESC OFFSET :skip LIMIT :limit
""")
params = {"cid": None, "uid": 4, "skip": 0, "limit": 100}
rows = db.execute(query, params).fetchall()
result = []
for row in rows:
    d = dict(row._mapping)
    # Ensure created_at is stringified
    if d.get("created_at"):
        d["created_at"] = str(d["created_at"])
    result.append(d)
print(result)
