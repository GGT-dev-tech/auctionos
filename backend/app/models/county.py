from sqlalchemy import Column, Integer, String, JSON, UniqueConstraint
from app.db.base_class import Base

class County(Base):
    __tablename__ = "counties"

    id = Column(Integer, primary_key=True, index=True)
    state_code = Column(String(2), index=True, nullable=False)
    county_name = Column(String(100), index=True, nullable=False)
    
    # Store list of office objects: [{name, phone, online_url}, ...]
    offices = Column(JSON, nullable=True)

    __table_args__ = (
        UniqueConstraint('state_code', 'county_name', name='bd_state_county_uc'),
    )
