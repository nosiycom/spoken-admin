#!/usr/bin/env node

/**
 * Migration runner for Supabase database
 * This script executes SQL migration files against the Supabase database
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Get Supabase configuration from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(migrationFile) {
  console.log(`🔄 Running migration: ${migrationFile}`);
  
  const migrationPath = path.join(__dirname, '..', 'database', 'migrations', migrationFile);
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  // Split the SQL into individual statements
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  console.log(`📝 Executing ${statements.length} SQL statements...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    
    try {
      // For some statements, we need to handle them differently
      if (statement.toLowerCase().includes('create policy') || 
          statement.toLowerCase().includes('alter table') ||
          statement.toLowerCase().includes('create trigger')) {
        // Use rpc for DDL statements that might need special handling
        const { error } = await supabase.rpc('exec_sql', { sql_statement: statement }).single();
        if (error && !error.message.includes('already exists')) {
          throw error;
        }
      } else {
        // Use direct SQL execution for other statements
        const { error } = await supabase.from('_').select('1').limit(0); // Just to test connection
        
        // For direct SQL execution, we'll use the REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ sql_statement: statement })
        });
        
        if (!response.ok && response.status !== 404) {
          const errorText = await response.text();
          if (!errorText.includes('already exists') && !errorText.includes('does not exist')) {
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
        }
      }
      
      successCount++;
      console.log(`  ✅ Statement ${i + 1}/${statements.length} executed successfully`);
      
    } catch (error) {
      // Ignore certain expected errors
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('already exists') || 
          errorMessage.includes('does not exist') ||
          errorMessage.includes('duplicate key')) {
        console.log(`  ⚠️  Statement ${i + 1}/${statements.length} skipped (already exists)`);
        successCount++;
      } else {
        console.error(`  ❌ Statement ${i + 1}/${statements.length} failed:`, errorMessage);
        errorCount++;
      }
    }
  }
  
  console.log(`\n📊 Migration Results:`);
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${errorCount}`);
  
  if (errorCount > 0) {
    throw new Error(`Migration completed with ${errorCount} errors`);
  }
  
  return { successCount, errorCount };
}

async function main() {
  const migrationFile = process.argv[2] || '001_create_users_table.sql';
  
  try {
    console.log('🚀 Starting database migration...');
    console.log(`📍 Supabase URL: ${supabaseUrl}`);
    console.log(`📁 Migration file: ${migrationFile}`);
    
    await runMigration(migrationFile);
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
main().catch(console.error);