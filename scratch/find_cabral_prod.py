import os
from sqlalchemy import create_engine, text

# Production Connection
DATABASE_URL = "postgresql://postgres:JbEkstWQnhmNJQLMoXCefBntLFHsfSOx@crossover.proxy.rlwy.net:43302/railway"

def find_cabral():
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    
    try:
        # Search for Cabral
        query = text("""
            SELECT id, email, full_name, role 
            FROM users 
            WHERE email ILIKE 'cabral%' OR full_name ILIKE 'cabral%'
        """)
        results = conn.execute(query).fetchall()
        
        if not results:
            print("No user found starting with 'cabral'")
            return
            
        for user in results:
            uid, email, name, role = user
            print(f"Found User: {name} ({email}) | ID: {uid} | Role: {role}")
            
            # Fetch Lists
            list_query = text("SELECT id, name, tags, is_favorite_list FROM client_lists WHERE user_id = :uid")
            user_lists = conn.execute(list_query, {"uid": uid}).fetchall()
            
            for lst in user_lists:
                lid, lname, ltags, is_fav = lst
                prop_count = conn.execute(text("SELECT count(*) FROM client_list_property WHERE list_id = :lid"), {"lid": lid}).scalar()
                print(f"  - Folder: {lname} (ID: {lid}) | Properties: {prop_count} | Tags: {ltags} | Favorite: {is_fav}")
                
                # Fetch first 5 properties for preview
                if prop_count > 0:
                    prop_query = text("""
                        SELECT p.parcel_id, p.address, p.county 
                        FROM client_list_property clp
                        JOIN property_details p ON p.id = clp.property_id
                        WHERE clp.list_id = :lid
                        LIMIT 5
                    """)
                    props = conn.execute(prop_query, {"lid": lid}).fetchall()
                    for p in props:
                        print(f"    * {p[0]} - {p[1]} ({p[2]})")
            
            print("-" * 50)
            
    except Exception as e:
        print(f"Error connecting to Production DB: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    find_cabral()
