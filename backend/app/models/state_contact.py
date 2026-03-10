from sqlalchemy import Column, Integer, String
from app.db.base_class import Base

class StateContact(Base):
    __tablename__ = "state_contacts"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String, unique=True, index=True, nullable=False)
    url = Column(String, nullable=True)
