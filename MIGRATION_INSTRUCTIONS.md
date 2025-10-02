# Database Migration Instructions

## OpenPlay Integration Migration

The OpenPlay integration migration (`20240101000003_openplay_integration.sql`) needs to be applied to set up the database schema for tracking commercial releases and voice model usage.

## Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/thnusgshpnktmphivphf/sql
   - Sign in with your Supabase account

2. **Apply the Migration:**
   - Open the SQL Editor
   - Copy the entire content from `supabase/migrations/20240101000003_openplay_integration.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

3. **Verify the Migration:**
   - After running, you can verify the tables were created by running:
   ```sql
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
           'openplay_webhook_events'
       )
   ORDER BY table_name;
   ```

## Option 2: Using Supabase CLI (Requires Docker)

If you have Docker Desktop installed, you can run the migration locally:

1. **Start Docker Desktop**
2. **Link to your project:**
   ```bash
   npx supabase link --project-ref thnusgshpnktmphivphf
   ```
3. **Apply migrations:**
   ```bash
   npx supabase migration up
   ```

## Migration Schema Overview

The migration creates the following tables:

### `commercial_releases`
- Stores commercial release information from OpenPlay
- Links to voice models through tracks
- Tracks release metadata and performance

### `commercial_tracks`
- Individual tracks that use voice models
- Links voice models to commercial releases
- Tracks attribution and usage details

### `release_distributions`
- Platform-specific distribution information
- Tracks which stores/platforms have the release

### `revenue_reconciliation`
- Compares expected vs actual revenue
- Handles discrepancy tracking

### `voice_model_analytics`
- Performance analytics for voice models
- Aggregated usage metrics

### `openplay_webhook_events`
- Audit trail for OpenPlay webhook events
- Tracks processed events for debugging

## Verification

After applying the migration, you should see these tables in your database:

1. `commercial_releases` - 7 tables created
2. `commercial_tracks` - Individual track tracking
3. `release_distributions` - Platform distribution
4. `revenue_reconciliation` - Revenue tracking
5. `voice_model_analytics` - Analytics aggregation
6. `openplay_webhook_events` - Webhook audit trail

## Troubleshooting

If you encounter issues:

1. **Permission errors:** Ensure you're logged in as a project admin
2. **Table exists errors:** Tables may already exist - this is normal
3. **Connection errors:** Verify your Supabase project URL and credentials

## Next Steps

After the migration is applied:

1. The ClearVoice dashboard will be able to track commercial releases
2. OpenPlay API integration will work properly
3. Voice model analytics will be available
4. Revenue reconciliation will be functional