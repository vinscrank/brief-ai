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
  --update-env-vars "FRONTEND_URL=https://TUO-PROGETTO.vercel.app"
```

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
2. Accedi con GitHub
3. Importa il repository `brief-ai`
4. Nella schermata di configurazione:

| Campo | Valore |
|-------|--------|
| **Framework Preset** | Next.js |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` (default) |

> **Importante:** il repo è un monorepo. Se non imposti `frontend` come Root Directory, il deploy fallisce.

### Step 3: Environment Variables

Aggiungi questa variabile **prima** del primo deploy:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://briefscope-backend-949475606814.europe-west1.run.app` | Production, Preview, Development |

Sostituisci l'URL con quello reale del tuo backend Cloud Run se diverso.

### Step 4: Deploy

Clicca **Deploy** e attendi 1-2 minuti.

Al termine otterrai un URL tipo:
```
https://briefscope-ai.vercel.app
```

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
| Project name? | `briefscope-ai` |
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

## Step 5 — Configura CORS sul Backend

Il frontend su Vercel chiama il backend su Cloud Run. Senza CORS corretto, il browser blocca le richieste.

Il backend legge già la variabile `FRONTEND_URL` in `backend/app/main.py`.

Dopo il deploy Vercel, esegui:

```bash
gcloud run services update briefscope-backend \
  --region europe-west1 \
  --update-env-vars "FRONTEND_URL=https://TUO-PROGETTO.vercel.app"
```

Esempio reale:
```bash
gcloud run services update briefscope-backend \
  --region europe-west1 \
  --update-env-vars "FRONTEND_URL=https://briefscope-ai.vercel.app"
```

> **Nota:** l'URL deve essere identico a quello Vercel, con `https://` e senza slash finale.

Se usi un dominio custom su Vercel, aggiorna `FRONTEND_URL` con quello.

---

## Step 6 — Verifica

### Checklist

1. Apri l'URL Vercel nel browser
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

→ `FRONTEND_URL` su Cloud Run non corrisponde all'URL Vercel.

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

### Errore: `No Output Directory named "public" found`

**Causa:** in Vercel e' impostato **Output Directory = `public`**. Quello vale per siti statici, non per Next.js.

**Soluzione:**

1. Vercel Dashboard → il tuo progetto → **Settings**
2. **General** → **Build & Development Settings**
3. Imposta cosi:

| Campo | Valore |
|-------|--------|
| Framework Preset | **Next.js** |
| Root Directory | **frontend** |
| Build Command | `npm run build` (default) |
| Output Directory | **vuoto** (disattiva l'override) |
| Install Command | `npm install` (default) |

4. **Deployments** → ultimo deploy → **Redeploy**

> Per Next.js **non** impostare Output Directory. Vercel usa il builder Next.js e gestisce `.next` in automatico.

---

### Dashboard vuota / `Failed to fetch`

**Causa 1:** `NEXT_PUBLIC_API_URL` mancante su Vercel.

**Soluzione:** Settings → Environment Variables → aggiungi `NEXT_PUBLIC_API_URL` → **Redeploy**

**Causa 2:** CORS non configurato.

**Soluzione:** aggiorna `FRONTEND_URL` su Cloud Run (vedi Step 5)

---

### Errore CORS in console

**Soluzione:**
```bash
gcloud run services update briefscope-backend \
  --region europe-west1 \
  --update-env-vars "FRONTEND_URL=https://TUO-URL.vercel.app"
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

| Servizio | Free Tier |
|----------|-----------|
| Vercel Hobby | 100 GB bandwidth/mese |
| Deploy illimitati | Sì |
| Domini custom | Sì |

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
