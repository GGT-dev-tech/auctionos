import os
import pandas as pd
from sqlalchemy import create_engine, text
import traceback

DATABASE_URL = os.environ.get("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def diagnose():
    print("Reading CSV...")
    df = pd.read_csv('backend/data/postgres_property_details.csv', dtype=str).head(2000)
    
    # Try bulk first
    print("Testing bulk insert (batch of 2000)...")
    try:
        df.to_sql('property_details', engine, if_exists='append', index=False)
        print("Bulk success! No error in the first 2000 rows.")
    except Exception as e:
        print("\nBULK FAILED. Diagnosing specific row...")
        if hasattr(e, 'orig'):
            print(f"Postgres Error: {e.orig}")
        else:
            print(f"Error: {e}")
        
        # Test row by row to find the culprit
        with engine.connect() as conn:
            for i, row in df.iterrows():
                try:
                    # Create a single-row dataframe to test to_sql
                    row_df = pd.DataFrame([row])
                    row_df.to_sql('property_details', conn, if_exists='append', index=False)
                except Exception as row_e:
                    print(f"\nCULPRIT FOUND AT ROW {i}:")
                    print(row)
                    if hasattr(row_e, 'orig'):
                        print(f"Exact DB Error: {row_e.orig}")
                    else:
                        print(f"Row Error: {row_e}")
                    return

if __name__ == "__main__":
    diagnose()
