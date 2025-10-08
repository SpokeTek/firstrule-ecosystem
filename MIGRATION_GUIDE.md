# OpenPlay Integration Migration Guide

## Overview
The OpenPlay integration migration creates tables to track commercial releases that use voice models. The migration has been updated to work with your existing database schema.

## Prerequisites
✅ Base tables exist (artists, me_models, licenses) - Verified
✅ Migration file updated to reference correct table names
✅ Supabase connection configured

## Running the Migration

Since the publishable key doesn't have permissions to execute raw SQL, you'll need to run this migration through the Supabase Dashboard.

### Option 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard:**
   - URL: https://supabase.com/dashboard/project/thnusgshpnktmphivphf/sql

2. **Open the SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste the migration:**
   - Open the file: `supabase/migrations/20240101000003_openplay_integration.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Execute the migration:**
   - Click "Run" to execute the migration
   - The migration will create 6 new tables and related indexes/policies

### Option 2: Using Supabase CLI (Alternative)

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref thnusgshpnktmphivphf

# Run the migration
supabase db push
```

## What the Migration Creates

### Tables Created:
1. **commercial_releases** - Tracks commercial music releases
2. **commercial_tracks** - Individual tracks that use voice models
3. **release_distributions** - Platform distribution information
4. **revenue_reconciliation** - Revenue tracking and reconciliation
5. **voice_model_analytics** - Analytics for voice model usage
6. **openplay_webhook_events** - Webhook event audit trail

### Key Features:
- ✅ Proper foreign key relationships to existing tables (me_models, licenses, artists)
- ✅ Row Level Security (RLS) policies for data access control
- ✅ Indexes for performance optimization
- ✅ Triggers for automatic data updates
- ✅ Views for common queries

## Verification

After running the migration, verify it worked by running:

```bash
node scripts/simple-db-check.js
```

You should see all OpenPlay tables listed as existing and accessible.

## Next Steps

1. **Test the integration:**
   - Check that the OpenPlay API integration works
   - Verify webhook handling functions properly

2. **Set up data:**
   - Add some test commercial releases
   - Configure webhook endpoints

3. **Monitor:**
   - Check the `openplay_webhook_events` table for incoming events
   - Review analytics in the `voice_model_analytics` table

## Troubleshooting

If you encounter issues:

1. **Permission errors:** Make sure you're using the service role key in the Supabase dashboard
2. **Table already exists:** The migration includes `IF NOT EXISTS` clauses, so it's safe to run multiple times
3. **Foreign key errors:** Ensure the base migration has been run first

## Migration Status
- ✅ Base tables exist (verified)
- ✅ Migration file updated with correct table references
- ✅ Ready to execute via Supabase Dashboard
- ⏳ Awaiting manual execution



