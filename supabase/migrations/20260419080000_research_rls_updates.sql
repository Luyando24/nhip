-- 1. Allow public/anon to see active instrument schemas (minimal fields for data collection form)
-- Note: We only allow SELECT on active instruments
CREATE POLICY "Allow public select on active instruments" 
ON research_instruments FOR SELECT 
TO anon, authenticated
USING (status = 'active');

-- 2. Allow anyone (including anon) to submit research data
-- We check that the target instrument is currently 'active'
CREATE POLICY "Allow public insert on research data" 
ON research_data FOR INSERT 
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM research_instruments 
    WHERE id = instrument_id AND status = 'active'
  )
);

-- 3. Ensure updated_at is handled (if not already by trigger)
-- (Assuming standard updated_at triggers exist from initial schema)
