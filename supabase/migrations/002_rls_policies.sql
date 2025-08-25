-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user ID from Supabase Auth
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = get_current_user_id());

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = get_current_user_id());

CREATE POLICY "Allow insert for authenticated users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Courses table policies (public read, admin write)
CREATE POLICY "Anyone can view published courses" ON courses
    FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated users can view all courses" ON courses
    FOR SELECT USING (auth.role() = 'authenticated');

-- Lessons table policies
CREATE POLICY "Anyone can view published lessons" ON lessons
    FOR SELECT USING (
        is_published = true AND 
        EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.is_published = true)
    );

CREATE POLICY "Authenticated users can view all lessons" ON lessons
    FOR SELECT USING (auth.role() = 'authenticated');

-- User course enrollments policies
CREATE POLICY "Users can view their own enrollments" ON user_course_enrollments
    FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "Users can create their own enrollments" ON user_course_enrollments
    FOR INSERT WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update their own enrollments" ON user_course_enrollments
    FOR UPDATE USING (user_id = get_current_user_id());

-- User lesson progress policies
CREATE POLICY "Users can view their own progress" ON user_lesson_progress
    FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "Users can create their own progress" ON user_lesson_progress
    FOR INSERT WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update their own progress" ON user_lesson_progress
    FOR UPDATE USING (user_id = get_current_user_id());

-- User performance policies
CREATE POLICY "Users can view their own performance" ON user_performance
    FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "Users can create their own performance data" ON user_performance
    FOR INSERT WITH CHECK (user_id = get_current_user_id());

-- Course categories policies (public read)
CREATE POLICY "Anyone can view course categories" ON course_categories
    FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "System can create achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admin policies (for dashboard management)
-- Note: In production, you'd have a proper admin role system

-- Allow service role to do everything (for admin dashboard)
CREATE POLICY "Service role can do everything on users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on courses" ON courses
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on lessons" ON lessons
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on enrollments" ON user_course_enrollments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on progress" ON user_lesson_progress
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on performance" ON user_performance
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on categories" ON course_categories
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on achievements" ON user_achievements
    FOR ALL USING (auth.role() = 'service_role');