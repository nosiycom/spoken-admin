import { createSupabaseAdminClient } from '../supabase'
import type { Course, CourseInsert, CourseUpdate, Lesson } from '../../types/database'

export class CourseService {
  private adminClient = createSupabaseAdminClient()

  async getAllCourses(includeUnpublished = false): Promise<Course[]> {
    const client = includeUnpublished ? this.adminClient : this.adminClient
    
    let query = client
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (!includeUnpublished) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch courses: ${error.message}`)
    }

    return data || []
  }

  async getCourseById(id: string, includeUnpublished = false): Promise<Course | null> {
    const client = this.adminClient
    
    let query = client
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (!includeUnpublished) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No rows returned
      }
      throw new Error(`Failed to fetch course: ${error.message}`)
    }

    return data
  }

  async getCourseWithLessons(courseId: string, includeUnpublished = false): Promise<Course & { lessons: Lesson[] } | null> {
    const client = this.adminClient
    
    let courseQuery = client
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (!includeUnpublished) {
      courseQuery = courseQuery.eq('is_published', true)
    }

    const { data: course, error: courseError } = await courseQuery

    if (courseError) {
      if (courseError.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch course: ${courseError.message}`)
    }

    let lessonsQuery = client
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true })

    if (!includeUnpublished) {
      lessonsQuery = lessonsQuery.eq('is_published', true)
    }

    const { data: lessons, error: lessonsError } = await lessonsQuery

    if (lessonsError) {
      throw new Error(`Failed to fetch lessons: ${lessonsError.message}`)
    }

    return {
      ...course,
      lessons: lessons || []
    }
  }

  async createCourse(course: CourseInsert): Promise<Course> {
    const { data, error } = await this.adminClient
      .from('courses')
      .insert(course)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create course: ${error.message}`)
    }

    return data
  }

  async updateCourse(id: string, updates: CourseUpdate): Promise<Course> {
    const { data, error } = await this.adminClient
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update course: ${error.message}`)
    }

    return data
  }

  async deleteCourse(id: string): Promise<void> {
    const { error } = await this.adminClient
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete course: ${error.message}`)
    }
  }

  async getCoursesByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Promise<Course[]> {
    const client = this.adminClient
    const { data, error } = await client
      .from('courses')
      .select('*')
      .eq('level', level)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch courses by level: ${error.message}`)
    }

    return data || []
  }

  async getCoursesByCategory(category: string): Promise<Course[]> {
    const client = this.adminClient
    const { data, error } = await client
      .from('courses')
      .select('*')
      .eq('category', category)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch courses by category: ${error.message}`)
    }

    return data || []
  }

  async searchCourses(searchTerm: string): Promise<Course[]> {
    const client = this.adminClient
    const { data, error } = await client
      .from('courses')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to search courses: ${error.message}`)
    }

    return data || []
  }
}