import { createClient } from '@supabase/supabase-js';

// Use the public key for basic connectivity test
const supabaseUrl = 'https://thnusgshpnktmphivphf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobnVzZ3NocG5rdG1waGl2cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDEzMjEsImV4cCI6MjA3NDk3NzMyMX0.CyO9YNrFpXZjhLIQVWDYQ-WBISKrgr21GwFZIFzDts4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database connection...');

  try {
    // Test basic connection with a simple query
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase
      .from('voice_models')
      .select('id')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Table voice_models does not exist - this is expected if no migrations have run');
      } else {
        console.error('❌ Connection failed:', error.message);
        return;
      }
    } else {
      console.log('✅ Database connection successful');
      console.log(`📊 Found ${data?.length || 0} voice models`);
    }

    // Check for licenses table
    console.log('\n2. Checking for licenses table...');
    const { data: licenseData, error: licenseError } = await supabase
      .from('licenses')
      .select('id')
      .limit(1);

    if (licenseError) {
      if (licenseError.message.includes('does not exist')) {
        console.log('❌ Table licenses does not exist');
      } else {
        console.log('❌ Error checking licenses table:', licenseError.message);
      }
    } else {
      console.log('✅ Table licenses exists');
    }

    // Check for OpenPlay tables
    console.log('\n3. Checking for OpenPlay integration tables...');
    const openplayTables = [
      'commercial_releases',
      'commercial_tracks',
      'release_distributions',
      'revenue_reconciliation',
      'voice_model_analytics',
      'openplay_webhook_events'
    ];

    for (const tableName of openplayTables) {
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);

      if (tableError) {
        if (tableError.message.includes('does not exist')) {
          console.log(`❌ Table '${tableName}' not found`);
        } else {
          console.log(`❌ Error checking table '${tableName}':`, tableError.message);
        }
      } else {
        console.log(`✅ Table '${tableName}' exists`);
      }
    }

    console.log('\n🎉 Database check completed');

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabase();


