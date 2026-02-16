"""Contact query API routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.schemas import ContactMeetingsResponse
from app.services.query_service import QueryService

router = APIRouter(prefix="/api/contacts", tags=["contacts"])


@router.get("/{contact_id}/meetings", response_model=ContactMeetingsResponse)
def get_contact_meetings(
    contact_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all meetings for a contact.
    
    Returns meetings ordered by occurredAt descending with optional analysis data.
    """
    service = QueryService(db)
    meetings = service.get_contact_meetings(contact_id)
    
    return ContactMeetingsResponse(
        contactId=contact_id,
        meetings=meetings
    )
