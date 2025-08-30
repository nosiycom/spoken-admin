-- Create users table for the Spoken Admin application
-- This table stores user profile information and learning progress

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

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at timestamp
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all users (for admin interface)
CREATE POLICY IF NOT EXISTS "Authenticated users can read all users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to update their own record
CREATE POLICY IF NOT EXISTS "Users can update their own record" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Create policy for service role to manage all users (for admin operations)
CREATE POLICY IF NOT EXISTS "Service role can manage all users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Create additional tables referenced in the schema if they don't exist
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    category TEXT NOT NULL DEFAULT 'general',
    image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    estimated_duration_hours INTEGER,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    lesson_type TEXT NOT NULL DEFAULT 'content' CHECK (lesson_type IN ('content', 'quiz', 'exercise', 'conversation')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 15,
    points_reward INTEGER NOT NULL DEFAULT 10,
    is_published BOOLEAN NOT NULL DEFAULT false,
    activities JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create triggers for courses and lessons updated_at
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON public.lessons;
CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for courses and lessons
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
CREATE POLICY IF NOT EXISTS "Anyone can read published courses" ON public.courses
    FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Service role can manage courses" ON public.courses
    FOR ALL USING (auth.role() = 'service_role');

-- Create policies for lessons
CREATE POLICY IF NOT EXISTS "Anyone can read published lessons" ON public.lessons
    FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Service role can manage lessons" ON public.lessons
    FOR ALL USING (auth.role() = 'service_role');

-- Insert sample courses
INSERT INTO public.courses (id, title, description, level, category, is_published, sort_order, estimated_duration_hours, created_by) 
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'French Basics', 'Learn the fundamentals of French language including greetings, basic vocabulary, and pronunciation.', 'beginner', 'language-fundamentals', true, 1, 20, 'system'),
    ('c2222222-2222-2222-2222-222222222222', 'Intermediate Conversation', 'Practice conversational French with real-world scenarios and dialogue practice.', 'intermediate', 'conversation', true, 2, 30, 'system'),
    ('c3333333-3333-3333-3333-333333333333', 'Advanced Grammar', 'Master complex French grammar rules and advanced language structures.', 'advanced', 'grammar', true, 3, 40, 'system'),
    ('c4444444-4444-4444-4444-444444444444', 'French Pronunciation', 'Perfect your French accent and pronunciation with detailed phonetic exercises.', 'beginner', 'pronunciation', true, 4, 15, 'system'),
    ('c5555555-5555-5555-5555-555555555555', 'Business French', 'Learn professional French vocabulary and communication skills for business settings.', 'intermediate', 'business', true, 5, 25, 'system')
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons
INSERT INTO public.lessons (course_id, title, description, lesson_type, sort_order, duration_minutes, points_reward, is_published) 
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Greetings and Introductions', 'Learn how to greet people and introduce yourself in French.', 'content', 1, 20, 15, true),
    ('c1111111-1111-1111-1111-111111111111', 'Numbers and Colors', 'Master French numbers from 1-100 and basic color vocabulary.', 'content', 2, 25, 20, true),
    ('c1111111-1111-1111-1111-111111111111', 'Basic Vocabulary Quiz', 'Test your knowledge of basic French vocabulary.', 'quiz', 3, 15, 25, true),
    ('c2222222-2222-2222-2222-222222222222', 'Ordering Food', 'Learn how to order food and drinks in French restaurants.', 'conversation', 1, 30, 30, true),
    ('c2222222-2222-2222-2222-222222222222', 'Asking for Directions', 'Practice asking for and giving directions in French.', 'conversation', 2, 25, 25, true)
ON CONFLICT (id) DO NOTHING;