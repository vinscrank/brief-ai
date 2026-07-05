# Fase 1 — Neon + schema SQL

## Obiettivo

Creare il database PostgreSQL su Neon, definire le 4 tabelle del progetto e inserire dati di test. Al termine avrai dati reali visibili nel dashboard Neon e la connection string pronta per la Fase 2 (FastAPI).

**Tu esegui tutto.** Questo documento ti guida passo passo.

---

## Teoria — Cos'e Neon e perche lo usiamo

**Neon** e un servizio cloud che offre PostgreSQL "serverless". In pratica:

- Non installi PostgreSQL sul tuo Mac
- Crei un progetto online e ottieni subito un database accessibile via internet
- E lo stesso tipo di database che userai in produzione (SaaS reale)

La **connection string** e l'indirizzo che il backend Python usera per connettersi al database. Formato tipico:

```
postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

**Regola importante:** la connection string contiene la password. Va solo in `backend/.env`, mai su Git.

---

## Teoria — Cosa fa lo script SQL

Lo script SQL fa tre cose:

| Comando | Cosa fa |
|---------|---------|
| `CREATE EXTENSION "pgcrypto"` | Abilita la generazione automatica di UUID |
| `CREATE TABLE ...` | Crea le tabelle (struttura vuota) |
| `CREATE INDEX ...` | Velocizza le query frequenti |
| `INSERT INTO ...` | Inserisce righe di test |

### Le 4 tabelle

1. **`briefs`** — tabella centrale: ogni richiesta/progetto del cliente
2. **`analyses`** — analisi AI collegata a un brief (1 brief = max 1 analysis)
3. **`proposals`** — proposta generata collegata a un brief
4. **`vector_metadata`** — metadati del vettore su Qdrant (la userai in Fase 7)

La riga `REFERENCES briefs(id) ON DELETE CASCADE` significa: se elimini un brief, PostgreSQL elimina automaticamente le righe collegate nelle altre tabelle.

---

## Passo 1 — Account Neon

1. Vai su https://neon.tech
2. Registrati (GitHub o email)
3. Clicca **New Project**
4. Nome progetto: `briefscope-ai`
5. Regione: scegli la piu vicina (es. `Frankfurt` per l'Europa)

Al termine vedrai il dashboard del progetto.

---

## Passo 2 — Copia la connection string

1. Nel dashboard Neon, vai su **Connection Details** (o **Connect**)
2. Seleziona il tab **Connection string**
3. Copia la stringa che inizia con `postgresql://`
4. Tienila da parte (non condividerla in chat)

---

## Passo 3 — Esegui lo schema SQL

1. Nel dashboard Neon, apri **SQL Editor**
2. Crea una nuova query
3. Copia e incolla **tutto** il blocco sotto
4. Clicca **Run**

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    source_type VARCHAR(50) NOT NULL,
    brief_text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'New',
    risk_level VARCHAR(50),
    complexity VARCHAR(50),
    estimated_effort VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL UNIQUE REFERENCES briefs(id) ON DELETE CASCADE,
    summary TEXT,
    required_skills JSONB DEFAULT '[]'::jsonb,
    nice_to_have_skills JSONB DEFAULT '[]'::jsonb,
    technical_scope TEXT,
    deliverables JSONB DEFAULT '[]'::jsonb,
    missing_information JSONB DEFAULT '[]'::jsonb,
    risks JSONB DEFAULT '[]'::jsonb,
    questions JSONB DEFAULT '[]'::jsonb,
    complexity VARCHAR(50),
    estimated_effort VARCHAR(100),
    suggested_daily_rate VARCHAR(100),
    implementation_plan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL UNIQUE REFERENCES briefs(id) ON DELETE CASCADE,
    short_proposal TEXT,
    technical_proposal TEXT,
    client_questions JSONB DEFAULT '[]'::jsonb,
    next_step TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vector_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL UNIQUE REFERENCES briefs(id) ON DELETE CASCADE,
    qdrant_point_id VARCHAR(255) NOT NULL,
    embedding_model VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_briefs_status ON briefs(status);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON briefs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_brief_id ON analyses(brief_id);
