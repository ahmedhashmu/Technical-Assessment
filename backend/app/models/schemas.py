"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal, List


# Meeting Schemas
class MeetingCreate(BaseModel):
    """Schema for creating a new meeting."""
    meetingId: str = Field(..., min_length=1)
    contactId: str = Field(..., min_length=1)
    type: Literal['sales', 'coaching']
    occurredAt: datetime
    transcript: str = Field(..., min_length=1)


class MeetingResponse(BaseModel):
    """Schema for meeting response."""
    id: str
    contactId: str
    type: str
    occurredAt: datetime
    transcript: str
    createdAt: datetime
    
    class Config:
        from_attributes = True


# Analysis Schemas
class AnalysisSignals(BaseModel):
    """Schema for LLM-extracted signals."""
    sentiment: Literal['positive', 'neutral', 'negative']
    topics: List[str]
    objections: List[str]
    commitments: List[str]
    outcome: Literal['closed', 'follow_up', 'no_interest', 'unknown']
    summary: str


class MeetingAnalysisResponse(BaseModel):
    """Schema for meeting analysis response."""
    id: str
    meetingId: str
    sentiment: str
    topics: List[str]
    objections: List[str]
    commitments: List[str]
    outcome: str
    summary: str
    analyzedAt: datetime
    
    class Config:
        from_attributes = True


class MeetingWithAnalysis(BaseModel):
    """Schema for meeting with optional analysis."""
    id: str
    contactId: str
    type: str
    occurredAt: datetime
    transcript: str
    createdAt: datetime
    analysis: MeetingAnalysisResponse | None = None


class ContactMeetingsResponse(BaseModel):
    """Schema for contact meetings response."""
    contactId: str
    meetings: List[MeetingWithAnalysis]


# Error Schema
class ErrorResponse(BaseModel):
    """Schema for error responses."""
    error: dict
