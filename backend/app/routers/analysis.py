"""Meeting analysis API routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.schemas import MeetingAnalysisResponse
from app.services.analysis_engine import AnalysisEngine
from app.core.auth import require_operator_role

router = APIRouter(prefix="/api/meetings", tags=["analysis"])


@router.post("/{meeting_id}/analyze", response_model=MeetingAnalysisResponse)
def analyze_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(require_operator_role)
):
    """
    Analyze a meeting transcript using LLM.
    
    **Requires operator role (admin@truthos.com).**
    
    Extracts structured signals: topics, objections, commitments, sentiment, outcome.
    """
    engine = AnalysisEngine(db)
    analysis = engine.analyze_meeting(meeting_id)
    
    return MeetingAnalysisResponse(
        id=analysis.id,
        meetingId=analysis.meeting_id,
        sentiment=analysis.sentiment,
        topics=analysis.topics,
        objections=analysis.objections,
        commitments=analysis.commitments,
        outcome=analysis.outcome,
        summary=analysis.summary,
        analyzedAt=analysis.analyzed_at
    )
