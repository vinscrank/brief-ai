# Fase 9 — Deploy con Docker + Google Cloud Run

## Obiettivo

Deployare il backend FastAPI su Google Cloud Run usando Docker. 
Aggiunge al CV: **Docker, Google Cloud Platform, Cloud Run, Container Registry**.

---

## Prerequisiti

1. Account Google Cloud (usa lo stesso di Gmail)
2. Google Cloud CLI installato
3. Docker installato

---

## Step 1: Installa Google Cloud CLI

### macOS
```bash
brew install google-cloud-sdk
```

### Verifica installazione
```bash
gcloud --version
```

---

## Step 2: Login e setup progetto

```bash
# Login con Google
gcloud auth login

# Crea nuovo progetto (scegli un nome unico)
gcloud projects create briefscope-ai-prod --name="BriefScope AI"

# Imposta il progetto come default
gcloud config set project briefscope-ai-prod

# Abilita le API necessarie
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

---

## Step 3: Crea repository per Docker images

```bash
# Crea repository su Artifact Registry
gcloud artifacts repositories create briefscope-repo \
    --repository-format=docker \
    --location=europe-west1 \
    --description="BriefScope AI Docker images"

# Configura Docker per usare Artifact Registry
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

---

## Step 4: Build e push Docker image

```bash
# Vai nella cartella backend
cd backend

# Build immagine Docker
docker build -t europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest .

# Push su Artifact Registry
docker push europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest
```

---

## Step 5: Deploy su Cloud Run

```bash
gcloud run deploy briefscope-backend \
    --image=europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest \
    --region=europe-west1 \
    --platform=managed \
    --allow-unauthenticated \
    --set-env-vars="DATABASE_URL=your-neon-connection-string" \
    --set-env-vars="LLM_API_KEY=your-openai-key" \
    --set-env-vars="LLM_MODEL=gpt-4o-mini"
```

**Output:** riceverai un URL tipo `https://briefscope-backend-xxxxx-ew.a.run.app`

---

## Step 6: Testa il deploy

```bash
# Health check
curl https://briefscope-backend-xxxxx-ew.a.run.app/health

# Deve rispondere: {"status":"ok","database":"connected"}
```

---

## Step 7: Deploy Frontend su Vercel

### 7.1 Aggiorna l'URL del backend

Modifica `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=https://briefscope-backend-xxxxx-ew.a.run.app
```

### 7.2 Aggiorna CORS nel backend

In `backend/app/main.py`, aggiungi il dominio Vercel:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://briefscope-ai.vercel.app",  # Aggiungi il tuo dominio
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 7.3 Deploy su Vercel

```bash
# Installa Vercel CLI
npm install -g vercel

# Vai nella cartella frontend
cd frontend

# Deploy
vercel

# Segui le istruzioni:
# - Link to existing project? No
# - Project name: briefscope-ai
# - Directory: ./
# - Override settings? No
```

---

## Step 8: Configura variabili su Vercel

1. Vai su https://vercel.com/dashboard
2. Seleziona il progetto
3. Settings → Environment Variables
4. Aggiungi:
   - `NEXT_PUBLIC_API_URL` = `https://briefscope-backend-xxxxx-ew.a.run.app`

---

## Comandi utili

### Aggiornare il backend dopo modifiche
```bash
cd backend
docker build -t europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest .
docker push europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest
gcloud run deploy briefscope-backend --image=europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest --region=europe-west1
```

### Vedere i log
```bash
gcloud run logs read --service=briefscope-backend --region=europe-west1
```

### Vedere lo stato del servizio
```bash
gcloud run services describe briefscope-backend --region=europe-west1
```

---

## Costi

### Google Cloud Run (Free Tier)
- 2 milioni di richieste/mese
- 360.000 GB-secondi di memoria
- 180.000 vCPU-secondi
- **Per un portfolio: $0**

### Vercel (Free Tier)
- 100GB bandwidth
- Unlimited deploys
- **Per un portfolio: $0**

---

## Cosa scrivere nel CV

```
Backend: Python, FastAPI, Docker, Google Cloud Run
Frontend: Next.js, React, TypeScript, Vercel
Database: PostgreSQL (Neon serverless)
AI: OpenAI API, LLM integration
DevOps: Docker, GCP, CI/CD
```

---

## Troubleshooting

### Errore "Permission denied"
```bash
gcloud auth login
gcloud config set project briefscope-ai-prod
```

### Errore "Image not found"
```bash
gcloud auth configure-docker europe-west1-docker.pkg.dev
docker push europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest
```

### Errore database connection
Verifica che `DATABASE_URL` sia corretto nelle env vars di Cloud Run.

### Vedere errori del container
```bash
gcloud run logs read --service=briefscope-backend --region=europe-west1 --limit=50
```
