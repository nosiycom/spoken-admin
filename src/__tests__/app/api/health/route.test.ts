import { GET } from '@/app/api/health/route'
import { NextRequest } from 'next/server'

// Mock the missing createSupabaseAdminClient function
jest.mock('@/lib/supabase', () => ({
  createSupabaseAdminClient: jest.fn(() => {
    throw new Error('createSupabaseAdminClient is not implemented')
  })
}))

// Mock Redis
jest.mock('@/lib/redis', () => ({
  __esModule: true,
  default: {
    ping: jest.fn()
  }
}))

describe('Health Check API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('CRITICAL BUGS', () => {
    test('CRITICAL BUG: createSupabaseAdminClient function does not exist', async () => {
      const req = new NextRequest('http://localhost:3000/api/health')
      
      const response = await GET(req)
      const data = await response.json()
      
      // This should fail because createSupabaseAdminClient doesn't exist
      expect(data.services.database).toBe('unhealthy')
      expect(data.status).toBe('degraded')
      expect(response.status).toBe(503)
    })
  })

  describe('Health Check Response Structure', () => {
    test('returns correct response structure when services are healthy', async () => {
      // Mock successful supabase client
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [{ id: '1' }], error: null }))
          }))
        }))
      }
      
      jest.doMock('@/lib/supabase', () => ({
        createSupabaseAdminClient: jest.fn(() => mockSupabase)
      }))
      
      // Mock successful Redis
      const redis = require('@/lib/redis').default
      redis.ping.mockResolvedValue('PONG')
      
      const req = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(req)
      const data = await response.json()
      
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('services')
      expect(data.services).toHaveProperty('database')
      expect(data.services).toHaveProperty('redis')
      
      // Should return 200 when all services are healthy
      expect(response.status).toBe(200)
    })

    test('returns degraded status when database is unhealthy', async () => {
      // Mock failed supabase connection
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Connection failed' } }))
          }))
        }))
      }
      
      jest.doMock('@/lib/supabase', () => ({
        createSupabaseAdminClient: jest.fn(() => mockSupabase)
      }))
      
      // Mock successful Redis
      const redis = require('@/lib/redis').default
      redis.ping.mockResolvedValue('PONG')
      
      const req = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(req)
      const data = await response.json()
      
      expect(data.status).toBe('degraded')
      expect(data.services.database).toBe('unhealthy')
      expect(data.services.redis).toBe('healthy')
      expect(response.status).toBe(503)
    })

    test('returns degraded status when Redis is unhealthy', async () => {
      // Mock successful supabase
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [{ id: '1' }], error: null }))
          }))
        }))
      }
      
      jest.doMock('@/lib/supabase', () => ({
        createSupabaseAdminClient: jest.fn(() => mockSupabase)
      }))
      
      // Mock failed Redis
      const redis = require('@/lib/redis').default
      redis.ping.mockRejectedValue(new Error('Redis connection failed'))
      
      const req = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(req)
      const data = await response.json()
      
      expect(data.status).toBe('degraded')
      expect(data.services.database).toBe('healthy')
      expect(data.services.redis).toBe('unhealthy')
      expect(response.status).toBe(503)
    })

    test('timestamp is in correct ISO format', async () => {
      const req = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(req)
      const data = await response.json()
      
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      
      // Timestamp should be recent (within last minute)
      const timestamp = new Date(data.timestamp)
      const now = new Date()
      const diffMs = now.getTime() - timestamp.getTime()
      expect(diffMs).toBeLessThan(60000) // Less than 1 minute
    })
  })

  describe('Error Handling', () => {
    test('handles unexpected database errors gracefully', async () => {
      // Mock supabase client that throws unexpected error
      jest.doMock('@/lib/supabase', () => ({
        createSupabaseAdminClient: jest.fn(() => {
          throw new Error('Unexpected database error')
        })
      }))
      
      const req = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(req)
      const data = await response.json()
      
      expect(data.status).toBe('degraded')
      expect(data.services.database).toBe('unhealthy')
      expect(response.status).toBe(503)
    })

    test('handles unexpected Redis errors gracefully', async () => {
      // Mock successful supabase
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [{ id: '1' }], error: null }))
          }))
        }))
      }
      
      jest.doMock('@/lib/supabase', () => ({
        createSupabaseAdminClient: jest.fn(() => mockSupabase)
      }))
      
      // Mock Redis that throws unexpected error
      const redis = require('@/lib/redis').default
      redis.ping.mockImplementation(() => {
        throw new Error('Unexpected Redis error')
      })
      
      const req = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(req)
      const data = await response.json()
      
      expect(data.status).toBe('degraded')
      expect(data.services.redis).toBe('unhealthy')
      expect(response.status).toBe(503)
    })
  })

  describe('Performance Tests', () => {
    test('health check responds within reasonable time', async () => {
      const start = Date.now()
      
      const req = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(req)
      
      const duration = Date.now() - start
      expect(duration).toBeLessThan(5000) // Should respond within 5 seconds
    })
  })
})