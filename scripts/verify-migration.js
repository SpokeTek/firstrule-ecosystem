import { createClient } from '@supabase/supabase-js';

// Use the publishable key for read-only verification
const supabaseUrl = 'https://thnusgshpnktmphivphf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobnVzZ3NocG5rdG1waGl2cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDEzMjEsImV4cCI6MjA3NDk3NzMyMX0.CyO9YNrFpXZjhLIQVWDYQ-WBISKrgr21GwFZIFzDts4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('🔍 Verifying OpenPlay Integration Migration Status...\n');

  try {
    // Check base tables first
    console.log('📋 Base Tables Status:');
    const baseTables = ['artists', 'me_models', 'licenses'];
    
    for (const table of baseTables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ ${table} - Table does not exist`);
        } else {
          console.log(`⚠️  ${table} - Error: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table} - Table exists and accessible`);
      }
    }

    console.log('\n🎵 OpenPlay Integration Tables Status:');
    const openplayTables = [
      'commercial_releases',
      'commercial_tracks', 
      'release_distributions',
      'revenue_reconciliation',
      'voice_model_analytics',
      'openplay_webhook_events'
    ];

    let migrationComplete = true;

    for (const table of openplayTables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ ${table} - Table does not exist`);
          migrationComplete = false;
        } else {
          console.log(`⚠️  ${table} - Error: ${error.message}`);
          migrationComplete = false;
        }
      } else {
        console.log(`✅ ${table} - Table exists and accessible`);
      }
    }

    console.log('\n📊 Migration Summary:');
    if (migrationComplete) {
      console.log('🎉 OpenPlay Integration Migration is COMPLETE!');
      console.log('✅ All required tables exist and are accessible');
      console.log('🚀 Ready to use OpenPlay integration features');
    } else {
      console.log('⚠️  OpenPlay Integration Migration is INCOMPLETE');
      console.log('📝 Please run the migration using the Supabase Dashboard');
      console.log('🔗 URL: https://supabase.com/dashboard/project/thnusgshpnktmphivphf/sql');
      console.log('📄 Migration file: supabase/migrations/20240101000003_openplay_integration.sql');
    }

    // Check if we can query the view
    console.log('\n🔍 Testing Views:');
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('voice_model_commercial_summary')
        .select('*')
        .limit(1);

      if (viewError) {
        console.log(`⚠️  voice_model_commercial_summary view - Error: ${viewError.message}`);
      } else {
        console.log(`✅ voice_model_commercial_summary view - Accessible`);
      }
    } catch (err) {
      console.log(`❌ voice_model_commercial_summary view - Not accessible: ${err.message}`);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyMigration();



