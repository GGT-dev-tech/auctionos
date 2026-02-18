import sys
import os

# Add backend directory to sys.path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.db.base import Base
from app.models.user import User
from app.models.user_role import UserRole

def create_admin_user():
    db = SessionLocal()
    try:
        email = "admin@example.com"
        password = "password123"  # Changing to a simple known password
        
        user = db.query(User).filter(User.email == email).first()
        hashed_password = get_password_hash(password)
        
        if user:
            print(f"User {email} exists. Updating password and role...")
            user.hashed_password = hashed_password
            user.role = UserRole.ADMIN
            user.is_active = True
            user.is_superuser = True
            db.commit()
            print(f"Updated user {email} with new password: {password}")
        else:
            print(f"Creating new user {email}...")
            db_user = User(
                email=email,
                hashed_password=hashed_password,
                is_active=True,
                is_superuser=True,
                role=UserRole.ADMIN
            )
            db.add(db_user)
            db.commit()
            print(f"Created admin user: {email} / {password}")
            
    except Exception as e:
        print(f"Error creating/updating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
