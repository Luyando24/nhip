# ZNHIP — Research Institution Feature Extension
**AI Coding Assistant Prompt**
*Paste this entire document at the start of any session where you are building research-focused features. It replaces the need to re-explain the project from scratch.*

---

## What we have already built

We have a working platform called **ZNHIP (Zambia National Health Intelligence Platform)**, built for the **Ministry of Health, Republic of Zambia**. The core system is complete and includes:

- **Mortality surveillance** — structured death records coded to ICD-11, with contributing factors (drug shortage, malnutrition, delayed presentation, comorbidity), recorded by clinicians at connected hospitals
- **Drug inventory management** — real-time stock tracking, expiry alerts, transaction history, and drug-mortality correlation alerts
- **AI research intelligence** — a Python FastAPI microservice that runs nightly, detects mortality anomalies, correlates stockouts with death spikes, and generates ranked research topic proposals
- **Role-based access** — clinician, pharmacist, facility_admin, provincial_officer, ministry_admin, super_admin — all enforced with PostgreSQL Row-Level Security
- **Offline mobile app** — React Native with WatermelonDB for data capture in low-connectivity facilities
- **Dashboards and exports** — national and facility-level mortality KPIs, drug inventory summaries, CSV exports

**The tech stack:**
- Backend: Node.js + Express + TypeScript, raw PostgreSQL queries, Zod validation
- Frontend: React + TypeScript + Tailwind CSS + React Query + Zustand
- AI service: Python 3.11 + FastAPI + pandas + scikit-learn
- Mobile: React Native + WatermelonDB
- Auth: JWT (15min) + httpOnly refresh cookies (7 days) + PostgreSQL RLS

**All API responses follow:** `{ success: boolean, data?: T, error?: string, message?: string }`

**All database tables use:** UUID primary keys, TIMESTAMPTZ for all timestamps, audit logging on every write.

---

## What we are building now

We are now extending ZNHIP to serve **health research institutions** — organisations like CIDRZ (Centre for Infectious Disease Research in Zambia), TDRC (Tropical Diseases Research Centre), universities, and other implementation science partners who need to use ZNHIP's national mortality and drug data as the foundation for their own research programmes.

These institutions are not just consumers of ZNHIP data. They are active participants in the research cycle that ZNHIP is designed to power:

```
ZNHIP detects a mortality pattern
    → AI generates a research topic proposal
        → Research institution refines it into a study
            → Study produces evidence
                → Evidence informs Ministry policy
                    → Policy changes are implemented
                        → ZNHIP tracks whether mortality falls
                            → Cycle repeats
```

**Every feature we build in this extension must serve this cycle.** If a feature does not help a researcher collect better data, analyse it more efficiently, propose a more fundable study, or connect their findings back to the platform, it does not belong here.

---

## Who is using these new features

We are adding a new user role: **`research_partner`**

Research partners are staff from institutions like CIDRZ, TDRC, or universities who have been granted access to ZNHIP by the Ministry Admin. They are not Ministry employees. They are external collaborators with formal data access agreements.

**What `research_partner` can do:**
- View the national Research Portal — aggregated, anonymised mortality data
- Browse and filter AI-generated research proposals
- Submit data access requests for specific datasets
- Design and manage their own research data collection instruments within ZNHIP
- Run pre-built and custom analyses on ZNHIP data
- Generate research questions from proposal data using the AI engine
- Export data in formats their own tools (REDCap, STATA, SAS, R) can consume
- Submit research findings back to ZNHIP to close the evidence loop

**What `research_partner` cannot do:**
- See individual patient records or death records at the row level
- See drug inventory data at the facility level
- See which specific facility a death occurred at (province only)
- Modify any clinical records
- Access other institutions' private research instruments

---

## The four feature areas we are building

### Feature Area 1 — Advanced Data Collection

Research institutions need to collect their own study-specific data on top of ZNHIP's operational data. They use REDCap and ODK today. We are building a lightweight, ZNHIP-native instrument builder so they can design structured data collection forms that:

- Are linked to ZNHIP's existing death records and drug inventory by record ID
- Can be deployed to tablets and phones using ZNHIP's existing offline mobile infrastructure
- Automatically pre-fill fields from existing ZNHIP records (to avoid re-entry)
- Feed data back into ZNHIP's shared database under the `research_data` schema
- Export in REDCap-compatible and ODK-compatible formats

