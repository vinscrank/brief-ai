# Fase 0 — Teoria database

## Cos'e un database relazionale

Un database relazionale organizza i dati in **tabelle** (come fogli Excel collegati tra loro). Ogni tabella ha **colonne** (campi) e **righe** (record). A differenza di un file JSON singolo, il database garantisce integrita, query efficienti e relazioni tra entita diverse.

## Concetti fondamentali

| Concetto | Significato | Esempio BriefScope |
|----------|-------------|-------------------|
| Tabella | Contenitore di dati omogenei | `briefs` |
| Colonna | Tipo di dato per ogni campo | `title`, `status` |
| Riga | Un record singolo | Un brief specifico |
| Primary Key (PK) | Identificatore univoco | `id` (UUID) |
| Foreign Key (FK) | Riferimento a un'altra tabella | `analyses.brief_id` -> `briefs.id` |
| Indice | Struttura per velocizzare le query | indice su `status`, `created_at` |

## Perche `briefs` e la tabella centrale

Ogni brief e l'entita principale del sistema. Le altre tabelle (`analyses`, `proposals`, `vector_metadata`) dipendono da un brief esistente tramite foreign key. Se elimini un brief, le righe collegate vengono eliminate in cascata (`ON DELETE CASCADE`).

Relazione: **1 brief : 0 o 1 analysis**, **1 brief : 0 o 1 proposal**, **1 brief : 0 o 1 vector_metadata**.

## PostgreSQL vs Qdrant

| | PostgreSQL (Neon) | Qdrant |
|--|-------------------|--------|
| Tipo dati | Strutturati (testo, numeri, JSON) | Vettori (embedding numerici) |
| Uso | Source of truth, CRUD, relazioni | Similarita semantica, ricerca |
| Query | SQL (`SELECT`, `WHERE`, `JOIN`) | Ricerca per distanza vettoriale |
| Quando | Sempre, fin dalla Fase 1 | Fase 7, dopo le analisi AI |

PostgreSQL memorizza **cosa** e successo (titolo, analisi, proposta). Qdrant memorizza **quanto e simile** un brief ad altri (embedding del testo).

## Diagramma ER

```
briefs (1) ----< (0..1) analyses
briefs (1) ----< (0..1) proposals
briefs (1) ----< (0..1) vector_metadata
```

## Mini-quiz CV

1. **Qual e la differenza tra primary key e foreign key?**
   La PK identifica univocamente una riga nella propria tabella. La FK collega una riga a una PK in un'altra tabella.

2. **Perche usare UUID invece di un intero auto-incrementale?**
   Gli UUID sono univoci globalmente, sicuri da esporre in API pubbliche e utili in sistemi distribuiti.

3. **Perche PostgreSQL e la source of truth e Qdrant no?**
   PostgreSQL garantisce transazioni ACID, relazioni e dati strutturati verificabili. Qdrant e un indice secondario per la ricerca semantica.

## Checkpoint Fase 0

Se riesci a spiegare cosa va in ciascuna delle 4 tabelle e perche sono collegate, sei pronto per la Fase 1 (Neon + SQL).
