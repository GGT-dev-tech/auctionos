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

def deduplicate():
    with engine.begin() as conn:
        print("\n--- INICIANDO PROCESSO DE DEDUPLICAÇÃO DE LEILÕES ---\n")
        
        # 1. Identificar grupos de duplicatas por (Data, Estado, Condado)
        query = text("""
            SELECT auction_date, state, county, 
                   array_agg(id ORDER BY id ASC) as ids, 
                   array_agg(name ORDER BY id ASC) as names, 
                   array_agg(list_link ORDER BY id ASC) as links
            FROM auction_events 
            WHERE state IS NOT NULL AND county IS NOT NULL AND auction_date IS NOT NULL
            GROUP BY auction_date, state, county 
            HAVING COUNT(*) > 1
            ORDER BY auction_date ASC
        """)
        
        groups = conn.execute(query).fetchall()
        print(f"Encontrados {len(groups)} grupos de potenciais duplicatas.\n")
        
        total_merged = 0
        total_properties_moved = 0
        
        for group in groups:
            auction_date, state, county, ids, names, links = group
            
            # --- REGRA DE SEGURANÇA: Verificar Links ---
            unique_links = {l for l in links if l and l.strip()}
            if len(unique_links) > 1:
                print(f"⚠️ PULAR: {county}, {state} em {auction_date} possui links diferentes: {unique_links}")
                continue
            
            remove_ids = []
            final_keep_id = keep_id
            final_keep_name = keep_name
            
            for i, rid in enumerate(ids):
                if rid == final_keep_id: continue
                
                r_name = names[i]
                r_link = links[i]
                
                # --- Similarity Rules ---
                # 1. Identical links = definitely same
                # 2. One name is substring of another (after cleaning) = likely same
                # 3. Both contain "upset bid" or both don't = shared type
                
                def clean(s): return s.lower().replace("county", "").replace(",", "").strip()
                
                c_keep = clean(final_keep_name)
                c_rem = clean(r_name)
                
                is_same_type = (c_rem in c_keep or c_keep in c_rem)
                has_same_link = (r_link and r_link == links[keep_idx])
                
                if not has_same_link and not is_same_type:
                    print(f"⚠️ PULAR: IDs {final_keep_id} ({final_keep_name}) e {rid} ({r_name}) parecem ser leilões diferentes no mesmo dia.")
                    continue
                
                remove_ids.append(rid)
            
            if not remove_ids:
                continue
            
            print(f"UNIFICANDO: {county}, {state} ({auction_date})")
            print(f"  [MANTER] ID {final_keep_id}: {final_keep_name}")
            
            for rid in remove_ids:
                # 1. Remover entradas duplicadas no histórico para evitar erro de Unique Constraint
                # Se a mesma propriedade já está no histórico tanto no KEEP quanto no REMOVE
                conn.execute(text("""
                    DELETE FROM property_auction_history h2
                    WHERE h2.auction_id = :remove_id
                    AND EXISTS (
                        SELECT 1 FROM property_auction_history h1
                        WHERE h1.auction_id = :keep_id
                        AND h1.property_id = h2.property_id
                    )
                """), {"keep_id": keep_id, "remove_id": rid})

                # 2. Mover o restante das propriedades do leilão deletado para o mantido
                res_history = conn.execute(text("""
                    UPDATE property_auction_history 
                    SET auction_id = :keep_id,
                        auction_name = :keep_name
                    WHERE auction_id = :remove_id
                """), {"keep_id": keep_id, "keep_name": keep_name, "remove_id": rid})
                
                total_properties_moved += res_history.rowcount
                print(f"  [REMOVER] ID {rid}: Propriedades movidas: {res_history.rowcount}")

                # 3. Apagar o leilão duplicado
                conn.execute(text("DELETE FROM auction_events WHERE id = :rid"), {"rid": rid})
                total_merged += 1

            print("-" * 30)

        print(f"\n--- SUCESSO ---")
        print(f"Total de leilões removidos/unificados: {total_merged}")
        print(f"Total de vínculos de propriedades atualizados: {total_properties_moved}")
        print("\nPara validar, rode o comando de relatório novamente.\n")

if __name__ == "__main__":
    deduplicate()
