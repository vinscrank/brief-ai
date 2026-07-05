from uuid import UUID

from sqlalchemy.orm import Session

from app.models.brief import Brief
from app.schemas.brief_schema import BriefCreate, BriefUpdate


def list_briefs(db: Session) -> list[Brief]:
    return db.query(Brief).order_by(Brief.created_at.desc()).all()


def get_brief(db: Session, brief_id: UUID) -> Brief | None:
    return db.query(Brief).filter(Brief.id == brief_id).first()


def create_brief(db: Session, data: BriefCreate) -> Brief:
    brief = Brief(
        title=data.title,
        client_name=data.client_name,
        source_type=data.source_type.value,
        brief_text=data.brief_text,
        status="New",
    )
    db.add(brief)
    db.commit()
    db.refresh(brief)
    return brief


def update_brief(db: Session, brief: Brief, data: BriefUpdate) -> Brief:
    update_data = data.model_dump(exclude_unset=True)

    if "source_type" in update_data and update_data["source_type"] is not None:
        update_data["source_type"] = update_data["source_type"].value

    if "status" in update_data and update_data["status"] is not None:
        update_data["status"] = update_data["status"].value

    for field, value in update_data.items():
        setattr(brief, field, value)

    db.commit()
    db.refresh(brief)
    return brief


def delete_brief(db: Session, brief: Brief) -> None:
    db.delete(brief)
    db.commit()