import sys
import json
from sqlalchemy import create_engine, inspect
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/auctionos")
engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

def get_schema_info():
    schemas = inspector.get_schema_names()
    
    report = {
        "schemas": schemas,
        "default_schema": inspector.default_schema_name,
        "tables": {}
    }
    
    # We focus on the schema that has our tables (usually 'public')
    target_schema = "public" if "public" in schemas else inspector.default_schema_name
    
    for table_name in inspector.get_table_names(schema=target_schema):
        columns = []
        for col in inspector.get_columns(table_name, schema=target_schema):
            columns.append({
                "name": col["name"],
                "type": str(col["type"]),
                "nullable": col["nullable"],
                "default": str(col.get("default", ""))
            })
            
        fks = []
        for fk in inspector.get_foreign_keys(table_name, schema=target_schema):
            fks.append({
                "constrained_columns": fk["constrained_columns"],
                "referred_table": fk["referred_table"],
                "referred_columns": fk["referred_columns"]
            })
            
        indexes = []
        for idx in inspector.get_indexes(table_name, schema=target_schema):
            indexes.append({
                "name": idx["name"],
                "column_names": idx["column_names"],
                "unique": idx["unique"]
            })
            
        pk = inspector.get_pk_constraint(table_name, schema=target_schema)
        
        report["tables"][table_name] = {
            "columns": columns,
            "foreign_keys": fks,
            "indexes": indexes,
            "primary_key": pk.get("constrained_columns", []) if pk else []
        }
    
    return report

if __name__ == "__main__":
    print(json.dumps(get_schema_info(), indent=2))
