import { createClient } from '@supabase/supabase-js';

// Use the public key for basic connectivity test
const supabaseUrl = 'https://thnusgshpnktmphivphf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobnVzZ3NocG5rdG1waGl2cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDEzMjEsImV4cCI6MjA3NDk3NzMyMX0.CyO9YNrFpXZjhLIQVWDYQ-WBISKrgr21GwFZIFzDts4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database connection and current schema...');

  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase
      .rpc('get_tables');

    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }

    console.log('✅ Database connection successful');
    console.log(`📊 Found ${data?.length || 0} tables in public schema`);

    // Check if our OpenPlay tables exist
    console.log('\n2. Checking for OpenPlay integration tables...');

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
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .single();

      if (tableError) {
        console.log(`❌ Table '${tableName}' not found`);
      } else {
        console.log(`✅ Table '${tableName}' exists`);
      }
    }

    // List all current tables
    console.log('\n3. Current tables in database:');
    const { data: allTables } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');

    if (allTables && allTables.length > 0) {
      allTables.forEach(table => {
        console.log(`   • ${table.table_name} (${table.table_type})`);
      });
    } else {
      console.log('   No tables found');
    }

    console.log('\n🎉 Database check completed');

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabase();