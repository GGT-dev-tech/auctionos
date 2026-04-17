import os
import sys
import pandas as pd
from sqlalchemy import create_engine, text

# Database Connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in environment.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
CSV_FILE = "backend/data/postgres_auction_events.csv"

def restore_bulk():
    if not os.path.exists(CSV_FILE):
        print(f"ERROR: {CSV_FILE} not found.")
        return

    print(f"\n--- RESTAURANDO METADADOS DE LEILÕES (MODO BULK ALTA PERFORMANCE) ---\n")
    
    df = pd.read_csv(CSV_FILE)
    # Clean up data
    df = df[['id', 'name', 'short_name', 'auction_date', 'county', 'state']]
    df['short_name'] = df['short_name'].fillna('')
    df['auction_date'] = pd.to_datetime(df['auction_date']).dt.strftime('%Y-%m-%d')
    
    # We'll use batches of 1000 to keep the SQL string size reasonable
    batch_size = 1000
    rows = df.values.tolist()
    
    updated_total = 0
    with engine.begin() as conn:
        for i in range(0, len(rows), batch_size):
            batch = rows[i:i + batch_size]
            
            # Construct a massive VALUES clause
            values_list = []
            params = {}
            for j, row in enumerate(batch):
                v_id, v_name, v_short, v_date, v_county, v_state = row
                values_list.append(f"(:id_{j}, :name_{j}, :short_{j}, :date_{j}, :county_{j}, :state_{j})")
                params[f"id_{j}"] = int(v_id)
                params[f"name_{j}"] = str(v_name)
                params[f"short_{j}"] = str(v_short) if v_short else None
                params[f"date_{j}"] = str(v_date)
                params[f"county_{j}"] = str(v_county)
                params[f"state_{j}"] = str(v_state)

            sql = f"""
                UPDATE auction_events AS ae
                SET name = t.name,
                    short_name = t.short_name,
                    auction_date = t.auction_date::date,
                    county = t.county,
                    state = t.state,
                    updated_at = NOW()
                FROM (VALUES {", ".join(values_list)}) AS t(id, name, short_name, auction_date, county, state)
                WHERE ae.id = t.id
            """
            
            result = conn.execute(text(sql), params)
            updated_total += result.rowcount
            print(f"Lote {i//batch_size + 1} processado. Atualizados: {updated_total}/{len(df)}")

    print(f"\n--- SUCESSO ---")
    print(f"Total de leilões restaurados: {updated_total}")
    print("Integridade de nomes e localizações restaurada com sucesso.")

if __name__ == "__main__":
    restore_bulk()
