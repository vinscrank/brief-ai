from uuid import UUID

from sqlalchemy.orm import Session

from app.models.brief import Brief
from app.models.proposal import Proposal
from app.services.brief_analyzer import get_analysis
from app.services.llm_service import generate_proposal_with_llm


def get_proposal(db: Session, brief_id: UUID) -> Proposal | None:
    return db.query(Proposal).filter(Proposal.brief_id == brief_id).first()


def generate_proposal(db: Session, brief: Brief) -> Proposal:
    analysis = get_analysis(db, brief.id)
    if not analysis:
        raise ValueError("Brief must be analysed before generating a proposal")

    analysis_dict = {
        "summary": analysis.summary,
        "required_skills": analysis.required_skills,
        "nice_to_have_skills": analysis.nice_to_have_skills,
        "technical_scope": analysis.technical_scope,
        "deliverables": analysis.deliverables,
        "risks": analysis.risks,
        "questions": analysis.questions,
        "complexity": analysis.complexity,
        "estimated_effort": analysis.estimated_effort,
        "suggested_daily_rate": analysis.suggested_daily_rate,
        "implementation_plan": analysis.implementation_plan,
    }

    proposal_data = generate_proposal_with_llm(brief.brief_text, analysis_dict)

    existing = get_proposal(db, brief.id)
    if existing:
        db.delete(existing)
        db.commit()

    proposal = Proposal(brief_id=brief.id, **proposal_data)
    db.add(proposal)

    brief.status = "Proposal Drafted"
    db.commit()
    db.refresh(proposal)
    return proposal