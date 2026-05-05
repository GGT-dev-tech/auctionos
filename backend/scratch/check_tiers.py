from app.db.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    users = db.execute(text("SELECT email, role, subscription_tier FROM users WHERE email IN ('gustavot.gomes7@gmail.com', 'john@manager.com', 'john@agent.com')")).fetchall()
    for u in users:
        print(f"User: {u.email} | Role: {u.role} | Tier: {u.subscription_tier}")
finally:
    db.close()
