# ZNHIP — Step-by-Step Build Guide
**Zambia National Health Intelligence Platform**
*One session per step. Paste the prompt, build, verify, then move on.*

---

## How to use this guide

Each step is a **self-contained Claude session**. Start a fresh conversation for each step to avoid context overflow. Every step begins with a **context block** — paste it at the top of your message so Claude knows what has already been built.

**Golden rules:**
- Never combine two steps in one session
- Always verify the output of one step before starting the next
- Save all generated files into the folder structure below before moving on
- If Claude's output is cut off, say: *"Continue from where you left off"*

---

## Folder structure (create this before you start)

```
znhip/
├── docker-compose.yml
├── .env
├── db/
│   ├── schema.sql
│   ├── rls.sql
│   └── seed.sql
├── api/                  ← Node.js Express backend
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── web/                  ← React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── ai-service/           ← Python FastAPI microservice
│   ├── main.py
│   └── requirements.txt
└── mobile/               ← React Native app
    ├── src/
    └── package.json
```

---

## Step 1 — Project scaffold & Docker setup

**Goal:** Get all services running locally with a single `docker-compose up`.

**Paste this prompt:**

```
You are building ZNHIP (Zambia National Health Intelligence Platform) — an integrated
digital health system for the Zambia Ministry of Health.

This is Step 1 of 12. Your only job in this session is to scaffold the project
and create the Docker environment.

TECH STACK:
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- AI service: Python 3.11 + FastAPI
- Database: PostgreSQL 15
- Cache/rate limiting: Redis

DELIVERABLES for this session only:

1. docker-compose.yml
   - Services: web (Vite, port 5173), api (Express, port 3000),
     ai (FastAPI, port 8000), db (PostgreSQL 15, port 5432), redis (port 6379)
   - All services share a network called "znhip-net"
   - db and redis use named volumes for persistence
   - api and ai depend_on db being healthy

2. .env (template with all required variables)
   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD,
   JWT_SECRET, JWT_REFRESH_SECRET, REDIS_URL,
   AI_SERVICE_URL, NODE_ENV, VITE_API_URL

3. api/package.json + api/tsconfig.json
   Dependencies: express, pg, redis, bcrypt, jsonwebtoken, zod,
   cors, helmet, express-rate-limit, node-cron, dotenv
   Dev dependencies: typescript, ts-node-dev, @types/*

4. web/package.json + web/vite.config.ts
   Dependencies: react, react-dom, react-router-dom, axios,
   recharts, @tanstack/react-query, tailwindcss, zustand
   
5. ai-service/requirements.txt
   fastapi, uvicorn, psycopg2-binary, pandas, scikit-learn,
   numpy, python-dotenv, httpx

6. A root Makefile with these commands:
   make up      → docker-compose up --build
   make down    → docker-compose down
   make logs    → docker-compose logs -f
   make db      → psql into the running db container
   make reset   → docker-compose down -v && docker-compose up --build

Write every file completely. No placeholders.
```

**Verify before moving on:**
- [ ] `docker-compose up --build` runs without errors
- [ ] `curl http://localhost:3000/health` returns 200
- [ ] `curl http://localhost:8000/health` returns 200
- [ ] PostgreSQL is reachable on port 5432

---

## Step 2 — Database schema

**Goal:** Create all tables, indexes, and constraints in PostgreSQL.

**Paste this prompt:**

```
You are building ZNHIP. This is Step 2 of 12.
Step 1 is complete: Docker is running with PostgreSQL 15, Express API, FastAPI,
and Redis all healthy.

Your only job this session is the complete PostgreSQL database schema.

DELIVERABLES:

1. db/schema.sql — all CREATE TABLE statements in this exact order:
   a. facilities (id, name, district, province, facility_type, lat, lng, created_at)
   b. users (id, email, password_hash, full_name, role, facility_id, province,
      is_active, last_login_at, created_at)
   c. icd11_codes (id, code, label, chapter, block, is_active)
   d. death_records (id, facility_id, recorded_by, patient_age_years,
      patient_sex, patient_district, primary_cause_icd11, primary_cause_label,
      time_of_death, time_of_admission, ward, was_admitted, notes, created_at)
   e. contributing_factors (id, death_record_id, factor_type, icd11_code,
      label, notes)
   f. drug_inventory (id, facility_id, drug_name, generic_name, batch_number,
      quantity_in_stock, unit, expiry_date, reorder_level, last_updated_by,
      updated_at)
   g. drug_transactions (id, drug_inventory_id, facility_id, transaction_type,
      quantity, notes, performed_by, created_at)
   h. research_proposals (id, title, summary, evidence_basis, priority_score,
      affected_provinces, icd11_codes_involved, status, generated_at,
      reviewed_by, reviewed_at)
   i. mortality_alerts (id, facility_id, province, alert_type, description,
      icd11_code, baseline_rate, observed_rate, period_start, period_end,
      is_resolved, created_at)
   j. audit_logs (id, user_id, action, table_name, record_id, old_values,
      new_values, ip_address, created_at)
   k. sync_queue (id, device_id, record_type, record_data, sync_status,
      facility_id, created_at, synced_at)
      — sync_status: 'pending' | 'synced' | 'error'

2. db/rls.sql — PostgreSQL Row Level Security policies:
   - Enable RLS on: death_records, drug_inventory, drug_transactions
   - clinician: SELECT/INSERT on death_records WHERE facility_id = current user's facility
   - pharmacist: SELECT/INSERT/UPDATE on drug_inventory WHERE facility_id = current user's
   - facility_admin: SELECT on all three WHERE facility_id = current user's facility
   - provincial_officer: SELECT on all three WHERE province = current user's province
   - ministry_admin + super_admin: full SELECT on everything
   - Use a set_config approach: the API sets app.current_user_id and
     app.current_user_role at the start of each request

3. db/indexes.sql — performance indexes on:
   - death_records(facility_id), death_records(primary_cause_icd11),
     death_records(time_of_death), death_records(created_at)
   - drug_inventory(facility_id), drug_inventory(expiry_date)
   - mortality_alerts(is_resolved), mortality_alerts(created_at)
   - audit_logs(user_id), audit_logs(created_at)

Include CHECK constraints, NOT NULL constraints, and foreign keys with
ON DELETE CASCADE where appropriate. Use gen_random_uuid() for all PKs.
Write the complete SQL — no truncation.
```