CREATE INDEX IF NOT EXISTS idx_proposals_brief_id ON proposals(brief_id);
CREATE INDEX IF NOT EXISTS idx_vector_metadata_brief_id ON vector_metadata(brief_id);
```

**Risultato atteso:** messaggio di successo, nessun errore rosso.

Se vedi errore `relation already exists`, le tabelle esistono gia: va bene, passa al passo 4.

---

## Passo 4 — Inserisci dati di test

Sempre nel SQL Editor, esegui:

```sql
INSERT INTO briefs (title, client_name, source_type, brief_text, status)
VALUES
(
    'Senior Full-Stack Developer',
    'TechCorp GmbH',
    'LinkedIn Job',
    'We need a developer to build a dashboard with React and Python backend. Authentication required. Timeline: 3 months.',
    'New'
),
(
    'WordPress to Next.js Migration',
    'StartupXYZ',
    'Upwork Job',
    'Migrate existing WordPress site to Next.js with headless CMS. Budget around 5000 EUR.',
    'New'
),
(
    'Internal AI Tool',
    'Acme Inc',
    'Internal Project',
    'Build an internal tool to analyze client requests and generate scope documents using LLM APIs.',
    'New'
);
```

---

## Passo 5 — Verifica i dati

Esegui:

```sql
SELECT id, title, client_name, source_type, status, created_at
FROM briefs
ORDER BY created_at DESC;
```

**Risultato atteso:** 3 righe con titoli diversi.

Verifica anche che le altre tabelle siano vuote (normale a questo stadio):

```sql
SELECT COUNT(*) AS total_analyses FROM analyses;
SELECT COUNT(*) AS total_proposals FROM proposals;
```

Entrambi devono restituire `0`.

---

## Passo 6 — Crea il file `.env` locale

Crea tu a mano questa struttura nel progetto:

```
briefscope-ai/
└── backend/
    └── .env
```

Contenuto di `backend/.env` (sostituisci con la tua connection string reale):

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

**Non committare `.env`.** Quando creerai Git, aggiungerai `backend/.env` al `.gitignore`.

---

## Passo 7 — Esplora il dashboard Neon

Nel pannello Neon prova anche la vista **Tables**: dovresti vedere `briefs`, `analyses`, `proposals`, `vector_metadata`.

Clicca su `briefs` e verifica che le 3 righe siano visibili anche li.

---

## Cosa impari in questa fase (per il CV)

- **PostgreSQL**: DDL (`CREATE TABLE`), DML (`INSERT`, `SELECT`)
- **Neon**: database cloud serverless, connection string
- **UUID**: identificatori univoci con `gen_random_uuid()`
- **JSONB**: colonne JSON native di PostgreSQL (per skills, risks, ecc.)
- **Foreign Key + CASCADE**: integrita referenziale tra tabelle
- **Indici**: ottimizzazione query su colonne frequenti

---

## Mini-quiz CV

1. **Cos'e una connection string e perche non va su Git?**
   E l'URL di connessione al DB con credenziali incluse. Su Git sarebbe pubblica e chiunque potrebbe accedere ai tuoi dati.

2. **Perche `analyses.brief_id` ha `UNIQUE`?**
   Perche ogni brief ha al massimo una analisi. La FK garantisce che esista il brief; UNIQUE garantisce una sola analysis per brief.

3. **Cosa significa `ON DELETE CASCADE`?**
   Se elimini un brief, PostgreSQL elimina automaticamente analysis, proposal e vector_metadata collegati.

---

## Checkpoint Fase 1

Segna completata la fase solo se tutti questi punti sono veri:

- [ ] Progetto Neon `briefscope-ai` creato
- [ ] 4 tabelle create senza errori
- [ ] `SELECT` su `briefs` mostra 3 righe
- [ ] `backend/.env` creato con `DATABASE_URL` (non condiviso)

Quando hai finito, scrivi in chat: **"Fase 1 completata"** (senza incollare password).

Passeremo alla **Fase 2**: ti generero `docs/phase-2-fastapi-setup.md` e spiegheremo FastAPI + `GET /health`.

---

## Troubleshooting

| Errore | Causa probabile | Soluzione |
|--------|-----------------|-----------|
| `extension "pgcrypto" does not exist` | Raro su Neon | Riprova; Neon lo supporta di default |
| `relation "briefs" already exists` | Script gia eseguito | Ignora, passa agli INSERT |
| `duplicate key value` su INSERT | Dati gia inseriti | Esegui solo il SELECT di verifica |
| Connection string non funziona | Password con caratteri speciali | Usa la stringa copiata direttamente da Neon, non riscritta a mano |
