import sys
import os

sys.path.append(os.getcwd())
from app.db.session import SessionLocal
from app.models.user import User

def upgrade_all_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            print(f"Upgrading {user.email}...")
            user.is_superuser = True
            user.role = "admin"
        
        db.commit()
        print(f"Successfully upgraded {len(users)} users to Admin.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    upgrade_all_users()
