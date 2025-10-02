-- OpenPlay Integration Migration
-- Run this script in the Supabase SQL Editor at: https://supabase.com/dashboard/project/thnusgshpnktmphivphf/sql

-- Copy and paste the content from supabase/migrations/20240101000003_openplay_integration.sql here
-- For now, let's create a simple version to test the connection

-- Test table to verify migration works
CREATE TABLE IF NOT EXISTS migration_test (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert a test record
INSERT INTO migration_test DEFAULT VALUES;

-- Check if the tables exist (this will help us verify the migration worked)
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'commercial_releases',
        'commercial_tracks',
        'release_distributions',
        'revenue_reconciliation',
        'voice_model_analytics',
        'openplay_webhook_events',
        'migration_test'
    )
ORDER BY table_name;