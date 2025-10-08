import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://thnusgshpnktmphivphf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseKey) {
  console.error('❌ No Supabase key found. Please set SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY environment variable.');
  console.log('💡 You can get your service role key from your Supabase project settings.');
  process.exit(1);
}

console.log('🔑 Using Supabase key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function runOpenPlayMigration() {
  console.log('🚀 Starting OpenPlay integration migration...');

  try {
    // First, let's check if base tables exist
    console.log('🔍 Checking for base tables...');
    
    const { data: artistsCheck, error: artistsError } = await supabase
      .from('artists')
      .select('id')
      .limit(1);
    
    if (artistsError && artistsError.message.includes('does not exist')) {
      console.log('❌ Base tables do not exist. Please run the base migration first.');
      console.log('💡 Run: node scripts/run-base-migration.js');
      return;
    }

    console.log('✅ Base tables exist, proceeding with OpenPlay migration...');

    // Read the OpenPlay migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20240101000003_openplay_integration.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 OpenPlay migration file loaded successfully');

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

        try {
          // Try using the exec function if available
          const { error } = await supabase.rpc('exec', { sql: statement });

          if (error) {
            // If exec doesn't work, try direct table operations for CREATE TABLE statements
            if (statement.toUpperCase().includes('CREATE TABLE')) {
              console.log(`⚠️  Statement ${i + 1} failed with exec, but table might already exist`);
              errorCount++;
            } else {
              console.log(`⚠️  Statement ${i + 1} failed:`, error.message);
              errorCount++;
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            successCount++;
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} failed:`, err.message);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`⚠️  Failed statements: ${errorCount}`);

    if (successCount > 0) {
      console.log('🎉 Migration completed with some successes!');
    }

    // Verify the migration by checking if tables exist
    console.log('\n🔍 Verifying OpenPlay migration...');

    const openplayTables = [
      'commercial_releases',
      'commercial_tracks',
      'release_distributions',
      'revenue_reconciliation',
      'voice_model_analytics',
      'openplay_webhook_events'
    ];

    for (const table of openplayTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          if (error.message.includes('does not exist')) {
            console.log(`❌ Table ${table} was not created`);
          } else {
            console.log(`⚠️  Table ${table} exists but has an issue:`, error.message);
          }
        } else {
          console.log(`✅ Table ${table} exists and is accessible`);
        }
      } catch (err) {
        console.log(`❌ Could not verify table ${table}:`, err.message);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runOpenPlayMigration();
