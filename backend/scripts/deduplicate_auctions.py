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
            
            # --- REGRA DE SELEÇÃO: Identificar quem manter (KEEP) ---
            # Prioridade 1: Não conter 'Upset Bid'
            # Prioridade 2: Menor ID (vínculo mais antigo)
            candidate_indices = []
            for idx, name in enumerate(names):
                if 'upset bid' not in name.lower():
                    candidate_indices.append(idx)
            
            if not candidate_indices: # Todos são 'Upset Bid'
                keep_idx = 0 
            else:
                keep_idx = candidate_indices[0] # Pega o primeiro que não é 'Upset Bid'
            
            keep_id = ids[keep_idx]
            keep_name = names[keep_idx]
            remove_ids = [i for i in ids if i != keep_id]
            
            print(f"UNIFICANDO: {county}, {state} ({auction_date})")
            print(f"  [MANTER] ID {keep_id}: {keep_name}")
            
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
