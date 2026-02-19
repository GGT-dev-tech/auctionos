import os
import sys
import json
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print(json.dumps({"error": "DATABASE_URL not set"}))
    sys.exit(1)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        data = {}

        # 1. Visao Geral (PostgreSQL version)
        version_res = conn.execute(text("SELECT version();")).scalar()
        data['version'] = version_res

        # 2. Schemas
        schema_query = """
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        """
        data['schemas'] = [row[0] for row in conn.execute(text(schema_query))]

        # 3. Estrutura das Tabelas & 4. Relacionamentos
        tables_query = """
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        """
        data['tables'] = {}
        tables = conn.execute(text(tables_query)).fetchall()
        
        for schema, table in tables:
            data['tables'][table] = {'columns': [], 'fks': [], 'constraints': []}
            
            # Colunas
            col_query = text("""
            SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = :schema AND table_name = :table
            ORDER BY ordinal_position
            """)
            cols = conn.execute(col_query, {"schema": schema, "table": table}).fetchall()
            for col in cols:
                data['tables'][table]['columns'].append({
                    'name': col[0], 'type': col[1], 'length': col[2], 'nullable': col[3], 'default': col[4]
                })
            
            # Constraints (PK, Unique, Check)
            const_query = text("""
            SELECT tc.constraint_type, tc.constraint_name, kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = :schema AND tc.table_name = :table
            """)
            consts = conn.execute(const_query, {"schema": schema, "table": table}).fetchall()
            for const in consts:
                data['tables'][table]['constraints'].append({
                    'type': const[0], 'name': const[1], 'column': const[2]
                })

            # Foreign Keys (Relacionamentos)
            fk_query = text("""
            SELECT
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_schema = :schema AND tc.table_name = :table;
            """)
            fks = conn.execute(fk_query, {"schema": schema, "table": table}).fetchall()
            for fk in fks:
                data['tables'][table]['fks'].append({
                    'column': fk[0], 'ref_table': fk[1], 'ref_column': fk[2]
                })

        # 5. Performance (Indices)
        idx_query = """
        SELECT tablename, indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        """
        data['indexes'] = [dict(row._mapping) for row in conn.execute(text(idx_query))]

        # Row counts (Estimative for large tables)
        count_query = """
        SELECT relname AS table, n_live_tup AS rows
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
        """
        data['table_sizes'] = [dict(row._mapping) for row in conn.execute(text(count_query))]

        print(json.dumps(data))

except Exception as e:
    print(json.dumps({"error": str(e)}))