**Verify before moving on:**
- [ ] `psql` into the DB and run `\dt` — all 11 tables exist
- [ ] Foreign keys resolve correctly (`\d death_records`)
- [ ] RLS is enabled (`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public'`)

---

## Step 3 — Seed data & ICD-11 codes

**Goal:** Populate the database with realistic Zambian test data.

**Paste this prompt:**

```
You are building ZNHIP. This is Step 3 of 12.
Steps 1–2 complete: Docker running, all 11 database tables created with RLS.

Your only job this session is seed data.

DELIVERABLES:

1. db/seed.sql — insert in this order:

   FACILITIES (6 total):
   - UTH Lusaka (Lusaka, Lusaka Province, hospital)
   - Ndola Central Hospital (Ndola, Copperbelt, hospital)
   - Livingstone General Hospital (Livingstone, Southern, hospital)
   - Chipata General Hospital (Chipata, Eastern, hospital)
   - Kasama General Hospital (Kasama, Northern, hospital)
   - Mongu General Hospital (Mongu, Western, hospital)

   USERS (one per role per facility minimum):
   - super_admin: admin@znhip.gov.zm
   - ministry_admin: ministry@znhip.gov.zm (no facility)
   - provincial_officer: lusaka.officer@znhip.gov.zm (Lusaka Province)
   - facility_admin: uth.admin@znhip.gov.zm (UTH Lusaka)
   - clinician: dr.banda@uth.gov.zm (UTH Lusaka)
   - clinician: dr.mwale@ndola.gov.zm (Ndola Central)
   - pharmacist: pharm.chanda@uth.gov.zm (UTH Lusaka)
   All passwords: hash of "ZNHIPTest2026!" using bcrypt cost 12
   (write the hash inline — do not generate it at runtime in the seed)
   Use this hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGFQKBZp4GFJqgN3gPhBVCU0XKi

   ICD-11 CODES (20 codes relevant to Zambia's disease burden):
   Include: malaria (1F40), HIV disease (1C62), tuberculosis (1B10),
   neonatal sepsis (KA21), maternal haemorrhage (CB00),
   pneumonia (CA40), diarrhoeal disease (1A00), anaemia (3A00),
   malnutrition (5B51), road traffic injury (NF01), stroke (8B20),
   diabetes (5A10), heart failure (BD10), sepsis (1G41),
   preterm birth complications (KA00), meningitis (1D01),
   cholera (1A00.0), typhoid (1A07), COVID-19 (RA01), sickle cell (3A51)

   DEATH RECORDS (40 total, spread across facilities and the past 6 months):
   - Mix of ICD-11 codes above
   - Realistic ages: neonatal deaths age 0, maternal deaths age 18–45,
     malaria deaths all ages
   - Some with and some without admission (was_admitted true/false)
   - Include 2–3 contributing factors per record (use factor_type:
     'comorbidity', 'delayed_presentation', 'drug_shortage', 'malnutrition')

   DRUG INVENTORY (5 drugs per facility):
   - Artemether/Lumefantrine (malaria), stock varies 0–500 tablets
   - Amoxicillin 500mg, stock varies 20–300 capsules
   - ORS sachets, stock varies 10–200
   - Oxytocin 10IU/ml vials, stock varies 0–50 vials
   - ARV (Tenofovir/Lamivudine/Dolutegravir), stock varies 10–400 tablets
   - Set 2 facilities with Artemether stock = 0 (simulates stockout)
   - Set expiry dates: some within 14 days, some within 30 days

   RESEARCH PROPOSALS (3 pre-generated):
   - "Malaria mortality outcomes during stock interruptions in Copperbelt Province"
     priority_score: 0.87, status: proposed
   - "Neonatal sepsis contributing factors across Eastern Province hospitals"
     priority_score: 0.74, status: reviewed
   - "Maternal haemorrhage rates and oxytocin availability correlation"
     priority_score: 0.91, status: approved

2. A script db/reset-and-seed.sh that:
   - Drops and recreates the public schema
   - Runs schema.sql, rls.sql, indexes.sql, seed.sql in order

Write every INSERT statement fully. No loops or procedural code — plain SQL only.
```

**Verify before moving on:**
- [ ] `SELECT COUNT(*) FROM death_records` returns 40
- [ ] `SELECT COUNT(*) FROM drug_inventory` returns 30
- [ ] Login works: `POST /api/auth/login` with `dr.banda@uth.gov.zm` / `ZNHIPTest2026!`

---

## Step 4 — Backend auth & middleware

**Goal:** JWT authentication, RBAC middleware, rate limiting, audit logging.

**Paste this prompt:**

