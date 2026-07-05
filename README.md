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

## Learning path

See `docs/` for step-by-step guides (phases 0-5).
