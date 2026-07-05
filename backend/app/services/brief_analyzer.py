from uuid import UUID

from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.brief import Brief
from app.services.llm_service import analyze_brief_with_llm


def get_analysis(db: Session, brief_id: UUID) -> Analysis | None:
    return db.query(Analysis).filter(Analysis.brief_id == brief_id).first()


def _derive_risk_level(risks: list) -> str:
    count = len(risks) if risks else 0
    if count >= 4:
        return "High"
    if count >= 2:
        return "Medium"
    return "Low"


def _save_analysis(db: Session, brief: Brief, analysis_data: dict) -> Analysis:
    existing = get_analysis(db, brief.id)
    if existing:
        db.delete(existing)
        db.commit()

    analysis = Analysis(brief_id=brief.id, **analysis_data)
    db.add(analysis)

    brief.status = "Analysed"
    brief.complexity = analysis_data.get("complexity")
    brief.estimated_effort = analysis_data.get("estimated_effort")
    brief.risk_level = _derive_risk_level(analysis_data.get("risks", []))

    db.commit()
    db.refresh(analysis)
    return analysis


def analyze_brief(db: Session, brief: Brief) -> Analysis:
    analysis_data = analyze_brief_with_llm(brief.brief_text)
    return _save_analysis(db, brief, analysis_data)
