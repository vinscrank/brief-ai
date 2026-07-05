from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    brief_id: UUID
    summary: str | None
    required_skills: list
    nice_to_have_skills: list
    technical_scope: str | None
    deliverables: list
    missing_information: list
    risks: list
    questions: list
    complexity: str | None
    estimated_effort: str | None
    suggested_daily_rate: str | None
    implementation_plan: str | None
    created_at: datetime