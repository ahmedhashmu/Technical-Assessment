"""Meeting ingestion API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.schemas import MeetingCreate, MeetingResponse
from app.services.ingestion import MeetingIngestionService

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


@router.post("", response_model=MeetingResponse, status_code=201)
def create_meeting(
    meeting_data: MeetingCreate,
    db: Session = Depends(get_db)
):
    """
    Ingest a new meeting transcript.
    
    Creates an immutable meeting record with transcript data.
    """
    service = MeetingIngestionService(db)
    meeting = service.create_meeting(meeting_data)
    
    return MeetingResponse(
        id=meeting.id,
        contactId=meeting.contact_id,
        type=meeting.type,
        occurredAt=meeting.occurred_at,
        transcript=meeting.transcript,
        createdAt=meeting.created_at
    )


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    """Get a meeting by ID."""
    service = MeetingIngestionService(db)
    meeting = service.get_meeting(meeting_id)
    
    return MeetingResponse(
        id=meeting.id,
        contactId=meeting.contact_id,
        type=meeting.type,
        occurredAt=meeting.occurred_at,
        transcript=meeting.transcript,
        createdAt=meeting.created_at
    )
