# Fase 9 — Deploy con Docker + Google Cloud Run

## Obiettivo

Deployare il backend FastAPI su Google Cloud Run usando Docker.

**Skill per il CV:** Docker, Google Cloud Platform, Cloud Run, Artifact Registry, CI/CD

---

## Prerequisiti

- Account Google (Gmail)
- Docker Desktop installato
- Google Cloud CLI installato
- Mac con Apple Silicon (M1/M2/M3) o Intel

---

## COMANDI RAPIDI (Riferimento Veloce)

Se hai già tutto configurato, ecco i comandi per il deploy:

```bash
cd /Users/vincenzo/Desktop/websites/briefscope-ai/backend

# 1. Build (IMPORTANTE: --platform per Mac Apple Silicon)
docker build --platform linux/amd64 -t europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest .

# 2. Push
docker push europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest

# 3. Deploy con env vars
gcloud run deploy briefscope-backend \
    --image=europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest \
    --region=europe-west1 \
    --platform=managed \
    --allow-unauthenticated \
    --min-instances=0 \
    --max-instances=1 \
    --memory=512Mi \
    --port=8080 \
    --set-env-vars='^##^DATABASE_URL=TUA_NEON_URL##LLM_API_KEY=TUA_OPENAI_KEY##LLM_MODEL=gpt-4o-mini'
```

---

## Setup Iniziale (Prima Volta)

### Step 1: Installa gli strumenti

#### Google Cloud CLI

```bash
brew install google-cloud-sdk
gcloud --version
```

#### Docker Desktop

```bash
brew install --cask docker
```

**IMPORTANTE:** Apri Docker Desktop dalle Applicazioni e aspetta che sia pronto (icona stabile).

---

### Step 2: Login e Setup Progetto

```bash
# Login
gcloud auth login

# Crea progetto
gcloud projects create briefscope-ai-prod --name="BriefScope AI"

# Imposta come default
gcloud config set project briefscope-ai-prod
```

---

### Step 3: Configura Billing

```bash
# Vedi account billing
gcloud billing accounts list
```

Output:
```
ACCOUNT_ID            NAME                    OPEN
01A0EB-D000BD-DA1A67  Account fatturazione    True
```

```bash
# Collega al progetto (usa l'ID con OPEN=True)
gcloud billing projects link briefscope-ai-prod --billing-account=01A0EB-D000BD-DA1A67
```

#### Imposta Budget Alert (IMPORTANTE per non pagare!)

1. Vai su https://console.cloud.google.com
2. Menu (☰) → **Fatturazione** → **Budget e avvisi**
3. Clicca **"+ Crea budget"**
4. Configura:
   - Nome: `BriefScope Limite`
   - Importo: `1 €`
   - Soglie: 50%, 90%, 100%
5. Attiva notifiche email

---

### Step 4: Abilita API

```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com
```

---

### Step 5: Crea Repository Docker

```bash
# Crea repository
gcloud artifacts repositories create briefscope-repo \
    --repository-format=docker \
    --location=europe-west1 \
    --description="BriefScope AI Docker images"

# Configura Docker per usare Google Cloud
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

Scrivi `Y` quando chiede conferma.

---

## Build e Deploy

### Step 6: Build Docker Image

**IMPORTANTE PER MAC APPLE SILICON (M1/M2/M3):**

```bash
cd /Users/vincenzo/Desktop/websites/briefscope-ai/backend

# Build per architettura Cloud Run (linux/amd64)
docker build --platform linux/amd64 -t europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest .
```

> **ATTENZIONE:** Se non usi `--platform linux/amd64` su Mac Apple Silicon, otterrai errore `exec format error` su Cloud Run!

---

### Step 7: Push su Google Cloud

```bash
docker push europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest
```

---

### Step 8: Deploy su Cloud Run

```bash
gcloud run deploy briefscope-backend \
    --image=europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest \
    --region=europe-west1 \
    --platform=managed \
    --allow-unauthenticated \
    --min-instances=0 \
    --max-instances=1 \
    --memory=512Mi \
    --port=8080 \
    --set-env-vars='^##^DATABASE_URL=postgresql://USER:PASS@HOST/DB?sslmode=require##LLM_API_KEY=sk-xxx##LLM_MODEL=gpt-4o-mini'
```

**Nota sulla sintassi env vars:**
- `^##^` indica che `##` è il separatore tra variabili
- Questo evita problemi con caratteri speciali come `?` e `=` nella DATABASE_URL

**Output atteso:**
```
Service URL: https://briefscope-backend-xxxxxx-ew.a.run.app
```

---

### Step 9: Verifica Deploy

```bash
# Test health
curl https://briefscope-backend-xxxxxx-ew.a.run.app/health
```

Risposta attesa:
```json
{"status":"ok","database":"connected"}
```

Apri Swagger:
```
https://briefscope-backend-xxxxxx-ew.a.run.app/docs
```

---

## Troubleshooting e Debug

### Dove vedere i log

1. **Console Google Cloud:**
   https://console.cloud.google.com/logs?project=briefscope-ai-prod

2. **Da terminale:**
   ```bash
   gcloud run services logs read briefscope-backend --region=europe-west1 --limit=50
   ```

3. **Link diretto dai log di errore:**
   Quando il deploy fallisce, copia il "Logs URL" dall'errore e aprilo nel browser.

---

### Errori Comuni e Soluzioni

#### Errore: "Billing account not found"

