
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

POSTGRES_DATABASE_URL = os.getenv("POSTGRES_URL", "postgresql://postgres:postgres@postgis:5432/auctionos_gis")

engine = create_engine(POSTGRES_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_gis_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
