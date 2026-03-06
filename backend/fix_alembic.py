import os
from sqlalchemy import create_engine, text

def main():
    db_url = os.environ.get("DATABASE_PUBLIC_URL") or os.environ.get("DATABASE_URL")
    if not db_url:
        print("Erro: DATABASE_URL não encontrada no ambiente!")
        return

    # Handle postgres:// vs postgresql:// (SQLAlchemy expect postgresql://)
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    print("Conectando ao banco de dados...")
    engine = create_engine(db_url)
    
    try:
        with engine.begin() as conn:
            print("Voltando a versão do Alembic para '9b875f2af7b4'...")
            conn.execute(text("UPDATE alembic_version SET version_num = '9b875f2af7b4'"))
            
            print("Apagando a tabela residual 'property_shape_data'...")
            conn.execute(text("DROP TABLE IF EXISTS property_shape_data CASCADE"))
            
        print("✅ Sucesso! O banco de dados foi sincronizado com a branch atual.")
    except Exception as e:
        print(f"❌ Erro ao executar a operação: {e}")

if __name__ == "__main__":
    main()
