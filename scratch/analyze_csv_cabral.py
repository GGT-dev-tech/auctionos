import pandas as pd
import os

CSV_FILE = "backend/data/postgres_property_details.csv"

def analyze_csv_cabral():
    if not os.path.exists(CSV_FILE):
        print("CSV not found.")
        return
        
    print(f"Loading {CSV_FILE}...")
    # Read CSV. We don't know the columns yet, but grep showed owner is around the 11th column.
    # Let's try to infer columns or read without headers if needed.
    # From grep: 2799fbf9...,31-08-27...,167 Road...,Dekalb,AL,0.69,Land & Structures,388.26,30900.0,2026,Cabral Alberto,available,Lien,False
    
    # Let's try to find potential headers in the CSV first
    with open(CSV_FILE, 'r') as f:
        first_line = f.readline()
        print(f"Header/First Line: {first_line}")
        
    # Standard columns based on the project structure:
    # id, parcel_id, address, county, state, lot_acres, property_type, amount_due, assessed_value, tax_year, owner_address, availability_status, property_category, is_processed
    cols = ['id', 'parcel_id', 'address', 'county', 'state', 'lot_acres', 'property_type', 'amount_due', 'assessed_value', 'tax_year', 'owner_address', 'availability_status', 'property_category', 'is_processed']
    
    try:
        df = pd.read_csv(CSV_FILE, names=cols, header=None)
        
        # Filter by owner_address containing 'Cabral'
        cabral_df = df[df['owner_address'].str.contains('Cabral', case=False, na=False)]
        print(f"Found {len(cabral_df)} properties in CSV owned by 'Cabral'.")
        
        # Breakdown by state
        state_counts = cabral_df['state'].value_counts()
        print("\nBreakdown by State:")
        print(state_counts)
        
        # List properties for states Ricardo has folders for: Florida, Oklahoma, Texas, Mississippi
        target_states = ['FL', 'Florida', 'OK', 'Oklahoma', 'TX', 'Texas', 'MS', 'Mississippi']
        target_df = cabral_df[cabral_df['state'].isin(target_states)]
        print(f"\nProperties in Ricardo's target states ({len(target_df)} total):")
        for idx, row in target_df.iterrows():
            print(f"- State: {row['state']} | Parcel: {row['parcel_id']} | Address: {row['address']} | Owner: {row['owner_address']}")
            
    except Exception as e:
        print(f"Error analyzing CSV: {e}")

if __name__ == "__main__":
    analyze_csv_cabral()
