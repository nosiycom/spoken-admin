import { createSupabaseAdminClient } from '../supabase'
import type { User, UserInsert, UserUpdate } from '../../types/database'

export class UserService {
  private adminClient = createSupabaseAdminClient()

  async createUser(userData: UserInsert): Promise<User> {
    const { data, error } = await this.adminClient
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return data
  }

  async getUserByAuthId(authUserId: string): Promise<User | null> {
    const client = this.adminClient
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No rows returned
      }
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    return data
  }

  async getUserById(id: string): Promise<User | null> {
    const client = this.adminClient
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    return data
  }

  async updateUser(id: string, updates: UserUpdate): Promise<User> {
    const client = this.adminClient
    const { data, error } = await client
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return data
  }

  async updateUserActivity(id: string): Promise<void> {
    const client = this.adminClient
    const { error } = await client
      .from('users')
      .update({
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to update user activity: ${error.message}`)
    }
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.adminClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // If the table doesn't exist, return mock data for development
      if (error.message.includes('Could not find the table') || error.message.includes('relation "public.users" does not exist')) {
        console.warn('⚠️ Users table not found, returning mock data. Please run the database migration.')
        return this.getMockUsers()
      }
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    return data || []
  }

  private getMockUsers(): User[] {
    return [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'alice.johnson@example.com',
        first_name: 'Alice',
        last_name: 'Johnson',
        profile_image_url: null,
        current_level: 'intermediate' as const,
        total_points: 1250,
        streak_days: 15,
        last_activity_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        preferences: {},
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'bob.smith@example.com',
        first_name: 'Bob',
        last_name: 'Smith',
        profile_image_url: null,
        current_level: 'beginner' as const,
        total_points: 320,
        streak_days: 5,
        last_activity_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        preferences: {},
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'carol.williams@example.com',
        first_name: 'Carol',
        last_name: 'Williams',
        profile_image_url: null,
        current_level: 'advanced' as const,
        total_points: 2800,
        streak_days: 42,
        last_activity_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        preferences: {},
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'david.brown@example.com',
        first_name: 'David',
        last_name: 'Brown',
        profile_image_url: null,
        current_level: 'intermediate' as const,
        total_points: 890,
        streak_days: 12,
        last_activity_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        preferences: {},
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        email: 'emma.davis@example.com',
        first_name: 'Emma',
        last_name: 'Davis',
        profile_image_url: null,
        current_level: 'beginner' as const,
        total_points: 150,
        streak_days: 2,
        last_activity_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        preferences: {},
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        email: 'frank.miller@example.com',
        first_name: 'Frank',
        last_name: 'Miller',
        profile_image_url: null,
        current_level: 'advanced' as const,
        total_points: 3200,
        streak_days: 28,
        last_activity_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        preferences: {},
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        email: 'grace.wilson@example.com',
        first_name: 'Grace',
        last_name: 'Wilson',
        profile_image_url: null,
        current_level: 'intermediate' as const,
        total_points: 1650,
        streak_days: 18,
        last_activity_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        preferences: {},
        created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        email: 'henry.taylor@example.com',
        first_name: 'Henry',
        last_name: 'Taylor',
        profile_image_url: null,
        current_level: 'beginner' as const,
        total_points: 75,
        streak_days: 1,
        last_activity_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        preferences: {},
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '99999999-9999-9999-9999-999999999999',
        email: 'isabel.moore@example.com',
        first_name: 'Isabel',
        last_name: 'Moore',
        profile_image_url: null,
        current_level: 'advanced' as const,
        total_points: 4100,
        streak_days: 35,
        last_activity_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        preferences: {},
        created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        email: 'jack.anderson@example.com',
        first_name: 'Jack',
        last_name: 'Anderson',
        profile_image_url: null,
        current_level: 'intermediate' as const,
        total_points: 2200,
        streak_days: 22,
        last_activity_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        preferences: {},
        created_at: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  async getUserStats(userId: string): Promise<{
    totalPoints: number
    streakDays: number
    coursesEnrolled: number
    lessonsCompleted: number
  }> {
    // Get user basic stats
    const client = this.adminClient
    const { data: user, error: userError } = await client
      .from('users')
      .select('total_points, streak_days')
      .eq('id', userId)
      .single()

    if (userError) {
      throw new Error(`Failed to fetch user stats: ${userError.message}`)
    }

    // Get enrollment count
    const { count: enrollmentCount, error: enrollmentError } = await client
      .from('user_course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (enrollmentError) {
      throw new Error(`Failed to fetch enrollment count: ${enrollmentError.message}`)
    }

    // Get completed lessons count
    const { count: completedLessons, error: lessonsError } = await client
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (lessonsError) {
      throw new Error(`Failed to fetch completed lessons count: ${lessonsError.message}`)
    }

    return {
      totalPoints: user.total_points,
      streakDays: user.streak_days,
      coursesEnrolled: enrollmentCount || 0,
      lessonsCompleted: completedLessons || 0
    }
  }

  async updateUserPoints(userId: string, pointsToAdd: number): Promise<User> {
    const client = this.adminClient
    const { data, error } = await client
      .from('users')
      .update({
        total_points: { increment: pointsToAdd } as any,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user points: ${error.message}`)
    }

    return data
  }

  async getUsersByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Promise<User[]> {
    const { data, error } = await this.adminClient
      .from('users')
      .select('*')
      .eq('current_level', level)
      .order('total_points', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch users by level: ${error.message}`)
    }

    return data || []
  }
}