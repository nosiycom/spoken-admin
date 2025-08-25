export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          current_level: 'beginner' | 'intermediate' | 'advanced'
          total_points: number
          streak_days: number
          last_activity_at: string
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          current_level?: 'beginner' | 'intermediate' | 'advanced'
          total_points?: number
          streak_days?: number
          last_activity_at?: string
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          current_level?: 'beginner' | 'intermediate' | 'advanced'
          total_points?: number
          streak_days?: number
          last_activity_at?: string
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          level: 'beginner' | 'intermediate' | 'advanced'
          category: string
          image_url: string | null
          is_published: boolean
          sort_order: number
          estimated_duration_hours: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          level: 'beginner' | 'intermediate' | 'advanced'
          category?: string
          image_url?: string | null
          is_published?: boolean
          sort_order?: number
          estimated_duration_hours?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced'
          category?: string
          image_url?: string | null
          is_published?: boolean
          sort_order?: number
          estimated_duration_hours?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          content: string | null
          lesson_type: 'content' | 'quiz' | 'exercise' | 'conversation'
          sort_order: number
          duration_minutes: number
          points_reward: number
          is_published: boolean
          activities: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          content?: string | null
          lesson_type?: 'content' | 'quiz' | 'exercise' | 'conversation'
          sort_order?: number
          duration_minutes?: number
          points_reward?: number
          is_published?: boolean
          activities?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          content?: string | null
          lesson_type?: 'content' | 'quiz' | 'exercise' | 'conversation'
          sort_order?: number
          duration_minutes?: number
          points_reward?: number
          is_published?: boolean
          activities?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_course_enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
          completed_at: string | null
          progress_percentage: number
          current_lesson_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          enrolled_at?: string
          completed_at?: string | null
          progress_percentage?: number
          current_lesson_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          enrolled_at?: string
          completed_at?: string | null
          progress_percentage?: number
          current_lesson_id?: string | null
        }
      }
      user_lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          course_id: string
          status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
          completion_percentage: number
          attempts_count: number
          best_score: number
          time_spent_minutes: number
          points_earned: number
          activity_progress: Json
          started_at: string | null
          completed_at: string | null
          last_accessed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          course_id: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'skipped'
          completion_percentage?: number
          attempts_count?: number
          best_score?: number
          time_spent_minutes?: number
          points_earned?: number
          activity_progress?: Json
          started_at?: string | null
          completed_at?: string | null
          last_accessed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          course_id?: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'skipped'
          completion_percentage?: number
          attempts_count?: number
          best_score?: number
          time_spent_minutes?: number
          points_earned?: number
          activity_progress?: Json
          started_at?: string | null
          completed_at?: string | null
          last_accessed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_performance: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          lesson_id: string | null
          metric_type: 'lesson_completion' | 'quiz_score' | 'exercise_accuracy' | 'speaking_fluency' | 'listening_comprehension' | 'reading_speed' | 'vocabulary_retention' | 'grammar_accuracy' | 'session_duration'
          metric_value: number
          metric_unit: string | null
          session_data: Json
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          lesson_id?: string | null
          metric_type: 'lesson_completion' | 'quiz_score' | 'exercise_accuracy' | 'speaking_fluency' | 'listening_comprehension' | 'reading_speed' | 'vocabulary_retention' | 'grammar_accuracy' | 'session_duration'
          metric_value: number
          metric_unit?: string | null
          session_data?: Json
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          lesson_id?: string | null
          metric_type?: 'lesson_completion' | 'quiz_score' | 'exercise_accuracy' | 'speaking_fluency' | 'listening_comprehension' | 'reading_speed' | 'vocabulary_retention' | 'grammar_accuracy' | 'session_duration'
          metric_value?: number
          metric_unit?: string | null
          session_data?: Json
          recorded_at?: string
          created_at?: string
        }
      }
      course_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string
          sort_order?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_type: string
          achievement_name: string
          achievement_description: string | null
          points_awarded: number
          metadata: Json
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_type: string
          achievement_name: string
          achievement_description?: string | null
          points_awarded?: number
          metadata?: Json
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_type?: string
          achievement_name?: string
          achievement_description?: string | null
          points_awarded?: number
          metadata?: Json
          earned_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type UserCourseEnrollment = Database['public']['Tables']['user_course_enrollments']['Row']
export type UserLessonProgress = Database['public']['Tables']['user_lesson_progress']['Row']
export type UserPerformance = Database['public']['Tables']['user_performance']['Row']
export type CourseCategory = Database['public']['Tables']['course_categories']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type CourseInsert = Database['public']['Tables']['courses']['Insert']
export type LessonInsert = Database['public']['Tables']['lessons']['Insert']
export type UserCourseEnrollmentInsert = Database['public']['Tables']['user_course_enrollments']['Insert']
export type UserLessonProgressInsert = Database['public']['Tables']['user_lesson_progress']['Insert']
export type UserPerformanceInsert = Database['public']['Tables']['user_performance']['Insert']
export type CourseCategoryInsert = Database['public']['Tables']['course_categories']['Insert']
export type UserAchievementInsert = Database['public']['Tables']['user_achievements']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type CourseUpdate = Database['public']['Tables']['courses']['Update']
export type LessonUpdate = Database['public']['Tables']['lessons']['Update']
export type UserCourseEnrollmentUpdate = Database['public']['Tables']['user_course_enrollments']['Update']
export type UserLessonProgressUpdate = Database['public']['Tables']['user_lesson_progress']['Update']
export type UserPerformanceUpdate = Database['public']['Tables']['user_performance']['Update']
export type CourseCategoryUpdate = Database['public']['Tables']['course_categories']['Update']
export type UserAchievementUpdate = Database['public']['Tables']['user_achievements']['Update']