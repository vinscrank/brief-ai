# Fase 2 — Python + FastAPI + connessione Neon

## Obiettivo

Creare un backend Python minimo con FastAPI che si connette al database Neon e risponde su `GET /health`. Al termine avrai un server locale su `http://localhost:8000` che verifica la connessione al database.

**Tu crei tutti i file e esegui i comandi.** Questo documento ti guida passo passo.

**Prerequisito:** Fase 1 completata (`backend/.env` con `DATABASE_URL` valido).

---

## Teoria — Cos'e un backend REST

Quando il frontend (Next.js, fase futura) ha bisogno di dati, non parla direttamente con PostgreSQL. Passa dal **backend**, un programma che:

1. Riceve richieste HTTP (es. `GET /health`)
2. Esegue logica (es. controlla il database)
3. Restituisce una risposta JSON (es. `{"status": "ok"}`)

Questo pattern si chiama **REST API**.

```
Browser / Frontend  --HTTP-->  FastAPI (Python)  --SQL-->  Neon (PostgreSQL)
```

---

## Teoria — Cos'e FastAPI

**FastAPI** e un framework Python per creare API web. Rispetto a uno script Python normale:

| Script Python | FastAPI |
|---------------|---------|
| Esegue e termina | Resta in ascolto su una porta |
| Nessuna URL | Ogni funzione e un endpoint (`/health`, `/briefs`) |
| Output a terminale | Risposta JSON al client |

**Uvicorn** e il server che esegue l'app FastAPI in locale.

---

## Teoria — Cos'e SQLAlchemy (ORM)

**SQLAlchemy** e un ORM: mappa tabelle PostgreSQL a classi Python.

```
Tabella PostgreSQL "briefs"  <-->  classe Python Brief
```

In Fase 2 crei solo il modello `Brief` e la connessione. In Fase 3 userai il modello per il CRUD.

**Flusso connessione:**

1. `config.py` legge `DATABASE_URL` da `.env`
2. `database.py` crea l'engine SQLAlchemy
3. `get_db()` fornisce una sessione per ogni richiesta
4. `main.py` usa la sessione per verificare il DB

---

## Teoria — Virtual environment (venv)

Un **virtualenv** isola le dipendenze Python del progetto da quelle globali del Mac. Ogni progetto ha il suo `requirements.txt` e le sue librerie installate in `.venv/`.

---

## Struttura file da creare

Al termine di questa fase avrai:

```
briefscope-ai/
└── backend/
    ├── .env                  (gia creato in Fase 1)
    ├── .gitignore
    ├── requirements.txt
    └── app/
        ├── __init__.py
        ├── main.py
        ├── config.py
        ├── db/
        │   └── database.py
        └── models/
            └── brief.py
```

---

## Passo 1 — Apri il terminale nella cartella backend

```bash
cd /Users/vincenzo/Desktop/websites/briefscope-ai/backend
```

---

## Passo 2 — Crea e attiva il virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Dopo l'attivazione vedrai `(.venv)` all'inizio del prompt.

Per disattivare in futuro: `deactivate`

---

## Passo 3 — Crea `requirements.txt`

Crea il file `backend/requirements.txt` con questo contenuto:

```
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy==2.0.36
psycopg2-binary==2.9.10
python-dotenv==1.0.1
pydantic==2.10.4
pydantic-settings==2.7.0
```

Poi installa le dipendenze (con venv attivo):

```bash
pip install -r requirements.txt
```

---

## Passo 4 — Crea `.gitignore`

Crea `backend/.gitignore`:

```
.env
.venv/
__pycache__/
*.py[cod]
```

Così non committi mai password o cartella venv.

---

## Passo 5 — Crea `app/config.py`

Crea le cartelle e il file `backend/app/config.py`:

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str


settings = Settings()
```

**Cosa fa:** legge `DATABASE_URL` dal file `.env` e lo rende disponibile come `settings.database_url`.

Nota: Pydantic converte automaticamente `DATABASE_URL` (maiuscolo nel .env) in `database_url` (snake_case in Python).

---

## Passo 6 — Crea `app/db/database.py`

Crea `backend/app/db/database.py`:

```python
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> bool:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return True
```

**Cosa fa:**
- `engine` — connessione persistente a Neon
- `SessionLocal` — factory di sessioni (una per richiesta HTTP)
- `get_db()` — dependency FastAPI, chiude la sessione a fine richiesta
- `check_database_connection()` — esegue `SELECT 1` per verificare che Neon risponda

---

## Passo 7 — Crea `app/models/brief.py`

Crea `backend/app/models/brief.py`:

```python
import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Brief(Base):
    __tablename__ = "briefs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    client_name: Mapped[str | None] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    brief_text: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    risk_level: Mapped[str | None] = mapped_column(String(50))
    complexity: Mapped[str | None] = mapped_column(String(50))
    estimated_effort: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