```
You are building ZNHIP. This is Step 4 of 12.
Steps 1–3 complete: Docker, schema (11 tables), seed data (40 deaths, 30 drugs,
6 facilities, 7 users) all working.

Your only job this session is the backend auth system and core middleware.

STACK: Node.js + Express + TypeScript + pg + jsonwebtoken + bcrypt + zod + redis

DELIVERABLES — all files in api/src/:

1. config/db.ts — PostgreSQL connection pool (pg.Pool), exports query() helper
   that also sets app.current_user_id and app.current_user_role on each connection
   using SET LOCAL for RLS

2. config/redis.ts — Redis client setup using ioredis

3. types/index.ts — TypeScript interfaces:
   User, Facility, DeathRecord, ContributingFactor, DrugInventory,
   DrugTransaction, ResearchProposal, MortalityAlert
   Also: JWTPayload { userId, role, facilityId, province }
   Also: ApiResponse<T> { success, data?, error?, message? }

4. middleware/auth.ts
   - authenticateToken(req, res, next): verifies JWT from Authorization header
   - requireRole(...roles): checks user role, returns 403 if not allowed
   - Sets req.user = decoded JWT payload on every authenticated request

5. middleware/rateLimiter.ts
   - loginLimiter: max 10 requests per 15 minutes per IP (use express-rate-limit + redis store)
   - apiLimiter: max 100 requests per minute per user

6. middleware/auditLogger.ts
   - Logs every POST/PATCH/DELETE to audit_logs table
   - Captures: user_id, action (CREATE/UPDATE/DELETE), table_name (from req path),
     record_id (from req.params.id), ip_address, timestamp

7. middleware/validate.ts
   - validateBody(schema): Zod validation middleware, returns 400 with field errors

8. routes/auth.ts
   POST /api/auth/login
   - Validate email + password with Zod
   - Check user exists and is_active
   - Compare bcrypt hash
   - Return: { accessToken (15min), user: { id, email, role, facilityId, fullName } }
   - Set refreshToken as httpOnly cookie (7 days)
   - Update last_login_at

   POST /api/auth/refresh
   - Read refresh token from cookie
   - Verify and issue new access token

   POST /api/auth/logout
   - Clear refresh token cookie
   - Blacklist the refresh token in Redis

9. app.ts — Express app setup:
   - helmet(), cors(), json body parser
   - Mount all middleware and routes
   - Global error handler: catches all unhandled errors,
     returns { success: false, error: message }
   - GET /health → { status: 'ok', timestamp }

10. server.ts — starts the server on process.env.PORT

All TypeScript, strict mode, no any types. Full error handling on every function.
```

**Verify before moving on:**
- [ ] `POST /api/auth/login` returns an access token
- [ ] `GET /health` returns 200
- [ ] Login with wrong password returns 401
- [ ] 11th login attempt returns 429

---

## Step 5 — Death records API

**Goal:** Full CRUD + statistics for mortality data.

**Paste this prompt:**

```
You are building ZNHIP. This is Step 5 of 12.
Steps 1–4 complete: Docker, schema, seed, auth middleware all working.
JWT auth protects all routes. RLS enforced at DB level.

Your only job this session is the death records API.

DELIVERABLES — in api/src/routes/deaths.ts and api/src/services/deaths.ts:

ROUTES (all require authenticateToken):

POST /api/deaths                     [clinician, facility_admin]
- Body (Zod validated):
  { patientAgeYears?, patientSex, patientDistrict?,
    primaryCauseIcd11, primaryCauseLabel,
    timeOfDeath, timeOfAdmission?, ward?, wasAdmitted,
    notes?, contributingFactors: Array<{
      factorType, icd11Code?, label, notes?
    }>
  }
- Insert death_record, then insert contributing_factors in a transaction
- Return created record with contributing factors

GET /api/deaths                      [all authenticated roles]
- Query params: facility_id?, province?, icd11_code?,
  date_from?, date_to?, ward?, page (default 1), limit (default 20)
- Apply filters based on user role (clinician sees own facility only,
  provincial_officer sees own province, ministry sees all)
- Return paginated results with total count

GET /api/deaths/:id                  [all authenticated roles]
- Return single death record with its contributing factors
- Enforce same role-based scoping

GET /api/deaths/stats/summary        [facility_admin, provincial_officer, ministry_admin]
- Query params: facility_id?, province?, date_from?, date_to?
- Returns:
  {
    totalDeaths: number,
    topCauses: [{ icd11Code, label, count, percentage }],  // top 10
    byMonth: [{ month, count }],
    byWard: [{ ward, count }],
    byAgeGroup: [{ group: '0-1'|'1-5'|'5-18'|'18-60'|'60+', count }],
    bySex: { male, female, unknown },
    avgTimeToAdmission: number | null,  // hours
    contributingFactorBreakdown: [{ factorType, count }]
  }
- All queries use aggregation SQL — no in-memory computation

GET /api/deaths/export/csv           [ministry_admin, super_admin]
- Stream CSV of death records with all fields
- Filename header: attachment; filename="znhip-deaths-YYYY-MM-DD.csv"

Also create api/src/routes/icd11.ts:
GET /api/icd11/search?q=             [all authenticated]
- Full-text search on icd11_codes.code and icd11_codes.label
- Return top 10 matches: { code, label, chapter }
- Cache results in Redis for 1 hour (key: "icd11:search:{q}")

Write complete service layer functions with SQL. No ORMs — raw pg queries only.
Handle all database errors and return appropriate HTTP status codes.
```

**Verify before moving on:**
- [ ] `POST /api/deaths` creates a record with contributing factors
- [ ] `GET /api/deaths/stats/summary` returns all 6 stat blocks
- [ ] Clinician cannot see deaths from another facility (RLS test)
- [ ] ICD-11 search returns results within 300ms

