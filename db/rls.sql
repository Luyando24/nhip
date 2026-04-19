-- Enable RLS on sensitive tables
ALTER TABLE death_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_transactions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(role TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN role IN ('ministry_admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Death Records Policies
CREATE POLICY clinician_deaths_policy ON death_records
  FOR ALL
  TO public
  USING (
    is_admin(current_setting('app.current_user_role', true)) OR
    (current_setting('app.current_user_role', true) = 'provincial_officer' AND facility_id IN (SELECT id FROM facilities WHERE province = current_setting('app.current_user_province', true))) OR
    (facility_id = (current_setting('app.current_user_facility_id', true))::UUID)
  );

-- 2. Drug Inventory Policies
CREATE POLICY staff_inventory_policy ON drug_inventory
  FOR ALL
  TO public
  USING (
    is_admin(current_setting('app.current_user_role', true)) OR
    (current_setting('app.current_user_role', true) = 'provincial_officer' AND facility_id IN (SELECT id FROM facilities WHERE province = current_setting('app.current_user_province', true))) OR
    (facility_id = (current_setting('app.current_user_facility_id', true))::UUID)
  );

-- 3. Drug Transactions Policies
CREATE POLICY staff_transactions_policy ON drug_transactions
  FOR ALL
  TO public
  USING (
    is_admin(current_setting('app.current_user_role', true)) OR
    (current_setting('app.current_user_role', true) = 'provincial_officer' AND facility_id IN (SELECT id FROM facilities WHERE province = current_setting('app.current_user_province', true))) OR
    (facility_id = (current_setting('app.current_user_facility_id', true))::UUID)
  );

-- Note: The application must run these commands at the start of every transaction:
-- SET LOCAL app.current_user_id = 'uuid';
-- SET LOCAL app.current_user_role = 'role';
-- SET LOCAL app.current_user_facility_id = 'uuid';
-- SET LOCAL app.current_user_province = 'province';
