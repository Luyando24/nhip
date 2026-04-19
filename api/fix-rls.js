const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

const sql = `
CREATE OR REPLACE FUNCTION get_user_role() RETURNS TEXT AS $$
  SELECT role FROM users WHERE email = auth.jwt()->>'email' LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_facility() RETURNS UUID AS $$
  SELECT facility_id FROM users WHERE email = auth.jwt()->>'email' LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_province() RETURNS TEXT AS $$
  SELECT province FROM users WHERE email = auth.jwt()->>'email' LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

DROP POLICY IF EXISTS clinician_deaths_policy ON death_records;
CREATE POLICY clinician_deaths_policy ON death_records FOR ALL TO authenticated USING (
    get_user_role() IN ('ministry_admin', 'super_admin') OR
    (get_user_role() = 'provincial_officer' AND facility_id IN (SELECT id FROM facilities WHERE province = get_user_province())) OR
    (facility_id = get_user_facility())
);

DROP POLICY IF EXISTS staff_inventory_policy ON drug_inventory;
CREATE POLICY staff_inventory_policy ON drug_inventory FOR ALL TO authenticated USING (
    get_user_role() IN ('ministry_admin', 'super_admin') OR
    (get_user_role() = 'provincial_officer' AND facility_id IN (SELECT id FROM facilities WHERE province = get_user_province())) OR
    (facility_id = get_user_facility())
);

DROP POLICY IF EXISTS staff_transactions_policy ON drug_transactions;
CREATE POLICY staff_transactions_policy ON drug_transactions FOR ALL TO authenticated USING (
    get_user_role() IN ('ministry_admin', 'super_admin') OR
    (get_user_role() = 'provincial_officer' AND facility_id IN (SELECT id FROM facilities WHERE province = get_user_province())) OR
    (facility_id = get_user_facility())
);
`;

async function execute() {
  try {
    console.log('Applying native Supabase RLS policies...');
    await pool.query(sql);
    console.log('Successfully updated RLS policies to use auth.jwt()!');
  } catch (err) {
    console.error('Error applying RLS policies:', err);
  } finally {
    await pool.end();
  }
}

execute();