---

## Step 6 — Drug inventory API

**Goal:** Full inventory management with alerts and transaction history.

**Paste this prompt:**

```
You are building ZNHIP. This is Step 6 of 12.
Steps 1–5 complete: auth, death records API, ICD-11 search all working.

Your only job this session is the drug inventory API.

DELIVERABLES — api/src/routes/drugs.ts and api/src/services/drugs.ts:

ROUTES (all require authenticateToken):

GET /api/drugs                          [pharmacist, facility_admin, provincial_officer, ministry_admin]
- Query params: facility_id?, expiring_within_days?, below_reorder?, page, limit
- Return inventory with computed fields:
  { ...drug, daysUntilExpiry, isExpiringSoon (≤30 days), isBelowReorder, stockStatus }
  stockStatus: 'ok' | 'low' | 'critical' | 'out'
  - out: quantity = 0
  - critical: quantity > 0 AND quantity < reorder_level * 0.5
  - low: quantity >= reorder_level * 0.5 AND quantity < reorder_level
  - ok: quantity >= reorder_level

POST /api/drugs                         [pharmacist, facility_admin]
- Body: { drugName, genericName?, batchNumber?, quantityInStock,
          unit, expiryDate, reorderLevel, facilityId }
- Validate: expiryDate must be in the future
- Insert and return created record
- Log a 'received' drug_transaction automatically

PATCH /api/drugs/:id                    [pharmacist, facility_admin]
- Body: { quantityInStock?, reorderLevel?, batchNumber?, expiryDate? }
- Record a drug_transaction of type 'adjusted' with the difference
- Update updated_at

POST /api/drugs/:id/transaction         [pharmacist, facility_admin]
- Body: { transactionType, quantity, notes? }
  transactionType: 'received' | 'dispensed' | 'expired' | 'adjusted'
- For 'dispensed': validate quantity <= current stock, return 400 if not
- Update drug_inventory.quantity_in_stock accordingly:
  received → add, dispensed/expired → subtract, adjusted → set directly
- Insert into drug_transactions
- Return updated inventory record

GET /api/drugs/:id                      [pharmacist, facility_admin, ministry_admin]
- Return drug with full transaction history (last 50 transactions)

GET /api/drugs/alerts                   [pharmacist, facility_admin, provincial_officer, ministry_admin]
- Returns two arrays:
  {
    expiringSoon: drugs expiring within 30 days (sorted by expiry ASC),
    belowReorder: drugs where quantity_in_stock < reorder_level (sorted by stockStatus)
  }
- Include facility name in each result

GET /api/drugs/stats/summary            [facility_admin, provincial_officer, ministry_admin]
- Query params: facility_id?, province?
- Returns:
  {
    totalDrugs: number,
    outOfStock: number,
    criticalStock: number,
    expiringSoon: number,      // within 30 days
    expiringThisWeek: number,  // within 7 days
    byFacility: [{ facilityName, totalDrugs, outOfStock, criticalStock }]
  }

Also build a background job in api/src/jobs/inventoryAlerts.ts:
- Runs every day at 06:00 (node-cron)
- Finds drugs expiring within 7 days or quantity = 0
- Inserts a mortality_alert of type 'stockout_correlation' if a facility
  has stock = 0 AND has had a death in the last 7 days with any contributing
  factor of type 'drug_shortage'
- Log results to console with timestamp

Write full service functions with SQL. Handle concurrent stock updates
using SELECT ... FOR UPDATE to prevent race conditions.
```

**Verify before moving on:**
- [ ] `GET /api/drugs/alerts` returns expiring and low-stock drugs
- [ ] Dispensing more than available stock returns 400
- [ ] Stock levels update correctly after each transaction
- [ ] Background job runs without errors

---

## Step 7 — AI microservice

**Goal:** Anomaly detection, drug-mortality correlation, research proposal generation.

**Paste this prompt:**

