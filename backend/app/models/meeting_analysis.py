"""Meeting analysis model - Derived data."""
from sqlalchemy import Column, String, Text, DateTime, CheckConstraint, ForeignKey, Index, JSON
from sqlalchemy.sql import func
from app.db.database import Base


class MeetingAnalysis(Base):
    """
    Meeting analysis record - Derived data.
    
    Stores LLM-generated insights from meeting transcripts.
    Can be regenerated without affecting source records.
    """
    __tablename__ = "meeting_analyses"
    
    id = Column(String(255), primary_key=True)
    meeting_id = Column(String(255), ForeignKey("meetings.id"), nullable=False)
    sentiment = Column(String(20), nullable=False)
    topics = Column(JSON, nullable=False)
    objections = Column(JSON, nullable=False)
    commitments = Column(JSON, nullable=False)
    outcome = Column(String(20), nullable=False)
    summary = Column(Text, nullable=False)
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint("sentiment IN ('positive', 'neutral', 'negative')", name="check_sentiment"),
        CheckConstraint("outcome IN ('closed', 'follow_up', 'no_interest', 'unknown')", name="check_outcome"),
        Index("idx_meeting_analyzed", "meeting_id", "analyzed_at"),
    )
