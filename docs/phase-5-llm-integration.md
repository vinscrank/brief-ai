# Fase 5 — Integrazione LLM (OpenAI)

## Obiettivo

Sostituire l'analisi mock con una chiamata reale a un LLM (OpenAI). Il brief viene inviato all'API, la risposta JSON strutturata viene salvata in `analyses` come in Fase 4.

**Tu modifichi/crei i file indicati.** Questo documento ti guida passo passo.

**Prerequisito:** Fase 4 completata (`POST /briefs/{id}/analyze` con mock funzionante).

---

## Teoria — Cos'e un LLM API

Un **Large Language Model** (es. GPT-4o-mini) analizza testo e restituisce una risposta. Tu non implementi l'AI: chiami un'API esterna con:

1. **System prompt** — istruzioni fisse ("rispondi solo in JSON con questi campi...")
2. **User message** — il testo del brief
3. **Response format** — JSON mode per output strutturato

```
POST /briefs/{id}/analyze
    ↓
brief_analyzer.py  →  llm_service.py  →  OpenAI API
    ↓
JSON parsato  →  INSERT analyses  →  UPDATE brief
```

**Costo:** ogni analisi consuma token (input + output). Usa `gpt-4o-mini` per imparare: e economico.

---

## Teoria — Mock vs LLM (fallback)

In Fase 5 il service usera:

- **LLM reale** se `LLM_API_KEY` e presente in `.env`
- **Mock Fase 4** se la chiave manca (utile per test senza spendere)

Così non rompi nulla se la chiave non e configurata.

---

## Passo 0 — Ottieni la API key OpenAI

1. Vai su https://platform.openai.com
2. Crea account e aggiungi credito/billing
3. **API Keys** → Create new secret key
4. Copia la chiave (inizia con `sk-...`)

**Non condividerla mai** in chat o su Git.

---

## Passo 1 — Aggiorna `requirements.txt`

Aggiungi questa riga:

```
openai==1.58.1
```

Poi reinstalla:

```bash
cd /Users/vincenzo/Desktop/websites/briefscope-ai/backend
source .venv/bin/activate
pip install openai==1.58.1
```

---

## Passo 2 — Aggiorna `backend/.env`

Aggiungi al file `.env` (mantieni `DATABASE_URL`):

```
LLM_API_KEY=sk-la-tua-chiave-qui
LLM_MODEL=gpt-4o-mini
```

---

## Passo 3 — Aggiorna `app/config.py`

Sostituisci il contenuto con:

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"


settings = Settings()
```

---

## Passo 4 — Crea `app/services/llm_service.py`

```python
import json

from openai import OpenAI

from app.config import settings

ANALYSIS_SYSTEM_PROMPT = """You are a technical project analyst for freelance and job briefs.
Analyze the brief and return ONLY valid JSON with exactly these fields:
- summary (string)
- required_skills (array of strings)
- nice_to_have_skills (array of strings)
- technical_scope (string)
- deliverables (array of strings)
- missing_information (array of strings)
- risks (array of strings)
- questions (array of strings)
- complexity (string: Low, Medium, or High)
- estimated_effort (string, e.g. "10-15 days")
- suggested_daily_rate (string, e.g. "EUR 200-250/day")
- implementation_plan (string, multi-line steps)

Be specific to the brief content. Do not invent unrelated technologies."""


def analyze_brief_with_llm(brief_text: str) -> dict:
    if not settings.llm_api_key:
        raise ValueError("LLM_API_KEY is not configured")

    client = OpenAI(api_key=settings.llm_api_key)
    response = client.chat.completions.create(
        model=settings.llm_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": brief_text},
        ],
    )
    content = response.choices[0].message.content or "{}"
    return json.loads(content)
```

**Cosa fa:**
- `response_format json_object` — OpenAI restituisce JSON valido
- `json.loads` — converte stringa in dict Python
- Il dict ha le stesse chiavi di `MOCK_ANALYSIS` in Fase 4

---

## Passo 5 — Aggiorna `app/services/brief_analyzer.py`

Sostituisci il contenuto con:

```python
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.brief import Brief
from app.services.llm_service import analyze_brief_with_llm


MOCK_ANALYSIS = {
    "summary": "The client needs a full-stack dashboard with AI-powered analysis.",
    "required_skills": ["React", "Python", "FastAPI", "PostgreSQL"],
    "nice_to_have_skills": ["Docker", "TypeScript"],
    "technical_scope": "Build a web dashboard with REST API backend and PostgreSQL storage.",
    "deliverables": ["Dashboard UI", "REST API", "Database schema"],
    "missing_information": ["Authentication requirements", "Deployment target"],
    "risks": ["Unclear authentication requirements", "No deployment strategy mentioned"],
    "questions": ["Which auth provider should be used?", "What is the expected timeline?"],
    "complexity": "Medium",
    "estimated_effort": "12-18 days",
    "suggested_daily_rate": "EUR 230-280/day",
    "implementation_plan": "1. Setup backend and DB\n2. Build CRUD APIs\n3. Integrate AI analysis\n4. Build frontend dashboard",
}


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


def create_mock_analysis(db: Session, brief: Brief) -> Analysis:
    return _save_analysis(db, brief, MOCK_ANALYSIS)


def create_llm_analysis(db: Session, brief: Brief) -> Analysis:
    analysis_data = analyze_brief_with_llm(brief.brief_text)
    return _save_analysis(db, brief, analysis_data)


