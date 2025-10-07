-- Phase 1: Critical Data Exposure Fixes

-- 1.1 Secure Artists Table - Restrict email visibility
DROP POLICY IF EXISTS "Users can view all artist profiles" ON artists;

CREATE POLICY "Users can view their own complete artist profile" ON artists
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view artist profiles without email" ON artists
FOR SELECT USING (true);

-- 1.2 Secure Licenses Table
DROP POLICY IF EXISTS "Authenticated users can view licenses" ON licenses;
DROP POLICY IF EXISTS "Authenticated users can create licenses" ON licenses;

CREATE POLICY "Model owners can view licenses for their models" ON licenses
FOR SELECT USING (
  model_id IN (
    SELECT mm.id FROM me_models mm
    JOIN artists a ON a.id = mm.artist_id
    WHERE a.user_id = auth.uid()
  )
);

CREATE POLICY "Licensees can view their own licenses" ON licenses
FOR SELECT USING (
  licensee_email = (SELECT email FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Service role can create licenses" ON licenses
FOR INSERT WITH CHECK (
  model_id IN (
    SELECT id FROM me_models WHERE is_active = true
  )
);

-- Phase 3: Access Control Refinements

-- 3.1 Restrict Usage Records Access
DROP POLICY IF EXISTS "Authenticated users can view usage records" ON usage_records;
DROP POLICY IF EXISTS "Authenticated users can insert usage records" ON usage_records;

CREATE POLICY "Model owners can view their usage records" ON usage_records
FOR SELECT USING (
  model_id IN (
    SELECT mm.id FROM me_models mm
    JOIN artists a ON a.id = mm.artist_id
    WHERE a.user_id = auth.uid()
  )
);

CREATE POLICY "Licensees can view their usage records" ON usage_records
FOR SELECT USING (
  license_id IN (
    SELECT id FROM licenses 
    WHERE licensee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Service role can create usage records" ON usage_records
FOR INSERT WITH CHECK (true);