# Fase 10 — Deploy Frontend su Vercel

## Obiettivo

Deployare il frontend Next.js su Vercel e collegarlo al backend già online su Google Cloud Run.

**Skill per il CV:** Vercel, deploy frontend, environment variables, CORS, monorepo

---

## Prerequisiti

- Backend già deployato su Cloud Run (Fase 9)
- Repo su GitHub (`vinscrank/brief-ai`)
- Account Vercel (gratis con GitHub)
- Build locale che funziona:

```bash
cd frontend
npm run build
```

---

## Architettura

```
Browser
   │
   ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │────▶│  Cloud Run      │────▶│     Neon        │
│   (Frontend)    │     │   (Backend)     │     │  (PostgreSQL)   │
│   Next.js       │     │   FastAPI       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │    OpenAI       │
                        └─────────────────┘
```

---

## COMANDI RAPIDI (Riferimento Veloce)

Se hai già il progetto Vercel collegato:

```bash
cd /Users/vincenzo/Desktop/websites/briefscope-ai/frontend

# Deploy preview
vercel

# Deploy produzione
vercel --prod
```

Dopo il deploy, aggiorna CORS sul backend:

```bash
gcloud run services update briefscope-backend \
  --region europe-west1 \
  --update-env-vars "FRONTEND_URL=https://briefgen-ai.vercel.app"
```

---

## URL Produzione (BriefScope AI)

| Servizio | URL |
|----------|-----|
| **Frontend (Vercel)** | https://briefgen-ai.vercel.app |
| **Backend (Cloud Run)** | https://briefscope-backend-949475606814.europe-west1.run.app |
| **Backend Swagger** | https://briefscope-backend-949475606814.europe-west1.run.app/docs |
| **Backend Health** | https://briefscope-backend-949475606814.europe-west1.run.app/health |

---

## Metodo 1 — GitHub + Dashboard Vercel (Consigliato)

### Step 1: Push del codice

```bash
cd /Users/vincenzo/Desktop/websites/briefscope-ai
git add .
git commit -m "Frontend ready for Vercel deploy"
git push origin main
```

### Step 2: Importa il progetto su Vercel