def analyze_brief(db: Session, brief: Brief) -> Analysis:
    from app.config import settings

    if settings.llm_api_key:
        return create_llm_analysis(db, brief)
    return create_mock_analysis(db, brief)
```

**Cosa cambia:**
- `_save_analysis` — logica comune mock/LLM (DRY)
- `analyze_brief` — sceglie LLM o mock in base alla chiave
- `_derive_risk_level` — calcola risk dal numero di rischi LLM

---

## Passo 6 — Aggiorna `app/api/analysis.py`

Cambia solo la riga che chiama il service. Sostituisci:

```python
return create_mock_analysis(db, brief)
```

con:

```python
from app.services.brief_analyzer import analyze_brief
```

(in alto negli import, rimuovi `create_mock_analysis` se non piu usato)

E nel corpo della funzione:

```python
return analyze_brief(db, brief)
```

File completo aggiornato:

```python
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.analysis_schema import AnalysisResponse
from app.services import brief_service
from app.services.brief_analyzer import analyze_brief, get_analysis

router = APIRouter(prefix="/briefs", tags=["analysis"])


@router.post("/{brief_id}/analyze", response_model=AnalysisResponse)
def analyze_brief_endpoint(brief_id: UUID, db: Session = Depends(get_db)):
    brief = brief_service.get_brief(db, brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    try:
        return analyze_brief(db, brief)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=502, detail="LLM analysis failed")


@router.get("/{brief_id}/analysis", response_model=AnalysisResponse)
def read_analysis(brief_id: UUID, db: Session = Depends(get_db)):
    brief = brief_service.get_brief(db, brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    analysis = get_analysis(db, brief_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis
```

---

## Passo 7 — Riavvia uvicorn

```bash
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

---

## Passo 8 — Test con Swagger

1. **POST /briefs** — crea un brief con testo ricco e specifico:

```json
{
  "title": "E-commerce React rebuild",
  "client_name": "Fashion Store",
  "source_type": "Client Email",
  "brief_text": "We need to rebuild our Shopify storefront in Next.js 14 with App Router, Stripe checkout, and Italian/English i18n. Must integrate with existing ERP via REST API. Deadline March 2026. Budget 15000 EUR."
}
```

2. Copia l'`id` del brief creato

3. **POST /briefs/{id}/analyze** — attendi 3-10 secondi (chiamata OpenAI)

4. Verifica che la risposta sia **diversa dal mock** e menzioni contenuti del brief (Next.js, Stripe, i18n, ERP...)

5. **GET /briefs/{id}/analysis** — stesso risultato

---

## Passo 9 — Test fallback mock

1. Commenta o rimuovi temporaneamente `LLM_API_KEY` dal `.env`
2. Riavvia uvicorn
3. POST analyze su un altro brief → deve tornare il mock Fase 4
4. Ripristina la chiave

---

## Passo 10 — Verifica su Neon

```sql
SELECT b.title, a.summary, a.required_skills, a.complexity, a.created_at
FROM briefs b
JOIN analyses a ON a.brief_id = b.id
ORDER BY a.created_at DESC
LIMIT 3;
```

Con LLM attivo, `summary` e `required_skills` devono riflettere il contenuto reale del brief.

---

## Cosa impari in questa fase (per il CV)

- **LLM API integration** — OpenAI chat completions
- **Structured output** — JSON mode + prompt engineering
- **Error handling** — 502/503 su failure API
- **Environment-based config** — feature flag via API key
- **Service layer refactor** — codice condiviso mock/LLM

---

## Mini-quiz CV

1. **Perche usiamo JSON mode invece di parsare testo libero?**
   Riduce errori di parsing e garantisce campi strutturati per il database.

2. **Dove metti la API key e perche?**
   In `.env`, mai in codice o Git, per sicurezza e rotazione facile.

3. **Qual e la differenza tra 502 e 503 in questo endpoint?**
   503 = configurazione mancante (no API key). 502 = chiamata fallita (rete, quota, risposta invalida).

---

## Checkpoint Fase 5

Segna completata la fase solo se:

- [ ] `openai` installato, `LLM_API_KEY` in `.env`
- [ ] POST analyze con brief specifico restituisce analisi **personalizzata** (non mock)
- [ ] Dati salvati su Neon in `analyses`
- [ ] Brief aggiornato con status `Analysed`
- [ ] Senza API key, fallback mock funziona ancora

Quando hai finito, scrivi: **"Fase 5 completata"**.

Passeremo alla **Fase 6**: `docs/phase-6-proposal-generator.md`.

---

## Troubleshooting

| Errore | Causa probabile | Soluzione |
|--------|-----------------|-----------|
| `503 LLM_API_KEY is not configured` | Chiave assente in `.env` | Aggiungi `LLM_API_KEY=sk-...` |
| `502 LLM analysis failed` | Chiave invalida, no credito, rate limit | Verifica dashboard OpenAI |
| `401 Incorrect API key` | Chiave sbagliata | Rigenera key su OpenAI |
| Risposta uguale al mock | Chiave non letta (uvicorn non riavviato) | Riavvia dopo modifica `.env` |
| `ValidationError` su Analysis | LLM ha omesso un campo | Migliora prompt o aggiungi default nel service |
| Analisi generica | Brief text troppo corto | Usa brief piu dettagliato nel POST |

---

## Costi indicativi (gpt-4o-mini)

Un brief medio (~500 token) costa circa **$0.001-0.003** per analisi. Monitora usage su https://platform.openai.com/usage
