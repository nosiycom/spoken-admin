# Database Schema Documentation

## Overview

The Spoken Admin application uses **Supabase (PostgreSQL)** as its primary database. This document outlines the current database schema, tables, relationships, and key constraints.

## Database Configuration

- **Provider**: Supabase (PostgreSQL)
- **Project Reference**: `jooyvvmoukyuawmjuomx`
- **URL**: `https://jooyvvmoukyuawmjuomx.supabase.co`
- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication**: Supabase Auth integration

## Tables

### users

The primary user table storing profile information and learning progress for French language learners.

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

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier for each user |
| `email` | TEXT | NOT NULL, UNIQUE | User's email address (used for authentication) |
| `first_name` | TEXT | - | User's first name |
| `last_name` | TEXT | - | User's last name |
| `profile_image_url` | TEXT | - | URL to user's profile image |
| `current_level` | TEXT | NOT NULL, CHECK | User's current French proficiency level |
| `total_points` | INTEGER | NOT NULL, DEFAULT 0 | Accumulated learning points |
| `streak_days` | INTEGER | NOT NULL, DEFAULT 0 | Consecutive days of activity |
| `last_activity_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last time user was active |
| `preferences` | JSONB | DEFAULT '{}' | User preferences and settings |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

#### Constraints

- **Check Constraint**: `current_level` must be one of: 'beginner', 'intermediate', 'advanced'
- **Unique Constraint**: `email` must be unique across all users

#### Indexes

```sql
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_last_activity ON public.users(last_activity_at);
CREATE INDEX idx_users_current_level ON public.users(current_level);
CREATE INDEX idx_users_created_at ON public.users(created_at);
```

#### Triggers

- **Auto-Update Timestamp**: `update_users_updated_at` trigger automatically updates `updated_at` field on row modifications

## Planned Tables (Future Implementation)

Based on the application codebase, these tables are expected to be implemented:

### courses
- Course content management
- Fields: id, title, description, type, level, category, status, created_at, updated_at

### analytics_events
- User activity tracking
- Fields: id, user_id, event_type, timestamp, metadata

### user_progress
- Individual learning progress tracking
- Fields: id, user_id, course_id, completion_status, score, completed_at

## Security

### Row Level Security (RLS)

All tables have RLS enabled to ensure users can only access their own data or data they're authorized to view.

### Authentication Integration

The database integrates with Supabase Auth for:
- User registration and login
- JWT token validation
- Role-based access control

## Migration History

| Version | File | Description | Date Applied |
|---------|------|-------------|--------------|
| 001 | `001_create_users_table_fixed.sql` | Create users table with indexes, triggers, and RLS | Recent |

## Connection Details

The application connects to the database using:
- **Public Anon Key**: For client-side operations
- **Service Role Key**: For server-side operations with elevated privileges
- **Environment Variables**: Configured in `.env.local`

## Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- JSONB is used for flexible user preferences storage
- UUID primary keys provide better security and distribution
- Indexes are optimized for common query patterns (email lookup, activity tracking, level filtering)