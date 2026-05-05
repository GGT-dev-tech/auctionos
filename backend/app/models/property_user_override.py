"""
PropertyUserOverride — JSONB Override/Merge pattern.

Allows any authenticated user to customize any property from the global pool
privately. Only the fields the user actually changes are stored (sparse JSONB).
The master property_details record is never modified.

Merge logic (applied at read time in the API):
    final = {**master_data, **override.overrides}
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base_class import Base


class PropertyUserOverride(Base):
    __tablename__ = "property_user_overrides"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "property_id",
            name="uq_override_user_property",
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)

    # FK → users.id  (cascade delete: clean up when user is removed)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # FK → property_details.property_id (UUID string)
    # (cascade delete: clean up when the master property is removed)
    property_id = Column(
        String(36),
        ForeignKey("property_details.property_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Sparse JSONB — only stores fields the user actually changed.
    # Example: {"amount_due": 1500.0, "occupancy": "vacant"}
    overrides = Column(JSONB, nullable=False, server_default="{}")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
