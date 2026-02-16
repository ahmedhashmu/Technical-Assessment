"""Meeting model - Immutable operational records."""
from sqlalchemy import Column, String, Text, DateTime, CheckConstraint, Index
from sqlalchemy.sql import func
from app.db.database import Base


class Meeting(Base):
    """
    Immutable meeting record.
    
    Represents the source of truth for meeting data.
    Cannot be modified or deleted after creation.
    """
    __tablename__ = "meetings"
    
    id = Column(String(255), primary_key=True)
    contact_id = Column(String(255), nullable=False, index=True)
    type = Column(String(20), nullable=False)
    occurred_at = Column(DateTime(timezone=True), nullable=False)
    transcript = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint("type IN ('sales', 'coaching')", name="check_meeting_type"),
        Index("idx_contact_occurred", "contact_id", "occurred_at"),
    )
