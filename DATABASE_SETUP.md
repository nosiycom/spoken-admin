# Database Setup Guide

## Current Status

The Spoken Admin application is currently running with **mock data** because the `public.users` table doesn't exist in the Supabase database.

⚠️ **Warning**: You'll see this warning in your logs:
```
⚠️ Users table not found, returning mock data. Please run the database migration.
```

## Quick Fix: Create the Users Table

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste the SQL from `database/migrations/001_create_users_table.sql`
5. Click **Run**

### Option 2: Using the Migration API

1. Temporarily disable authentication for the migration endpoint by adding this to `/src/app/api/migrate/route.ts`:
   ```typescript
   // Add this line at the top of both POST and GET functions
   // Remove after migration is complete
   return await actualFunction() // Bypass auth temporarily
   ```

2. Run the migration:
   ```bash
   curl -X POST http://localhost:3000/api/migrate
   ```

3. Re-enable authentication by removing the bypass

## Database Schema

The users table will be created with the following structure:

```sql
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
```

## Clean Database Setup

The migration creates **only the table structure** with no sample data. This gives you a clean slate to:
- Import your own user data
- Start with a fresh application
- Add users through the application interface
- Populate data via API endpoints

## User Management Features

Once the database is set up, the following features will work:

### ✅ Currently Working (with mock data fallback)
- View list of 10 sample users for development/testing
- Search and filter functionality
- User management interface (edit/delete modals)
- User statistics dashboard
- Responsive user interface

### 🔧 After Database Setup
- **Empty table ready for real data**
- Edit/delete operations will work with real data
- User creation through application
- Real-time user activity tracking
- Persistent user data storage
- No mock data warnings

## Verification

After setting up the database:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/users` - you should no longer see the mock data warning
3. The users table will be empty initially - add users through the application
4. Try creating, editing, and deleting users - changes will be persisted
5. Check the server logs for successful database operations

## Environment Variables Required

Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### "Could not find the table" Error
- The users table hasn't been created yet
- Run the migration SQL in Supabase dashboard

### "Authentication required" for API
- The API endpoints are protected
- Use Supabase dashboard SQL editor instead

### "Row Level Security" Issues
- The migration includes proper RLS policies
- Service role should have full access
- Regular users can read all users (for admin interface)

## Next Steps

1. **Create the users table** using Option 1 above
2. **Test user management** - the table will be empty initially
3. **Create users** through your application's user registration/creation flow
4. **Test edit/delete functionality** with real data
5. **Set up remaining tables** from the schema (courses, lessons, etc.)

## File Locations

- Migration SQL: `database/migrations/001_create_users_table.sql`
- User Service: `src/lib/services/users.ts` (includes mock data fallback)
- User Management UI: `src/app/(dashboard)/users/`
- API Routes: `src/app/api/users/`