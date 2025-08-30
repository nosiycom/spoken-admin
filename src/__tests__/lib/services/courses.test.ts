import { CourseService } from '@/lib/services/courses'
import { mockSupabaseClient, mockSupabaseData } from '../../../../tests/mocks/supabase'

describe('CourseService', () => {
  let courseService: CourseService
  
  beforeEach(() => {
    courseService = new CourseService()
    jest.clearAllMocks()
  })

  describe('Critical Bug Tests', () => {
    test('CRITICAL BUG: adminClient is undefined - getAllCourses with includeUnpublished will throw', async () => {
      // This should fail because adminClient is commented out but still used
      await expect(courseService.getAllCourses(true)).rejects.toThrow()
    })

    test('CRITICAL BUG: adminClient is undefined - getCourseById with includeUnpublished will throw', async () => {
      // This should fail because adminClient is commented out but still used
      await expect(courseService.getCourseById('course-1', true)).rejects.toThrow()
    })

    test('CRITICAL BUG: adminClient is undefined - getCourseWithLessons with includeUnpublished will throw', async () => {
      // This should fail because adminClient is commented out but still used
      await expect(courseService.getCourseWithLessons('course-1', true)).rejects.toThrow()
    })

    test('CRITICAL BUG: adminClient is undefined - createCourse will throw', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'A test course',
      }

      // This should fail because adminClient is commented out but still used
      await expect(courseService.createCourse(courseData)).rejects.toThrow()
    })

    test('CRITICAL BUG: adminClient is undefined - updateCourse will throw', async () => {
      const updates = {
        title: 'Updated Course',
      }

      // This should fail because adminClient is commented out but still used
      await expect(courseService.updateCourse('course-1', updates)).rejects.toThrow()
    })

    test('CRITICAL BUG: adminClient is undefined - deleteCourse will throw', async () => {
      // This should fail because adminClient is commented out but still used
      await expect(courseService.deleteCourse('course-1')).rejects.toThrow()
    })
  })

  describe('CourseService - Basic Operations (Working Methods)', () => {
    test('getAllCourses - success without includeUnpublished', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          title: 'Course 1',
          is_published: true,
          sort_order: 1,
        },
        {
          id: 'course-2', 
          title: 'Course 2',
          is_published: true,
          sort_order: 2,
        }
      ]

      mockSupabaseData.mockQuerySuccess(mockCourses)
      
      const result = await courseService.getAllCourses(false)
      expect(result).toEqual(mockCourses)
    })

    test('getCourseById - success without includeUnpublished', async () => {
      const mockCourse = {
        id: 'course-1',
        title: 'Test Course',
        is_published: true,
      }

      mockSupabaseData.mockQuerySuccess(mockCourse)
      
      const result = await courseService.getCourseById('course-1', false)
      expect(result).toEqual(mockCourse)
    })

    test('getCourseById - not found', async () => {
      const mockChain = mockSupabaseClient.from()
      mockChain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      })
      
      const result = await courseService.getCourseById('non-existent', false)
      expect(result).toBeNull()
    })

    test('getCoursesByLevel - success', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          title: 'Beginner Course',
          level: 'beginner',
          is_published: true,
        }
      ]

      mockSupabaseData.mockQuerySuccess(mockCourses)
      
      const result = await courseService.getCoursesByLevel('beginner')
      expect(result).toEqual(mockCourses)
    })

    test('getCoursesByCategory - success', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          title: 'Math Course',
          category: 'mathematics',
          is_published: true,
        }
      ]

      mockSupabaseData.mockQuerySuccess(mockCourses)
      
      const result = await courseService.getCoursesByCategory('mathematics')
      expect(result).toEqual(mockCourses)
    })

    test('searchCourses - success', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          title: 'JavaScript Fundamentals',
          description: 'Learn JavaScript basics',
          is_published: true,
        }
      ]

      mockSupabaseData.mockQuerySuccess(mockCourses)
      
      const result = await courseService.searchCourses('JavaScript')
      expect(result).toEqual(mockCourses)
    })
  })

  describe('getCourseWithLessons - Complex Query Tests', () => {
    test('getCourseWithLessons - success without includeUnpublished', async () => {
      const mockCourse = {
        id: 'course-1',
        title: 'Test Course',
        is_published: true,
      }

      const mockLessons = [
        {
          id: 'lesson-1',
          title: 'Lesson 1',
          course_id: 'course-1',
          sort_order: 1,
        },
        {
          id: 'lesson-2',
          title: 'Lesson 2', 
          course_id: 'course-1',
          sort_order: 2,
        }
      ]

      // Mock course query
      const mockChain = mockSupabaseClient.from()
      mockChain.single.mockResolvedValueOnce({
        data: mockCourse,
        error: null
      })
      
      // Mock lessons query
      mockChain.single.mockResolvedValueOnce({
        data: mockLessons,
        error: null
      })

      const result = await courseService.getCourseWithLessons('course-1', false)
      
      expect(result).toEqual({
        ...mockCourse,
        lessons: mockLessons
      })
    })

    test('getCourseWithLessons - course not found', async () => {
      const mockChain = mockSupabaseClient.from()
      mockChain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      })
      
      const result = await courseService.getCourseWithLessons('non-existent', false)
      expect(result).toBeNull()
    })

    test('getCourseWithLessons - lessons query fails', async () => {
      const mockCourse = {
        id: 'course-1',
        title: 'Test Course',
      }

      const mockChain = mockSupabaseClient.from()
      // Course query succeeds
      mockChain.single.mockResolvedValueOnce({
        data: mockCourse,
        error: null
      })
      
      // Lessons query fails
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Lessons table not found' }
      })

      await expect(courseService.getCourseWithLessons('course-1', false))
        .rejects.toThrow('Failed to fetch lessons: Lessons table not found')
    })
  })

  describe('Error Handling Tests', () => {
    test('handles database connection errors', async () => {
      mockSupabaseData.mockQueryError('Connection timeout')
      
      await expect(courseService.getAllCourses(false)).rejects.toThrow('Failed to fetch courses: Connection timeout')
    })

    test('handles invalid course ID format', async () => {
      await expect(courseService.getCourseById('', false)).rejects.toThrow()
    })

    test('handles SQL injection attempts in search', async () => {
      const maliciousSearch = "'; DROP TABLE courses; --"
      
      mockSupabaseData.mockQueryError('Invalid input')
      await expect(courseService.searchCourses(maliciousSearch)).rejects.toThrow()
    })
  })

  describe('Data Validation Tests', () => {
    test('search with empty string should handle gracefully', async () => {
      mockSupabaseData.mockQuerySuccess([])
      
      const result = await courseService.searchCourses('')
      expect(result).toEqual([])
    })

    test('search with very long string should handle gracefully', async () => {
      const longSearch = 'a'.repeat(1000)
      mockSupabaseData.mockQuerySuccess([])
      
      const result = await courseService.searchCourses(longSearch)
      expect(result).toEqual([])
    })
  })
})