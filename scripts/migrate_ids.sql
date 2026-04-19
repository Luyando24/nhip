-- Revised migration script to sync public.users IDs with Auth IDs
-- This handles the UNIQUE email constraint by temporarily renaming old emails
BEGIN;

-- 1. Temporarily rename old emails to avoid unique constraint violation during insert
UPDATE users SET email = email || '.old' WHERE id IN (
    'a1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000007',
    'a1000000-0000-0000-0000-000000000008'
);

-- 2. Create temporary storage for existing user data from renamed records
CREATE TEMP TABLE user_migration_temp AS SELECT * FROM users;

-- 3. Insert the NEW user records into public.users with correct clean emails
-- We strip '.old' from the email in temp storage
INSERT INTO users (id, email, password_hash, full_name, role, facility_id, province, is_active)
SELECT '0bbba52d-73ea-41b7-9eae-a4b0e650da9d'::UUID, REPLACE(email, '.old', ''), password_hash, full_name, role, facility_id, province, is_active FROM user_migration_temp WHERE id = 'a1000000-0000-0000-0000-000000000001'::UUID
UNION ALL
SELECT '39a6abf9-38f2-4ff9-adfa-96882314b1ae'::UUID, REPLACE(email, '.old', ''), password_hash, full_name, role, facility_id, province, is_active FROM user_migration_temp WHERE id = 'a1000000-0000-0000-0000-000000000002'::UUID
UNION ALL
SELECT '4b93201a-bbf8-4986-95d8-2676271f4fb4'::UUID, REPLACE(email, '.old', ''), password_hash, full_name, role, facility_id, province, is_active FROM user_migration_temp WHERE id = 'a1000000-0000-0000-0000-000000000003'::UUID
UNION ALL
SELECT '50202ab4-da1f-4857-abed-b9e4b635f977'::UUID, REPLACE(email, '.old', ''), password_hash, full_name, role, facility_id, province, is_active FROM user_migration_temp WHERE id = 'a1000000-0000-0000-0000-000000000004'::UUID
UNION ALL
SELECT 'f01c5178-94b1-4447-8273-d7d257e54643'::UUID, REPLACE(email, '.old', ''), password_hash, full_name, role, facility_id, province, is_active FROM user_migration_temp WHERE id = 'a1000000-0000-0000-0000-000000000005'::UUID
UNION ALL
SELECT '76740da7-449e-4818-93f6-a6a90c05e079'::UUID, REPLACE(email, '.old', ''), password_hash, full_name, role, facility_id, province, is_active FROM user_migration_temp WHERE id = 'a1000000-0000-0000-0000-000000000006'::UUID
UNION ALL
SELECT '71e38387-b2eb-4105-896b-fb009e16d3a4'::UUID, REPLACE(email, '.old', ''), password_hash, full_name, role, facility_id, province, is_active FROM user_migration_temp WHERE id = 'a1000000-0000-0000-0000-000000000007'::UUID
UNION ALL
SELECT '7a3f555b-784b-47df-8d8e-e62f6365fc09'::UUID, REPLACE(email, '.old', ''), password_hash, full_name, role, facility_id, province, is_active FROM user_migration_temp WHERE id = 'a1000000-0000-0000-0000-000000000008'::UUID;

-- 4. Update all foreign key references in dependent tables to point to the NEW IDs
CREATE OR REPLACE FUNCTION do_mass_update() RETURNS VOID AS $$
DECLARE
    mapping RECORD;
BEGIN
    FOR mapping IN (
        SELECT 'a1000000-0000-0000-0000-000000000001'::UUID as old_id, '0bbba52d-73ea-41b7-9eae-a4b0e650da9d'::UUID as new_id UNION ALL
        SELECT 'a1000000-0000-0000-0000-000000000002'::UUID, '39a6abf9-38f2-4ff9-adfa-96882314b1ae'::UUID UNION ALL
        SELECT 'a1000000-0000-0000-0000-000000000003'::UUID, '4b93201a-bbf8-4986-95d8-2676271f4fb4'::UUID UNION ALL
        SELECT 'a1000000-0000-0000-0000-000000000004'::UUID, '50202ab4-da1f-4857-abed-b9e4b635f977'::UUID UNION ALL
        SELECT 'a1000000-0000-0000-0000-000000000005'::UUID, 'f01c5178-94b1-4447-8273-d7d257e54643'::UUID UNION ALL
        SELECT 'a1000000-0000-0000-0000-000000000006'::UUID, '76740da7-449e-4818-93f6-a6a90c05e079'::UUID UNION ALL
        SELECT 'a1000000-0000-0000-0000-000000000007'::UUID, '71e38387-b2eb-4105-896b-fb009e16d3a4'::UUID UNION ALL
        SELECT 'a1000000-0000-0000-0000-000000000008'::UUID, '7a3f555b-784b-47df-8d8e-e62f6365fc09'::UUID
    ) LOOP
        UPDATE death_records SET recorded_by = mapping.new_id WHERE recorded_by = mapping.old_id;
        UPDATE drug_inventory SET last_updated_by = mapping.new_id WHERE last_updated_by = mapping.old_id;
        UPDATE drug_transactions SET performed_by = mapping.new_id WHERE performed_by = mapping.old_id;
        UPDATE research_proposals SET reviewed_by = mapping.new_id WHERE reviewed_by = mapping.old_id;
        UPDATE audit_logs SET user_id = mapping.new_id WHERE user_id = mapping.old_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT do_mass_update();

-- 5. Delete the OLD user records from public.users
DELETE FROM users WHERE email LIKE '%.old';

-- Clean up
DROP FUNCTION do_mass_update();
DROP TABLE user_migration_temp;

COMMIT;
