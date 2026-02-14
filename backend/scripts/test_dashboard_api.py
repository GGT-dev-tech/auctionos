from app.db.session import SessionLocal
from app.api.deps import get_db
from app.models.user import User
from app.core.security import get_password_hash
# Import base to register all models
import app.db.base
from app.api.api_v1.endpoints.dashboard import get_dashboard_init
from fastapi import Depends

def test_dashboard_api():
    db = SessionLocal()
    try:
        # 1. Get an Admin User
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
            print("Admin user not found. Run ensure_admin.py first.")
            return

        print(f"Testing as User: {admin_user.email} ({admin_user.role})")

        # 2. Call the function directly (simulating dependency injection)
        result = get_dashboard_init(db=db, current_user=admin_user)
        
        # 3. Print Results
        print("\n--- Dashboard Init Data ---")
        print(f"Role: {result['role']}")
        print(f"Linked Companies: {len(result['linked_companies'])}")
        print(f"County Stats Count: {len(result['county_stats'])}")
        if result['county_stats']:
            print(f"Sample County Stat: {result['county_stats'][0]}")
        
        print("\n--- Quick Stats ---")
        print(result['quick_stats'])
        
        print("\n--- Recent Activity ---")
        print(f"Count: {len(result['recent_activity'])}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_dashboard_api()