```

**Cosa fa:** mappa la tabella `briefs` che hai creato in Fase 1. Non crea la tabella (esiste gia su Neon); serve per le fasi successive.

---

## Passo 8 — Crea `app/__init__.py`

Crea `backend/app/__init__.py` — file vuoto (serve a Python per trattare `app` come package).

---

## Passo 9 — Crea `app/main.py`

Crea `backend/app/main.py`:

```python
from fastapi import FastAPI, HTTPException

from app.db.database import check_database_connection

app = FastAPI(title="BriefScope AI", version="0.1.0")


@app.get("/health")
def health():
    try:
        check_database_connection()
        return {"status": "ok", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database connection failed")
```

**Cosa fa:**
- `GET /health` — endpoint di controllo
- Se Neon risponde: `200` con `{"status": "ok", "database": "connected"}`
- Se Neon non risponde: `503` con errore

---

## Passo 10 — Avvia il server

Assicurati di essere in `backend/` con venv attivo:

```bash
cd /Users/vincenzo/Desktop/websites/briefscope-ai/backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Significato del comando:**
- `app.main:app` — modulo `app.main`, variabile `app`
- `--reload` — riavvia automaticamente se modifichi i file
- `--port 8000` — ascolta su localhost:8000

Il server resta in esecuzione finche non premi `Ctrl+C`.

---

## Passo 11 — Verifica

Apri un **secondo terminale** e esegui:

```bash
curl http://localhost:8000/health
```

**Risultato atteso:**

```json
{"status":"ok","database":"connected"}
```

Apri anche nel browser:

- http://localhost:8000/health
- http://localhost:8000/docs — documentazione automatica Swagger di FastAPI

---

## Passo 12 — Verifica che legge i brief (opzionale ma utile)

Per confermare che SQLAlchemy parla davvero con Neon, aggiungi temporaneamente in `main.py` (sotto `/health`):

```python
from sqlalchemy.orm import Session
from fastapi import Depends

from app.db.database import get_db
from app.models.brief import Brief


@app.get("/health/briefs-count")
def briefs_count(db: Session = Depends(get_db)):
    count = db.query(Brief).count()
    return {"count": count}
```

Riavvia (o aspetta il reload) e prova:

```bash
curl http://localhost:8000/health/briefs-count
```

**Risultato atteso:** `{"count": 3}` (i 3 brief inseriti in Fase 1).

Questo endpoint e solo per test. In Fase 3 lo sostituirai con il CRUD vero `GET /briefs`.

---

## Cosa impari in questa fase (per il CV)

- **Python**: virtualenv, package structure
- **FastAPI**: routing, dependency injection, auto-docs Swagger
- **Pydantic Settings**: gestione variabili d'ambiente
- **SQLAlchemy**: engine, session, ORM model mapping
- **REST**: endpoint health check, status HTTP 200 vs 503
- **PostgreSQL via Neon**: connessione da codice Python

---

## Mini-quiz CV

1. **Perche usiamo un virtualenv?**
   Isola le dipendenze del progetto evitando conflitti con altre versioni Python/librerie sul sistema.

2. **Qual e la differenza tra modello SQLAlchemy e schema Pydantic?**
   Il modello SQLAlchemy mappa la tabella DB (persistenza). Lo schema Pydantic valida input/output API (lo userai in Fase 3). Sono layer separati.

3. **Cosa fa `pool_pre_ping=True` nell'engine?**
   Verifica che la connessione sia viva prima di usarla. Utile con Neon che puo sospendere connessioni idle.

---

## Checkpoint Fase 2

Segna completata la fase solo se tutti questi punti sono veri:

- [ ] Virtualenv creato e attivato
- [ ] `pip install -r requirements.txt` senza errori
- [ ] Tutti i file Python creati nella struttura corretta
- [ ] `uvicorn` avviato su porta 8000
- [ ] `curl http://localhost:8000/health` restituisce `"database": "connected"`
- [ ] `/docs` si apre nel browser

Quando hai finito, scrivi in chat: **"Fase 2 completata"**.

Passeremo alla **Fase 3**: ti generero `docs/phase-3-crud-briefs.md` con CRUD completo su `/briefs`.

---

## Troubleshooting

| Errore | Causa probabile | Soluzione |
|--------|-----------------|-----------|
| `ModuleNotFoundError: No module named 'app'` | Terminale non in `backend/` | `cd backend` e riavvia uvicorn |
| `ValidationError: database_url` | `.env` mancante o senza `DATABASE_URL` | Verifica `backend/.env` |
| `503 Database connection failed` | Connection string errata o Neon spento | Ricopia stringa da Neon dashboard |
| `No module named 'psycopg2'` | Dipendenze non installate | `pip install -r requirements.txt` con venv attivo |
| `Address already in use :8000` | Porta occupata | `uvicorn ... --port 8001` oppure chiudi il processo sulla 8000 |
| `curl: command not found` | curl non installato | Usa il browser su http://localhost:8000/health |

---

## Nota su Neon e SSL

Se la connection string usa `postgresql://` e la connessione fallisce, prova a sostituire il prefisso con `postgresql+psycopg2://` nel `.env`. Neon accetta entrambi nella maggior parte dei casi.
