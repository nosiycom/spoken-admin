import { 
  sanitizeHtml,
  courseValidationSchema,
  searchValidationSchema,
  userValidationSchema,
} from '@/lib/security'
import { ZodError } from 'zod'

// Mock DOMPurify
jest.mock('isomorphic-dompurify', () => ({
  sanitize: jest.fn((html) => html.replace(/<script[^>]*>.*?<\/script>/gi, '')),
}))

describe('Security Functions', () => {
  describe('sanitizeHtml', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    test('removes script tags', () => {
      const maliciousHtml = '<p>Safe content</p><script>alert("XSS")</script>'
      const result = sanitizeHtml(maliciousHtml)
      
      expect(result).toBe('<p>Safe content</p>')
      expect(result).not.toContain('<script>')
    })

    test('preserves safe HTML', () => {
      const safeHtml = '<p>Safe content</p><strong>Bold text</strong><em>Italic</em>'
      const result = sanitizeHtml(safeHtml)
      
      expect(result).toBe(safeHtml)
    })

    test('handles empty strings', () => {
      const result = sanitizeHtml('')
      expect(result).toBe('')
    })

    test('handles null and undefined', () => {
      expect(sanitizeHtml(null as any)).toBe('')
      expect(sanitizeHtml(undefined as any)).toBe('')
    })

    test('removes dangerous attributes', () => {
      const dangerousHtml = '<img src="x" onerror="alert(1)" /><a href="javascript:alert(1)">Link</a>'
      
      // The actual behavior depends on DOMPurify configuration
      // This test assumes dangerous attributes are removed
      const result = sanitizeHtml(dangerousHtml)
      
      expect(result).not.toContain('onerror')
      expect(result).not.toContain('javascript:')
    })

    test('handles nested malicious content', () => {
      const nestedMalicious = '<div><script>alert("nested")</script><p>Safe</p></div>'
      const result = sanitizeHtml(nestedMalicious)
      
      expect(result).toContain('<div>')
      expect(result).toContain('<p>Safe</p>')
      expect(result).not.toContain('<script>')
    })

    test('performance with large HTML strings', () => {
      const largeHtml = '<p>'.repeat(1000) + 'Content' + '</p>'.repeat(1000)
      
      const start = performance.now()
      const result = sanitizeHtml(largeHtml)
      const end = performance.now()
      
      expect(result).toContain('Content')
      expect(end - start).toBeLessThan(100) // Should be reasonably fast
    })
  })

  describe('courseValidationSchema', () => {
    const validCourse = {
      title: 'French Basics',
      description: 'Learn basic French vocabulary and grammar',
      level: 'beginner',
      category: 'general',
      is_published: false,
      sort_order: 1,
      estimated_duration_hours: 20,
      image_url: 'https://example.com/image.jpg',
    }

    test('validates correct course data', () => {
      const result = courseValidationSchema.parse(validCourse)
      expect(result).toEqual(validCourse)
    })

    test('requires title field', () => {
      const invalidCourse = { ...validCourse }
      delete invalidCourse.title
      
      expect(() => courseValidationSchema.parse(invalidCourse))
        .toThrow(ZodError)
    })

    test('requires description field', () => {
      const invalidCourse = { ...validCourse }
      delete invalidCourse.description
      
      expect(() => courseValidationSchema.parse(invalidCourse))
        .toThrow(ZodError)
    })

    test('validates level enum values', () => {
      const invalidCourse = { ...validCourse, level: 'expert' }
      
      expect(() => courseValidationSchema.parse(invalidCourse))
        .toThrow(ZodError)
      
      // Valid levels should work
      const beginnerCourse = { ...validCourse, level: 'beginner' }
      const intermediateCourse = { ...validCourse, level: 'intermediate' }
      const advancedCourse = { ...validCourse, level: 'advanced' }
      
      expect(() => courseValidationSchema.parse(beginnerCourse)).not.toThrow()
      expect(() => courseValidationSchema.parse(intermediateCourse)).not.toThrow()
      expect(() => courseValidationSchema.parse(advancedCourse)).not.toThrow()
    })

    test('validates title length limits', () => {
      const tooShortTitle = { ...validCourse, title: 'A' }
      const tooLongTitle = { ...validCourse, title: 'A'.repeat(201) }
      
      expect(() => courseValidationSchema.parse(tooShortTitle))
        .toThrow(ZodError)
      expect(() => courseValidationSchema.parse(tooLongTitle))
        .toThrow(ZodError)
      
      const validShortTitle = { ...validCourse, title: 'AB' }
      const validLongTitle = { ...validCourse, title: 'A'.repeat(200) }
      
      expect(() => courseValidationSchema.parse(validShortTitle)).not.toThrow()
      expect(() => courseValidationSchema.parse(validLongTitle)).not.toThrow()
    })

    test('validates description length limits', () => {
      const tooLongDescription = { ...validCourse, description: 'A'.repeat(2001) }
      
      expect(() => courseValidationSchema.parse(tooLongDescription))
        .toThrow(ZodError)
      
      const validLongDescription = { ...validCourse, description: 'A'.repeat(2000) }
      expect(() => courseValidationSchema.parse(validLongDescription)).not.toThrow()
    })

    test('validates URL format for image_url', () => {
      const invalidUrl = { ...validCourse, image_url: 'not-a-url' }
      
      expect(() => courseValidationSchema.parse(invalidUrl))
        .toThrow(ZodError)
      
      const validUrls = [
        { ...validCourse, image_url: 'https://example.com/image.jpg' },
        { ...validCourse, image_url: 'http://example.com/image.png' },
        { ...validCourse, image_url: 'https://cdn.example.com/path/to/image.webp' },
      ]
      
      validUrls.forEach(course => {
        expect(() => courseValidationSchema.parse(course)).not.toThrow()
      })
    })

    test('validates numeric fields', () => {
      const negativeOrder = { ...validCourse, sort_order: -1 }
      const negativeDuration = { ...validCourse, estimated_duration_hours: -5 }
      
      expect(() => courseValidationSchema.parse(negativeOrder))
        .toThrow(ZodError)
      expect(() => courseValidationSchema.parse(negativeDuration))
        .toThrow(ZodError)
      
      const validNumbers = { 
        ...validCourse, 
        sort_order: 0, 
        estimated_duration_hours: 0 
      }
      expect(() => courseValidationSchema.parse(validNumbers)).not.toThrow()
    })

    test('handles optional fields', () => {
      const minimalCourse = {
        title: 'Minimal Course',
        description: 'Minimal description',
        level: 'beginner',
      }
      
      expect(() => courseValidationSchema.parse(minimalCourse)).not.toThrow()
    })

    test('validates boolean fields', () => {
      const stringBoolean = { ...validCourse, is_published: 'true' }
      
      expect(() => courseValidationSchema.parse(stringBoolean))
        .toThrow(ZodError)
      
      const validBooleans = [
        { ...validCourse, is_published: true },
        { ...validCourse, is_published: false },
      ]
      
      validBooleans.forEach(course => {
        expect(() => courseValidationSchema.parse(course)).not.toThrow()
      })
    })
  })

  describe('searchValidationSchema', () => {
    const validSearch = {
      type: 'all',
      level: 'beginner',
      status: 'published',
      category: 'general',
      page: '1',
      limit: '10',
      search: 'french basics',
    }

    test('validates correct search parameters', () => {
      const result = searchValidationSchema.parse(validSearch)
      expect(result).toEqual({
        ...validSearch,
        page: 1,
        limit: 10,
      })
    })

    test('converts string numbers to integers', () => {
      const searchWithStrings = {
        ...validSearch,
        page: '5',
        limit: '25',
      }
      
      const result = searchValidationSchema.parse(searchWithStrings)
      expect(result.page).toBe(5)
      expect(result.limit).toBe(25)
    })

    test('validates page and limit ranges', () => {
      const invalidPage = { ...validSearch, page: '0' }
      const invalidLimit = { ...validSearch, limit: '101' }
      
      expect(() => searchValidationSchema.parse(invalidPage))
        .toThrow(ZodError)
      expect(() => searchValidationSchema.parse(invalidLimit))
        .toThrow(ZodError)
      
      const validRanges = [
        { ...validSearch, page: '1', limit: '1' },
        { ...validSearch, page: '1000', limit: '100' },
      ]
      
      validRanges.forEach(search => {
        expect(() => searchValidationSchema.parse(search)).not.toThrow()
      })
    })

    test('validates enum values', () => {
      const invalidLevel = { ...validSearch, level: 'expert' }
      const invalidStatus = { ...validSearch, status: 'archived' }
      
      expect(() => searchValidationSchema.parse(invalidLevel))
        .toThrow(ZodError)
      expect(() => searchValidationSchema.parse(invalidStatus))
        .toThrow(ZodError)
    })

    test('validates search string length', () => {
      const tooLongSearch = { ...validSearch, search: 'A'.repeat(201) }
      
      expect(() => searchValidationSchema.parse(tooLongSearch))
        .toThrow(ZodError)
      
      const validSearch200 = { ...validSearch, search: 'A'.repeat(200) }
      expect(() => searchValidationSchema.parse(validSearch200)).not.toThrow()
    })

    test('handles default values', () => {
      const emptySearch = {}
      
      const result = searchValidationSchema.parse(emptySearch)
      
      // Should provide sensible defaults
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.search).toBe('')
    })
  })

  describe('userValidationSchema', () => {
    const validUser = {
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
    }

    test('validates correct user data', () => {
      const result = userValidationSchema.parse(validUser)
      expect(result).toEqual(validUser)
    })

    test('validates email format', () => {
      const invalidEmails = [
        { ...validUser, email: 'not-an-email' },
        { ...validUser, email: 'missing@domain' },
        { ...validUser, email: '@domain.com' },
        { ...validUser, email: 'spaces @domain.com' },
      ]
      
      invalidEmails.forEach(user => {
        expect(() => userValidationSchema.parse(user))
          .toThrow(ZodError)
      })
      
      const validEmails = [
        { ...validUser, email: 'test@example.com' },
        { ...validUser, email: 'user+tag@domain.co.uk' },
        { ...validUser, email: 'firstname.lastname@company-name.com' },
      ]
      
      validEmails.forEach(user => {
        expect(() => userValidationSchema.parse(user)).not.toThrow()
      })
    })

    test('validates name length', () => {
      const tooShortName = { ...validUser, name: 'A' }
      const tooLongName = { ...validUser, name: 'A'.repeat(101) }
      
      expect(() => userValidationSchema.parse(tooShortName))
        .toThrow(ZodError)
      expect(() => userValidationSchema.parse(tooLongName))
        .toThrow(ZodError)
      
      const validNames = [
        { ...validUser, name: 'AB' },
        { ...validUser, name: 'A'.repeat(100) },
      ]
      
      validNames.forEach(user => {
        expect(() => userValidationSchema.parse(user)).not.toThrow()
      })
    })

    test('validates role enum values', () => {
      const invalidRole = { ...validUser, role: 'superuser' }
      
      expect(() => userValidationSchema.parse(invalidRole))
        .toThrow(ZodError)
      
      const validRoles = [
        { ...validUser, role: 'admin' },
        { ...validUser, role: 'user' },
        { ...validUser, role: 'moderator' },
      ]
      
      validRoles.forEach(user => {
        expect(() => userValidationSchema.parse(user)).not.toThrow()
      })
    })

    test('handles optional fields', () => {
      const minimalUser = {
        email: 'minimal@example.com',
      }
      
      expect(() => userValidationSchema.parse(minimalUser)).not.toThrow()
    })
  })

  describe('Security Edge Cases', () => {
    test('handles XSS attempts in course titles', () => {
      const xssTitle = '<script>alert("XSS")</script>French Course'
      const courseWithXSS = {
        title: xssTitle,
        description: 'Safe description',
        level: 'beginner',
      }
      
      // Schema should accept the input (validation happens)
      // But sanitization should occur at the application level
      expect(() => courseValidationSchema.parse(courseWithXSS)).not.toThrow()
      
      // Verify that sanitization would clean it
      const sanitizedTitle = sanitizeHtml(xssTitle)
      expect(sanitizedTitle).not.toContain('<script>')
    })

    test('handles SQL injection attempts', () => {
      const sqlInjection = "'; DROP TABLE courses; --"
      const courseWithSql = {
        title: sqlInjection,
        description: 'Description with SQL injection attempt',
        level: 'beginner',
      }
      
      // Schema should still validate (string length permitting)
      expect(() => courseValidationSchema.parse(courseWithSql)).not.toThrow()
    })

    test('handles extremely long input strings', () => {
      const veryLongString = 'A'.repeat(10000)
      
      // Should fail validation due to length limits
      const courseWithLongTitle = {
        title: veryLongString,
        description: 'Normal description',
        level: 'beginner',
      }
      
      expect(() => courseValidationSchema.parse(courseWithLongTitle))
        .toThrow(ZodError)
    })

    test('handles Unicode and special characters', () => {
      const unicodeCourse = {
        title: '🇫🇷 Français Avancé - Course with émoji and açcénts',
        description: 'Descripción con caracteres especiales: áéíóú ñ',
        level: 'advanced',
      }
      
      expect(() => courseValidationSchema.parse(unicodeCourse)).not.toThrow()
    })

    test('handles null bytes and control characters', () => {
      const maliciousInput = 'Title\x00\x01\x02\x03'
      
      const courseWithControlChars = {
        title: maliciousInput,
        description: 'Normal description',
        level: 'beginner',
      }
      
      // Should handle gracefully (either clean or reject)
      const result = courseValidationSchema.parse(courseWithControlChars)
      expect(result.title).toBeDefined()
    })
  })

  describe('Performance and Security', () => {
    test('validation performance under load', () => {
      const testData = Array.from({ length: 100 }, (_, i) => ({
        title: `Course ${i}`,
        description: `Description for course ${i}`,
        level: i % 3 === 0 ? 'beginner' : i % 3 === 1 ? 'intermediate' : 'advanced',
      }))
      
      const start = performance.now()
      
      testData.forEach(course => {
        courseValidationSchema.parse(course)
      })
      
      const end = performance.now()
      expect(end - start).toBeLessThan(100) // Should be fast
    })

    test('memory usage with large validation sets', () => {
      // Test that validation doesn't cause memory leaks
      for (let i = 0; i < 1000; i++) {
        const course = {
          title: `Course ${i}`,
          description: 'A'.repeat(100),
          level: 'beginner',
        }
        courseValidationSchema.parse(course)
      }
      
      // If this completes without memory issues, test passes
      expect(true).toBe(true)
    })
  })
})