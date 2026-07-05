# Fase 8 — Frontend Next.js con design AI-Themed

## Obiettivo

Creare un frontend moderno e responsive con Next.js 15, shadcn/ui e un design a tema AI. L'app si connette al backend FastAPI e offre un'esperienza utente fluida con animazioni durante i caricamenti.

---

## Stack

| Libreria | Scopo |
|----------|-------|
| Next.js 15 | Framework React con App Router |
| shadcn/ui | Componenti UI accessibili |
| Tailwind CSS | Styling utility-first |
| Framer Motion | Animazioni fluide |
| next-themes | Dark mode |
| Lucide React | Icone |

---

## Pagine

| Route | Descrizione |
|-------|-------------|
| `/` | Landing page con hero AI |
| `/dashboard` | Lista brief con stats |
| `/briefs/new` | Form creazione brief |
| `/briefs/[id]` | Dettaglio + Analyze + Proposal |

---

## Design AI-Themed

- Dark mode di default
- Colori: cyan (#06b6d4), purple (#8b5cf6), dark bg (#0a0a0f)
- Gradient borders e glow effects
- Animated neural network background
- Loading states con pulse/shimmer e step indicators

---

## Come avviare

### 1. Installa dipendenze

```bash
cd frontend
npm install
```

### 2. Avvia backend (in un altro terminale)

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### 3. Avvia frontend

```bash
cd frontend
npm run dev
```

### 4. Apri nel browser

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

---

## Connessione Backend

Il file `.env.local` contiene:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Il backend ha CORS abilitato per `localhost:3000`.

Endpoints usati:
```typescript
GET  /briefs                    // Lista tutti i brief
POST /briefs                    // Crea nuovo brief
GET  /briefs/{id}               // Dettaglio brief
DELETE /briefs/{id}             // Elimina brief
POST /briefs/{id}/analyze       // Analizza con AI
GET  /briefs/{id}/analysis      // Recupera analisi
POST /briefs/{id}/generate-proposal  // Genera proposta
GET  /briefs/{id}/proposal      // Recupera proposta
```

---

## Struttura file creati

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css          # CSS globale + variabili tema
│   │   ├── layout.tsx           # Layout root con ThemeProvider
│   │   ├── page.tsx             # Landing page AI-themed
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Dashboard con lista brief
│   │   └── briefs/
│   │       ├── new/
│   │       │   └── page.tsx     # Form creazione brief
│   │       └── [id]/
│   │           └── page.tsx     # Dettaglio + analyze + proposal
│   ├── components/
│   │   ├── ui/                  # Componenti shadcn-style
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── label.tsx
│   │   │   └── tabs.tsx
│   │   ├── theme-provider.tsx   # Provider dark/light mode
│   │   ├── theme-toggle.tsx     # Toggle tema
│   │   ├── navbar.tsx           # Navigazione
│   │   ├── ai-background.tsx    # Canvas neural network
│   │   ├── ai-loading.tsx       # Loading animato con step
│   │   ├── brief-card.tsx       # Card per lista brief
│   │   ├── brief-form.tsx       # Form creazione
│   │   ├── analysis-result.tsx  # Visualizza analisi
│   │   └── proposal-result.tsx  # Visualizza proposta
│   └── lib/
│       ├── api.ts               # Client API + tipi TypeScript
│       └── utils.ts             # Utility (cn, formatDate, etc)
├── .env.local                   # Variabili ambiente
├── .gitignore
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Features

1. **Landing Page**: Hero con background animato neural network
2. **Dashboard**: Stats, ricerca, lista brief con card animate
3. **Creazione Brief**: Form con validazione
4. **Dettaglio Brief**: Tabs per Brief/Analysis/Proposal
5. **AI Loading**: Animazioni durante chiamate OpenAI con step visibili
6. **Dark Mode**: Default dark, toggle in navbar
7. **Responsive**: Mobile-first design
8. **Copy to Clipboard**: Copia rapida delle proposal
