from datetime import datetime
from sqlalchemy import Column, String, Float, Text, DateTime, UniqueConstraint
from app.db.base_class import Base


class PropertyScore(Base):
    """
    Persistent score storage for properties.
    Receives computed scores from the frontend scoring engine
    (rule-based v1) and will be extended for ML model v2+.

    Auto-upserted on property detail page load — non-destructive,
    additive table only. Unique per parcel_id.
    """
    __tablename__ = "property_scores"
    __table_args__ = (
        UniqueConstraint('parcel_id', name='uq_property_scores_parcel_id'),
    )

    parcel_id = Column(String(100), primary_key=True, index=True, nullable=False)
    deal_score = Column(Float, nullable=False)
    rating = Column(String(5), nullable=False)           # A+, A, B, C, D, F
    score_factors = Column(Text, nullable=True)           # JSON-encoded list of factor strings
    model_version = Column(String(50), nullable=False, default="rule-based-v1")
    computed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