**Key design constraint:** Research data collected through these instruments is owned by the research institution that created it. Other institutions cannot see it. Only the Ministry Admin can access it for governance purposes. This must be enforced with RLS.

**Think of it as:** A REDCap-lite, embedded inside ZNHIP, connected to the same mortality and drug data that powers the rest of the platform.

---

### Feature Area 2 — Data Analysis Workbench

Research partners need to run analyses on ZNHIP data without exporting it to STATA or SAS every time they want to ask a new question. We are building an in-platform analysis workbench that allows them to:

- Query mortality data using a guided filter builder (no SQL required)
- Generate standard epidemiological outputs: incidence rates, case fatality rates, age-sex breakdowns, trend lines, geographic distributions
- Build cross-tabulations (e.g. cause of death × contributing factor × province × quarter)
- Save and name analyses for reuse
- Export results as CSV, PDF report, or REDCap-compatible flat file
- Share a read-only analysis link with collaborators (Ministry Admin, co-investigators)

**Key design constraint:** All queries run against aggregated, anonymised data views — pre-built PostgreSQL views that group data at the province level and suppress cells with fewer than 5 deaths (to prevent re-identification). Researchers never touch the underlying `death_records` table directly.

**Think of it as:** A guided data explorer, like a simplified version of what epidemiologists do in STATA — but running inside ZNHIP, on live national data, without needing to write code.

---

### Feature Area 3 — Research Topic Proposals (deepened)

The existing AI engine generates basic research proposals ranked by a priority score. We are now deepening this into a full **research intelligence layer** that takes a proposal from a generated suggestion all the way to a fundable research brief.

The enhanced proposal workflow has five stages:

**Stage 1 — AI Generation (already built)**
The Python AI service detects mortality patterns and generates proposals with: title, summary, evidence basis, priority score, affected provinces, ICD-11 codes.

**Stage 2 — Research Partner Refinement (new)**
A research partner can claim a proposal and refine it:
- Edit the title and summary
- Add their institution's context and prior work on this topic
- Tag relevant existing publications (DOI links)
- Specify the study design they would use (RCT, cohort, cross-sectional, qualitative, mixed methods)
- Estimate the study population size and duration

**Stage 3 — AI Research Brief Generation (new)**
Once the partner has refined the proposal, the AI engine generates a structured research brief containing:
- Refined problem statement (grounded in ZNHIP mortality data)
- Literature gap statement (what is known vs. what ZNHIP shows is unknown)
- Primary research objective
- 3–5 specific, measurable research questions (see Feature Area 4)
- Recommended study design and justification
- Proposed data sources (ZNHIP mortality data + instrument data + existing records)
- Ethical considerations (NHRA approval pathway, data anonymisation approach)
- Estimated impact on mortality if the research informs policy

**Stage 4 — Ministry Review and Approval (already partially built — deepen it)**
Ministry Admin reviews and approves or rejects. On approval:
- PDF research brief is generated and attached to the proposal record
- ZNHIP sends a notification to the research partner
- The proposal status moves to `approved`
- The underlying ZNHIP dataset is prepared for the partner's data access request

**Stage 5 — Evidence Loop Closure (new)**
After the research is complete, the partner submits back to ZNHIP:
- Publication DOI (if published)
- Key findings summary (plain language, max 500 words)
- Policy recommendation (what the Ministry should change based on the findings)
- Outcome status: `findings_submitted | policy_recommended | policy_adopted | no_policy_change`

ZNHIP tracks this on a **Research Impact Dashboard** — showing the Ministry how many proposals have gone from AI generation to published evidence to policy change.

---

### Feature Area 4 — Research Question Generator

This is the most novel feature. When a research partner is refining a proposal (Stage 2 above), they can trigger the **Research Question Generator** — an AI-powered tool that takes the mortality data behind the proposal and produces a set of specific, measurable, answerable research questions.

**What it does:**

The generator takes as input:
- The ICD-11 codes with the highest mortality burden in the proposal
- The contributing factors most frequently associated with those deaths
- The provinces and facilities with the highest burden
- Any existing literature the partner has tagged
- The study design the partner has selected

It produces as output a set of research questions structured in the **PICO format** (Population, Intervention, Comparison, Outcome) for quantitative studies, or **PEO format** (Population, Exposure, Outcome) for epidemiological studies, or **open-ended phenomenological questions** for qualitative studies.

