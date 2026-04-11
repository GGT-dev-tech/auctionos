import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Mocking app context or using DB directly
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/auctionos")

def get_client_stats():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Get users
        users = db.execute(text("SELECT id, email, full_name, role FROM users")).fetchall()
        print(f"Found {len(users)} users:\n")
        
        for u in users:
            print(f"User ID: {u[0]} | Email: {u[1]} | Name: {u[2]} | Role: {u[3]}")
            
            # Get lists for this user
            lists = db.execute(text("SELECT id, name, tags FROM client_lists WHERE user_id = :uid"), {"uid": u[0]}).fetchall()
            for l in lists:
                count = db.execute(text("SELECT count(*) FROM client_list_property WHERE list_id = :lid"), {"lid": l[0]}).scalar()
                print(f"  - List: {l[1]} (ID: {l[0]}) | Properties: {count} | Tags: {l[2]}")
                
            # Get notes
            notes_count = db.execute(text("SELECT count(*) FROM client_notes WHERE user_id = :uid"), {"uid": u[0]}).scalar()
            if notes_count > 0:
                print(f"  - Total Notes: {notes_count}")
                
            print("-" * 40)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    get_client_stats()
