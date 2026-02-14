import csv
import os
import sys
import json
import subprocess
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

CSV_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'netronline_data.csv')
ALEMBIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'alembic')
VERSIONS_DIR = os.path.join(ALEMBIC_DIR, 'versions')

def get_latest_revision():
    try:
        # Get head revision
        result = subprocess.check_output([sys.executable, '-m', 'alembic', 'heads'], cwd=os.path.dirname(ALEMBIC_DIR))
        head = result.decode('utf-8').split(' ')[0].strip()
        return head
    except Exception as e:
        print(f"Error getting head revision: {e}")
        return None

def generate_migration():
    if not os.path.exists(CSV_FILE_PATH):
        print(f"Error: CSV file not found at {CSV_FILE_PATH}")
        return

    print(f"Reading CSV from {CSV_FILE_PATH}...")
    
    # Aggregate Data
    counties_map = {}
    with open(CSV_FILE_PATH, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            state = row['State'].strip().upper()
            county_name = row['County'].strip()
            key = (state, county_name)
            
            office = {
                "name": row['Name'].strip() if row['Name'] else "Unknown Office",
                "phone": row['Phone'].strip() if row['Phone'] else None,
                "online_url": row['Online_URL'].strip() if row['Online_URL'] else None
            }
            
            if key not in counties_map:
                counties_map[key] = []
            counties_map[key].append(office)

    print(f"Aggregated {len(counties_map)} unique counties.")

    # Prepare Data List
    data_list = []
    for (state, county_name), offices in counties_map.items():
        data_list.append({
            "state_code": state,
            "county_name": county_name,
            "offices": offices  # Passed as list/dict
        })

    # Generate revision file via Alembic command
    print("Generating new revision via alembic...")
    subprocess.run([sys.executable, '-m', 'alembic', 'revision', '-m', 'seed_counties_data'], cwd=os.path.dirname(ALEMBIC_DIR))
    
    # Find the newly created file (latest timestamp)
    files = [os.path.join(VERSIONS_DIR, f) for f in os.listdir(VERSIONS_DIR) if f.endswith('.py')]
    if not files:
        print("Error: No migration file found.")
        return
        
    latest_file = max(files, key=os.path.getctime)
    print(f"Injecting data into {latest_file}...")

    # Read file content
    with open(latest_file, 'r') as f:
        content = f.read()

    # Create the data string (formatted nicely)
    # Use repr() to ensure valid Python syntax (None instead of null, True instead of true)
    data_str = repr(data_list)
    # Optional: prettify if needed, but repr is sufficient for execution. 
    # For a 4MB file, single line repr might be ugly but functional.
    # To make it readable (if we care), we could use pprint.pformat, but it's large.
    # Let's stick to simple repr but maybe replace the generic repr with pretty print if available?
    import pprint
    data_str = pprint.pformat(data_list, indent=4)
    
    # Construct new content
    injection = f"""
    # Data to seed
    data = {data_str}
    
    # Insert data
    counties_table = table('counties',
        column('state_code', String),
        column('county_name', String),
        column('offices', JSON)
    )
    
    op.bulk_insert(counties_table, data)
"""
    
    # Replace pass in upgrade()
    if "def upgrade() -> None:" in content:
        content = content.replace("def upgrade() -> None:\n    pass", f"def upgrade() -> None:\n    {injection}")
    elif "def upgrade():" in content:
        content = content.replace("def upgrade():\n    pass", f"def upgrade():\n    {injection}")
        
    # Add imports
    imports = "from alembic import op\nimport sqlalchemy as sa\nfrom sqlalchemy.sql import table, column\nfrom sqlalchemy import String, Integer, JSON\nimport json\n"
    content = imports + content.replace("from alembic import op\nimport sqlalchemy as sa\n", "")

    # Write back
    with open(latest_file, 'w') as f:
        f.write(content)
        
    print(f"Successfully populated {latest_file} with {len(data_list)} records.")

if __name__ == "__main__":
    generate_migration()
