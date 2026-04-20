
import os
import sys

# Add current directory to path to import app logic
sys.path.append(os.getcwd())

try:
    from app.core.config import settings
    from sqlalchemy import create_engine, text
except ImportError:
    print("Could not import app settings. Please run from the backend directory.")
    sys.exit(1)

def migrate():
    db_url = settings.DATABASE_URL
    print(f"Connecting to: {db_url}")
    engine = create_engine(db_url)
    try:
        with engine.connect() as conn:
            if "postgresql" in db_url:
                conn.execute(text("ALTER TABLE client_lists ADD COLUMN IF NOT EXISTS notes TEXT;"))
            else:
                # SQLite doesn't support IF NOT EXISTS for columns, but we can check if it exists
                try:
                    conn.execute(text("ALTER TABLE client_lists ADD COLUMN notes TEXT;"))
                except Exception as e:
                    if "duplicate column name" in str(e).lower():
                        print("Column 'notes' already exists.")
                    else:
                        raise e
            conn.commit()
            print("Migration successful: notes column added to client_lists.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
