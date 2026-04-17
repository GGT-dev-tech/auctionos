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
    role = Column(String(50), default="client")   # 'admin', 'client', 'consultant', 'superuser'
    full_name = Column(String(255), nullable=True)

    # ── Empresa ativa (persistente entre sessões) ────────────────────────────
    active_company_id = Column(
        Integer,
        ForeignKey("companies.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ── Relacionamentos ──────────────────────────────────────────────────────
    # Usa backref nos modelos secundários → NÃO define back_populates aqui
    # para evitar conflito com os backref definidos naquelas classes.
    # Exceção: Company e Consultant usam back_populates explícito de ambos os lados.

    companies = relationship(
        "Company",
        foreign_keys="Company.user_id",
        back_populates="owner",
        cascade="all, delete-orphan",
    )

    active_company = relationship(
        "Company",
        foreign_keys=[active_company_id],
    )

    consultant_profile = relationship(
        "Consultant",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # Os modelos abaixo definem 'backref' próprio → não usar back_populates aqui
    # client_lists       → ClientList.user   (backref)
    # client_notes       → ClientNote.user   (backref)
    # client_attachments → ClientAttachment.user (backref)
    # notifications      → via user_id FK, sem ORM back-ref no modelo Notification
    # activity_logs      → via user_id FK, sem ORM back-ref no modelo ActivityLog
