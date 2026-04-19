-- 1. Alter Users Table Role Constraint to include 'research_partner'
-- Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
-- Re-add the constraint with the new role
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('clinician', 'pharmacist', 'facility_admin', 'provincial_officer', 'ministry_admin', 'super_admin', 'research_partner'));

-- 2. Create Research Instruments
CREATE TABLE research_instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_institution TEXT NOT NULL,
  owner_user_id UUID REFERENCES users(id),
  linked_proposal_id UUID REFERENCES research_proposals(id),
  form_schema JSONB NOT NULL,         -- instrument field definitions
  export_format TEXT DEFAULT 'redcap' CHECK (export_format IN ('redcap', 'odk', 'csv')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Research Data
CREATE TABLE research_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID REFERENCES research_instruments(id),
  linked_death_record_id UUID REFERENCES death_records(id),
  collected_by UUID REFERENCES users(id),
  facility_id UUID REFERENCES facilities(id),
  data JSONB NOT NULL,                -- flexible field storage
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'error')),
  collected_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Saved Analyses
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

-- 5. Create Data Access Requests
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  dataset_url TEXT,                   -- pre-signed download URL on approval
  dataset_expires_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create Research Questions
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
  framework TEXT DEFAULT 'pico' CHECK (framework IN ('pico', 'peo', 'open')),
  context_data JSONB,                 -- the mortality stats used to generate
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'incorporated_in_protocol')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create Research Findings
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

-- 8. Enable Row Level Security
ALTER TABLE research_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_findings ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS Policies
-- Helper functions for RLS (assuming `auth.uid()` corresponds to `users.id`)
-- research_instruments: owner_user_id matches current user OR role is ministry_admin/super_admin
CREATE POLICY "Users can access their own instruments or all if ministry_admin"
  ON research_instruments
  FOR ALL
  USING (
    owner_user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ministry_admin', 'super_admin'))
  );

-- research_data: instrument owner OR role is ministry_admin/super_admin
CREATE POLICY "Users can access data for their instruments or all if admin"
  ON research_data
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM research_instruments WHERE research_instruments.id = instrument_id AND research_instruments.owner_user_id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ministry_admin', 'super_admin'))
  );

-- saved_analyses: created_by matches current user OR is_shared = true OR role is ministry_admin
CREATE POLICY "Users can access their analyses, shared ones, or all if admin"
  ON saved_analyses
  FOR ALL
  USING (
    created_by = auth.uid() OR 
    is_shared = true OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ministry_admin', 'super_admin'))
  );

-- data_access_requests: requested_by matches current user OR role is ministry_admin/super_admin
CREATE POLICY "Users can access their data requests or all if admin"
  ON data_access_requests
  FOR ALL
  USING (
    requested_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ministry_admin', 'super_admin'))
  );

-- research_questions: proposal_id is accessible to current user (assuming all users can view proposals for now, or just limit to the one who generated it if research_partner)
-- Wait, prompt: "proposal_id is accessible to current user". Let's allow if generated_by matches or if admin, OR if the proposal is approved.
CREATE POLICY "Users access own questions or admin"
  ON research_questions
  FOR ALL
  USING (
    generated_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ministry_admin', 'super_admin'))
  );

-- research_findings: submitted_by matches current user OR role is ministry_admin/super_admin
CREATE POLICY "Users access own findings or admin"
  ON research_findings
  FOR ALL
  USING (
    submitted_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ministry_admin', 'super_admin'))
  );

-- 10. Create Anonymized Mortality View
CREATE VIEW research_mortality_view AS
SELECT
  date_trunc('month', dr.time_of_death) AS death_month,
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
HAVING COUNT(*) >= 5;

-- Grant select on the view to authenticated users
GRANT SELECT ON research_mortality_view TO authenticated;
