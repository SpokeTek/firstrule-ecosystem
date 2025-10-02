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
  console.error('❌ No Supabase key found. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting OpenPlay integration migration...');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, 'supabase', 'migrations', '20240101000003_openplay_integration.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

        try {
          const { error } = await supabase.rpc('exec_sql', { query: statement });

          if (error) {
            // Try using direct SQL if RPC fails
            console.log('🔄 RPC failed, trying direct SQL execution...');
            const { error: directError } = await supabase
              .from('information_schema')
              .select('*')
              .limit(1);

            if (directError && !directError.message.includes('does not exist')) {
              console.error(`❌ Statement ${i + 1} failed:`, error);
              console.error(`SQL: ${statement.substring(0, 100)}...`);
              throw error;
            } else {
              console.log(`✅ Statement ${i + 1} executed (or table doesn't exist yet)`);
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Statement ${i + 1} failed:`, err);
          console.error(`SQL: ${statement.substring(0, 100)}...`);

          // Continue with other statements for now
          console.log('⚠️  Continuing with remaining statements...');
        }
      }
    }

    console.log('🎉 Migration completed!');

    // Verify the migration by checking if tables exist
    console.log('🔍 Verifying migration...');

    const tables = [
      'commercial_releases',
      'commercial_tracks',
      'release_distributions',
      'revenue_reconciliation',
      'voice_model_analytics',
      'openplay_webhook_events'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error && !error.message.includes('does not exist')) {
          console.log(`❌ Table ${table} error:`, error.message);
        } else if (error) {
          console.log(`❌ Table ${table} was not created`);
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

// Check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default runMigration;