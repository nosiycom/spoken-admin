#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// This migration creates the table structure only.
// No sample data is inserted.

async function main() {
  console.log('🚀 Starting migration...')
  
  // Check if table already exists
  const { error: checkError } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
  
  if (!checkError) {
    console.log('✅ Users table already exists')
    return
  }
  
  console.error('❌ Users table does not exist')
  console.log('\n🔧 You need to create the users table manually in Supabase dashboard:')
  console.log('1. Go to https://supabase.com/dashboard > Your Project > SQL Editor')
  console.log('2. Run the SQL from database/migrations/001_create_users_table.sql')
  console.log('3. This will create an empty users table ready for your application')
  
  process.exit(1)
}

main().catch(console.error)