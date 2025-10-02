-- Set the view to SECURITY INVOKER to fix the linter warning
ALTER VIEW voice_model_commercial_summary SET (security_invoker = true)