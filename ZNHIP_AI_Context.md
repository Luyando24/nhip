# ZNHIP — AI Development Context Document
**Zambia National Health Intelligence Platform**
*Read this at the start of every development session. It is the single source of truth for what we are building, why we are building it, and how every decision should be made.*

---

## Who we are

This platform is being developed for the **Ministry of Health, Republic of Zambia**, headquartered in Lusaka. The initial pilot will be anchored at **Ndola Central Hospital** on the Copperbelt, with **TDRC (Tropical Diseases Research Centre)** as the local research partner. The system is intended to eventually scale to all 10 provinces and all registered public health facilities in Zambia.

The proposal has been submitted to the Ministry and is supported by Zambia's **Digital Health Strategy 2022–2026** and the **National Health Strategic Plan 2022–2026**. Potential funding partners include UNDP, the Global Fund, WHO, UNICEF, JICA, the World Bank, and CIDRZ.

---

## The core problem we are solving

Zambia's hospitals produce enormous amounts of health data every day — deaths, diagnoses, drug dispensing, patient admissions — but almost none of it is captured in a structured, queryable, nationally connected form.

### Problem 1 — Mortality data is invisible
When a patient dies in a Zambian public hospital today, the cause of death may be written in a paper register, coded inconsistently or not at all, and never aggregated beyond the facility. **No one at the provincial or national level knows in real time what Zambians are dying from, or why.** Contributing factors — malnutrition, delayed presentation, drug shortages, comorbidities — are almost never recorded at all.

The consequence: health policy is made without evidence. Interventions are reactive. Prevention is guesswork.

### Problem 2 — Drug stockouts are silent killers
Medicines run out in Zambian hospitals regularly. But there is no national system that connects a stockout event at Ndola Central Hospital to the mortality data recorded in the same ward during the same week. A clinician knows the drugs are gone. A pharmacist knows the shelf is empty. But no one in Lusaka — and no algorithm — is watching the relationship between that empty shelf and the deaths that follow.

### Problem 3 — The research agenda is disconnected from national burden
Academic and clinical health research in Zambia is not systematically driven by what the data shows is killing the most people. Researchers choose topics based on what funders prioritise globally, not what the national mortality burden demands locally. There is no mechanism for the data to speak and say: *this is where the research needs to go.*

### Problem 4 — Every hospital is an island
Each facility manages its own records, its own pharmacy, and its own reporting. There is no shared infrastructure. The Ministry receives aggregate reports that are often incomplete, delayed, and impossible to drill into. Provincial health officers cannot see what is happening across their districts in real time.

---

## What ZNHIP is

ZNHIP is a **unified digital health intelligence platform** that solves all four problems through three integrated pillars, powered by a shared AI engine.

It is **not** a generic hospital management system. It is **not** an EHR (Electronic Health Record) system. It is a **national health intelligence layer** — designed to sit on top of existing clinical workflows and turn the data those workflows generate into actionable national knowledge.

---

## The three pillars

### Pillar 1 — Mortality & Contributing Factor Surveillance

Every death in a connected facility triggers a structured digital record. Clinical staff enter:

- **Primary cause of death** coded to ICD-11 (the WHO international standard)
- **Contributing factors** — selected from structured categories: comorbidity, delayed presentation, drug shortage, malnutrition, other
- **Contextual fields** — ward, time of death, time of admission, whether the patient was admitted at all
- **Anonymised patient demographics** — age group, sex, district of origin

The system builds a **longitudinal, structured national mortality dataset** — the first of its kind in Zambia. It answers questions like:

- What are the top 10 causes of death at Ndola Central this quarter?
- Is neonatal mortality rising in the Copperbelt compared to six months ago?
- How many deaths this month had a drug shortage listed as a contributing factor?
- Which wards have the highest mortality rates, and what do they have in common?

### Pillar 2 — Drug Inventory Management

Every pharmacy in a connected facility logs its stock through ZNHIP. The system tracks:

- Real-time quantities per drug per facility
- Expiry dates, with automated alerts at 30, 14, and 7 days
- Consumption rates, enabling intelligent reorder recommendations
- Full transaction history — received, dispensed, expired, adjusted

The **critical feature that separates this from a simple inventory tool** is the AI-powered drug-mortality correlation engine. If a facility reports zero stock of Artemether (the frontline malaria treatment) and the mortality module simultaneously shows a spike in malaria deaths at the same facility in the same period, the system flags this as a correlated event and generates an alert for the Ministry.

This creates an **audit trail for procurement accountability** that has never existed before.

### Pillar 3 — AI Research Intelligence Engine

The AI engine runs continuously across the aggregated national dataset. It does three things:

