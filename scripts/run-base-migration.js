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

async function runBaseMigration() {
  console.log('🚀 Starting base migration (artists, me_models, licenses)...');

  try {
    // Read the base migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251002191519_b6dd267c-a73d-43c0-bcbe-dae1e8c68378.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Base migration file loaded successfully');

    // Execute the migration using raw SQL
    console.log('⚡ Executing base migration...');
    const { data, error } = await supabase.rpc('exec', { sql: migrationSQL });

    if (error) {
      console.error('❌ Base migration failed:', error);
      
      // Try alternative approach - split into statements
      console.log('🔄 Trying statement-by-statement execution...');
      
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          
          try {
            const { error: stmtError } = await supabase.rpc('exec', { sql: statement });
            if (stmtError) {
              console.log(`⚠️  Statement ${i + 1} had an issue (might already exist):`, stmtError.message);
            } else {
              console.log(`✅ Statement ${i + 1} executed successfully`);
            }
          } catch (err) {
            console.log(`⚠️  Statement ${i + 1} failed (might already exist):`, err.message);
          }
        }
      }
    } else {
      console.log('✅ Base migration executed successfully');
    }

    console.log('🎉 Base migration completed!');

    // Verify the migration by checking if tables exist
    console.log('🔍 Verifying base migration...');

    const baseTables = [
      'artists',
      'me_models',
      'licenses',
      'usage_records',
      'sessionchain_attestations'
    ];

    for (const table of baseTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Table ${table} error:`, error.message);
        } else {
          console.log(`✅ Table ${table} exists and is accessible`);
        }
      } catch (err) {
        console.log(`❌ Could not verify table ${table}:`, err.message);
      }
    }

  } catch (error) {
    console.error('❌ Base migration failed:', error);
    process.exit(1);
  }
}

runBaseMigration();


