import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.db.session import SessionLocal
from app.models.property import PropertyDetails
from app.models.user import User
from app.models.client_data import ClientList

def check_db():
    db = SessionLocal()
    
    users = db.query(User).all()
    print("\n--- Users ---")
    for u in users:
        print(f"ID={u.id}, Email='{u.email}', Role='{u.role}'")

    lists = db.query(ClientList).all()
    print("\n--- Client Lists ---")
    for l in lists:
        print(f"ID={l.id}, Name='{l.name}', UserID={l.user_id}, Fav={l.is_favorite_list}, Broadcast={l.is_broadcasted}")
        
    db.close()

if __name__ == "__main__":
    check_db()
