from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.analysis_schema import AnalysisResponse
from app.services import brief_service
from app.services.brief_analyzer import create_mock_analysis, get_analysis

router = APIRouter(prefix="/briefs", tags=["analysis"])


@router.post("/{brief_id}/analyze", response_model=AnalysisResponse)
def analyze_brief(brief_id: UUID, db: Session = Depends(get_db)):
    brief = brief_service.get_brief(db, brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    return create_mock_analysis(db, brief)


@router.get("/{brief_id}/analysis", response_model=AnalysisResponse)
def read_analysis(brief_id: UUID, db: Session = Depends(get_db)):
    brief = brief_service.get_brief(db, brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    analysis = get_analysis(db, brief_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis