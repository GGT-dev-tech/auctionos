import os
from sqlalchemy import create_engine, text

# Production Connection
DATABASE_URL = "postgresql://postgres:JbEkstWQnhmNJQLMoXCefBntLFHsfSOx@crossover.proxy.rlwy.net:43302/railway"

def restore_cabral_lists():
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    trans = conn.begin()
    
    try:
        user_id = 8
        favorites_list_id = 47
        property_ids = [107548, 107549, 12748, 66741]
        
        print(f"Restoring {len(property_ids)} properties to user {user_id}'s Favorites list ({favorites_list_id})...")
        
        for pid in property_ids:
            # Using ON CONFLICT DO NOTHING to avoid duplicates if some exist
            query = text("""
                INSERT INTO client_list_property (list_id, property_id) 
                VALUES (:lid, :pid)
                ON CONFLICT (list_id, property_id) DO NOTHING
            """)
            conn.execute(query, {"lid": favorites_list_id, "pid": pid})
            print(f"  - Linked Property ID: {pid}")
            
        trans.commit()
        print("\nRestoration successful.")
        
        # Verify
        count = conn.execute(text("SELECT count(*) FROM client_list_property WHERE list_id = :lid"), {"lid": favorites_list_id}).scalar()
        print(f"Total properties in Ricardo's Favorites: {count}")
        
    except Exception as e:
        trans.rollback()
        print(f"Error during restoration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    restore_cabral_lists()
