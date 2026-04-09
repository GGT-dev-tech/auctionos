import os
import sys
from sqlalchemy import create_engine, text

# Database Connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in environment.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

def unlink_mismatches():
    with engine.begin() as conn:
        print("\n--- INICIANDO LIMPEZA DE VÍNCULOS CONFLITANTES ---\n")
        
        # 1. Identificar e Limpar Vínculos onde o Estado ou Condado do Leilão não bate com a Propriedade
        unlink_query = text("""
            UPDATE property_auction_history pah
            SET auction_id = NULL
            FROM property_details p, auction_events ae
            WHERE pah.property_id = p.property_id
              AND pah.auction_id = ae.id
              AND (
                  (ae.state != p.state AND ae.state NOT IN ('US', 'All')) 
                  OR (ae.county != p.county AND ae.county NOT IN ('All'))
              )
        """)
        
        result = conn.execute(unlink_query)
        print(f"Sucesso: {result.rowcount} vínculos conflitantes foram removidos (set to NULL).")
        print("Essas propriedades agora estão prontas para serem re-vinculadas corretamente pelo reparo de nomes.\n")

if __name__ == "__main__":
    unlink_mismatches()