**Example input:**
```
ICD-11 code: 1F40 (Malaria)
Top contributing factor: drug_shortage (Artemether)
Province: Copperbelt
Period: Q3 2025 (Jul–Sep)
Mortality spike: +47% above baseline
Study design: Cross-sectional
```

**Example output:**
```
Primary research question:
"Among patients presenting with confirmed malaria at Copperbelt Province
hospitals between July and September 2025, what was the association between
Artemether/Lumefantrine stockout duration (days without stock) and
in-hospital case fatality rate?"

PICO:
  P (Population): Adults and children with confirmed malaria admitted to
                  Copperbelt hospitals, July–September 2025
  I (Intervention/Exposure): Artemether/Lumefantrine stockout (≥1 day
                  without stock during the admission period)
  C (Comparison): Malaria admissions during periods of uninterrupted
                  Artemether/Lumefantrine availability
  O (Outcome): In-hospital case fatality rate; length of stay;
               treatment delays >24 hours

Secondary research questions:
1. What proportion of malaria deaths in the Copperbelt during Q3 2025
   occurred at facilities that reported Artemether stockouts of >3 days?
2. Is there a dose-response relationship between stockout duration
   and mortality rate across Copperbelt facilities?
3. What alternative treatments were administered during stockout periods,
   and what were their outcomes?
4. What supply chain factors at facility, district, and provincial level
   predicted the occurrence and duration of stockouts?
```

**Implementation approach:**
This feature calls the Anthropic Claude API (or a locally hosted LLM) with a carefully structured system prompt and the mortality context data. It is the one place in ZNHIP where an external AI API is used — but only for question generation, not for data analysis. No patient-level data is sent to the API. Only aggregated statistics (counts, rates, province names, ICD-11 codes) are included in the prompt context.

The system prompt for this call should be:
```
You are an epidemiology research assistant supporting health researchers
in Zambia. You generate precise, fundable research questions based on
mortality surveillance data. You always structure questions in PICO format
for quantitative studies or PEO format for epidemiological studies.
You never invent data. You only use the statistics provided to you.
You produce questions that are specific enough to guide a study protocol,
measurable with the data sources available, and answerable within a
12-month study period with reasonable resources. Always consider the
Zambian health system context: limited resources, high disease burden,
community health worker infrastructure, and the National Health Research
Authority ethics approval process.
```

---

## Database changes required

Add these tables to the existing schema. Run them as a migration after the core 11-table schema is in place.

```sql
-- Research instruments (form builder)
CREATE TABLE research_instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_institution TEXT NOT NULL,
  owner_user_id UUID REFERENCES users(id),
  linked_proposal_id UUID REFERENCES research_proposals(id),
  form_schema JSONB NOT NULL,         -- instrument field definitions
  export_format TEXT DEFAULT 'redcap'
    CHECK (export_format IN ('redcap', 'odk', 'csv')),
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Research data collected via instruments
CREATE TABLE research_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID REFERENCES research_instruments(id),
  linked_death_record_id UUID REFERENCES death_records(id),
  collected_by UUID REFERENCES users(id),
  facility_id UUID REFERENCES facilities(id),
  data JSONB NOT NULL,                -- flexible field storage
  sync_status TEXT DEFAULT 'synced'
    CHECK (sync_status IN ('pending', 'synced', 'error')),
  collected_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Saved analyses
CREATE TABLE saved_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  institution TEXT,
  query_config JSONB NOT NULL,        -- filters, groupings, output type
  result_snapshot JSONB,              -- cached result at time of save
  is_shared BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,            -- for read-only sharing links
  created_at TIMESTAMPTZ DEFAULT now(),
  last_run_at TIMESTAMPTZ
);

-- Data access requests
CREATE TABLE data_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID REFERENCES users(id),
  organisation TEXT NOT NULL,
  study_title TEXT NOT NULL,
  nhra_approval_number TEXT,
  data_requested TEXT NOT NULL,
  icd11_codes_of_interest TEXT[],
  province_filter TEXT[],
  date_range_from DATE,
  date_range_to DATE,
  justification TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  dataset_url TEXT,                   -- pre-signed download URL on approval
  dataset_expires_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Research questions (generated by AI)
CREATE TABLE research_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES research_proposals(id),
  generated_by UUID REFERENCES users(id),
  study_design TEXT NOT NULL,         -- 'rct', 'cohort', 'cross_sectional', 'qualitative', 'mixed'
  pico_population TEXT,
  pico_intervention TEXT,
  pico_comparison TEXT,
  pico_outcome TEXT,
  primary_question TEXT NOT NULL,
  secondary_questions TEXT[],
  framework TEXT DEFAULT 'pico'
    CHECK (framework IN ('pico', 'peo', 'open')),
  context_data JSONB,                 -- the mortality stats used to generate
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'incorporated_in_protocol')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Research findings (evidence loop closure)
CREATE TABLE research_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES research_proposals(id),
  submitted_by UUID REFERENCES users(id),
  institution TEXT NOT NULL,
  publication_doi TEXT,
  publication_title TEXT,
  findings_summary TEXT NOT NULL,     -- plain language, max 500 words
  policy_recommendation TEXT,
  outcome_status TEXT DEFAULT 'findings_submitted'
    CHECK (outcome_status IN (
      'findings_submitted', 'policy_recommended',
      'policy_adopted', 'no_policy_change'
    )),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ
);
```

