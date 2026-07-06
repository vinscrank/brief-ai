from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.brief_schema import BriefCreate, BriefResponse, BriefUpdate
from app.services import brief_service

router = APIRouter(prefix="/briefs", tags=["briefs"])


@router.get("", response_model=list[BriefResponse])
def list_briefs(db: Session = Depends(get_db)):
    return brief_service.list_briefs(db)


@router.post("", response_model=BriefResponse, status_code=201)
def create_brief(data: BriefCreate, db: Session = Depends(get_db)):
    return brief_service.create_brief(db, data)


@router.get("/{brief_id}", response_model=BriefResponse)
def get_brief(brief_id: UUID, db: Session = Depends(get_db)):
    brief = brief_service.get_brief(db, brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    return brief


@router.put("/{brief_id}", response_model=BriefResponse)
def update_brief(brief_id: UUID, data: BriefUpdate, db: Session = Depends(get_db)):
    brief = brief_service.get_brief(db, brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    return brief_service.update_brief(db, brief, data)
