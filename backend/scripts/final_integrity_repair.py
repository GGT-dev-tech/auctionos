import os
import sys
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime

# Database Connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in environment.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

# File Paths
PROPERTIES_CSV = "backend/data/postgres_property_details.csv"
AUCTIONS_CSV = "backend/data/postgres_auction_events.csv"

def run_repair_sync():
    print("\n--- INICIANDO REPARO E SINCRONIZAÇÃO DE INTEGRIDADE (CSV -> DB) ---\n")
    
    with engine.begin() as conn:
        # 1. SINCRONIZAR METADADOS DE LEILÕES (2026+) - BATCH UPDATE
        if os.path.exists(AUCTIONS_CSV):
            print(f"Lendo {AUCTIONS_CSV}...")
            df_auc = pd.read_csv(AUCTIONS_CSV, dtype=str)
            # Filter for 2026 and clean rows
            df_auc = df_auc[df_auc['auction_date'].str.contains('2026', na=False)]
            
            records = []
            for _, row in df_auc.iterrows():
                try:
                    records.append({
                        "id": int(row.get('id')),
                        "parcels_count": int(float(str(row.get('parcels_count')).replace(',', '')))
                    })
                except: continue
            
            if records:
                # Bulk Update using temporary table trick for maximum speed
                conn.execute(text("CREATE TEMP TABLE tmp_auc (id INT, p_count INT) ON COMMIT DROP"))
                conn.execute(text("INSERT INTO tmp_auc (id, p_count) VALUES (:id, :parcels_count)"), records)
                conn.execute(text("""
                    UPDATE auction_events 
                    SET parcels_count = tmp_auc.p_count 
                    FROM tmp_auc 
                    WHERE auction_events.id = tmp_auc.id
                """))
                print(f"Metadados de {len(records)} leilões 2026+ atualizados.")

        # 2. SINCRONIZAR STATUS DE PROPRIEDADES (Focado em Disponibilidade) - BATCH
        if os.path.exists(PROPERTIES_CSV):
            print(f"Processando {PROPERTIES_CSV} (Bulk Update)...")
            # We use chunks for the big properties file but batch the SQL updates
            total_corrected = 0
            for chunk in pd.read_csv(PROPERTIES_CSV, chunksize=5000, dtype=str):
                available_pids = []
                for _, row in chunk.iterrows():
                    if str(row.get('availability_status')).strip().lower() == 'available':
                        available_pids.append(row.get('parcel_id').strip())
                
                if available_pids:
                    # Efficient IN update
                    res = conn.execute(text("""
                        UPDATE property_details 
                        SET availability_status = 'available' 
                        WHERE parcel_id IN :pids AND availability_status != 'available'
                    """), {"pids": tuple(available_pids)})
                    total_corrected += res.rowcount
            
            print(f"Propriedades corrigidas para 'available' via CSV: {total_corrected}")

        # 3. GARANTIA FINAL: Todas as propriedades em leilões FUTURE (2026+) 
        print("Executando garantia final para leilões de 2026...")
        res_final = conn.execute(text("""
            UPDATE property_details pd
            SET availability_status = 'available'
            FROM property_auction_history pah
            WHERE pd.property_id = pah.property_id
            AND pah.auction_date >= '2026-01-01'
            AND pd.availability_status != 'available'
        """))
        print(f"Garantia final: {res_final.rowcount} propriedades restauradas via vínculo 2026+.")

    print("\n--- SUCESSO: REPARO CONCLUÍDO ---")

if __name__ == "__main__":
    run_repair_sync()
