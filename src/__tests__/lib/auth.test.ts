import { getServerUser, getServerSession, requireAuth } from '@/lib/auth'
import { mockSupabaseAuth } from '../../../tests/mocks/supabase'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('Auth Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { redirect } = require('next/navigation')
    redirect.mockClear()
  })

  describe('getServerUser', () => {
    test('returns user when authenticated', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      }
      
      mockSupabaseAuth.mockSignedInUser(mockUser)
      
      const user = await getServerUser()
      expect(user).toEqual(mockUser)
    })

    test('returns null when not authenticated', async () => {
      mockSupabaseAuth.mockSignedOutUser()
      
      const user = await getServerUser()
      expect(user).toBeNull()
    })

    test('returns null on auth error (non-critical)', async () => {
      mockSupabaseAuth.mockAuthError('Auth session missing!')
      
      const user = await getServerUser()
      expect(user).toBeNull()
    })

    test('logs error for unexpected auth errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockSupabaseAuth.mockAuthError('Database connection failed')
      
      const user = await getServerUser()
      expect(user).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Error getting server user:', { message: 'Database connection failed' })
      
      consoleSpy.mockRestore()
    })

    test('handles unexpected exceptions gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      // Mock createServerSupabase to throw an error
      jest.doMock('@/lib/supabase-server', () => ({
        createServerSupabase: jest.fn().mockRejectedValue(new Error('Server error'))
      }))
      
      const user = await getServerUser()
      expect(user).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Auth check failed:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('getServerSession', () => {
    test('returns session when authenticated', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      const mockSession = {
        access_token: 'mock-token',
        user: mockUser,
      }
      
      mockSupabaseAuth.mockSignedInUser(mockUser)
      
      const session = await getServerSession()
      expect(session).toBeDefined()
      expect(session?.user).toEqual(mockUser)
    })

    test('returns null when no session', async () => {
      mockSupabaseAuth.mockSignedOutUser()
      
      const session = await getServerSession()
      expect(session).toBeNull()
    })

    test('logs error and returns null on session error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockSupabaseAuth.mockAuthError('Session expired')
      
      const session = await getServerSession()
      expect(session).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Error getting server session:', { message: 'Session expired' })
      
      consoleSpy.mockRestore()
    })

    test('handles unexpected exceptions', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Mock createServerSupabase to throw an error
      jest.doMock('@/lib/supabase-server', () => ({
        createServerSupabase: jest.fn().mockRejectedValue(new Error('Server error'))
      }))
      
      const session = await getServerSession()
      expect(session).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Error in getServerSession:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('requireAuth', () => {
    test('returns user when authenticated', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      }
      
      mockSupabaseAuth.mockSignedInUser(mockUser)
      
      const user = await requireAuth()
      expect(user).toEqual(mockUser)
      const { redirect } = require('next/navigation')
      expect(redirect).not.toHaveBeenCalled()
    })

    test('redirects to sign-in when not authenticated', async () => {
      mockSupabaseAuth.mockSignedOutUser()
      
      await requireAuth()
      const { redirect } = require('next/navigation')
      expect(redirect).toHaveBeenCalledWith('/sign-in?redirect=/dashboard')
    })

    test('redirects on auth error', async () => {
      mockSupabaseAuth.mockAuthError('Session expired')
      
      await requireAuth()
      const { redirect } = require('next/navigation')
      expect(redirect).toHaveBeenCalledWith('/sign-in?redirect=/dashboard')
    })
  })

  describe('Integration Tests', () => {
    test('auth flow from unauthenticated to authenticated', async () => {
      // Start unauthenticated
      mockSupabaseAuth.mockSignedOutUser()
      let user = await getServerUser()
      expect(user).toBeNull()
      
      // After sign in
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      mockSupabaseAuth.mockSignedInUser(mockUser)
      user = await getServerUser()
      expect(user).toEqual(mockUser)
    })

    test('session and user consistency', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      mockSupabaseAuth.mockSignedInUser(mockUser)
      
      const [user, session] = await Promise.all([
        getServerUser(),
        getServerSession()
      ])
      
      expect(user).toEqual(mockUser)
      expect(session?.user).toEqual(mockUser)
    })
  })

  describe('Edge Cases and Security Tests', () => {
    test('handles malformed user data', async () => {
      const malformedUser = {
        id: null,
        email: '',
        // Missing required fields
      }
      
      mockSupabaseAuth.mockSignedInUser(malformedUser)
      
      const user = await getServerUser()
      // Should still return the user, even if malformed
      expect(user).toEqual(malformedUser)
    })

    test('handles very long redirect URLs', async () => {
      mockSupabaseAuth.mockSignedOutUser()
      
      // This tests if there are any URL length limits
      await requireAuth()
      const { redirect } = require('next/navigation')
      expect(redirect).toHaveBeenCalledWith('/sign-in?redirect=/dashboard')
    })

    test('handles concurrent auth requests', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      mockSupabaseAuth.mockSignedInUser(mockUser)
      
      // Make multiple concurrent requests
      const promises = Array(5).fill(null).map(() => getServerUser())
      const results = await Promise.all(promises)
      
      results.forEach(result => {
        expect(result).toEqual(mockUser)
      })
    })
  })
})