1. **Anomaly detection** — compares current 30-day mortality rates per ICD-11 code per facility against the prior 60-day baseline. If current rates exceed baseline by 25% or more (with a minimum threshold of 3 deaths), it raises a mortality spike alert.

2. **Drug-mortality correlation** — for every facility, cross-references stockout events against mortality events in the same time window. If the correlation is strong and a contributing factor of "drug shortage" is present, it escalates to a Ministry-level alert.

3. **Research proposal generation** — identifies the top ICD-11 codes nationally by death count where no funded research proposal exists in the past 180 days, and generates ranked, evidence-based research topic proposals. Priority score is calculated from: death count volume (40%), trend direction (30%), and geographic spread across provinces (30%).

These proposals are surfaced to Ministry administrators, who can review, approve, or archive them. Approved proposals can be shared directly with academic institutions, TDRC, CIDRZ, and international research funders.

---

## Who uses the system (user roles)

| Role | What they do | What they see |
|------|-------------|---------------|
| **Clinician** | Records deaths and contributing factors | Their facility's records only |
| **Pharmacist** | Manages drug inventory and transactions | Their facility's inventory only |
| **Facility Admin** | Oversees all data at their hospital | All data at their facility |
| **Provincial Officer** | Monitors health trends across a province | All facilities in their province |
| **Ministry Admin** | Views national dashboard, approves research proposals, manages alerts | Everything nationally |
| **Super Admin** | System configuration, user management | Full system access |

**Row-level security is enforced at the database level** — not just the application level. A clinician at Ndola Central Hospital cannot query or view records from Livingstone General Hospital, even if they somehow bypass the frontend.

---

## Technical decisions and why we made them

### PostgreSQL with Row-Level Security (RLS)
We use PostgreSQL because it supports native row-level security policies. This means the data access rules are enforced inside the database engine itself — no application bug can accidentally leak a facility's data to another facility's users. RLS is set using `SET LOCAL app.current_user_role` and `SET LOCAL app.current_user_id` at the start of every query.

### ICD-11 coding
All causes of death are coded to the **WHO ICD-11 standard**. This is non-negotiable for two reasons:
1. It makes Zambia's mortality data internationally comparable and submittable to the WHO Global Health Observatory.
2. It enables the AI engine to group, compare, and trend causes of death consistently across facilities and time periods.

The ICD-11 code table is loaded locally from the WHO API. A live search endpoint (`GET /api/icd11/search`) powers the death record entry form with a debounced dropdown — clinical staff search by keyword, not code.

### Offline-first mobile app
Many Zambian health facilities — particularly rural district hospitals — have unreliable or no internet connectivity. The React Native mobile companion app stores death records and drug transactions in a local SQLite database (WatermelonDB) with a `sync_status` field (`pending | synced | error`). When connectivity is restored, the app syncs automatically. Clinical staff can record deaths even during a 3-day outage; the data will sync when the network returns.

### No third-party AI APIs
The AI analysis engine is a Python FastAPI microservice that runs locally on the server. It uses pandas and scikit-learn for all computations. **We do not send patient data to external AI APIs (OpenAI, Anthropic, etc.).** This is a data sovereignty requirement — all Zambian health data stays within Zambia. The AI logic is template-based and statistical, not generative.

### DHIS2 interoperability
Zambia already uses DHIS2 as its national Health Management Information System (HMIS). ZNHIP is designed to **complement, not replace** DHIS2. The backend API is built with HL7 FHIR-compatible endpoints so that aggregated ZNHIP data can be pushed into DHIS2 reporting flows. ZNHIP is the data capture and intelligence layer; DHIS2 remains the national reporting layer.

### Data hosted in Zambia
All data is hosted on infrastructure physically located within Zambia. This is a requirement of the **Cyber Security and Cyber Crimes Act (2021)** and a condition of Ministry of Health endorsement. Cloud hosting providers must be able to demonstrate Zambian data residency.

---

## What ZNHIP is NOT

Understanding what we are not building is as important as understanding what we are.

