import os
import sys
from sqlalchemy import create_engine, text
from datetime import datetime

# Database Connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in environment.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

def fix_linkages():
    # 1. Buscar históricos órfãos
    with engine.connect() as conn:
        print("\n--- INICIANDO REPARO DE VÍNCULOS DE LEILÕES (BATCHED) ---\n")
        
        orphan_query = text("""
            SELECT id, property_id, auction_name, auction_date 
            FROM property_auction_history 
            WHERE auction_id IS NULL
        """)
        orphans = conn.execute(orphan_query).fetchall()
        
        if not orphans:
            print("Nenhum histórico órfão encontrado. Tudo OK!")
            return
            
        print(f"Encontrados {len(orphans)} registros de histórico sem vínculo de ID.\n")
        
        fixed_count = 0
        batch_size = 500
        
        for i, orphan in enumerate(orphans):
            o_id, prop_id, o_name, o_date = orphan
            
            # 2. Tentar encontrar o leilão correspondente
            match_query = text("""
                SELECT id, name FROM auction_events 
                WHERE auction_date = :auction_date
                AND (
                    name = :name 
                    OR short_name = :name
                    OR :name LIKE '%' || name || '%'
                    OR name LIKE '%' || :name || '%'
                )
                ORDER BY (name = :name) DESC, (short_name = :name) DESC
                LIMIT 1
            """)
            
            # Open a small transaction for each match/update or batch it
            match = conn.execute(match_query, {"name": o_name, "auction_date": o_date}).fetchone()
            
            if match:
                ae_id, ae_name = match
                conn.execute(text("""
                    UPDATE property_auction_history 
                    SET auction_id = :ae_id, auction_name = :ae_name
                    WHERE id = :o_id
                """), {"ae_id": ae_id, "ae_name": ae_name, "o_id": o_id})
                
                fixed_count += 1
            
            if (i + 1) % batch_size == 0 or (i + 1) == len(orphans):
                conn.commit()
                # Create a new transaction-like state if needed, but in SQLAlchemy 2.0+ with engine.connect(), 
                # commit() handles the transaction.
                print(f"Progresso: {i + 1}/{len(orphans)} processados... Fixos: {fixed_count}")

            # Re-establish connection if it times out (optional for very large sets)
                
        print(f"\n--- SUCESSO ---")
        print(f"Total de vínculos reparados: {fixed_count} de {len(orphans)}")
        print("\nOs contadores 'Available' devem estar atualizados agora.\n")

if __name__ == "__main__":
    fix_linkages()
