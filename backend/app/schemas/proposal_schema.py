from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ProposalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    brief_id: UUID
    short_proposal: str | None
    technical_proposal: str | None
    client_questions: list
    next_step: str | None
    created_at: datetime