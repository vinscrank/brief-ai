import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brief_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("briefs.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    summary: Mapped[str | None] = mapped_column(Text)
    required_skills: Mapped[list] = mapped_column(JSONB, default=list)
    nice_to_have_skills: Mapped[list] = mapped_column(JSONB, default=list)
    technical_scope: Mapped[str | None] = mapped_column(Text)
    deliverables: Mapped[list] = mapped_column(JSONB, default=list)
    missing_information: Mapped[list] = mapped_column(JSONB, default=list)
    risks: Mapped[list] = mapped_column(JSONB, default=list)
    questions: Mapped[list] = mapped_column(JSONB, default=list)
    complexity: Mapped[str | None] = mapped_column(String(50))
    estimated_effort: Mapped[str | None] = mapped_column(String(100))
    suggested_daily_rate: Mapped[str | None] = mapped_column(String(100))
    implementation_plan: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    brief = relationship("Brief", backref="analysis", uselist=False)