```
You are building ZNHIP. This is Step 7 of 12.
Steps 1–6 complete: full backend API for auth, deaths, and inventory working.

Your only job this session is the Python FastAPI AI microservice.

LOCATION: ai-service/

DELIVERABLES:

1. ai-service/main.py — FastAPI app with:

   GET /health → { status: 'ok' }

   POST /analyze
   - Accepts JSON body:
     {
       deaths: Array<{ facilityId, province, icd11Code, timeOfDeath,
                       patientAgeYears, patientSex, contributingFactors }>,
       inventory: Array<{ facilityId, drugName, quantityInStock,
                          expiryDate, updatedAt }>,
       lookbackDays: int (default 90)
     }
   - Returns:
     {
       alerts: MortalityAlert[],
       proposals: ResearchProposal[],
       analysisTimestamp: ISO8601 string,
       stats: { deathsAnalysed, facilitiesAnalysed, alertsGenerated, proposalsGenerated }
     }

2. ai-service/analysis/anomaly.py — anomaly detection:
   Function: detect_anomalies(deaths_df: pd.DataFrame) -> List[dict]
   
   Logic:
   - Group deaths by facility_id + icd11_code + 30-day windows
   - For each group: compute baseline_rate (days 31–90) and current_rate (days 0–30)
   - If current_rate > baseline_rate * 1.25 AND current_rate >= 3 deaths:
     create an alert
   - alert_type: 'spike'
   - Include: facility_id, icd11_code, baseline_rate, observed_rate,
     period_start, period_end, description (human-readable sentence)

3. ai-service/analysis/correlation.py — drug-mortality correlation:
   Function: detect_drug_correlations(deaths_df, inventory_df) -> List[dict]
   
   Logic:
   - For each facility, find drugs where quantity = 0 (stockout periods)
   - For the same facility, look for deaths in the same 30-day window
     with contributing_factor type = 'drug_shortage'
   - If ≥2 deaths overlap with a stockout at the same facility:
     create alert of type 'stockout_correlation'
   - Include: facility_id, drug_name, death_count, stockout_start,
     description

4. ai-service/analysis/proposals.py — research proposal generation:
   Function: generate_proposals(deaths_df, existing_proposals) -> List[dict]
   
   Logic:
   - Count deaths per icd11_code for the analysis period
   - Filter out codes where a proposal was generated in the last 180 days
   - For the top 5 remaining codes, compute priority_score:
     - death_count_score = min(death_count / 20, 1.0) * 0.4
     - trend_score: 1.0 if current > baseline, 0.5 if equal, 0.0 if declining, * 0.3
     - geographic_spread_score = unique_provinces / 10 * 0.3
     - priority_score = death_count_score + trend_score + geographic_spread_score
   - Generate title and summary as formatted strings (no LLM — template-based)
   - Return proposals sorted by priority_score descending

5. ai-service/analysis/utils.py — shared utilities:
   - parse_deaths_df(): converts raw JSON to clean pandas DataFrame with correct dtypes
   - parse_inventory_df(): same for inventory
   - date_window(df, days_ago_start, days_ago_end): filter DataFrame by date range

6. api/src/jobs/aiAnalysis.ts — Node.js cron job:
   - Runs nightly at 02:00
   - Fetches last 90 days of deaths and inventory from DB
   - POSTs to http://ai:8000/analyze
   - Inserts returned alerts into mortality_alerts table (skip duplicates)
   - Inserts returned proposals into research_proposals table (skip duplicates)
   - Logs: "AI analysis complete: X alerts, Y proposals"

   Also expose: POST /api/ai/run [super_admin only]
   to trigger the analysis job manually and return its results immediately.

Write clean Python with type hints throughout. Use pandas for all data manipulation.
No external ML APIs — all logic is implemented locally.
```

**Verify before moving on:**
- [ ] `POST http://localhost:8000/analyze` with sample data returns alerts + proposals
- [ ] At least 1 alert generated from seed data (2 facilities have zero Artemether stock)
- [ ] `POST /api/ai/run` triggers analysis and stores results in DB
- [ ] `GET /api/ai/proposals` returns the generated proposals

---

## Step 8 — Dashboard & reporting API

**Goal:** Aggregated KPIs for national, provincial, and facility dashboards.

**Paste this prompt:**

```
You are building ZNHIP. This is Step 8 of 12.
Steps 1–7 complete: auth, deaths API, drugs API, AI microservice all working.

Your only job this session is the dashboard and reporting API endpoints.

DELIVERABLES — api/src/routes/dashboard.ts:

GET /api/dashboard/mortality           [all authenticated]
Role-scoped: clinician/facility_admin see own facility,
provincial sees province, ministry sees national.

Returns:
{
  totalDeaths: number,
  deathsThisMonth: number,
  deathsLastMonth: number,
  monthOverMonthChange: number,         // percentage, can be negative
  topCauses: [{ icd11Code, label, count, trend: 'up'|'down'|'stable' }],  // top 5
  deathsByProvince: [{ province, count }],   // for map rendering
  deathsByMonth: [{ month: 'YYYY-MM', count }],  // last 12 months
  deathsByAgeGroup: [{ group, count }],
  recentAlerts: MortalityAlert[],       // last 5 unresolved
  facilityRanking: [{ facilityName, province, totalDeaths, topCause }]  // top 10
}

GET /api/dashboard/inventory           [pharmacist, facility_admin, provincial_officer, ministry_admin]
Returns:
{
  totalDrugLines: number,
  outOfStock: number,
  criticalStock: number,
  expiringSoon: number,
  expiryValue: string,                  // "X items expiring in <7 days"
  stockoutAlerts: [{ facilityName, drugName, daysSinceEmpty }],
  stockByFacility: [{ facilityName, province, outOfStock, criticalStock, totalLines }]
}

GET /api/dashboard/research            [ministry_admin, super_admin]
Returns:
{
  totalProposals: number,
  byStatus: { proposed, reviewed, approved, archived },
  topProposal: ResearchProposal | null,
  recentlyApproved: ResearchProposal[]  // last 3
}

GET /api/ai/proposals                  [ministry_admin, super_admin]
- Query params: status?, page, limit
- Returns paginated proposals sorted by priority_score DESC

PATCH /api/ai/proposals/:id            [ministry_admin, super_admin]
- Body: { status: 'reviewed' | 'approved' | 'archived' }
- Updates status and sets reviewed_by + reviewed_at

GET /api/ai/alerts                     [facility_admin, provincial_officer, ministry_admin]
- Query params: is_resolved?, facility_id?, province?, page, limit
- Returns alerts sorted by created_at DESC

PATCH /api/ai/alerts/:id/resolve       [facility_admin, provincial_officer, ministry_admin]
- Sets is_resolved = true

GET /api/reports/deaths/csv            [ministry_admin, super_admin]
GET /api/reports/inventory/csv         [ministry_admin, super_admin]
- Stream CSV responses with proper headers
- Include all columns, formatted dates, human-readable labels

All endpoints use raw SQL aggregation queries. No ORMs.
Include proper indexes hints if queries are slow (EXPLAIN ANALYZE guidance in comments).
```

