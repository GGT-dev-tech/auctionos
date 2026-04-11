import os
from sqlalchemy import create_engine, text

# Production Connection
DATABASE_URL = "postgresql://postgres:JbEkstWQnhmNJQLMoXCefBntLFHsfSOx@crossover.proxy.rlwy.net:43302/railway"

def find_lost_data():
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    
    try:
        email = "cabralscbr@gmail.com"
        print(f"Searching for data associated with {email}...")
        
        # 1. Confirm User
        user = conn.execute(text("SELECT id, full_name FROM users WHERE email = :email"), {"email": email}).fetchone()
        if not user:
            print("User not found.")
            return
        uid = user[0]
        print(f"User ID: {uid}, Name: {user[1]}")
        
        # 2. Check all tables
        print("\nChecking all relevant tables for this user...")
        tables = ["client_lists", "client_notes", "client_attachments", "client_list_property"]
        for table in tables:
            if table == "client_list_property":
                count = conn.execute(text("""
                    SELECT count(*) FROM client_list_property clp
                    JOIN client_lists cl ON cl.id = clp.list_id
                    WHERE cl.user_id = :uid
                """), {"uid": uid}).scalar()
            else:
                count = conn.execute(text(f"SELECT count(*) FROM {table} WHERE user_id = :uid"), {"uid": uid}).scalar()
            print(f"Table {table}: {count} records")

        # 3. Check for properties owned by 'Cabral' in the database
        print("\nSearching for properties in DB where owner name contains 'Cabral'...")
        # Note: we need to check which column stores the owner name. Based on CSV it might be 'owner_address' or a specific name field.
        # Let's check columns for property_details first.
        cols_query = text("SELECT column_name FROM information_schema.columns WHERE table_name = 'property_details'")
        cols = [r[0] for r in conn.execute(cols_query).fetchall()]
        print(f"Property Columns: {cols}")
        
        # Try a fuzzy search on owner name
        # Some schemas use owner_address for both name and address
        cabral_props = conn.execute(text("""
            SELECT id, parcel_id, address, owner_address 
            FROM property_details 
            WHERE owner_address ILIKE '%Cabral%'
        """)).fetchall()
        print(f"Found {len(cabral_props)} properties currently in DB with 'Cabral' in owner name/address.")
        for p in cabral_props[:5]:
            print(f"  - {p[1]} | {p[2]} | Owner: {p[3]}")

        # 4. Check if there's any table with 'backup' in the name
        print("\nChecking for backup tables...")
        backups = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_name ILIKE '%backup%' OR table_name ILIKE '%tmp%'")).fetchall()
        for b in backups:
            print(f"  - Backup table found: {b[0]}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    find_lost_data()
