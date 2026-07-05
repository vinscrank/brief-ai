# BriefScope AI

AI platform to analyze technical briefs, extract scope, risks, and implementation plans.

## Stack

- Python, FastAPI, SQLAlchemy, Pydantic
- PostgreSQL (Neon)
- OpenAI LLM API

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Configure `DATABASE_URL` and optional `LLM_API_KEY` in `backend/.env`.

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Live (produzione)

| | URL |
|---|-----|
| Frontend | https://briefgen-ai.vercel.app |
| Backend API | https://briefscope-backend-949475606814.europe-west1.run.app |
| Swagger | https://briefscope-backend-949475606814.europe-west1.run.app/docs |

## Learning path

See `docs/` for step-by-step guides:

- Phases 0-6: database, backend, LLM
- Phase 8: frontend Next.js
- Phase 9: deploy backend (Docker + Google Cloud Run)
- Phase 10: deploy frontend (Vercel)
