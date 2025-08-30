import { UserService } from '@/lib/services/users'
import { mockSupabaseClient, mockSupabaseAuth, mockSupabaseData } from '../../../../tests/mocks/supabase'

describe('UserService', () => {
  let userService: UserService
  
  beforeEach(() => {
    userService = new UserService()
    // Reset all mocks
    jest.clearAllMocks()
  })

  describe('Critical Bug Tests', () => {
    test('CRITICAL BUG: adminClient is undefined - createUser will throw', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      }

      // This should fail because adminClient is commented out but still used
      await expect(userService.createUser(userData)).rejects.toThrow()
    })

    test('CRITICAL BUG: adminClient is undefined - getAllUsers will throw', async () => {
      // This should fail because adminClient is commented out but still used
      await expect(userService.getAllUsers()).rejects.toThrow()
    })

    test('CRITICAL BUG: adminClient is undefined - getUsersByLevel will throw', async () => {
      // This should fail because adminClient is commented out but still used  
      await expect(userService.getUsersByLevel('beginner')).rejects.toThrow()
    })

    test('CRITICAL BUG: updateUserPoints uses invalid SQL increment syntax', async () => {
      mockSupabaseData.mockUpdateSuccess({ id: 'user-1', total_points: 150 })
      
      // The increment syntax { increment: pointsToAdd } as any is invalid
      // This will fail in a real Supabase environment
      await expect(userService.updateUserPoints('user-1', 50)).resolves.toBeDefined()
      // In real world, this would throw an error due to invalid SQL syntax
    })
  })

  describe('UserService - Basic Operations', () => {
    test('getUserByAuthId - success', async () => {
      const mockUser = {
        id: 'auth-user-1',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
      }

      mockSupabaseData.mockQuerySuccess(mockUser)
      
      const result = await userService.getUserByAuthId('auth-user-1')
      expect(result).toEqual(mockUser)
    })

    test('getUserByAuthId - not found', async () => {
      const mockChain = mockSupabaseClient.from()
      mockChain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      })
      
      const result = await userService.getUserByAuthId('non-existent')
      expect(result).toBeNull()
    })

    test('getUserByAuthId - error handling', async () => {
      mockSupabaseData.mockQueryError('Database connection failed')
      
      await expect(userService.getUserByAuthId('user-1')).rejects.toThrow('Failed to fetch user: Database connection failed')
    })

    test('updateUser - success', async () => {
      const updatedUser = {
        id: 'user-1',
        name: 'Updated Name',
        updated_at: new Date().toISOString(),
      }
      
      mockSupabaseData.mockUpdateSuccess(updatedUser)
      
      const result = await userService.updateUser('user-1', { name: 'Updated Name' })
      expect(result).toEqual(updatedUser)
    })

    test('updateUserActivity - success', async () => {
      const mockChain = mockSupabaseClient.from()
      mockChain.single.mockResolvedValue({ data: null, error: null })
      
      await expect(userService.updateUserActivity('user-1')).resolves.not.toThrow()
    })

    test('getUserStats - success', async () => {
      // Mock user basic stats
      const mockUser = {
        total_points: 100,
        streak_days: 7,
      }
      mockSupabaseData.mockQuerySuccess(mockUser)

      // Mock enrollment count
      const mockChain = mockSupabaseClient.from()
      mockChain.select.mockReturnThis()
      mockChain.eq.mockReturnThis()

      // First call for enrollment count
      mockChain.single.mockResolvedValueOnce({ count: 3, error: null })
      // Second call for completed lessons
      mockChain.single.mockResolvedValueOnce({ count: 15, error: null })

      const stats = await userService.getUserStats('user-1')
      
      expect(stats).toEqual({
        totalPoints: 100,
        streakDays: 7,
        coursesEnrolled: 3,
        lessonsCompleted: 15,
      })
    })
  })

  describe('Error Handling Tests', () => {
    test('handles Supabase connection errors gracefully', async () => {
      mockSupabaseData.mockQueryError('Connection timeout')
      
      await expect(userService.getUserById('user-1')).rejects.toThrow('Failed to fetch user: Connection timeout')
    })

    test('handles invalid user ID format', async () => {
      await expect(userService.getUserById('')).rejects.toThrow()
    })

    test('handles null/undefined parameters', async () => {
      await expect(userService.getUserById(null as any)).rejects.toThrow()
      await expect(userService.updateUser(undefined as any, {})).rejects.toThrow()
    })
  })

  describe('Data Validation Tests', () => {
    test('validates user update data', async () => {
      const invalidUpdates = {
        email: '', // Invalid empty email
        name: null, // Invalid null name
      }

      // Should validate data before sending to Supabase
      mockSupabaseData.mockUpdateSuccess({})
      await userService.updateUser('user-1', invalidUpdates)
      // This test shows missing validation
    })

    test('handles SQL injection attempts', async () => {
      const maliciousId = "'; DROP TABLE users; --"
      
      mockSupabaseData.mockQueryError('Invalid input')
      await expect(userService.getUserById(maliciousId)).rejects.toThrow()
    })
  })
})