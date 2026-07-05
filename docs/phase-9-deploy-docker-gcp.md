# Fase 9 — Deploy con Docker + Google Cloud Run

## Obiettivo

Deployare il backend FastAPI su Google Cloud Run usando Docker.

**Skill per il CV:** Docker, Google Cloud Platform, Cloud Run, Artifact Registry, CI/CD

---

## Prerequisiti

- Account Google (Gmail)
- Docker Desktop installato
- Google Cloud CLI installato

---

## Step 1: Installa gli strumenti

### 1.1 Google Cloud CLI

```bash
brew install google-cloud-sdk
```

Verifica:
```bash
gcloud --version
```

### 1.2 Docker Desktop

```bash
brew install --cask docker
```

**IMPORTANTE:** Dopo l'installazione, apri Docker Desktop dalle Applicazioni e aspetta che sia pronto (icona stabile nella barra menu).

---

## Step 2: Login e Setup Progetto Google Cloud

### 2.1 Login

```bash
gcloud auth login
```

Si apre il browser → accedi con Google.

### 2.2 Crea progetto

```bash
gcloud projects create briefscope-ai-prod --name="BriefScope AI"
```

### 2.3 Imposta come progetto default

```bash
gcloud config set project briefscope-ai-prod
```

---

## Step 3: Configura Billing

Google richiede billing anche per il free tier (non addebita nulla se resti nei limiti).

### 3.1 Vedi i tuoi account billing

```bash
gcloud billing accounts list
```

Output esempio:
```
ACCOUNT_ID            NAME                    OPEN
01A0EB-D000BD-DA1A67  Account fatturazione    True
```

### 3.2 Collega billing al progetto

```bash
gcloud billing projects link briefscope-ai-prod --billing-account=IL_TUO_ACCOUNT_ID
```

### 3.3 Imposta Budget Alert (IMPORTANTE!)

1. Vai su https://console.cloud.google.com
2. Menu (☰) → **Fatturazione** → **Budget e avvisi**
3. Clicca **"+ Crea budget"**
4. Configura:
   - Nome: `BriefScope Limite`
   - Importo: `1 €`
   - Soglie: 50%, 90%, 100%
5. Attiva notifiche email

---

## Step 4: Abilita API necessarie

```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com
```

---

## Step 5: Crea Repository Docker

### 5.1 Crea repository su Artifact Registry

```bash
gcloud artifacts repositories create briefscope-repo \
    --repository-format=docker \
    --location=europe-west1 \
    --description="BriefScope AI Docker images"
```

### 5.2 Configura Docker per usare Google Cloud

```bash
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

Quando chiede conferma, scrivi `Y` e premi Invio.

### 5.3 Verifica su console

Vai su: https://console.cloud.google.com/artifacts?project=briefscope-ai-prod

Vedrai `briefscope-repo` nella lista (Menu → Artifact Registry).

---

## Step 6: Build e Push Docker Image

### 6.1 Assicurati che Docker Desktop sia avviato

Apri Docker Desktop e aspetta che sia pronto.

### 6.2 Vai nella cartella backend

```bash
cd /Users/vincenzo/Desktop/websites/briefscope-ai/backend
```

### 6.3 Build dell'immagine

```bash
docker build -t europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest .
```

Aspetta 1-2 minuti. Vedrai `Step 1/6`, `Step 2/6`, ecc.

### 6.4 Push su Google Cloud

```bash
docker push europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest
```

Aspetta 2-3 minuti per l'upload.

---

## Step 7: Deploy su Cloud Run

```bash
gcloud run deploy briefscope-backend \
    --image=europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest \
    --region=europe-west1 \
    --platform=managed \
    --allow-unauthenticated \
    --min-instances=0 \
    --max-instances=1 \
    --memory=256Mi \
    --port=8080 \
    --set-env-vars="DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require" \
    --set-env-vars="LLM_API_KEY=sk-your-openai-key" \
    --set-env-vars="LLM_MODEL=gpt-4o-mini"
