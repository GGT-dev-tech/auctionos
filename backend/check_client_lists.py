import asyncio
from app.db.session import SessionLocal
from app.models.client_data import ClientList
from app.models.user import User

def check_db():
    db = SessionLocal()
    lists = db.query(ClientList).all()
    print("--- Client Lists ---")
    for l in lists:
        print(f"ID={l.id}, Name='{l.name}', UserID={l.user_id}, Fav={l.is_favorite_list}, Broadcast={l.is_broadcasted}")
        
    users = db.query(User).all()
    print("\n--- Users ---")
    for u in users:
        print(f"ID={u.id}, Email='{u.email}', Role='{u.role}'")
        
    db.close()

if __name__ == "__main__":
    check_db()
