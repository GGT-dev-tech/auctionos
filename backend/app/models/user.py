from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)

    # Relacionamentos Módulo 2 e 3
    client_lists = relationship("ClientList", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("ClientNote", back_populates="user", cascade="all, delete-orphan")
    attachments = relationship("ClientAttachment", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
    
    # NOVOS RELACIONAMENTOS: Multi-Company e Consultores
    companies = relationship("Company", foreign_keys="Company.user_id", back_populates="owner", cascade="all, delete-orphan")
    consultant_profile = relationship("Consultant", back_populates="user", uselist=False, cascade="all, delete-orphan")

    role = Column(String(50), default="client")  # 'admin', 'client', 'consultant'
    full_name = Column(String(255), nullable=True)

    # Empresa ativa selecionada pelo usuário (persistente entre sessões)
    active_company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    active_company = relationship("Company", foreign_keys=[active_company_id])

