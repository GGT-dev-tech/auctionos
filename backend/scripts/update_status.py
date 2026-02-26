import os
import psycopg2

database_url = os.environ.get("DATABASE_URL")
if not database_url:
    print("DATABASE_URL environment variable is missing!")
    exit(1)

print("Connecting to database...")
try:
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    # Check current distribution
    cur.execute("SELECT availability_status, count(*) FROM property_details GROUP BY availability_status;")
    results = cur.fetchall()
    print(f"Current distribution: {results}")

    print("Updating availability_status to 'available' for all properties...")
    cur.execute("UPDATE property_details SET availability_status = 'available';")
    
    print(f"Rows updated: {cur.rowcount}")
    
    conn.commit()
    
    # Check new distribution
    cur.execute("SELECT availability_status, count(*) FROM property_details GROUP BY availability_status;")
    print(f"New distribution: {cur.fetchall()}")

    cur.close()
    conn.close()
    print("Successfully updated database.")
except Exception as e:
    print(f"Error: {e}")
