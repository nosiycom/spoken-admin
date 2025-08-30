import { createClient } from '@supabase/supabase-js'

// Test database utilities
export class TestDatabase {
  private client: any
  
  constructor() {
    // Use a test-specific Supabase instance
    this.client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'
    )
  }
  
  async setup() {
    // Setup test database schema and initial data
    try {
      // Create test users table if it doesn't exist
      const { error: usersError } = await this.client.rpc('create_test_users_table', {})
      if (usersError && !usersError.message.includes('already exists')) {
        console.warn('Failed to create test users table:', usersError)
      }
      
      // Create test courses table if it doesn't exist
      const { error: coursesError } = await this.client.rpc('create_test_courses_table', {})
      if (coursesError && !coursesError.message.includes('already exists')) {
        console.warn('Failed to create test courses table:', coursesError)
      }
      
      return true
    } catch (error) {
      console.warn('Database setup failed (using mocked data):', error)
      return false
    }
  }
  
  async teardown() {
    try {
      // Clean up test data
      await this.client.from('test_users').delete().neq('id', '')
      await this.client.from('test_courses').delete().neq('id', '')
    } catch (error) {
      console.warn('Database teardown failed:', error)
    }
  }
  
  async createTestUser(userData: any = {}) {
    const defaultUser = {
      id: `test-user-${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      name: 'Test User',
      created_at: new Date().toISOString(),
      ...userData
    }
    
    try {
      const { data, error } = await this.client
        .from('users')
        .insert(defaultUser)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      // Return mock data if database operation fails
      return defaultUser
    }
  }
  
  async createTestCourse(courseData: any = {}) {
    const defaultCourse = {
      id: `test-course-${Date.now()}`,
      title: 'Test Course',
      description: 'A test course',
      created_at: new Date().toISOString(),
      ...courseData
    }
    
    try {
      const { data, error } = await this.client
        .from('courses')
        .insert(defaultCourse)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      // Return mock data if database operation fails
      return defaultCourse
    }
  }
  
  getClient() {
    return this.client
  }
}

// Global test database instance
export const testDb = new TestDatabase()