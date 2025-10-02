-- Ensure view uses SECURITY INVOKER for proper RLS enforcement

DROP VIEW IF EXISTS voice_model_commercial_summary;

CREATE VIEW voice_model_commercial_summary 
WITH (security_invoker = true)
AS
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