**RLS policies for new tables:**
- `research_instruments`: owner_user_id matches current user OR role is ministry_admin/super_admin
- `research_data`: instrument owner OR role is ministry_admin/super_admin
- `saved_analyses`: created_by matches current user OR is_shared = true OR role is ministry_admin
- `data_access_requests`: requested_by matches current user OR role is ministry_admin/super_admin
- `research_questions`: proposal_id is accessible to current user
- `research_findings`: submitted_by matches current user OR role is ministry_admin/super_admin

---

## New API endpoints

Add these routes to the existing Express backend. All require `authenticateToken`. Role requirements are noted per route.

### Research Partner routes
```
GET  /api/research/portal              [research_partner, ministry_admin]
     Returns: aggregated national mortality data, approved proposals,
     recent alerts — all at province level, no facility identifiers

POST /api/research/data-requests       [research_partner]
GET  /api/research/data-requests       [research_partner sees own; ministry_admin sees all]
GET  /api/research/data-requests/:id   [research_partner (own) or ministry_admin]
PATCH /api/research/data-requests/:id  [ministry_admin: approve/reject]
GET  /api/research/data-requests/:id/download  [research_partner: download approved dataset]
```

### Instrument builder routes
```
POST /api/instruments                  [research_partner]
GET  /api/instruments                  [research_partner sees own; ministry_admin sees all]
GET  /api/instruments/:id              [owner or ministry_admin]
PATCH /api/instruments/:id             [owner only]
DELETE /api/instruments/:id            [owner only, only if status = 'draft']
GET  /api/instruments/:id/export       [owner: returns REDCap or ODK format]
POST /api/instruments/:id/deploy       [owner: sets status to 'active']
POST /api/instruments/:id/data         [research_partner: submit a data collection record]
GET  /api/instruments/:id/data         [owner: view all collected records]
GET  /api/instruments/:id/data/export  [owner: CSV export of all collected data]
```

### Analysis workbench routes
```
POST /api/analyses/run                 [research_partner, ministry_admin]
     Body: { filters, groupBy, outputType, dateRange }
     Returns: query results as structured JSON

POST /api/analyses/save                [research_partner, ministry_admin]
GET  /api/analyses                     [research_partner sees own; ministry_admin sees all]
GET  /api/analyses/:id                 [owner or ministry_admin or share_token]
GET  /api/analyses/:id/export          [owner: CSV or PDF]
POST /api/analyses/:id/share           [owner: generates share_token]
```

### Enhanced proposal routes
```
POST /api/proposals/:id/claim          [research_partner: assign to their institution]
PATCH /api/proposals/:id/refine        [research_partner (claimer): add context, study design]
POST /api/proposals/:id/brief          [research_partner: trigger AI brief generation]
GET  /api/proposals/:id/brief          [research_partner or ministry_admin: download PDF]
POST /api/proposals/:id/findings       [research_partner: submit evidence loop closure]
GET  /api/proposals/:id/findings       [research_partner or ministry_admin]
```

