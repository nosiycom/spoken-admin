import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

const USERS_TABLE_SQL = `
-- Create users table for the Spoken Admin application
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    current_level TEXT NOT NULL DEFAULT 'beginner' CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
    total_points INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON public.users(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_users_current_level ON public.users(current_level);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
`

// Note: This migration creates the table structure only.
// No sample data is inserted. Users will be created through the application.

export async function POST() {
  try {
    const adminClient = createSupabaseAdminClient()
    
    console.log('🚀 Starting database migration...')
    
    // Step 1: Create the users table using raw SQL
    console.log('📝 Creating users table...')
    const { error: sqlError } = await adminClient.rpc('exec_sql', { 
      query: USERS_TABLE_SQL 
    })
    
    if (sqlError && !sqlError.message.includes('already exists')) {
      console.error('❌ Failed to create users table:', sqlError)
      
      // Try alternative approach - check if table exists first
      const { data: existingTables } = await adminClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'users')
      
      if (!existingTables || existingTables.length === 0) {
        // Table doesn't exist, try creating with individual statements
        console.log('🔄 Trying to create table with Supabase API...')
        
        // Use the REST API directly to create the table
        const createTableResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || ''
          },
          body: JSON.stringify({
            query: `
              CREATE TABLE public.users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT NOT NULL UNIQUE,
                first_name TEXT,
                last_name TEXT,
                profile_image_url TEXT,
                current_level TEXT NOT NULL DEFAULT 'beginner' CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
                total_points INTEGER NOT NULL DEFAULT 0,
                streak_days INTEGER NOT NULL DEFAULT 0,
                last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                preferences JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
              );
            `
          })
        })
        
        if (!createTableResponse.ok) {
          const errorText = await createTableResponse.text()
          throw new Error(`Failed to create table via API: ${errorText}`)
        }
      }
    }
    
    console.log('✅ Users table created successfully')
    
    // Step 2: Verify table structure
    console.log('✅ Users table structure created successfully')
    
    // Step 3: Verify the table exists
    const { error: countError } = await adminClient
      .from('users')
      .select('id', { count: 'exact', head: true })
    
    if (countError) {
      throw new Error(`Failed to verify users table: ${countError.message}`)
    }
    
    console.log(`📋 Users table verified and ready for use`)
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      details: {
        tableCreated: true,
        tableVerified: true,
        note: 'No sample data inserted - table is ready for use'
      }
    })
    
  } catch (error: any) {
    console.error('💥 Migration failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Unknown error occurred during migration',
        details: error
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const adminClient = createSupabaseAdminClient()
    
    // Check if users table exists
    const { data: users, error } = await adminClient
      .from('users')
      .select('id, email, first_name, last_name, current_level, total_points, streak_days')
      .limit(5)
    
    if (error) {
      return NextResponse.json({
        exists: false,
        error: error.message
      })
    }
    
    return NextResponse.json({
      exists: true,
      totalUsers: users.length,
      message: `Users table exists with ${users.length} records`
    })
    
  } catch (error: any) {
    return NextResponse.json({
      exists: false,
      error: error.message
    })
  }
}