```
FAILED_PRECONDITION: Billing account for project 'xxx' is not found
```

**Soluzione:**
```bash
gcloud billing accounts list
gcloud billing projects link briefscope-ai-prod --billing-account=IL_TUO_ACCOUNT_ID
```

---

#### Errore: "Cannot connect to Docker daemon"

```
Cannot connect to the Docker daemon at unix:///Users/xxx/.docker/run/docker.sock
```

**Soluzione:**
Apri Docker Desktop dalle Applicazioni e aspetta che sia pronto.

---

#### Errore: "exec format error" (COMUNE SU MAC M1/M2/M3!)

```
terminated: Application failed to start: failed to load /bin/sh: exec format error
```

**Causa:** L'immagine è stata compilata per ARM (Mac Apple Silicon) ma Cloud Run usa AMD64.

**Soluzione:**
```bash
docker build --platform linux/amd64 -t nome-immagine .
```

---

#### Errore: "Container failed to start - port 8080"

```
The user-provided container failed to start and listen on the port defined by PORT=8080
```

**Possibili cause:**
1. App crasha all'avvio (variabili d'ambiente mancanti)
2. Timeout troppo breve
3. Architettura sbagliata (vedi errore sopra)

**Debug:**
1. Testa in locale prima:
   ```bash
   docker run -p 8081:8080 \
     -e DATABASE_URL="..." \
     -e LLM_API_KEY="..." \
     -e LLM_MODEL="gpt-4o-mini" \
     nome-immagine
   ```

2. Controlla i log su Google Cloud Console

3. Verifica che tutte le env vars siano passate correttamente

---

#### Errore: "Port already allocated" (locale)

```
Bind for 0.0.0.0:8080 failed: port is already allocated
```

**Soluzione:**
```bash
# Usa porta diversa
docker run -p 8081:8080 ...

# Oppure ferma tutti i container
docker stop $(docker ps -q)
```

---

#### Errore: "Permission denied" su gcloud

**Soluzione:**
```bash
gcloud auth login
gcloud config set project briefscope-ai-prod
```

---

## Comandi Utili

### Aggiornare dopo modifiche al codice

```bash
cd /Users/vincenzo/Desktop/websites/briefscope-ai/backend

# Rebuild (ricorda --platform su Mac M1/M2/M3!)
docker build --platform linux/amd64 -t europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest .

# Push
docker push europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest

# Redeploy
gcloud run deploy briefscope-backend \
    --image=europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest \
    --region=europe-west1
```

### Vedere i log

```bash
gcloud run services logs read briefscope-backend --region=europe-west1 --limit=50
```

### Vedere URL del servizio

```bash
gcloud run services describe briefscope-backend --region=europe-west1 --format='value(status.url)'
```

### Aggiornare variabili d'ambiente

```bash
gcloud run services update briefscope-backend \
    --region=europe-west1 \
    --set-env-vars="NUOVA_VAR=valore"
```

### Eliminare il servizio

```bash
gcloud run services delete briefscope-backend --region=europe-west1
```

---

## Console Google Cloud (Link Utili)

| Cosa | Link |
|------|------|
| **Cloud Run** | https://console.cloud.google.com/run?project=briefscope-ai-prod |
| **Artifact Registry** | https://console.cloud.google.com/artifacts?project=briefscope-ai-prod |
| **Logs** | https://console.cloud.google.com/logs?project=briefscope-ai-prod |
| **Fatturazione** | https://console.cloud.google.com/billing?project=briefscope-ai-prod |
| **Budget** | https://console.cloud.google.com/billing/budgets?project=briefscope-ai-prod |

---

## Deploy Frontend su Vercel

Guida completa: **`docs/phase-10-deploy-vercel.md`**

| Servizio | URL produzione |
|----------|----------------|
| Frontend | https://briefgen-ai.vercel.app |
| Backend | https://briefscope-backend-949475606814.europe-west1.run.app |

Dopo il deploy frontend, aggiorna CORS su Cloud Run:

```bash
gcloud run services update briefscope-backend \
  --region europe-west1 \
  --update-env-vars "FRONTEND_URL=https://briefgen-ai.vercel.app"
```

---

## Costi

### Free Tier Mensile

| Servizio | Limite Gratis |
|----------|---------------|
| Cloud Run | 2M richieste, 180k vCPU-sec |
| Artifact Registry | 500MB storage |
| Vercel | 100GB bandwidth |

**Per un portfolio: $0/mese**

---

## Dockerfile Finale

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
```

---

## Architettura Finale

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│     Vercel      │────▶│  Cloud Run      │────▶│     Neon        │
│   (Frontend)    │     │   (Backend)     │     │  (PostgreSQL)   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     Next.js              FastAPI/Docker           Database
                               │
                               ▼
                        ┌─────────────────┐
                        │                 │
                        │    OpenAI       │
                        │     API         │
                        │                 │
                        └─────────────────┘
```

---

## Cosa scrivere nel CV

```
DevOps & Cloud:
• Docker (containerizzazione, multi-arch build)
• Google Cloud Platform (Cloud Run, Artifact Registry)
• CI/CD deployment pipelines
• Vercel (deploy frontend)

Backend:
• Python, FastAPI, SQLAlchemy
• PostgreSQL (Neon serverless)
• OpenAI API integration
• RESTful API design

Frontend:
• Next.js 15, React, TypeScript
• Tailwind CSS, Framer Motion
• Responsive design
```
