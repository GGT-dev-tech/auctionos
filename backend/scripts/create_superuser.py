import sys
import os
from sqlalchemy.orm import Session

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.session import SessionLocal
import app.db.base # Import all models
from app.models.user import User
from app.models.user_role import UserRole
from app.core.security import get_password_hash

def create_superuser():
    db = SessionLocal()
    try:
        email = "admin@example.com"
        password = "admin"
        
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User {email} already exists. Resetting password...")
            user.hashed_password = get_password_hash(password)
            user.is_superuser = True
            user.is_active = True
            user.role = UserRole.ADMIN
            db.commit()
            print("Password reset and permissions updated.")
        else:
            print(f"Creating user {email}...")
            user = User(
                email=email,
                hashed_password=get_password_hash(password),
                is_active=True,
                is_superuser=True,
                role=UserRole.ADMIN
            )
            db.add(user)
            db.commit()
            print("User created successfully.")
        
        # Verify
        db.refresh(user)
        from app.core.security import verify_password
        if verify_password(password, user.hashed_password):
            print("Password verification successful.")
        else:
            print("Password verification FAILED.")
            
    except Exception as e:
        print(f"Error creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_superuser()
