import sys
import os
import logging
from sqlalchemy import text

# Add app to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Environment Handling (MUST happen before app imports)
if "DATABASE_URL" in os.environ:
    print(f"Using DATABASE_URL from environment.")
elif len(sys.argv) > 1 and sys.argv[1].startswith("postgresql"):
    os.environ["DATABASE_URL"] = sys.argv[1]
    print(f"Using DATABASE_URL from command line argument.")

from app.db.session import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_database():
    print(f"Target DB: {os.environ.get('DATABASE_URL', 'Default from config')}")
    confirm = input("⚠️ WARNING: This will DELETE ALL properties and auctions. Type 'RESET' to confirm: ")
    
    if confirm != "RESET":
        print("Reset cancelled.")
        return

    try:
        with engine.begin() as conn:
            print("Truncating tables...")
            # Disable FK checks temporarily if needed, but here we just truncate in order
            conn.execute(text("TRUNCATE TABLE property_auction_history RESTART IDENTITY CASCADE;"))
            conn.execute(text("TRUNCATE TABLE property_details RESTART IDENTITY CASCADE;"))
            conn.execute(text("TRUNCATE TABLE auction_events RESTART IDENTITY CASCADE;"))
            print("Done.")
            
        print("\n✅ Production database reset successfully.")
        print("Note: Remember to flush your Redis instance in the Railway dashboard to clear active task statuses.")
    except Exception as e:
        print(f"❌ Failed to reset database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    reset_database()
