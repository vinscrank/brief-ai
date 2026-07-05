from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from openai import APIError, AuthenticationError, RateLimitError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.proposal_schema import ProposalResponse
from app.services import brief_service
from app.services.proposal_service import generate_proposal, get_proposal

router = APIRouter(prefix="/briefs", tags=["proposals"])


@router.post("/{brief_id}/generate-proposal", response_model=ProposalResponse)
def generate_proposal_endpoint(brief_id: UUID, db: Session = Depends(get_db)):
    brief = brief_service.get_brief(db, brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    try:
        return generate_proposal(db, brief)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
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


@router.get("/{brief_id}/proposal", response_model=ProposalResponse)
def read_proposal(brief_id: UUID, db: Session = Depends(get_db)):
    brief = brief_service.get_brief(db, brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    proposal = get_proposal(db, brief_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal