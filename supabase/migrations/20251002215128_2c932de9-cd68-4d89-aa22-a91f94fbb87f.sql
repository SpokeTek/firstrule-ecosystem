-- Fix security issues from OpenPlay integration

-- 1. Add missing RLS policies for release_distributions
CREATE POLICY "Users can view own release distributions" ON release_distributions
  FOR SELECT USING (
    commercial_release_id IN (
      SELECT cr.id FROM commercial_releases cr
      JOIN commercial_tracks ct ON ct.commercial_release_id = cr.id
      JOIN me_models mm ON mm.id = ct.voice_model_id
      JOIN artists a ON a.id = mm.artist_id
      WHERE a.user_id = auth.uid()
    )
  );

-- 2. Add missing RLS policies for revenue_reconciliation
CREATE POLICY "Users can view own revenue reconciliation" ON revenue_reconciliation
  FOR SELECT USING (
    commercial_track_id IN (
      SELECT ct.id FROM commercial_tracks ct
      JOIN me_models mm ON mm.id = ct.voice_model_id
      JOIN artists a ON a.id = mm.artist_id
      WHERE a.user_id = auth.uid()
    )
  );

-- 3. Add missing RLS policies for voice_model_analytics
CREATE POLICY "Users can view own voice model analytics" ON voice_model_analytics
  FOR SELECT USING (
    voice_model_id IN (
      SELECT mm.id FROM me_models mm
      JOIN artists a ON a.id = mm.artist_id
      WHERE a.user_id = auth.uid()
    )
  );

-- 4. Enable RLS on openplay_webhook_events and add policies
ALTER TABLE openplay_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook events (internal system use only)
CREATE POLICY "Service role can manage webhook events" ON openplay_webhook_events
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- 5. Fix function search paths
CREATE OR REPLACE FUNCTION update_release_totals()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE commercial_releases
  SET
    total_tracks = (
      SELECT COUNT(*) FROM commercial_tracks
      WHERE commercial_release_id = NEW.commercial_release_id
    ),
    updated_at = NOW()
  WHERE id = NEW.commercial_release_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_voice_model_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- 6. Drop and recreate view without SECURITY DEFINER
DROP VIEW IF EXISTS voice_model_commercial_summary;

CREATE VIEW voice_model_commercial_summary AS
SELECT
  vm.id as voice_model_id,
  vm.model_name as voice_model_name,
  COUNT(DISTINCT cr.id) as total_releases,
  COUNT(DISTINCT ct.id) as total_tracks,
  COALESCE(SUM(ct.estimated_revenue), 0) as total_revenue,
  COALESCE(SUM(ct.estimated_streams), 0) as total_streams,
  MAX(cr.release_date) as latest_release_date
FROM me_models vm
LEFT JOIN commercial_tracks ct ON ct.voice_model_id = vm.id
LEFT JOIN commercial_releases cr ON cr.id = ct.commercial_release_id
WHERE cr.status = 'active' OR cr.id IS NULL
GROUP BY vm.id, vm.model_name