- ❌ Not a full Electronic Health Record (EHR) system — we do not manage full patient records, clinical notes, lab results, or imaging
- ❌ Not a replacement for SmartCare (the national EMR) — we complement it
- ❌ Not a billing or revenue management system
- ❌ Not a telemedicine platform
- ❌ Not a genomics or pathogen surveillance system (that is TDRC's domain)
- ❌ Not a general-purpose hospital management system
- ❌ Not dependent on external AI services — all intelligence is computed locally

---

## The data flows

```
FACILITY LEVEL
──────────────
Clinician records death
  → Death record + contributing factors saved
  → If offline: queued in mobile SQLite (sync_status = pending)
  → If online: POST to /api/deaths immediately
  → Audit log entry created

Pharmacist updates stock
  → Drug transaction saved
  → Stock level recalculated
  → If below reorder level: inventory alert generated
  → If quantity = 0: stockout event flagged for AI engine

NIGHTLY (02:00 Zambia time)
────────────────────────────
AI cron job runs
  → Fetches last 90 days of deaths and inventory from DB
  → POSTs to Python AI microservice at /analyze
  → AI returns: alerts (anomalies + correlations) + proposals
  → New alerts inserted into mortality_alerts table
  → New proposals inserted into research_proposals table

MINISTRY LEVEL
──────────────
Ministry Admin views national dashboard
  → Sees: top causes of death nationally, trends by province, stockout alerts
  → Reviews AI-generated research proposals
  → Approves proposals → shared with TDRC / academic partners
  → Exports mortality and inventory data as CSV for WHO reporting
```

---

## Zambia-specific disease context

The AI engine, research proposals, and dashboard are calibrated for Zambia's actual disease burden. The leading causes of death that the system is most likely to flag and track include:

| Condition | ICD-11 Code | Why it matters for ZNHIP |
|-----------|-------------|--------------------------|
| Malaria | 1F40 | Seasonal spikes; directly correlates with Artemether stockouts |
| HIV disease | 1C62 | High prevalence; ARV stockouts are a mortality risk |
| Tuberculosis | 1B10 | TB/HIV co-infection common; drug supply critical |
| Neonatal sepsis | KA21 | High neonatal mortality; antibiotic availability key |
| Maternal haemorrhage | CB00 | Preventable with Oxytocin; stockout correlation high |
| Pneumonia | CA40 | Leading killer of under-5s; antibiotic access critical |
| Diarrhoeal disease | 1A00 | ORS availability directly linked to mortality |
| Malnutrition | 5B51 | Common contributing factor, not always primary cause |
| Sepsis | 1G41 | Cross-cutting; often reflects delayed presentation |
| Anaemia | 3A00 | Common comorbidity, especially in maternal deaths |

When the AI generates research proposals or anomaly alerts, it should contextualise them within this disease landscape. A 30% rise in neonatal sepsis deaths in Ndola is not just a statistical anomaly — it is a potential signal of an antibiotic stockout at Arthur Davidson Children's Hospital.

---

## Local institutions to be aware of

These are real Zambian institutions that ZNHIP is designed to work with or support. Any references to them in the codebase, documentation, or seeding should be accurate:

- **Ndola Central Hospital** — main referral hospital for the Copperbelt; planned pilot site
- **Arthur Davidson Children's Hospital** — paediatric hospital in Ndola; critical for neonatal and under-5 mortality data
- **Ndola Teaching Hospital** — co-located with TDRC; key research partner
- **TDRC (Tropical Diseases Research Centre)** — government research centre at Ndola Teaching Hospital; primary beneficiary of AI research proposals on the Copperbelt
- **CIDRZ (Centre for Infectious Disease Research in Zambia)** — has a branch in Ndola; manages 90+ research grants; potential implementation partner
- **UTH (University Teaching Hospital)** — Lusaka; largest hospital nationally; future expansion site
- **ZAMMSA (Zambia Medicines and Medical Supplies Agency)** — national medicines procurement body; the drug inventory module's data is directly relevant to ZAMMSA procurement planning
- **Smart Zambia Institute** — government ICT body; already partnered with UNDP and the Ministry of Health on digital health connectivity

---

## Coding conventions and standards

When generating code for this project, always follow these rules:

**General:**
- Language: TypeScript (strict mode, no `any`) for frontend and backend; Python 3.11+ with type hints for the AI service
- All database queries use raw SQL via `pg` — no ORMs
- All inputs validated with Zod (backend and frontend) before any database operation
- All API responses follow the shape: `{ success: boolean, data?: T, error?: string, message?: string }`
- Every create/update/delete operation writes a row to the `audit_logs` table

**Security:**
- Never log raw passwords, tokens, or patient identifiers
- JWTs expire in 15 minutes; refresh tokens in 7 days as httpOnly cookies
- RLS must be activated via `SET LOCAL` at the start of every database request
- Rate limiting on all auth endpoints (max 10 login attempts per 15 minutes per IP)
- No patient data is ever sent to external APIs

**Database:**
- All primary keys are UUIDs generated with `gen_random_uuid()`
- All timestamps are `TIMESTAMPTZ` stored in UTC
- Soft deletes are not used — records are immutable once created (clinical records must not be deleted)
- Migrations are versioned and sequential

**Frontend:**
- Tailwind CSS only — no inline styles, no CSS modules
- All data fetching via `@tanstack/react-query` — no raw `useEffect` for data fetching
- Loading states and error states are required on every data-dependent component
- Forms use React Hook Form with Zod schemas

**AI Service:**
- All data manipulation uses pandas DataFrames
- No calls to external ML APIs
- Results are always returned as typed JSON with an `analysis_timestamp`
- The service is stateless — all state lives in the PostgreSQL database

---

## File structure reference

```
znhip/
├── docker-compose.yml         # All services
├── .env                       # Environment variables (never commit)
├── db/
│   ├── schema.sql             # All 11 tables
│   ├── rls.sql                # Row-level security policies
│   ├── indexes.sql            # Performance indexes
│   └── seed.sql               # Test data (6 facilities, 7 users, 40 deaths, 30 drugs)
├── api/                       # Node.js Express backend
│   └── src/
│       ├── config/            # DB pool, Redis client
│       ├── middleware/        # Auth, rate limiting, audit logging, validation
│       ├── routes/            # deaths, drugs, dashboard, auth, icd11, ai
│       ├── services/          # Business logic, SQL queries
│       └── jobs/              # Nightly AI analysis cron, inventory alerts cron
├── web/                       # React frontend
│   └── src/
│       ├── store/             # Zustand: auth state, sync state
│       ├── lib/               # Axios instance with interceptors
│       ├── components/        # Layout, charts, shared UI
│       ├── pages/             # Dashboard, Deaths, Inventory, Research, Alerts
│       └── router/            # Protected routes, role guards
├── ai-service/                # Python FastAPI AI microservice
│   ├── main.py                # FastAPI app, /analyze endpoint
│   └── analysis/
│       ├── anomaly.py         # Mortality spike detection
│       ├── correlation.py     # Drug-mortality correlation
│       ├── proposals.py       # Research topic generation
│       └── utils.py           # DataFrame helpers
└── mobile/                    # React Native offline app
    └── src/
        ├── database/          # WatermelonDB schema and models
        ├── services/          # Sync service, API client
        ├── store/             # Zustand: sync state
        └── screens/           # Login, Dashboard, RecordDeath, Inventory
```

---

## The 12-step build sequence

The system is built in 12 sequential sessions to avoid context overflow. Each session has a single focus:

| Step | Focus | Key output |
|------|-------|------------|
| 1 | Docker scaffold | `docker-compose.yml`, all services running |
| 2 | Database schema | 11 tables, RLS, indexes |
| 3 | Seed data | 6 facilities, 7 users, 40 deaths, 30 drugs, ICD-11 codes |
| 4 | Auth & middleware | JWT, RBAC, rate limiting, audit logging |
| 5 | Deaths API | CRUD, statistics, CSV export, ICD-11 search |
| 6 | Drugs API | Inventory, transactions, alerts, daily cron |
| 7 | AI microservice | Anomaly detection, drug correlation, proposals |
| 8 | Dashboard API | National KPIs, province map data, reports |
| 9 | React foundation | Login, routing, sidebar, role-aware layout |
| 10 | Dashboard + deaths UI | Charts, multi-step death entry form |
| 11 | Inventory + research UI | Stock badges, proposal approval, alerts |
| 12 | React Native mobile | Offline SQLite, sync queue, status bar |

**Always check the step number before writing code.** If the session prompt says Step 5, only build Step 5. Do not anticipate future steps or refactor completed steps unless explicitly asked.

---

## What success looks like

ZNHIP is complete and working when a person in each of these roles can do the following without friction:

**A clinician at Ndola Central Hospital:**
- Opens the mobile app with no internet connection
- Records a maternal death with primary cause "Maternal haemorrhage (CB00)" and contributing factor "Drug shortage — Oxytocin"
- Saves the record locally
- Sees "1 record pending sync" in the status bar
- When Wi-Fi is restored, the record syncs automatically
- Status bar shows "Synced"

**A pharmacist at the same hospital:**
- Logs in to the web app
- Sees that Oxytocin stock is at 0 (out of stock — red badge)
- Logs a "received" transaction when new stock arrives
- Stock updates immediately
- The out-of-stock alert clears

**A Ministry administrator in Lusaka:**
- Logs in to the national dashboard
- Sees that maternal haemorrhage deaths on the Copperbelt have risen 40% this month
- Sees an AI alert: "Stockout correlation detected — Oxytocin, Ndola Central Hospital, 3 maternal deaths in 7-day window"
- Sees an AI research proposal: "Maternal haemorrhage outcomes during Oxytocin stockouts — Copperbelt Province" with priority score 0.91
- Approves the proposal
- Downloads a CSV of all maternal deaths nationally for the past 90 days to share with WHO

**This is the problem we are solving. This is why every line of code matters.**

---

*ZNHIP Context Document v1.0 — Ministry of Health, Republic of Zambia — April 2026*
*Maintained by the ZNHIP development team. Update this document whenever a major architectural or product decision is made.*
