"""Contact model - Simplified for assessment."""
from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Contact(Base):
    """
    Contact record.
    
    Simplified contact model for assessment purposes.
    In production, would include more fields (name, email, etc.).
    """
    __tablename__ = "contacts"
    
    id = Column(String(255), primary_key=True)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
