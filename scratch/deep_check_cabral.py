import os
from sqlalchemy import create_engine, text

# Production Connection
DATABASE_URL = "postgresql://postgres:JbEkstWQnhmNJQLMoXCefBntLFHsfSOx@crossover.proxy.rlwy.net:43302/railway"

def deep_check_cabral():
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    
    try:
        # Search for Cabral IDs
        uids = [8, 11]
        
        for uid in uids:
            print(f"Deep check for User ID: {uid}")
            
            # Check Notes
            note_query = text("""
                SELECT p.parcel_id, p.address, n.note_text, n.created_at 
                FROM client_notes n
                JOIN property_details p ON p.id = n.property_id
                WHERE n.user_id = :uid
            """)
            notes = conn.execute(note_query, {"uid": uid}).fetchall()
            print(f"  - Notes found: {len(notes)}")
            for n in notes:
                print(f"    * Prop: {n[0]} | Note: {n[2][:50]}... | Date: {n[3]}")
                
            # Check Attachments
            attach_query = text("""
                SELECT p.parcel_id, a.filename, a.file_path, a.created_at 
                FROM client_attachments a
                JOIN property_details p ON p.id = a.property_id
                WHERE a.user_id = :uid
            """)
            attachments = conn.execute(attach_query, {"uid": uid}).fetchall()
            print(f"  - Attachments found: {len(attachments)}")
            for a in attachments:
                print(f"    * Prop: {a[0]} | File: {a[1]} | Path: {a[2]}")
                
            # Check if properties exist in ANY list including those not listed?
            # Actually, let's check the client_list_property table directly for these users' lists
            list_ids_query = text("SELECT id FROM client_lists WHERE user_id = :uid")
            lids = [r[0] for r in conn.execute(list_ids_query, {"uid": uid}).fetchall()]
            if lids:
                total_props = conn.execute(text("SELECT count(*) FROM client_list_property WHERE list_id IN :lids"), {"lids": tuple(lids)}).scalar()
                print(f"  - Total properties across all lists: {total_props}")
            
            print("-" * 50)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    deep_check_cabral()
