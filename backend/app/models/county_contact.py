from sqlalchemy import Column, Integer, String
from app.db.base_class import Base

class CountyContact(Base):
    __tablename__ = "county_contacts"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(50), nullable=False, index=True)
    county = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    url = Column(String(2048), nullable=True)
