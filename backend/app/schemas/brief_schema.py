from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SourceType(str, Enum):
    LINKEDIN_JOB = "LinkedIn Job"
    UPWORK_JOB = "Upwork Job"
    CLIENT_EMAIL = "Client Email"
    TENDER_RFP = "Tender / RFP"
    INTERNAL_PROJECT = "Internal Project"
    OTHER = "Other"


class BriefStatus(str, Enum):
    NEW = "New"
    ANALYSED = "Analysed"
    PROPOSAL_DRAFTED = "Proposal Drafted"
    ARCHIVED = "Archived"


class BriefCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    client_name: str | None = None
    source_type: SourceType
    brief_text: str = Field(min_length=1)


class BriefUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    client_name: str | None = None
    source_type: SourceType | None = None
    brief_text: str | None = Field(default=None, min_length=1)
    status: BriefStatus | None = None
    risk_level: str | None = None
    complexity: str | None = None
    estimated_effort: str | None = None


class BriefResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    client_name: str | None
    source_type: str
    brief_text: str
    status: str
    risk_level: str | None
    complexity: str | None
    estimated_effort: str | None
    created_at: datetime
    updated_at: datetime