1. Vai su [vercel.com/new](https://vercel.com/new)
2. Accedi con GitHub (piano **Hobby** gratuito, **non serve Pro**)
3. Se non vedi il repo, clicca **Adjust GitHub App Permissions** e abilita `vinscrank/brief-ai`
4. Clicca **Import** accanto al repository

### Step 3: Configurazione corretta (IMPORTANTE)

Il repo e' un **monorepo**. Vercel deve deployare solo la cartella `frontend`.

#### Root Directory

**Settings → General → Root Directory**

| Impostazione | Valore |
|--------------|--------|
| Root Directory | `frontend` |
| Include files outside the root directory in the Build Step | **Enabled** (ON) |
| Skip deployments when there are no changes to the root directory | **Enabled** (ON) — opzionale |

Clicca **Save**.

#### Build & Development Settings

**Settings → General → Build & Development Settings**

| Campo | Valore corretto | Override |
|-------|-----------------|----------|
| **Framework Preset** | **Next.js** | — |
| Build Command | default (`npm run build`) | **OFF** |
| Output Directory | default (vuoto) | **OFF** |
| Install Command | default (`npm install`) | **OFF** |
| Development Command | default | **OFF** |

> **Attenzione:** se Framework Preset e' **Other**, Vercel tratta il progetto come sito statico e cerca una cartella `public` come output. Il deploy fallisce anche se Root Directory e' corretta.

> I toggle **Override OFF** vanno bene cosi. Non serve forzare Build Command o Output Directory manualmente.

#### File `frontend/vercel.json`

Nel repo e' gia presente:

```json
{
  "framework": "nextjs"
}
```

Aiuta Vercel a riconoscere il framework Next.js.

### Step 4: Environment Variables

Aggiungi questa variabile **prima** del primo deploy (o subito dopo):

**Settings → Environment Variables**

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://briefscope-backend-949475606814.europe-west1.run.app` | Production, Preview, Development |

Sostituisci l'URL con quello reale del tuo backend Cloud Run se diverso.

### Step 5: Deploy

Clicca **Deploy** e attendi 1-2 minuti.

Al termine otterrai un URL tipo:
```
https://briefgen-ai.vercel.app
```

URL produzione attuale del progetto: **https://briefgen-ai.vercel.app**

Se vedi l'avviso giallo:
> "Configuration Settings in the current Production deployment differ from your current Project Settings"

Significa che il deploy precedente usava impostazioni sbagliate. Dopo aver corretto Framework e Root Directory, fai **Redeploy**.

---

## Configurazione che funziona (checklist)

Usa questa checklist se il deploy fallisce o per verificare che tutto sia corretto:

```
[ ] Piano Vercel: Hobby (gratis)
[ ] Root Directory: frontend
[ ] Framework Preset: Next.js (NON "Other")
[ ] Override Build Command: OFF
[ ] Override Output Directory: OFF
[ ] Override Install Command: OFF
[ ] NEXT_PUBLIC_API_URL impostata su Vercel
[ ] Redeploy dopo ogni modifica alle impostazioni
[ ] FRONTEND_URL=https://briefgen-ai.vercel.app su Cloud Run (CORS)
```

### Struttura monorepo

```
brief-ai/                    ← root repo GitHub
├── backend/                 ← deploy su Cloud Run (Fase 9)
├── docs/
└── frontend/                ← Root Directory Vercel
    ├── package.json         ← npm run build
    ├── vercel.json
    └── src/
```

Se Vercel guarda la root del repo invece di `frontend/`, non trova `package.json` e fallisce con errori su `public`.

---

## Metodo 2 — Vercel CLI

### Step 1: Installa la CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

Si apre il browser per autenticarti.

### Step 3: Deploy dalla cartella frontend

```bash
cd /Users/vincenzo/Desktop/websites/briefscope-ai/frontend
vercel
```

Risposte consigliate al primo deploy:

| Domanda | Risposta |
|---------|----------|
| Set up and deploy? | **Y** |
| Which scope? | il tuo account |
| Link to existing project? | **N** (prima volta) |
| Project name (Vercel) | `briefgen-ai` |
| In which directory is your code? | `./` |
| Override settings? | **N** |

### Step 4: Aggiungi variabile ambiente

```bash
vercel env add NEXT_PUBLIC_API_URL production
```

Quando chiede il valore, incolla:
```
https://briefscope-backend-949475606814.europe-west1.run.app
```

Ripeti per preview se vuoi:
```bash
vercel env add NEXT_PUBLIC_API_URL preview
```

### Step 5: Deploy produzione

```bash
vercel --prod
```

---

## Configura CORS sul Backend

Il frontend su Vercel chiama il backend su Cloud Run. Senza CORS corretto, il browser blocca le richieste.

Il backend legge già la variabile `FRONTEND_URL` in `backend/app/main.py`.

Dopo il deploy Vercel, esegui (comando gia usato in produzione):

```bash
gcloud run services update briefscope-backend \
  --region europe-west1 \
  --update-env-vars "FRONTEND_URL=https://briefgen-ai.vercel.app"
```

Se il nome progetto Vercel cambia, sostituisci l'URL con quello nuovo (es. `https://TUO-PROGETTO.vercel.app`).

> **Nota:** l'URL deve essere identico a quello Vercel, con `https://` e senza slash finale.

Se usi un dominio custom su Vercel, aggiorna `FRONTEND_URL` con quello.

---

## Verifica post-deploy

### Checklist

1. Apri https://briefgen-ai.vercel.app
2. Landing page visibile
3. Vai su **Dashboard** → deve caricare i brief (no errori in console)
4. Crea un brief e lancia **Analyze**
5. Genera una **Proposal**

### Test backend da browser

Apri:
```
https://briefscope-backend-949475606814.europe-west1.run.app/health
```

Risposta attesa:
```json
{"status":"ok","database":"connected"}
```

### Test CORS

Apri DevTools (F12) → tab **Network** → ricarica Dashboard.

Se vedi errori tipo:
```
Access to fetch at '...' from origin 'https://...vercel.app' has been blocked by CORS policy
```

→ `FRONTEND_URL` su Cloud Run non corrisponde all'URL Vercel (es. frontend su `briefgen-ai.vercel.app` ma backend senza quella origin).

---

## File `.env.local` vs Vercel

| Ambiente | Dove configurare |
|----------|-------------------|
| Locale | `frontend/.env.local` |
| Vercel | Dashboard → Settings → Environment Variables |

Il file `.env.local` **non** va committato su Git. Su Vercel le variabili vanno impostate manualmente nel dashboard o via CLI.

Contenuto locale di riferimento:
```
NEXT_PUBLIC_API_URL=https://briefscope-backend-949475606814.europe-west1.run.app
```

---

## Deploy automatico (CI/CD)

Con GitHub collegato a Vercel:

- **Push su `main`** → deploy automatico in produzione
- **Pull request** → deploy preview con URL temporaneo

Non serve fare nulla manualmente dopo la prima configurazione.

---

## Troubleshooting

### Errore: `Missing public directory` / `Missing build script`

**Sintomi:**
- `No Output Directory named "public" found`
- `Missing public directory`
- `Missing build script`

**Causa principale:** **Framework Preset = Other** oppure **Root Directory** non impostata su `frontend`.

Con "Other", Vercel usa il flusso sito statico e cerca output in `public/`. Next.js non funziona cosi.

**Soluzione:**

1. **Settings → General → Root Directory** → `frontend` → Save
2. **Settings → General → Build & Development Settings** → Framework Preset → **Next.js**
3. Lascia tutti gli **Override OFF** (Build, Output, Install)
4. **Deployments → Redeploy**

**Se continua a fallire:** elimina il progetto su Vercel, reimporta da [vercel.com/new](https://vercel.com/new) e imposta **Root Directory + Next.js PRIMA** del primo Deploy.

---

### Avviso: "Configuration Settings differ from Project Settings"

Compare quando hai cambiato le impostazioni ma l'ultimo deploy e' ancora quello vecchio (con "Other" o senza Root Directory).

**Soluzione:** **Deployments → ... → Redeploy**

---

### Dashboard vuota / `Failed to fetch`

**Causa 1:** `NEXT_PUBLIC_API_URL` mancante su Vercel.

**Soluzione:** Settings → Environment Variables → aggiungi `NEXT_PUBLIC_API_URL` → **Redeploy**

**Causa 2:** CORS non configurato.

**Soluzione:** aggiorna `FRONTEND_URL` su Cloud Run (vedi sezione CORS sotto)

---

### Errore CORS in console

**Soluzione:**
```bash
gcloud run services update briefscope-backend \
  --region europe-west1 \
  --update-env-vars "FRONTEND_URL=https://briefgen-ai.vercel.app"
```

Poi ricarica la pagina Vercel.

---

### Variabile ambiente non aggiornata dopo modifica

Le variabili `NEXT_PUBLIC_*` vengono incluse **al momento del build**.

Dopo aver cambiato una variabile su Vercel:
1. Vai su **Deployments**
2. Clicca sui tre puntini dell'ultimo deploy
3. **Redeploy**

---

### Warning: multiple lockfiles

Next.js può mostrare un warning sul workspace root. Non blocca il deploy.

Per silenziarlo (opzionale), in `frontend/next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
};
```

---

## Costi

**Non serve il piano Pro.** Il piano **Hobby** (gratuito) e' sufficiente per BriefScope AI.

| Servizio | Free Tier |
|----------|-----------|
| Vercel Hobby | 100 GB bandwidth/mese |
| Deploy illimitati | Si |
| Domini custom | Si |
| CI/CD da GitHub | Si |

Per un portfolio: **$0/mese**

---

## Cosa scrivere nel CV

```
Frontend & Deploy:
• Next.js 15, React, TypeScript, Tailwind CSS
• Deploy frontend su Vercel con CI/CD da GitHub
• Configurazione environment variables e build production
• Integrazione frontend-backend con CORS cross-origin

Full Stack Architecture:
• Frontend: Vercel (Next.js)
• Backend: Google Cloud Run (FastAPI + Docker)
• Database: Neon PostgreSQL
• AI: OpenAI API
```

---

## Link Utili

| Risorsa | URL |
|---------|-----|
| **Frontend live** | https://briefgen-ai.vercel.app |
| Vercel Dashboard | https://vercel.com/dashboard |
| Vercel Docs | https://vercel.com/docs |
| Cloud Run Console | https://console.cloud.google.com/run?project=briefscope-ai-prod |
| Backend Health | https://briefscope-backend-949475606814.europe-west1.run.app/health |
| Backend Swagger | https://briefscope-backend-949475606814.europe-west1.run.app/docs |

---

## Prossimo passo

Dopo FE + BE in produzione, puoi procedere con:
- **Fase 7:** Qdrant (ricerca semantica sui brief)
- Dominio custom su Vercel
- Monitoring e analytics
