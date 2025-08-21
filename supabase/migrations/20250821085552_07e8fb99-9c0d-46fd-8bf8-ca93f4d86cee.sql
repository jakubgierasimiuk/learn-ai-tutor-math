-- Add RLS policies for skills table to allow skill content import

-- Policy to allow anyone to view skills (already exists but ensuring it's there)
DROP POLICY IF EXISTS "Anyone can view skills" ON skills;
CREATE POLICY "Anyone can view skills" ON skills FOR SELECT USING (true);

-- Policy to allow system/admin to insert skills for content import
DROP POLICY IF EXISTS "System can insert skills" ON skills;
CREATE POLICY "System can insert skills" ON skills FOR INSERT WITH CHECK (true);

-- Policy to allow system/admin to update skills 
DROP POLICY IF EXISTS "System can update skills" ON skills;
CREATE POLICY "System can update skills" ON skills FOR UPDATE USING (true);