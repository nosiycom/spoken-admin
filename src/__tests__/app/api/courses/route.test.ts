import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/courses/route'
import { CourseService } from '@/lib/services/courses'
import { withApiMiddleware } from '@/lib/apiMiddleware'

// Mock the CourseService
jest.mock('@/lib/services/courses', () => ({
  CourseService: jest.fn().mockImplementation(() => ({
    getAllCourses: jest.fn(),
    searchCourses: jest.fn(),
    getCoursesByLevel: jest.fn(),
    getCoursesByCategory: jest.fn(),
    createCourse: jest.fn(),
  })),
}))

// Mock the API middleware
jest.mock('@/lib/apiMiddleware', () => ({
  withApiMiddleware: jest.fn((handler, options) => {
    // Return a mock implementation that calls the handler with mock context
    return jest.fn(async (req: NextRequest) => {
      const mockContext = {
        userId: 'test-user-id',
        req,
      }
      return handler(mockContext)
    })
  }),
}))

// Mock security functions
jest.mock('@/lib/security', () => ({
  courseValidationSchema: {
    parse: jest.fn((data) => data),
  },
  searchValidationSchema: {
    parse: jest.fn((data) => ({
      type: data.type || 'all',
      level: data.level || 'all',
      status: data.status || 'all',
      category: data.category || '',
      page: parseInt(data.page || '1'),
      limit: parseInt(data.limit || '10'),
      search: data.search || '',
    })),
  },
  sanitizeHtml: jest.fn((html) => html),
}))

