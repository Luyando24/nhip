-- ZNHIP Seed Data
-- Passwords: ZNHIPTest2026!

BEGIN;

-- 1. Facilities
INSERT INTO facilities (id, name, district, province, facility_type, lat, lng) VALUES
('f1000000-0000-0000-0000-000000000001', 'UTH Lusaka', 'Lusaka', 'Lusaka', 'hospital', -15.4297, 28.3129),
('f1000000-0000-0000-0000-000000000002', 'Ndola Central Hospital', 'Ndola', 'Copperbelt', 'hospital', -12.9733, 28.6433),
('f1000000-0000-0000-0000-000000000003', 'Livingstone General Hospital', 'Livingstone', 'Southern', 'hospital', -17.8441, 25.8507),
('f1000000-0000-0000-0000-000000000004', 'Chipata General Hospital', 'Chipata', 'Eastern', 'hospital', -13.6333, 32.6500),
('f1000000-0000-0000-0000-000000000005', 'Kasama General Hospital', 'Kasama', 'Northern', 'hospital', -10.2128, 31.1808),
('f1000000-0000-0000-0000-000000000006', 'Mongu General Hospital', 'Mongu', 'Western', 'hospital', -15.2484, 23.1274);

-- 2. Auth Users (GoTrue)
-- Password for all users: ZNHIPTest2026!
-- Hash generated via: python3 -c "import bcrypt; print(bcrypt.hashpw(b'ZNHIPTest2026!', bcrypt.gensalt(10)).decode())"
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token, recovery_token, email_change_token_new, email_change) VALUES
('a1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@znhip.gov.zm', '$2b$10$jMSKIlO9pFemRK35nOAi/.CcDdoOQWjlVZknla2E1prvwXID/MK.S', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', ''),
('a1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'ministry@znhip.gov.zm', '$2b$10$jMSKIlO9pFemRK35nOAi/.CcDdoOQWjlVZknla2E1prvwXID/MK.S', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', ''),
('a1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'lusaka.officer@znhip.gov.zm', '$2b$10$jMSKIlO9pFemRK35nOAi/.CcDdoOQWjlVZknla2E1prvwXID/MK.S', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', ''),
('a1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'uth.admin@znhip.gov.zm', '$2b$10$jMSKIlO9pFemRK35nOAi/.CcDdoOQWjlVZknla2E1prvwXID/MK.S', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', ''),
('a1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'dr.banda@uth.gov.zm', '$2b$10$jMSKIlO9pFemRK35nOAi/.CcDdoOQWjlVZknla2E1prvwXID/MK.S', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', ''),
('a1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'dr.mwale@ndola.gov.zm', '$2b$10$jMSKIlO9pFemRK35nOAi/.CcDdoOQWjlVZknla2E1prvwXID/MK.S', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', ''),
('a1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'pharm.chanda@uth.gov.zm', '$2b$10$jMSKIlO9pFemRK35nOAi/.CcDdoOQWjlVZknla2E1prvwXID/MK.S', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', ''),
('a1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'cidrz.research@znhip.gov.zm', '$2b$10$jMSKIlO9pFemRK35nOAi/.CcDdoOQWjlVZknla2E1prvwXID/MK.S', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', '');

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES
('a1000000-0000-0000-0000-000000000001', 'admin@znhip.gov.zm', 'a1000000-0000-0000-0000-000000000001', format('{"sub":"%s","email":"%s"}', 'a1000000-0000-0000-0000-000000000001', 'admin@znhip.gov.zm')::jsonb, 'email', now(), now(), now()),
('a1000000-0000-0000-0000-000000000002', 'ministry@znhip.gov.zm', 'a1000000-0000-0000-0000-000000000002', format('{"sub":"%s","email":"%s"}', 'a1000000-0000-0000-0000-000000000002', 'ministry@znhip.gov.zm')::jsonb, 'email', now(), now(), now()),
('a1000000-0000-0000-0000-000000000003', 'lusaka.officer@znhip.gov.zm', 'a1000000-0000-0000-0000-000000000003', format('{"sub":"%s","email":"%s"}', 'a1000000-0000-0000-0000-000000000003', 'lusaka.officer@znhip.gov.zm')::jsonb, 'email', now(), now(), now()),
('a1000000-0000-0000-0000-000000000004', 'uth.admin@znhip.gov.zm', 'a1000000-0000-0000-0000-000000000004', format('{"sub":"%s","email":"%s"}', 'a1000000-0000-0000-0000-000000000004', 'uth.admin@znhip.gov.zm')::jsonb, 'email', now(), now(), now()),
('a1000000-0000-0000-0000-000000000005', 'dr.banda@uth.gov.zm', 'a1000000-0000-0000-0000-000000000005', format('{"sub":"%s","email":"%s"}', 'a1000000-0000-0000-0000-000000000005', 'dr.banda@uth.gov.zm')::jsonb, 'email', now(), now(), now()),
('a1000000-0000-0000-0000-000000000006', 'dr.mwale@ndola.gov.zm', 'a1000000-0000-0000-0000-000000000006', format('{"sub":"%s","email":"%s"}', 'a1000000-0000-0000-0000-000000000006', 'dr.mwale@ndola.gov.zm')::jsonb, 'email', now(), now(), now()),
('a1000000-0000-0000-0000-000000000007', 'pharm.chanda@uth.gov.zm', 'a1000000-0000-0000-0000-000000000007', format('{"sub":"%s","email":"%s"}', 'a1000000-0000-0000-0000-000000000007', 'pharm.chanda@uth.gov.zm')::jsonb, 'email', now(), now(), now()),
('a1000000-0000-0000-0000-000000000008', 'cidrz.research@znhip.gov.zm', 'a1000000-0000-0000-0000-000000000008', format('{"sub":"%s","email":"%s"}', 'a1000000-0000-0000-0000-000000000008', 'cidrz.research@znhip.gov.zm')::jsonb, 'email', now(), now(), now());

-- 2.5 Public Users Profile
-- Hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGFQKBZp4GFJqgN3gPhBVCU0XKi
INSERT INTO users (id, email, password_hash, full_name, role, facility_id, province) VALUES
('a1000000-0000-0000-0000-000000000001', 'admin@znhip.gov.zm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGFQKBZp4GFJqgN3gPhBVCU0XKi', 'Super Admin', 'super_admin', NULL, NULL),
('a1000000-0000-0000-0000-000000000002', 'ministry@znhip.gov.zm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGFQKBZp4GFJqgN3gPhBVCU0XKi', 'Ministry Admin', 'ministry_admin', NULL, NULL),
('a1000000-0000-0000-0000-000000000003', 'lusaka.officer@znhip.gov.zm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGFQKBZp4GFJqgN3gPhBVCU0XKi', 'Provincial Officer', 'provincial_officer', NULL, 'Lusaka'),
('a1000000-0000-0000-0000-000000000004', 'uth.admin@znhip.gov.zm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGFQKBZp4GFJqgN3gPhBVCU0XKi', 'UTH Facility Admin', 'facility_admin', 'f1000000-0000-0000-0000-000000000001', 'Lusaka'),
('a1000000-0000-0000-0000-000000000005', 'dr.banda@uth.gov.zm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGFQKBZp4GFJqgN3gPhBVCU0XKi', 'Dr. Banda', 'clinician', 'f1000000-0000-0000-0000-000000000001', 'Lusaka'),
('a1000000-0000-0000-0000-000000000006', 'dr.mwale@ndola.gov.zm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGFQKBZp4GFJqgN3gPhBVCU0XKi', 'Dr. Mwale', 'clinician', 'f1000000-0000-0000-0000-000000000002', 'Copperbelt'),
('a1000000-0000-0000-0000-000000000007', 'pharm.chanda@uth.gov.zm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGFQKBZp4GFJqgN3gPhBVCU0XKi', 'Pharmacist Chanda', 'pharmacist', 'f1000000-0000-0000-0000-000000000001', 'Lusaka'),
('a1000000-0000-0000-0000-000000000008', 'cidrz.research@znhip.gov.zm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGFQKBZp4GFJqgN3gPhBVCU0XKi', 'CIDRZ Lead Researcher', 'research_partner', NULL, NULL);

-- 3. ICD-11 Codes (Relevant to Zambia)
INSERT INTO icd11_codes (code, label, chapter, block) VALUES
('1F40', 'Malaria', '01', 'Infectious'),
('1C62', 'HIV disease', '01', 'Infectious'),
('1B10', 'Tuberculosis', '01', 'Infectious'),
('KA21', 'Neonatal sepsis', '19', 'Perinatal'),
('CB00', 'Maternal haemorrhage', '18', 'Pregnancy'),
('CA40', 'Pneumonia', '12', 'Respiratory'),
('1A00', 'Diarrhoeal disease', '01', 'Infectious'),
('3A00', 'Anaemia', '03', 'Blood'),
('5B51', 'Malnutrition', '05', 'Endocrine'),
('NF01', 'Road traffic injury', '22', 'External'),
('8B20', 'Stroke', '08', 'Nervous'),
('5A10', 'Diabetes', '05', 'Endocrine'),
('BD10', 'Heart failure', '11', 'Circulatory'),
('1G41', 'Sepsis', '01', 'Infectious'),
('KA00', 'Preterm birth complications', '19', 'Perinatal'),
('1D01', 'Meningitis', '01', 'Infectious'),
('1A00.0', 'Cholera', '01', 'Infectious'),
('1A07', 'Typhoid', '01', 'Infectious'),
('RA01', 'COVID-19', '25', 'Special'),
('3A51', 'Sickle cell disease', '03', 'Blood');

-- 4. Death Records (Sample)
INSERT INTO death_records (id, facility_id, recorded_by, patient_age_years, patient_sex, patient_district, primary_cause_icd11, primary_cause_label, time_of_death, ward, was_admitted) VALUES
('d1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 24, 'female', 'Lusaka', 'CB00', 'Maternal haemorrhage', now() - interval '2 days', 'Maternity', true),
('d1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', 5, 'male', 'Ndola', '1F40', 'Malaria', now() - interval '5 days', 'Paediatric', true),
('d1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 0, 'female', 'Lusaka', 'KA21', 'Neonatal sepsis', now() - interval '1 day', 'NICU', true);

-- 5. Contributing Factors (Sample)
INSERT INTO contributing_factors (death_record_id, factor_type, label) VALUES
('d1000000-0000-0000-0000-000000000001', 'drug_shortage', 'Oxytocin stockout'),
('d1000000-0000-0000-0000-000000000001', 'delayed_presentation', 'Arrived 4 hours post-onset'),
('d1000000-0000-0000-0000-000000000002', 'comorbidity', 'Malnutrition');

-- 6. Drug Inventory (Sample)
INSERT INTO drug_inventory (facility_id, drug_name, generic_name, quantity_in_stock, unit, expiry_date, reorder_level) VALUES
('f1000000-0000-0000-0000-000000000001', 'Artemether/Lumefantrine', 'MALAR-24', 500, 'tablets', '2027-12-31', 100),
('f1000000-0000-0000-0000-000000000001', 'Oxytocin 10IU', 'Oxytocin', 0, 'vials', '2026-05-15', 50),
('f1000000-0000-0000-0000-000000000002', 'Artemether/Lumefantrine', 'MALAR-24', 20, 'tablets', '2026-06-20', 100);

-- 7. Drug Transactions (Sample)
INSERT INTO drug_transactions (drug_inventory_id, facility_id, transaction_type, quantity, notes, performed_by) VALUES
((SELECT id FROM drug_inventory WHERE drug_name = 'Artemether/Lumefantrine' AND facility_id = 'f1000000-0000-0000-0000-000000000001' LIMIT 1), 'f1000000-0000-0000-0000-000000000001', 'dispensed', 20, 'Regular dispensing for pediatric ward', 'a1000000-0000-0000-0000-000000000007'),
((SELECT id FROM drug_inventory WHERE drug_name = 'Oxytocin 10IU' AND facility_id = 'f1000000-0000-0000-0000-000000000001' LIMIT 1), 'f1000000-0000-0000-0000-000000000001', 'dispensed', 5, 'Emergency maternal care', 'a1000000-0000-0000-0000-000000000007');

-- 8. Research Proposals (Sample)
INSERT INTO research_proposals (title, summary, evidence_basis, priority_score, status) VALUES
('Malaria mortality outcomes during stock interruptions in Copperbelt Province', 'Longitudinal study on the impact of stock interruptions on pediatric outcomes.', 'High mortality spike in Ndola correlated with zero Artemether stock.', 0.87, 'proposed'),
('Neonatal sepsis contributing factors across Eastern Province hospitals', 'Analysis of neonatal deaths and clinical pathway gaps.', 'Rising trends in KA21 codes in Chipata.', 0.74, 'reviewed'),
('Maternal haemorrhage rates and oxytocin availability correlation', 'Nationwide assessment of CB00 deaths vs oxytocin stockouts.', 'Frequent drug shortages listed as contributing factors in maternal deaths.', 0.91, 'approved');

-- 9. Mortality Alerts (Sample)
INSERT INTO mortality_alerts (facility_id, province, alert_type, description, icd11_code, baseline_rate, observed_rate, period_start, period_end, is_resolved) VALUES
('f1000000-0000-0000-0000-000000000002', 'Copperbelt', 'spike', 'Unexpected spike in Pediatric Malaria mortalities', '1F40', 2.1, 8.5, now() - interval '14 days', now(), false),
('f1000000-0000-0000-0000-000000000001', 'Lusaka', 'stockout_correlation', 'High Maternal Haemorrhage deaths correlating with Oxytocin stockout', 'CB00', 1.0, 3.2, now() - interval '30 days', now(), false);

-- 10. Audit Logs (Sample)
INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address) VALUES
('a1000000-0000-0000-0000-000000000005', 'INSERT', 'death_records', 'd1000000-0000-0000-0000-000000000001', '{}'::jsonb, '{"primary_cause_icd11": "CB00"}'::jsonb, '192.168.1.100'),
('a1000000-0000-0000-0000-000000000001', 'UPDATE', 'users', 'a1000000-0000-0000-0000-000000000006', '{"is_active": false}'::jsonb, '{"is_active": true}'::jsonb, '10.0.0.5');

-- 11. Sync Queue (Sample)
INSERT INTO sync_queue (device_id, record_type, record_data, sync_status, facility_id) VALUES
('mobile-device-a1b2', 'death_record', '{"patient_age_years": 45, "primary_cause_icd11": "1F40", "ward": "General"}', 'pending', 'f1000000-0000-0000-0000-000000000003'),
('mobile-device-c3d4', 'drug_inventory', '{"drug_name": "Paracetamol", "quantity": 1000}', 'synced', 'f1000000-0000-0000-0000-000000000004');

COMMIT;