### Research question generator
```
POST /api/research/questions/generate  [research_partner]
     Body: {
       proposalId,
       studyDesign,       // 'rct' | 'cohort' | 'cross_sectional' | 'qualitative' | 'mixed'
       additionalContext  // optional free text from the researcher
     }
     Calls Claude API with anonymised mortality context
     Stores result in research_questions table
     Returns: { primaryQuestion, secondaryQuestions, pico, framework }

GET  /api/research/questions           [research_partner sees own; ministry_admin sees all]
PATCH /api/research/questions/:id      [research_partner: edit generated questions]
PATCH /api/research/questions/:id/status [research_partner: mark as incorporated_in_protocol]
```

### Exports
```
GET /api/export/redcap                 [research_partner, ministry_admin]
GET /api/export/stata                  [research_partner, ministry_admin]
GET /api/export/r                      [research_partner, ministry_admin]
     All support query params: icd11_codes[], province[], date_from, date_to
     All return anonymised province-level data only
     All include a data dictionary file
```

### Research impact dashboard
```
GET /api/research/impact               [ministry_admin, super_admin]
     Returns: {
       totalProposals,
       byLifecycleStatus: { proposed, reviewed, approved, funded,
                            active_study, completed, published, policy_adopted },
       findingsSubmitted: number,
       policiesAdopted: number,
       topResearchInstitutions: [{ name, proposalsClaimed, findingsSubmitted }],
       recentFindings: ResearchFinding[]
     }
```

---

## Frontend pages to build

### Research Portal (`/research/portal`) — `research_partner`
Landing page for research institution users. Shows:
- National mortality summary (province-level, last 90 days)
- Top 10 causes of death nationally with trend arrows
- Available approved proposals (claimable)
- Their institution's active proposals and instruments
- Their pending data access requests

### Instrument Builder (`/research/instruments`) — `research_partner`
- List of their institution's instruments
- "New Instrument" button → drag-and-drop form builder
  - Field types: text, number, date, select (single/multi), ICD-11 lookup, ZNHIP record link
  - Each field has: label, variable name, required flag, validation rules, help text
- Deploy button activates the instrument for data collection
- Export button generates REDCap or ODK format

### Analysis Workbench (`/research/analysis`) — `research_partner`, `ministry_admin`
Three-panel layout:
- Left: Filter builder (ICD-11 code search, province select, date range, contributing factor, age group, sex)
- Centre: Live results — table or chart based on selected output type
- Right: Saved analyses list

Output types:
- Frequency table (cause of death × count × % of total)
- Trend chart (deaths per month for selected codes)
- Cross-tabulation (two variables, e.g. cause × contributing factor)
- Geographic summary (deaths by province, sortable)
- Age-sex pyramid (for selected ICD-11 code)
- Case fatality rate over time

### Research Questions (`/research/proposals/:id/questions`) — `research_partner`
- Shows the proposal data (title, evidence basis, mortality stats)
- Study design selector (radio buttons)
- "Generate Research Questions" button → loading state → results
- Editable PICO fields (pre-filled by AI, researcher can refine)
- Primary question (editable text area)
- Secondary questions (add/remove/edit list)
- "Save Questions" and "Mark as Incorporated in Protocol" actions

### Research Impact Dashboard (`/research/impact`) — `ministry_admin`
- Funnel chart: proposals → approved → funded → published → policy adopted
- Table of all proposals with current lifecycle status
- Recent findings submissions
- Institutions ranked by research output

---

## Coding rules specific to this extension

These are in addition to the general ZNHIP coding conventions already established.

**Privacy-first data aggregation:**
All queries serving the `research_partner` role must go through anonymised PostgreSQL views. Create these views before building any research partner routes:

```sql
-- Anonymised mortality view for research partners
CREATE VIEW research_mortality_view AS
SELECT
  date_trunc('month', time_of_death) AS death_month,
  f.province,
  f.facility_type,
  dr.primary_cause_icd11,
  dr.primary_cause_label,
  CASE
    WHEN dr.patient_age_years < 1  THEN '0-1'
    WHEN dr.patient_age_years < 5  THEN '1-5'
    WHEN dr.patient_age_years < 18 THEN '5-18'
    WHEN dr.patient_age_years < 60 THEN '18-60'
    ELSE '60+'
  END AS age_group,
  dr.patient_sex,
  cf.factor_type AS contributing_factor_type,
  COUNT(*) AS death_count
FROM death_records dr
JOIN facilities f ON dr.facility_id = f.id
LEFT JOIN contributing_factors cf ON cf.death_record_id = dr.id
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
HAVING COUNT(*) >= 5;       -- suppress cells with fewer than 5 deaths
```