**Verify before moving on:**
- [ ] `/api/dashboard/mortality` returns all 8 data blocks
- [ ] `/api/dashboard/inventory` returns stock summary
- [ ] CSV export downloads a valid file with correct headers
- [ ] Ministry admin sees national data; clinician sees only their facility

---

## Step 9 — React frontend (auth + layout)

**Goal:** Login page, protected routing, sidebar navigation, role-aware layout.

**Paste this prompt:**

```
You are building ZNHIP. This is Step 9 of 12.
Steps 1–8 complete: full backend API working with all endpoints.

Your only job this session is the React frontend foundation.

STACK: React 18 + TypeScript + Vite + Tailwind CSS + React Router v6
+ Axios + Zustand + @tanstack/react-query

COLOR THEME (use as Tailwind custom colors in tailwind.config.ts):
  primary: #0F6E56 (teal), primary-light: #1D9E75, primary-dark: #0B3D2E
  accent: #E8A020 (gold), surface: #F4F9F7, muted: #8AADA0

DELIVERABLES — all in web/src/:

1. tailwind.config.ts — extend with ZNHIP color palette above

2. store/authStore.ts (Zustand)
   State: { user, accessToken, isAuthenticated }
   Actions: { login(email, password), logout(), refreshToken(), setUser }
   Persist accessToken in memory only (not localStorage)
   Auto-refresh token 60 seconds before expiry using setInterval

3. lib/axios.ts
   - Axios instance with baseURL from VITE_API_URL env var
   - Request interceptor: attach Authorization: Bearer {accessToken}
   - Response interceptor: on 401, attempt token refresh then retry;
     if refresh fails, call logout() and redirect to /login

4. components/layout/Sidebar.tsx
   - Logo + "ZNHIP" text at top
   - Navigation links vary by role:
     ALL: Dashboard
     clinician: Record Death, My Records
     pharmacist: Inventory, Stock Alerts
     facility_admin: Deaths, Inventory, Alerts
     provincial_officer: Deaths, Inventory, Alerts
     ministry_admin: Deaths, Inventory, Research, Alerts, Reports
     super_admin: all of above + Users
   - Active link highlighted with primary color left border
   - User name + role badge at bottom with logout button
   - Collapsible on mobile

5. components/layout/Layout.tsx
   - Sidebar left, main content right
   - TopBar: breadcrumb + notification bell (shows unresolved alert count)

6. pages/Login.tsx
   - Full-page centered form: email + password + submit
   - ZNHIP logo and "Ministry of Health, Republic of Zambia" subtitle
   - Show error message on failed login
   - Redirect to /dashboard on success

7. router/index.tsx
   - ProtectedRoute component: redirects to /login if not authenticated
   - RoleGuard component: redirects to /dashboard if role not permitted
   - Routes: /login, /dashboard, /deaths, /deaths/new, /deaths/:id,
     /inventory, /inventory/new, /inventory/:id, /research,
     /alerts, /reports

8. pages/NotFound.tsx and pages/Unauthorized.tsx — simple error pages

9. main.tsx + App.tsx — QueryClientProvider, Router, AuthProvider wrappers

Write fully typed TypeScript with no `any`. Every component must handle
loading and error states. Use Tailwind classes only — no inline styles.
```

**Verify before moving on:**
- [ ] `npm run dev` in web/ starts without TypeScript errors
- [ ] Login form submits and stores token
- [ ] Navigating to /dashboard without auth redirects to /login
- [ ] Sidebar shows correct links for each role

---

## Step 10 — React frontend (dashboard + deaths)

**Goal:** The two most important views: the national dashboard and death record entry.

**Paste this prompt:**

```
You are building ZNHIP. This is Step 10 of 12.
Steps 1–9 complete: backend API, React auth, routing, sidebar layout all working.

Your only job this session is two pages: Dashboard and Death Records.

DELIVERABLES — all in web/src/:

1. pages/Dashboard.tsx
   Uses GET /api/dashboard/mortality and GET /api/dashboard/inventory

   Layout (role-aware — show only what the role can see):

   TOP ROW — 4 stat cards:
   - Total Deaths (this month) with month-over-month % change (red if up, green if down)
   - Top Cause of Death (label + count)
   - Out of Stock Drugs (count, yellow if >0, red if >5)
   - Unresolved Alerts (count, red if >0)

   MIDDLE ROW:
   - Left (60%): Line chart (Recharts) — Deaths by Month, last 12 months,
     teal line, gridlines, hover tooltip
   - Right (40%): Horizontal bar chart — Top 5 Causes of Death this month

   BOTTOM ROW:
   - Left: Deaths by Province table (province, count, % of total)
     Ministry admin sees all provinces; others see their scope
   - Right: Recent Unresolved Alerts list (type badge, description, facility, time ago)

   Loading state: skeleton placeholders for each card and chart
   Error state: red banner with retry button

2. components/charts/MortalityTrendChart.tsx
   Recharts LineChart — accepts { month: string, count: number }[]
   Teal (#0F6E56) line, white background, formatted month labels on X axis

3. components/charts/TopCausesChart.tsx
   Recharts BarChart (horizontal) — accepts { label, count }[]
   Teal bars, count labels on right side

4. pages/Deaths.tsx
   Table view of death records with:
   - Filters (date range, ICD-11 search, ward, province — shown based on role)
   - Columns: Date, Cause (ICD-11 code + label), Age, Sex, Ward, Facility,
     Contributing Factors count
   - Pagination (20 per page)
   - "Record Death" button (top right, clinician and facility_admin only)
   - Click row → /deaths/:id

5. pages/DeathDetail.tsx (GET /api/deaths/:id)
   Two-column layout:
   - Left: patient info, primary cause, time details
   - Right: contributing factors list (each as a pill/badge by factor_type)
   - Back button

6. pages/NewDeath.tsx — death record entry form
   Step 1 — Patient Info:
   - Age (number), Sex (radio: Male/Female/Unknown),
     District of origin (text), Ward (text), Was admitted (toggle)
   - Time of death (datetime picker), Time of admission (datetime picker, shown if admitted)

   Step 2 — Primary Cause:
   - ICD-11 live search input (debounced 300ms, calls GET /api/icd11/search)
   - Results appear as dropdown, click to select
   - Shows selected code + label in a green badge

   Step 3 — Contributing Factors:
   - "Add factor" button opens a mini-form: Factor Type (select),
     ICD-11 code (optional search), Label (text), Notes (textarea)
   - Added factors appear as removable list items

   Step 4 — Review & Submit:
   - Summary of all entered data
   - Submit button → POST /api/deaths
   - On success: show confirmation toast, redirect to /deaths

   Multi-step form with progress bar. Validate each step before advancing.
   Zod schemas mirror the API validation.

Use @tanstack/react-query for all data fetching. Invalidate queries on mutation.
Show toast notifications (build a simple Toast component) for success and error.
All forms use React Hook Form. Fully typed TypeScript throughout.
```

**Verify before moving on:**
- [ ] Dashboard loads with real data from seed
- [ ] Charts render with correct data
- [ ] New death form completes all 4 steps and submits
- [ ] ICD-11 search dropdown works with debounce

---

## Step 11 — React frontend (inventory + research + alerts)

**Goal:** Pharmacy view, ministry research proposals, and alert management.

**Paste this prompt:**

```
You are building ZNHIP. This is Step 11 of 12.
Steps 1–10 complete: backend, auth, dashboard, death record pages all working.

Your only job this session is three remaining pages: Inventory, Research, and Alerts.

DELIVERABLES — all in web/src/:

1. pages/Inventory.tsx
   Table of drug inventory with:
   - Stock status badge per row: OUT (red), CRITICAL (orange), LOW (yellow), OK (green)
   - Columns: Drug Name, Generic Name, Batch, Qty in Stock, Unit, Expiry, Status, Actions
   - "Expiring Soon" tab filter (≤30 days) and "Below Reorder" tab filter
   - Each row: Edit Stock button (opens inline quantity update form)
   - "Add Drug" button → /inventory/new
   - Click row → /inventory/:id

2. pages/NewInventory.tsx
   Form: Drug Name, Generic Name, Batch Number, Quantity, Unit (select),
   Expiry Date, Reorder Level
   POST /api/drugs on submit

3. pages/InventoryDetail.tsx
   Two-column layout:
   - Left: drug info + current stock status card
   - Right: Transaction history table (type, quantity, performed by, date)
   Bottom: Update Stock form (select transaction type, enter quantity, notes)
   Shows days until expiry as a countdown badge (red if ≤7 days)

4. components/StockStatusBadge.tsx
   Props: { status: 'ok'|'low'|'critical'|'out' }
   Returns a color-coded pill component

5. pages/Research.tsx                [ministry_admin, super_admin only]
   Cards layout (not table) — each research proposal as a card:
   - Title, Summary, Priority Score (progress bar 0–100%), Status badge
   - Affected provinces as tags
   - ICD-11 codes involved
   - "Approve" and "Archive" action buttons (PATCH /api/ai/proposals/:id)
   - Filter by status (tabs: All, Proposed, Reviewed, Approved, Archived)
   - Sort by Priority Score (default) or Date

6. pages/Alerts.tsx
   Two sections:

   Section 1 — Mortality Alerts (GET /api/ai/alerts):
   - Type badge (spike = red, stockout_correlation = orange, new_pattern = blue)
   - Description, facility/province, date, baseline vs observed rate
   - "Mark Resolved" button

   Section 2 — Inventory Alerts (GET /api/drugs/alerts):
   - Expiring Soon list: drug name, facility, days until expiry, quantity
   - Below Reorder list: drug name, facility, current stock, reorder level

   Unresolved count shown in Sidebar notification badge (from Zustand store,
   updated every 5 minutes via react-query refetchInterval)

7. pages/Reports.tsx                 [ministry_admin, super_admin only]
   Simple page with two download buttons:
   - "Download Deaths CSV" → GET /api/reports/deaths/csv
   - "Download Inventory CSV" → GET /api/reports/inventory/csv
   Each button shows a date range picker (default: last 30 days) before downloading
   Handle the file download via a Blob URL (don't navigate away)

All pages: loading skeletons, error states, empty states with helpful messages.
All mutations use react-query useMutation with optimistic updates where possible.
Mobile-responsive layouts throughout using Tailwind responsive prefixes.
```

**Verify before moving on:**
- [ ] Inventory page shows stock status badges correctly
- [ ] Transaction form updates stock in real time
- [ ] Research proposals can be approved/archived
- [ ] Alert count appears in sidebar badge
- [ ] CSV download produces a valid file

---

## Step 12 — React Native mobile app (offline sync)

**Goal:** Offline-capable mobile app for clinicians and pharmacists in low-connectivity facilities.

**Paste this prompt:**

```
You are building ZNHIP. This is Step 12 of 12.
Steps 1–11 complete: full web platform working end to end.

Your only job this session is the React Native mobile app with offline sync.

STACK: React Native (TypeScript) + WatermelonDB (SQLite) + Axios + Zustand

DELIVERABLES — all in mobile/src/:

1. database/schema.ts (WatermelonDB)
   Tables mirroring the backend:
   - death_records: all fields from the API + sync_status (pending/synced/error)
   - contributing_factors: all fields + death_record_local_id (local relation)
   - drug_inventory: read-only local cache of facility's drugs
   - drug_transactions: quantity, type, drug_id, sync_status

2. database/models/ — WatermelonDB Model classes for each table above

3. services/syncService.ts
   Function: syncPendingRecords()
   - Find all death_records WHERE sync_status = 'pending'
   - POST each to /api/deaths (include contributing_factors in body)
   - On success: update sync_status = 'synced', store server_id
   - On failure (network or 4xx): set sync_status = 'error', store error_message
   - Find all drug_transactions WHERE sync_status = 'pending'
   - POST each to /api/drugs/:drug_id/transaction
   - Update sync_status accordingly
   - Return: { synced: number, failed: number, lastSyncAt: Date }

   Function: pullInventoryCache()
   - GET /api/drugs?facility_id={user.facilityId}
   - Upsert into local drug_inventory table

4. store/syncStore.ts (Zustand)
   State: { pendingCount, lastSyncAt, isSyncing, syncError }
   Actions: { runSync(), setSyncing, setSyncResult }
   - Listens to NetInfo for connectivity changes
   - Auto-triggers syncPendingRecords() when connectivity is restored
   - Updates pendingCount by querying WatermelonDB

5. screens/LoginScreen.tsx
   - Email + password form, same API as web
   - Store JWT in AsyncStorage (mobile — acceptable here unlike web)
   - On login, immediately call pullInventoryCache()

6. screens/DashboardScreen.tsx
   - Pending sync count badge (prominent, yellow if >0)
   - Last sync timestamp
   - Two buttons: "Record Death" and "Update Stock"
   - Basic stats (deaths this month from local DB only — no network required)

7. screens/RecordDeathScreen.tsx
   - Same 4-step flow as web but in React Native ScrollView
   - Step 1: Patient info (TextInput, RadioButton, DatePicker)
   - Step 2: ICD-11 search (queries /api/icd11/search if online;
     falls back to local cache of top 50 codes if offline)
   - Step 3: Contributing factors (add/remove inline)
   - Step 4: Review + Save
   - On Save: INSERT into local WatermelonDB with sync_status = 'pending'
   - Show: "Saved locally. Will sync when connected." toast

8. screens/InventoryScreen.tsx
   - List from local drug_inventory cache
   - "Update Stock" → opens quantity input + transaction type picker
   - On save: INSERT into drug_transactions with sync_status = 'pending'
   - "Refresh" button: calls pullInventoryCache() (requires connectivity)

9. components/SyncStatusBar.tsx
   - Persistent bottom bar showing:
     Green "Synced" if pendingCount = 0
     Yellow "X records pending sync" if pendingCount > 0 and online
     Red "Offline — X records pending" if offline
   - Tap to trigger manual sync

10. navigation/AppNavigator.tsx
    - Stack navigator: Login → Main (Tab: Dashboard, Record Death, Inventory)
    - Protected: redirect to Login if no stored token

Write full TypeScript. Handle all WatermelonDB operations in @database decorators.
Include basic unit tests for syncService.ts using Jest.
Note at the top of each file any native modules that require `npx pod-install` on iOS.
```

**Verify before moving on:**
- [ ] App launches and login works
- [ ] Recording a death offline saves to local DB
- [ ] Sync status bar shows pending count
- [ ] When connectivity restored, records POST to the API and status updates to 'synced'

---

## Final checklist — end-to-end verification

Run through these scenarios before presenting to stakeholders:

**Mortality workflow:**
- [ ] Clinician logs in on mobile (offline), records 2 deaths → pending count = 2
- [ ] Connectivity restored → records sync → appear in web dashboard

**Drug workflow:**
- [ ] Pharmacist dispenses Artemether → stock drops to 0
- [ ] `/api/drugs/alerts` immediately returns it as out-of-stock
- [ ] Nightly AI job flags the stockout + recent malaria death as a correlation alert
- [ ] Alert appears in ministry admin's Alerts page

**Research workflow:**
- [ ] `POST /api/ai/run` triggers analysis
- [ ] New proposal generated for top ICD-11 code
- [ ] Ministry admin reviews + approves proposal
- [ ] Approved proposal visible on Research page

**Access control:**
- [ ] Clinician at UTH cannot see deaths from Ndola (RLS enforced)
- [ ] Provincial officer for Lusaka cannot see Copperbelt data
- [ ] Ministry admin sees all provinces

**Performance:**
- [ ] Dashboard loads in under 2 seconds with seed data
- [ ] ICD-11 search responds in under 300ms

---

## Troubleshooting quick reference

| Problem | Fix |
|---------|-----|
| RLS blocking queries unexpectedly | Check that `SET LOCAL app.current_user_role` is being called before every query in the connection pool |
| AI service not generating proposals | Verify seed data has deaths in last 90 days — check `time_of_death` timestamps |
| Mobile sync failing silently | Check that the device's API base URL points to your LAN IP, not `localhost` |
| ICD-11 search returning nothing | Confirm `db/seed.sql` ICD-11 inserts ran — `SELECT COUNT(*) FROM icd11_codes` |
| JWT refresh loop | Ensure the axios interceptor doesn't retry the `/auth/refresh` endpoint itself |
| WatermelonDB migration error | Increment the schema version number and add a migration in `database/migrations.ts` |

---

*ZNHIP Build Guide v1.0 — Ministry of Health, Republic of Zambia — April 2026*
