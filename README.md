# BriefScope AI

AI platform to analyze technical briefs, extract scope, risks, and implementation plans.

## Stack

- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, Docker (Cloud Run)
- **Frontend:** Next.js, React, Tailwind
- **Database:** PostgreSQL (Neon)
- **AI:** OpenAI LLM API

## Setup (prima volta)

**Backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Configura `DATABASE_URL` e opzionale `LLM_API_KEY` in `backend/.env`.

**Frontend**

```bash
cd frontend
npm install
```

Opzionale: crea `frontend/.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:8000` (è già il default se omesso).

## Avvio locale

Servono **due terminali** aperti.

**Terminale 1 — Backend** (porta 8000)

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

**Terminale 2 — Frontend** (porta 3000)

```bash
cd frontend
npm run dev
```

- App: http://localhost:3000

Il frontend in locale chiama il backend su `http://localhost:8000` (vedi `frontend/src/lib/api.ts`).

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
- Reference: [Cloud Run e Artifact Registry](docs/reference-gcp-cloud-run-artifact-registry.md) (teoria GCP, glossario, CV)
