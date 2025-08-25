import { createServerSupabase } from '../supabase-server'
import type { User, UserInsert, UserUpdate } from '../../types/database'

export class UserService {
  // private adminClient = createSupabaseAdminClient()

  private async getSupabaseClient() {
    return await createServerSupabase()
  }

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
    const client = await this.getSupabaseClient()
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
    const client = await this.getSupabaseClient()
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
    const client = await this.getSupabaseClient()
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
    const client = await this.getSupabaseClient()
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
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    return data || []
  }

  async getUserStats(userId: string): Promise<{
    totalPoints: number
    streakDays: number
    coursesEnrolled: number
    lessonsCompleted: number
  }> {
    // Get user basic stats
    const client = await this.getSupabaseClient()
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
    const client = await this.getSupabaseClient()
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