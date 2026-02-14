from sqlalchemy import Boolean, Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.user_role import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    role = Column(Enum(UserRole), default=UserRole.AGENT, nullable=False)

    # Relationships
    owned_companies = relationship("Company", back_populates="owner")
    companies = relationship("Company", secondary="user_company", back_populates="users")