```

**IMPORTANTE:** Sostituisci:
- `DATABASE_URL` con la tua connection string di Neon
- `LLM_API_KEY` con la tua API key OpenAI

### Output

```
Service URL: https://briefscope-backend-xxxxxx-ew.a.run.app
```

**Questo è l'URL del tuo backend!**

---

## Step 8: Testa il Deploy

```bash
curl https://briefscope-backend-xxxxxx-ew.a.run.app/health
```

Risposta attesa:
```json
{"status":"ok","database":"connected"}
```

Puoi anche aprire nel browser:
```
https://briefscope-backend-xxxxxx-ew.a.run.app/docs
```

Vedrai Swagger con tutte le API.

---

## Step 9: Deploy Frontend su Vercel

### 9.1 Aggiorna URL backend

Modifica `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=https://briefscope-backend-xxxxxx-ew.a.run.app
```

### 9.2 Installa Vercel CLI

```bash
npm install -g vercel
```

### 9.3 Deploy

```bash
cd /Users/vincenzo/Desktop/websites/briefscope-ai/frontend
vercel
```

Segui le istruzioni:
- Link to existing project? **No**
- Project name: **briefscope-ai**
- Directory: **./**
- Override settings? **No**

### 9.4 Configura variabili su Vercel

1. Vai su https://vercel.com/dashboard
2. Seleziona il progetto `briefscope-ai`
3. **Settings** → **Environment Variables**
4. Aggiungi:
   - `NEXT_PUBLIC_API_URL` = `https://briefscope-backend-xxxxxx-ew.a.run.app`
5. **Redeploy** per applicare le variabili

---

## Comandi Utili

### Aggiornare il backend dopo modifiche

```bash
cd /Users/vincenzo/Desktop/websites/briefscope-ai/backend

# Rebuild
docker build -t europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest .

# Push
docker push europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest

# Redeploy
gcloud run deploy briefscope-backend \
    --image=europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest \
    --region=europe-west1
```

### Vedere i log

```bash
gcloud run logs read --service=briefscope-backend --region=europe-west1 --limit=50
```

### Vedere stato servizio

```bash
gcloud run services describe briefscope-backend --region=europe-west1
```

### Vedere URL del servizio

```bash
gcloud run services describe briefscope-backend --region=europe-west1 --format='value(status.url)'
```

---

## Dove vedere tutto su Console

| Cosa | Link |
|------|------|
| **Cloud Run (servizi)** | https://console.cloud.google.com/run?project=briefscope-ai-prod |
| **Artifact Registry (immagini)** | https://console.cloud.google.com/artifacts?project=briefscope-ai-prod |
| **Logs** | https://console.cloud.google.com/logs?project=briefscope-ai-prod |
| **Billing** | https://console.cloud.google.com/billing?project=briefscope-ai-prod |
| **Budget** | https://console.cloud.google.com/billing/budgets?project=briefscope-ai-prod |

---

## Troubleshooting

### Errore: "Billing account not found"

```bash
gcloud billing accounts list
gcloud billing projects link briefscope-ai-prod --billing-account=IL_TUO_ACCOUNT_ID
```

### Errore: "Cannot connect to Docker daemon"

Docker Desktop non è avviato. Aprilo dalle Applicazioni e aspetta che sia pronto.

### Errore: "Permission denied" su gcloud

```bash
gcloud auth login
gcloud config set project briefscope-ai-prod
```

### Errore: "Image not found" durante deploy

```bash
gcloud auth configure-docker europe-west1-docker.pkg.dev
docker push europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest
```

### Errore: Database connection failed

Verifica che `DATABASE_URL` sia corretto:
```bash
gcloud run services update briefscope-backend \
    --region=europe-west1 \
    --set-env-vars="DATABASE_URL=postgresql://..."
```

---

## Costi

### Google Cloud Run - Free Tier (mensile)

| Risorsa | Limite Gratis |
|---------|---------------|
| Richieste | 2 milioni |
| CPU | 180.000 vCPU-secondi |
| Memoria | 360.000 GB-secondi |
| Networking | 1 GB |

### Vercel - Free Tier

| Risorsa | Limite |
|---------|--------|
| Bandwidth | 100 GB |
| Deploys | Illimitati |
| Progetti | Illimitati |

**Per un portfolio: $0/mese**

---

## Cosa scrivere nel CV

```
DevOps & Cloud:
• Docker (containerizzazione applicazioni Python)
• Google Cloud Platform (Cloud Run, Artifact Registry)
• Vercel (deploy frontend Next.js)
• CI/CD deployment pipelines

Backend:
• Python, FastAPI, SQLAlchemy
• PostgreSQL (Neon serverless)
• OpenAI API integration

Frontend:
• Next.js 15, React, TypeScript
• Tailwind CSS, Framer Motion
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