**Never expose in research_partner responses:**
- `death_records.id`
- `death_records.facility_id`
- `death_records.patient_district`
- `death_records.recorded_by`
- Any facility name or facility ID
- Any user ID

**REDCap export variable naming:**
All variable names in REDCap exports must be:
- Lowercase, underscores only (no spaces, no hyphens)
- Under 26 characters
- Prefixed with `znhip_` to avoid conflicts with existing REDCap project variables
- Example: `znhip_death_month`, `znhip_icd11_code`, `znhip_age_group`

**Research Question Generator — API call rules:**
- Only send aggregated statistics to the Claude API — never individual records
- The payload to Claude must include an explicit instruction: "Do not request or reference individual patient data."
- Cache generated questions in the `research_questions` table — never regenerate the same question set more than once unless the researcher explicitly requests a regeneration
- Log every API call to the audit_logs table with action = 'AI_QUESTION_GENERATION'
- If the Claude API is unavailable, return a graceful error — do not fail silently

**STATA export requirements:**
- All variable names ≤ 32 characters (STATA hard limit)
- Numeric codes for all categorical variables (sex: 1=male, 2=female, 3=unknown)
- Include a `.do` file with label definitions
- Date variables as `%td` STATA date format (days since 1 Jan 1960) OR as string `YYYY-MM-DD`

**R export requirements:**
- Return a `.csv` with clean column names (snake_case)
- Include a companion `znhip_codebook.json` with variable descriptions, types, and value labels
- Numeric codes should be paired with factor labels in the codebook

---

## What CIDRZ specifically needs from this layer

When implementing any feature in this extension, ask: *would CIDRZ's Strategic Information Unit accept this as a usable data product?*

CIDRZ's data team uses SAS, STATA, and NVivo. They manage REDCap instances for 90+ active grants. Their data managers perform routine QA/QC. Their analysis unit produces reports for NIH, USAID, CDC, and the Global Fund.

This means:
- Exports must be clean enough to load into a study database without manual cleaning
- The data dictionary must be complete and match what's in the export exactly
- The anonymisation must satisfy PEPFAR and USAID data use agreement requirements
- The audit trail must be visible enough to satisfy NHRA secondary data use requirements
- The instrument builder must produce ODK-compatible XLSForm output so CIDRZ field teams can deploy it on their existing tablets without new infrastructure

If any feature falls short of this standard, flag it in a code comment: `// TODO: Verify CIDRZ data standards compliance`

---

## What not to build in this session

To keep scope controlled, do not build the following in this extension unless explicitly asked:

- ❌ Full clinical trial management (that is CIDRZ's domain, not ZNHIP's)
- ❌ Patient recruitment or consent management
- ❌ Laboratory results integration
- ❌ Genomic or pathogen data handling
- ❌ Billing or grant financial management
- ❌ Peer review or publication submission workflows
- ❌ Inter-institutional data sharing between two research partners (Ministry Admin is always the broker)
- ❌ Real-time collaborative editing of instruments or analyses

---

## How to approach each session

When you receive a task to build a specific feature from this extension:

1. **Re-read this document first.** Understand which of the four feature areas the task belongs to.
2. **Check the database schema.** All six new tables must exist before any service or route code is written.
3. **Build the anonymised views first.** No research_partner route should be written before the PostgreSQL views are in place.
4. **Write the service layer before the route layer.** SQL queries and business logic go in `api/src/services/research.ts`. Routes in `api/src/routes/research.ts` call the service — they do not contain SQL.
5. **Add RLS.** Every new table needs a policy. Verify with a test query using `SET LOCAL app.current_user_role = 'research_partner'`.
6. **Write the frontend last.** Backend first, then UI.
7. **Test the privacy boundary explicitly.** After building any research_partner-facing feature, write a test that confirms a research_partner cannot retrieve individual death record IDs or facility names.

---

*ZNHIP Research Extension Prompt v1.0 — April 2026*
*Add this to your session alongside the ZNHIP AI Context document and the CIDRZ Alignment document when building any research institution feature.*
