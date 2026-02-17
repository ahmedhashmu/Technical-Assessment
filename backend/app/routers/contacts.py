"""Contact query API routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.schemas import ContactMeetingsResponse, ContactMeetingsBasicResponse
from app.services.query_service import QueryService
from app.core.auth import get_user_role, UserRole
from typing import Union

router = APIRouter(prefix="/api/contacts", tags=["contacts"])


@router.get(
    "/{contact_id}/meetings",
    response_model=Union[ContactMeetingsResponse, ContactMeetingsBasicResponse]
)
def get_contact_meetings(
    contact_id: str,
    user_role: UserRole = Depends(get_user_role),
    db: Session = Depends(get_db)
):
    """
    Get all meetings for a contact with role-based access control.
    
    - **operator**: Full access (transcript + analysis)
    - **basic**: Metadata only (no transcript, no analysis)
    
    Requires header: x-user-role (operator | basic)
    
    Returns meetings ordered by occurredAt descending.
    """
    service = QueryService(db)
    meetings = service.get_contact_meetings(contact_id, user_role)
    
    if user_role == "operator":
        return ContactMeetingsResponse(
            contactId=contact_id,
            meetings=meetings
        )
    else:
        return ContactMeetingsBasicResponse(
            contactId=contact_id,
            meetings=meetings
        )
