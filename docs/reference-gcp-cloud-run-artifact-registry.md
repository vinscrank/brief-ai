# Riferimento — Google Cloud Run e Artifact Registry

Guida teorica e pratica sui servizi GCP usati per il deploy del backend BriefScope.

**Skill per il CV:** Docker, GCP (Google Cloud Platform), Google Cloud Run, Artifact Registry

**Guida operativa deploy:** vedi `docs/phase-9-deploy-docker-gcp.md`

---

## Indice

1. [Panoramica GCP](#panoramica-gcp)
2. [Docker: il container](#docker-il-container)
3. [Artifact Registry: il magazzino](#artifact-registry-il-magazzino)
4. [Cloud Run: il runtime](#cloud-run-il-runtime)
5. [Come lavorano insieme](#come-lavorano-insieme)
6. [Il tuo setup BriefScope](#il-tuo-setup-briefscope)
7. [Comandi spiegati uno per uno](#comandi-spiegati-uno-per-uno)
8. [Concetti chiave Cloud Run](#concetti-chiave-cloud-run)
9. [GCR vs Artifact Registry](#gcr-vs-artifact-registry)
10. [Confronto con alternative](#confronto-con-alternative)
11. [Costi e free tier](#costi-e-free-tier)
12. [Cosa scrivere nel CV](#cosa-scrivere-nel-cv)
13. [Glossario](#glossario)
14. [Mini-quiz](#mini-quiz)

---

## Panoramica GCP

**GCP** (Google Cloud Platform) e l'insieme dei servizi cloud di Google. Non e un singolo prodotto: e la piattaforma su cui girano servizi come Cloud Run, Artifact Registry, Cloud Storage, BigQuery, ecc.

Nel progetto BriefScope usi solo una piccola parte di GCP:

| Servizio GCP | Ruolo nel progetto |
|--------------|-------------------|
| **Artifact Registry** | Conserva l'immagine Docker del backend |
| **Cloud Run** | Esegue il container e espone l'API pubblica |
| **Billing / IAM** | Account, permessi, fatturazione del progetto |

**Non usi** (in questo progetto): Kubernetes (GKE), Compute Engine (VM), App Engine, Cloud Functions.

```
                    GOOGLE CLOUD PLATFORM (GCP)
    ┌─────────────────────────────────────────────────────────┐
    │                                                         │
    │   Artifact Registry          Cloud Run                  │
    │   (immagine Docker)    →     (esegue FastAPI)           │
    │                                                         │
    │   Progetto: briefscope-ai-prod                        │
    │   Regione: europe-west1 (Belgio)                      │
    └─────────────────────────────────────────────────────────┘
              │                              │
              │                              ├──→ Neon (PostgreSQL, esterno)
              │                              └──→ OpenAI API (esterno)
```

---

## Docker: il container

Prima di Cloud Run e Artifact Registry serve **Docker**.

Un **container** e un pacchetto che contiene:
- il codice dell'app (`backend/app/`)
- le dipendenze Python (`requirements.txt`)
- il comando di avvio (`uvicorn`)

Il file `backend/Dockerfile` e la "ricetta" per costruire l'immagine:

```dockerfile
FROM python:3.11-slim          # sistema operativo minimale + Python
WORKDIR /app                   # cartella di lavoro nel container
COPY requirements.txt .
RUN pip install -r requirements.txt   # installa dipendenze
COPY . .                       # copia il codice
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
```

| Concetto | Significato |
|----------|-------------|
| **Dockerfile** | Istruzioni per costruire l'immagine |
| **Immagine (image)** | Il pacchetto pronto, immutabile, versionabile |
| **Container** | Un'istanza in esecuzione dell'immagine |
| **Build** | `docker build` crea l'immagine dal Dockerfile |
| **Tag** | Etichetta dell'immagine, es. `backend:latest` |

In locale fai `docker build` sul tuo Mac. In produzione Cloud Run esegue quella stessa immagine su server Google.

---

## Artifact Registry: il magazzino

**Google Artifact Registry** e il servizio GCP dove **pubblichi e conservi** le immagini Docker (e altri artifact: npm, Maven, ecc.).

### Perche serve

Cloud Run non legge il codice dal tuo computer. Deve scaricare l'immagine da un registro accessibile su internet. Artifact Registry e quel registro, integrato con GCP.

### Analogia

| Mondo reale | GCP |
|-------------|-----|
| Piatto cucinato | Immagine Docker (`docker build`) |
| Frigo / dispensa | Artifact Registry |
| Ristorante che serve | Cloud Run |

### Struttura del percorso immagine

```
europe-west1-docker.pkg.dev / briefscope-ai-prod / briefscope-repo / backend : latest
        │                            │                    │              │        │
     regione                    progetto GCP          repository      nome    tag
```

| Parte | Valore BriefScope | Significato |
|-------|-------------------|-------------|
| Host | `europe-west1-docker.pkg.dev` | Registry nella regione `europe-west1` |
| Progetto | `briefscope-ai-prod` | Il progetto GCP |
| Repository | `briefscope-repo` | Cartella logica per le immagini |
| Immagine | `backend` | Nome dell'app |
| Tag | `latest` | Versione (ultima build) |

### Operazioni principali

```bash
# Crea il repository (una volta sola)
gcloud artifacts repositories create briefscope-repo \
    --repository-format=docker \
    --location=europe-west1

# Autentica Docker verso GCP
gcloud auth configure-docker europe-west1-docker.pkg.dev

# Push dell'immagine dopo il build
docker push europe-west1-docker.pkg.dev/briefscope-ai-prod/briefscope-repo/backend:latest
```

Dopo il push, l'immagine e salvata su Google. Cloud Run puo riferirsi a quell'URL per il deploy.

### Cosa non fa Artifact Registry

- Non esegue il codice
- Non espone URL HTTP al pubblico
- Non scala istanze

Fa solo da **storage versionato** per le immagini.

---

## Cloud Run: il runtime

**Google Cloud Run** e un servizio **serverless per container**. Prende un'immagine Docker e la esegue su infrastruttura gestita da Google, senza che tu crei o amministri server.

### Cosa fa per te

- Avvia il container quando arrivano richieste HTTP
- Assegna un URL HTTPS pubblico (es. `https://briefscope-backend-....run.app`)
- Scala da 0 a N istanze in base al traffico
- Gestisce TLS/HTTPS automaticamente
- Inietta variabili d'ambiente (`DATABASE_URL`, `LLM_API_KEY`, `FRONTEND_URL`)
- Monitora log e metriche

### Cosa non devi fare

- Non installi Linux su una VM
- Non configuri nginx o load balancer manualmente
- Non gestisci Kubernetes
- Non fai SSH su un server

### Modello serverless

| Aspetto | Comportamento |
|---------|---------------|
| **Scale to zero** | Con `min-instances=0`, a riposo non paghi istanze attive |
| **Cold start** | Prima richiesta dopo idle puo essere piu lenta (avvio container) |
| **Pay per use** | Paghi per richieste, CPU e memoria usate |
| **Stateless** | Ogni istanza e indipendente; lo stato sta su Neon, non nel container |

### Servizio BriefScope

| Parametro | Valore |
|-----------|--------|
| Nome servizio | `briefscope-backend` |
| Regione | `europe-west1` |
| Porta container | `8080` |
| Memoria | `512Mi` |
| Istanze | min 0, max 1 (portfolio) |
| Accesso | pubblico (`--allow-unauthenticated`) |

URL live: https://briefscope-backend-949475606814.europe-west1.run.app

---

## Come lavorano insieme

Flusso completo dal codice alla richiesta HTTP:

```
  SVILUPPO                    BUILD & PUSH                 DEPLOY                    RUNTIME

  backend/                    docker build                 gcloud run deploy         Utente / Frontend
  Dockerfile        →       docker push          →       (legge immagine      →   GET /briefs
  app/main.py                 Artifact Registry            da Registry)              POST /analyze
                                                                                      │
                                                                                      ▼
                                                                                 Neon + OpenAI
```

### Passo per passo

1. **Sviluppi** in locale con `uvicorn` (senza Docker, opzionale)
2. **Buildi** l'immagine: `docker build --platform linux/amd64 -t ... .`
3. **Pushi** su Artifact Registry: `docker push ...`
4. **Deployi** su Cloud Run: `gcloud run deploy ... --image=...`
5. Cloud Run **scarica** l'immagine dal Registry e **avvia** il container
6. Il frontend Vercel **chiama** l'URL Cloud Run
7. FastAPI nel container **legge/scrive** su Neon e **chiama** OpenAI

### Diagramma architettura produzione

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│     Vercel      │────▶│  Cloud Run      │────▶│     Neon        │
│   (Frontend)    │     │   (Backend)     │     │  (PostgreSQL)   │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
     Next.js              FastAPI/Docker           Database
                                  │
                    immagine da   │
                                  ▼
                         ┌─────────────────┐
                         │ Artifact        │     ┌─────────────────┐
                         │ Registry        │     │    OpenAI       │
                         └─────────────────┘     │     API         │
                                                 └─────────────────┘
```

---

## Il tuo setup BriefScope

Riepilogo di tutto cio che hai configurato:

| Elemento | Dettaglio |
|----------|-----------|
| Progetto GCP | `briefscope-ai-prod` |
| Regione | `europe-west1` |
| Repository Docker | `briefscope-repo` |
| Immagine | `backend:latest` |
| Servizio Cloud Run | `briefscope-backend` |
| URL API | https://briefscope-backend-949475606814.europe-west1.run.app |
| Env vars | `DATABASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `FRONTEND_URL` |

Console utili:
- Cloud Run: https://console.cloud.google.com/run?project=briefscope-ai-prod
- Artifact Registry: https://console.cloud.google.com/artifacts?project=briefscope-ai-prod

---

## Comandi spiegati uno per uno

### `docker build --platform linux/amd64 -t europe-west1-docker.pkg.dev/.../backend:latest .`

| Parte | Significato |
|-------|-------------|
| `docker build` | Costruisce l'immagine dal Dockerfile nella cartella corrente |
| `--platform linux/amd64` | Compila per CPU Intel/AMD (obbligatorio da Mac M1/M2/M3) |
| `-t ...` | Assegna il tag completo (destinazione Artifact Registry) |
| `.` | Contesto build = cartella `backend/` |

Senza `--platform linux/amd64` su Apple Silicon ottieni `exec format error` su Cloud Run.

### `docker push europe-west1-docker.pkg.dev/.../backend:latest`

Carica l'immagine locale su Artifact Registry. Dopo questo comando l'immagine e disponibile per Cloud Run.

### `gcloud run deploy briefscope-backend --image=...`

| Flag | Significato |
|------|-------------|
| `briefscope-backend` | Nome del servizio (crea o aggiorna) |
| `--image=...` | Quale immagine eseguire (da Artifact Registry) |
| `--region=europe-west1` | Dove gira il servizio |
| `--allow-unauthenticated` | API pubblica senza login Google |
| `--min-instances=0` | Scale to zero quando non usato |
| `--max-instances=1` | Limite istanze (portfolio) |
| `--memory=512Mi` | RAM per istanza |
| `--port=8080` | Porta esposta dal container |
| `--set-env-vars=...` | Variabili d'ambiente (DB, API key, CORS) |

### `gcloud run services update briefscope-backend --set-env-vars=FRONTEND_URL=...`

Aggiorna solo le variabili d'ambiente senza rifare build/push (es. dopo deploy frontend su Vercel per CORS).

---

## Concetti chiave Cloud Run

### PORT e uvicorn

Cloud Run imposta la variabile `PORT` (di solito 8080). Il Dockerfile usa:

```dockerfile
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
```

`0.0.0.0` significa "ascolta su tutte le interfacce" dentro il container (richiesto da Cloud Run).

### Revisioni

Ogni `gcloud run deploy` crea una **nuova revisione**. Puoi tornare a una revisione precedente dalla console se un deploy rompe qualcosa.

### Log

```bash
gcloud run services logs read briefscope-backend --region=europe-west1 --limit=50
```

I log del container (stdout/stderr di uvicorn/FastAPI) finiscono in Cloud Logging.

### CORS e FRONTEND_URL

Il backend legge `FRONTEND_URL` per accettare richieste dal browser. Deve coincidere con l'URL Vercel (`https://briefgen-ai.vercel.app`), altrimenti il browser blocca le chiamate API.

---

## GCR vs Artifact Registry

Spesso si confondono tre nomi:

| Nome | Cos'e | Stato |
|------|-------|-------|
| **GCR** (Google Container Registry) | Vecchio registry Docker su `gcr.io` | Deprecato, sostituito da Artifact Registry |
| **Artifact Registry** | Registry moderno su `*.pkg.dev` | Quello che usi tu |
| **Cloud Run** | Servizio che **esegue** i container | Diverso dal registry |

**GCR non e Cloud Run.** GCR/Artifact Registry = dove tieni l'immagine. Cloud Run = dove la fai girare.

Nel CV scrivi **Artifact Registry**, non GCR (a meno che non l'abbia usato davvero un progetto legacy).

---

## Confronto con alternative

| Approccio | Pro | Contro | BriefScope |
|-----------|-----|--------|------------|
| **Cloud Run** | Zero server, scale to zero, HTTPS incluso | Cold start, meno controllo | Si (backend) |
| **Vercel** | Ottimo per Next.js | Non per FastAPI Python long-running | Si (frontend) |
| **Railway / Render** | Setup semplice | Meno "enterprise GCP" | No |
| **Kubernetes (GKE)** | Massimo controllo | Complessita alta | No |
| **VM (Compute Engine)** | Controllo totale | Devi gestire OS, aggiornamenti, scaling | No |
| **Docker Hub** | Registry pubblico gratuito | Meno integrato con GCP | No (usi Artifact Registry) |

---

## Costi e free tier

Per un portfolio come BriefScope, il costo tipico e **$0/mese** nel free tier:

| Servizio | Free tier (indicativo) |
|----------|------------------------|
| Cloud Run | 2M richieste/mese, 180k vCPU-secondi |
| Artifact Registry | 500 MB storage |
| Neon | Tier free PostgreSQL |
| Vercel | Hobby free per frontend |

Cloud Run con `min-instances=0` e `max-instances=1` tiene i costi al minimo.

---

## Cosa scrivere nel CV

### Formulazione consigliata

```
DevOps & Cloud:
• Docker (containerizzazione, multi-arch build linux/amd64)
• Google Cloud Platform — Cloud Run, Artifact Registry
• Deploy serverless di API REST (FastAPI)
```

### Evita

- Solo "GCP" senza specificare Cloud Run
- "Kubernetes" (non l'hai usato)
- "GCR" (servizio vecchio; tu usi Artifact Registry)

### Domanda colloquio tipica

**"Come hai deployato il backend?"**

> Ho containerizzato l'API FastAPI con Docker, pubblicato l'immagine su Google Artifact Registry e deployato su Cloud Run in `europe-west1`. Il frontend su Vercel chiama l'URL HTTPS di Cloud Run; il database e su Neon e le variabili sensibili sono env vars sul servizio.

---

## Glossario

| Termine | Definizione |
|---------|-------------|
| **GCP** | Google Cloud Platform — piattaforma cloud di Google |
| **Progetto** | Contenitore logico su GCP (billing, IAM, risorse). Es: `briefscope-ai-prod` |
| **Regione** | Data center geografico. Es: `europe-west1` (Belgio) |
| **Docker** | Piattaforma per creare ed eseguire container |
| **Immagine** | Template read-only per i container |
| **Artifact Registry** | Registry GCP per immagini Docker e altri pacchetti |
| **Cloud Run** | Servizio serverless che esegue container HTTP |
| **gcloud** | CLI ufficiale per gestire risorse GCP |
| **Revisione** | Versione deployata di un servizio Cloud Run |
| **Scale to zero** | Nessuna istanza attiva quando non ci sono richieste |
| **Cold start** | Ritardo al primo avvio dopo idle |
| **Env vars** | Variabili d'ambiente nel container (segreti, URL, config) |

---

## Mini-quiz

1. **Qual e la differenza tra Artifact Registry e Cloud Run?**
   Artifact Registry conserva l'immagine Docker; Cloud Run la scarica e la esegue come servizio HTTP.

2. **Perche serve `docker push` prima del deploy?**
   Perche Cloud Run deve leggere l'immagine da un registry remoto, non dal tuo Mac.

3. **Perche `--platform linux/amd64` su Mac Apple Silicon?**
   Cloud Run gira su CPU AMD64; un'immagine ARM compilata localmente non parte (`exec format error`).

4. **Dove vivono DATABASE_URL e LLM_API_KEY in produzione?**
   Come variabili d'ambiente sul servizio Cloud Run (`--set-env-vars`), non dentro l'immagine Docker.

5. **Cloud Run e Kubernetes?**
   No. Cloud Run e serverless gestito; Kubernetes richiede cluster e manifest/yaml. Stesso concetto (container), complessita diversa.

6. **Cosa significa GCR e cosa usi tu?**
   GCR = vecchio Google Container Registry (`gcr.io`). Tu usi **Artifact Registry** (`*.pkg.dev`).

---

## Prossimi passi

- Deploy operativo: `docs/phase-9-deploy-docker-gcp.md`
- Collegare frontend Vercel: `docs/phase-10-deploy-vercel.md`
- Automatizzare build + push + deploy con GitHub Actions (CI/CD) — estensione futura
