import sys
import os
from sqlalchemy import text
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv(os.path.join(os.getcwd(), 'backend/.env'))

# Add the backend directory to the path so we can import app modules
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.session import SessionLocal

def update_tier(email, tier):
    db = SessionLocal()
    try:
        result = db.execute(
            text("UPDATE users SET subscription_tier = :tier WHERE email = :email"),
            {"tier": tier, "email": email}
        )
        db.commit()
        if result.rowcount > 0:
            print(f"User {email} updated to {tier} tier (Raw SQL)")
        else:
            print(f"User {email} not found")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_tier("cabralscbr@gmail.com", "enterprise")