describe('Courses API Routes', () => {
  let mockCourseService: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockCourseService = new CourseService()
  })

  describe('GET /api/courses', () => {
    const mockCourses = [
      {
        id: 'course-1',
        title: 'French Basics',
        description: 'Learn basic French',
        level: 'beginner',
        category: 'general',
        is_published: true,
        created_at: '2023-01-01T00:00:00Z',
      },
      {
        id: 'course-2',
        title: 'Advanced French',
        description: 'Advanced French lessons',
        level: 'advanced',
        category: 'advanced',
        is_published: false,
        created_at: '2023-01-02T00:00:00Z',
      },
    ]

    test('returns all courses by default', async () => {
      mockCourseService.getAllCourses.mockResolvedValue(mockCourses)

      const req = new NextRequest('http://localhost:3000/api/courses')
      const response = await GET(req)
      const data = await response.json()

      expect(mockCourseService.getAllCourses).toHaveBeenCalledWith(true)
      expect(data.courses).toEqual(mockCourses)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        pages: 1,
      })
      expect(data.stats).toEqual({
        totalCourses: 2,
        publishedCourses: 1,
        draftCourses: 1,
        archivedCourses: 0,
      })
    })

    test('filters courses by search query', async () => {
      const searchResults = [mockCourses[0]]
      mockCourseService.searchCourses.mockResolvedValue(searchResults)

      const req = new NextRequest('http://localhost:3000/api/courses?search=basic')
      const response = await GET(req)
      const data = await response.json()

      expect(mockCourseService.searchCourses).toHaveBeenCalledWith('basic')
      expect(data.courses).toEqual(searchResults)
    })

    test('filters courses by level', async () => {
      const levelResults = [mockCourses[0]]
      mockCourseService.getCoursesByLevel.mockResolvedValue(levelResults)

      const req = new NextRequest('http://localhost:3000/api/courses?level=beginner')
      const response = await GET(req)
      const data = await response.json()

      expect(mockCourseService.getCoursesByLevel).toHaveBeenCalledWith('beginner')
      expect(data.courses).toEqual(levelResults)
    })

    test('filters courses by category', async () => {
      const categoryResults = [mockCourses[0]]
      mockCourseService.getCoursesByCategory.mockResolvedValue(categoryResults)

      const req = new NextRequest('http://localhost:3000/api/courses?category=general')
      const response = await GET(req)
      const data = await response.json()

      expect(mockCourseService.getCoursesByCategory).toHaveBeenCalledWith('general')
      expect(data.courses).toEqual(categoryResults)
    })

    test('filters courses by publish status', async () => {
      mockCourseService.getAllCourses.mockResolvedValue(mockCourses)

      const req = new NextRequest('http://localhost:3000/api/courses?status=published')
      const response = await GET(req)
      const data = await response.json()

      expect(data.courses).toHaveLength(1)
      expect(data.courses[0].is_published).toBe(true)
    })

    test('filters courses by draft status', async () => {
      mockCourseService.getAllCourses.mockResolvedValue(mockCourses)

      const req = new NextRequest('http://localhost:3000/api/courses?status=draft')
      const response = await GET(req)
      const data = await response.json()

      expect(data.courses).toHaveLength(1)
      expect(data.courses[0].is_published).toBe(false)
    })

    test('handles pagination correctly', async () => {
      const manyCourses = Array.from({ length: 25 }, (_, i) => ({
        ...mockCourses[0],
        id: `course-${i}`,
        title: `Course ${i}`,
      }))
      
      mockCourseService.getAllCourses.mockResolvedValue(manyCourses)

      const req = new NextRequest('http://localhost:3000/api/courses?page=2&limit=10')
      const response = await GET(req)
      const data = await response.json()

      expect(data.courses).toHaveLength(10)
      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        pages: 3,
      })
    })

    test('handles empty results', async () => {
      mockCourseService.getAllCourses.mockResolvedValue([])

      const req = new NextRequest('http://localhost:3000/api/courses')
      const response = await GET(req)
      const data = await response.json()

      expect(data.courses).toEqual([])
      expect(data.pagination.total).toBe(0)
      expect(data.stats.totalCourses).toBe(0)
    })

    test('validates search parameters with defaults', async () => {
      const { searchValidationSchema } = require('@/lib/security')
      mockCourseService.getAllCourses.mockResolvedValue([])

      const req = new NextRequest('http://localhost:3000/api/courses?invalid=param')
      await GET(req)

      expect(searchValidationSchema.parse).toHaveBeenCalledWith({
        type: 'all',
        level: 'all',
        status: 'all',
        category: '',
        page: '1',
        limit: '10',
        search: '',
      })
    })

    test('handles service errors gracefully', async () => {
      mockCourseService.getAllCourses.mockRejectedValue(new Error('Database error'))

      const req = new NextRequest('http://localhost:3000/api/courses')

      await expect(GET(req)).rejects.toThrow('Database error')
    })
  })

  describe('POST /api/courses', () => {
    const mockCourseData = {
      title: 'New Course',
      description: 'A new course description',
      level: 'intermediate',
      category: 'conversation',
      image_url: 'https://example.com/image.jpg',
      is_published: false,
      sort_order: 5,
      estimated_duration_hours: 20,
    }

    const mockCreatedCourse = {
      id: 'course-new',
      ...mockCourseData,
      created_by: 'test-user-id',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }

    test('creates a new course successfully', async () => {
      mockCourseService.createCourse.mockResolvedValue(mockCreatedCourse)

      const req = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCourseData),
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.course).toEqual(mockCreatedCourse)
      expect(data.message).toBe('Course created successfully')
      expect(mockCourseService.createCourse).toHaveBeenCalledWith({
        ...mockCourseData,
        category: 'conversation',
        created_by: 'test-user-id',
      })
    })

    test('sets default values for optional fields', async () => {
      const minimalCourseData = {
        title: 'Minimal Course',
        description: 'Minimal description',
        level: 'beginner',
      }

      const expectedCourseData = {
        ...minimalCourseData,
        category: 'general',
        image_url: undefined,
        is_published: false,
        sort_order: 0,
        estimated_duration_hours: undefined,
        created_by: 'test-user-id',
      }

      mockCourseService.createCourse.mockResolvedValue({
        id: 'course-minimal',
        ...expectedCourseData,
      })

      const req = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalCourseData),
      })

      await POST(req)

      expect(mockCourseService.createCourse).toHaveBeenCalledWith(expectedCourseData)
    })

    test('sanitizes HTML content in description', async () => {
      const { sanitizeHtml } = require('@/lib/security')
      const courseDataWithHtml = {
        ...mockCourseData,
        description: '<script>alert("xss")</script>Safe content',
      }

      sanitizeHtml.mockReturnValue('Safe content')
      mockCourseService.createCourse.mockResolvedValue(mockCreatedCourse)

      const req = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseDataWithHtml),
      })

      await POST(req)

      expect(sanitizeHtml).toHaveBeenCalledWith('<script>alert("xss")</script>Safe content')
      expect(mockCourseService.createCourse).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Safe content',
        })
      )
    })

    test('logs audit trail on successful creation', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      mockCourseService.createCourse.mockResolvedValue(mockCreatedCourse)

      const req = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCourseData),
      })

      await POST(req)

      expect(consoleSpy).toHaveBeenCalledWith('AUDIT: Course created', {
        userId: 'test-user-id',
        courseId: 'course-new',
        title: 'New Course',
        timestamp: expect.any(String),
      })

      consoleSpy.mockRestore()
    })

    test('handles service errors during creation', async () => {
      mockCourseService.createCourse.mockRejectedValue(new Error('Creation failed'))

      const req = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCourseData),
      })

      await expect(POST(req)).rejects.toThrow('Creation failed')
    })

    test('validates course data schema', async () => {
      const { courseValidationSchema } = require('@/lib/security')
      mockCourseService.createCourse.mockResolvedValue(mockCreatedCourse)

      const req = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCourseData),
      })

      await POST(req)

      // The middleware should validate using the schema
      expect(withApiMiddleware).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          validateSchema: courseValidationSchema,
        })
      )
    })

    test('handles malformed JSON in request body', async () => {
      const req = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      })

      await expect(POST(req)).rejects.toThrow()
    })

    test('includes proper rate limiting configuration', () => {
      expect(withApiMiddleware).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 20 },
        })
      )
    })
  })

  describe('Authentication and Authorization', () => {
    test('GET endpoint requires authentication', () => {
      expect(withApiMiddleware).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          requireAuth: true,
        })
      )
    })

    test('POST endpoint requires authentication', () => {
      expect(withApiMiddleware).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          requireAuth: true,
        })
      )
    })

    test('GET endpoint has appropriate rate limiting', () => {
      expect(withApiMiddleware).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
        })
      )
    })
  })
})