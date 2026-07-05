from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from openai import APIError, AuthenticationError, RateLimitError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.analysis_schema import AnalysisResponse
from app.services import brief_service
from app.services.brief_analyzer import analyze_brief, get_analysis

router = APIRouter(prefix="/briefs", tags=["analysis"])


@router.post("/{brief_id}/analyze", response_model=AnalysisResponse)
def analyze_brief_endpoint(brief_id: UUID, db: Session = Depends(get_db)):
    brief = brief_service.get_brief(db, brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    try:
        return analyze_brief(db, brief)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid LLM_API_KEY")
    except RateLimitError:
        raise HTTPException(
            status_code=402,
            detail="OpenAI quota exceeded. Add billing credits at platform.openai.com",
        )
    except APIError as e:
        raise HTTPException(status_code=502, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/{brief_id}/analysis", response_model=AnalysisResponse)
def read_analysis(brief_id: UUID, db: Session = Depends(get_db)):
    brief = brief_service.get_brief(db, brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    analysis = get_analysis(db, brief_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis
