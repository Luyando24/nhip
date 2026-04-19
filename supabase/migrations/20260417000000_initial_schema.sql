-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Facilities
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  province TEXT NOT NULL,
  facility_type TEXT CHECK (facility_type IN ('hospital', 'clinic', 'health_post')),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('clinician', 'pharmacist', 'facility_admin', 'provincial_officer', 'ministry_admin', 'super_admin')),
  facility_id UUID REFERENCES facilities(id),
  province TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ICD-11 Codes
CREATE TABLE icd11_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  chapter TEXT,
  block TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 4. Death Records
CREATE TABLE death_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) NOT NULL,
  recorded_by UUID REFERENCES users(id) NOT NULL,
  patient_age_years INT,
  patient_sex TEXT CHECK (patient_sex IN ('male', 'female', 'unknown')),
  patient_district TEXT,
  primary_cause_icd11 TEXT NOT NULL,
  primary_cause_label TEXT NOT NULL,
  time_of_death TIMESTAMPTZ NOT NULL,
  time_of_admission TIMESTAMPTZ,
  ward TEXT,
  was_admitted BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Contributing Factors
CREATE TABLE contributing_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  death_record_id UUID REFERENCES death_records(id) ON DELETE CASCADE,
  factor_type TEXT NOT NULL CHECK (factor_type IN ('comorbidity', 'delayed_presentation', 'drug_shortage', 'malnutrition', 'other')),
  icd11_code TEXT,
  label TEXT NOT NULL,
  notes TEXT
);

-- 6. Drug Inventory
CREATE TABLE drug_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) NOT NULL,
  drug_name TEXT NOT NULL,
  generic_name TEXT,
  batch_number TEXT,
  quantity_in_stock INT NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  reorder_level INT NOT NULL DEFAULT 50,
  last_updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Drug Transactions
CREATE TABLE drug_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_inventory_id UUID REFERENCES drug_inventory(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id),
  transaction_type TEXT CHECK (transaction_type IN ('received', 'dispensed', 'expired', 'adjusted')),
  quantity INT NOT NULL,
  notes TEXT,
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. AI Research Proposals
CREATE TABLE research_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  evidence_basis TEXT NOT NULL,
  priority_score FLOAT NOT NULL,
  affected_provinces TEXT[],
  icd11_codes_involved TEXT[],
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'reviewed', 'approved', 'archived')),
  generated_at TIMESTAMPTZ DEFAULT now(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ
);

-- 9. Mortality Alerts
CREATE TABLE mortality_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id),
  province TEXT,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('spike', 'stockout_correlation', 'new_pattern')),
  description TEXT NOT NULL,
  icd11_code TEXT,
  baseline_rate FLOAT,
  observed_rate FLOAT,
  period_start DATE,
  period_end DATE,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Sync Queue (for Mobile)
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  record_type TEXT NOT NULL,
  record_data JSONB NOT NULL,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'error')),
  facility_id UUID REFERENCES facilities(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ
);
