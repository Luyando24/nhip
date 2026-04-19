-- Death Records Indexes
CREATE INDEX idx_deaths_facility ON death_records(facility_id);
CREATE INDEX idx_deaths_cause_code ON death_records(primary_cause_icd11);
CREATE INDEX idx_deaths_time ON death_records(time_of_death);
CREATE INDEX idx_deaths_created ON death_records(created_at);

-- Drug Inventory Indexes
CREATE INDEX idx_drugs_facility ON drug_inventory(facility_id);
CREATE INDEX idx_drugs_expiry ON drug_inventory(expiry_date);
CREATE INDEX idx_drugs_updated ON drug_inventory(updated_at);

-- Mortality Alerts Indexes
CREATE INDEX idx_alerts_facility ON mortality_alerts(facility_id);
CREATE INDEX idx_alerts_province ON mortality_alerts(province);
CREATE INDEX idx_alerts_resolved ON mortality_alerts(is_resolved);
CREATE INDEX idx_alerts_created ON mortality_alerts(created_at);

-- Audit Logs Indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- User Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_facility ON users(facility_id);

-- ICD-11 Search Index
CREATE INDEX idx_icd11_search ON icd11_codes USING gin(to_tsvector('english', label || ' ' || code));
