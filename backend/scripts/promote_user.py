
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.user import User

def promote_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users.")
        
        for user in users:
            print(f"User: {user.email}, Role: {user.role}, Superuser: {user.is_superuser}")
            
            # Promote everyone for dev convenience as per user request
            user.role = "admin"
            user.is_superuser = True
            db.add(user)
            print(f" -> Promoted {user.email} to Admin/Superuser.")
            
        db.commit()
        print("✅ All users promoted.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    promote_users()
