from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

client_list_property = Table(
    "client_list_property",
    Base.metadata,
    Column("list_id", Integer, ForeignKey("client_lists.id"), primary_key=True),
    Column("property_id", Integer, ForeignKey("property_details.id"), primary_key=True)
)

class ClientList(Base):
    __tablename__ = "client_lists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="client_lists")
    properties = relationship(
        "PropertyDetails",
        secondary=client_list_property,
        backref="client_lists"
    )

class ClientNote(Base):
    __tablename__ = "client_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    property_id = Column(Integer, ForeignKey("property_details.id"), nullable=False, index=True)
    note_text = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="client_notes")
    property = relationship("PropertyDetails", backref="client_notes")

class ClientAttachment(Base):
    __tablename__ = "client_attachments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    property_id = Column(Integer, ForeignKey("property_details.id"), nullable=False, index=True)
    file_path = Column(String(1000), nullable=False)
    filename = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="client_attachments")
    property = relationship("PropertyDetails", backref="client_attachments")
