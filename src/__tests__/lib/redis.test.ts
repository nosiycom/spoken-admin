import { CacheService } from '@/lib/redis'
import { mockRedisClient, mockRedisOperations } from '../../../tests/mocks/redis'

describe('CacheService', () => {
  beforeEach(() => {
    mockRedisOperations.reset()
  })

  describe('Basic Cache Operations', () => {
    test('get - success', async () => {
      mockRedisOperations.mockGetSuccess('test-key', 'test-value')
      
      const result = await CacheService.get('test-key')
      expect(result).toBe('test-value')
      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key')
    })

    test('get - key not found', async () => {
      mockRedisClient.get.mockResolvedValue(null)
      
      const result = await CacheService.get('non-existent-key')
      expect(result).toBeNull()
    })

    test('get - handles Redis error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockRedisOperations.mockGetError('Redis connection failed')
      
      const result = await CacheService.get('test-key')
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Redis GET error:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    test('set - success without TTL', async () => {
      mockRedisOperations.mockSetSuccess()
      
      const result = await CacheService.set('test-key', 'test-value')
      expect(result).toBe(true)
      expect(mockRedisClient.set).toHaveBeenCalledWith('test-key', 'test-value')
    })

    test('set - success with TTL', async () => {
      mockRedisOperations.mockSetSuccess()
      
      const result = await CacheService.set('test-key', 'test-value', 3600)
      expect(result).toBe(true)
      expect(mockRedisClient.setex).toHaveBeenCalledWith('test-key', 3600, 'test-value')
    })

    test('set - handles Redis error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockRedisOperations.mockSetError('Redis write failed')
      
      const result = await CacheService.set('test-key', 'test-value')
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Redis SET error:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    test('del - success', async () => {
      mockRedisOperations.mockDelSuccess()
      
      const result = await CacheService.del('test-key')
      expect(result).toBe(true)
      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key')
    })

    test('del - handles Redis error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockRedisClient.del.mockRejectedValue(new Error('Redis delete failed'))
      
      const result = await CacheService.del('test-key')
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Redis DEL error:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('JSON Cache Operations', () => {
    test('getJSON - success', async () => {
      const testObj = { name: 'Test', value: 123 }
      mockRedisOperations.mockGetSuccess('json-key', testObj)
      
      const result = await CacheService.getJSON('json-key')
      expect(result).toEqual(testObj)
    })

    test('getJSON - key not found', async () => {
      mockRedisClient.get.mockResolvedValue(null)
      
      const result = await CacheService.getJSON('non-existent-key')
      expect(result).toBeNull()
    })

    test('getJSON - handles invalid JSON gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockRedisClient.get.mockResolvedValue('invalid-json{')
      
      const result = await CacheService.getJSON('invalid-json-key')
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Redis GET JSON error:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    test('setJSON - success without TTL', async () => {
      mockRedisOperations.mockSetSuccess()
      const testObj = { name: 'Test', value: 123 }
      
      const result = await CacheService.setJSON('json-key', testObj)
      expect(result).toBe(true)
      expect(mockRedisClient.set).toHaveBeenCalledWith('json-key', JSON.stringify(testObj))
    })

    test('setJSON - success with TTL', async () => {
      mockRedisOperations.mockSetSuccess()
      const testObj = { name: 'Test', value: 123 }
      
      const result = await CacheService.setJSON('json-key', testObj, 1800)
      expect(result).toBe(true)
      expect(mockRedisClient.setex).toHaveBeenCalledWith('json-key', 1800, JSON.stringify(testObj))
    })

    test('setJSON - handles circular reference error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Create circular reference
      const circularObj: any = { name: 'Test' }
      circularObj.self = circularObj
      
      const result = await CacheService.setJSON('circular-key', circularObj)
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Redis SET JSON error:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Advanced Cache Operations', () => {
    test('exists - key exists', async () => {
      mockRedisOperations.mockExistsSuccess(true)
      
      const result = await CacheService.exists('existing-key')
      expect(result).toBe(true)
      expect(mockRedisClient.exists).toHaveBeenCalledWith('existing-key')
    })

    test('exists - key does not exist', async () => {
      mockRedisOperations.mockExistsSuccess(false)
      
      const result = await CacheService.exists('non-existent-key')
      expect(result).toBe(false)
    })

    test('exists - handles Redis error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockRedisClient.exists.mockRejectedValue(new Error('Redis exists failed'))
      
      const result = await CacheService.exists('test-key')
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Redis EXISTS error:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    test('invalidatePattern - success with matching keys', async () => {
      const matchingKeys = ['user:1', 'user:2', 'user:3']
      mockRedisClient.keys.mockResolvedValue(matchingKeys)
      mockRedisClient.del.mockResolvedValue(3)
      
      await CacheService.invalidatePattern('user:*')
      
      expect(mockRedisClient.keys).toHaveBeenCalledWith('user:*')
      expect(mockRedisClient.del).toHaveBeenCalledWith(...matchingKeys)
    })

    test('invalidatePattern - no matching keys', async () => {
      mockRedisClient.keys.mockResolvedValue([])
      
      await CacheService.invalidatePattern('user:*')
      
      expect(mockRedisClient.keys).toHaveBeenCalledWith('user:*')
      expect(mockRedisClient.del).not.toHaveBeenCalled()
    })

    test('invalidatePattern - handles Redis error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockRedisClient.keys.mockRejectedValue(new Error('Redis keys failed'))
      
      await CacheService.invalidatePattern('user:*')
      
      expect(consoleSpy).toHaveBeenCalledWith('Redis INVALIDATE PATTERN error:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Performance and Edge Cases', () => {
    test('handles very large values', async () => {
      const largeValue = 'x'.repeat(1000000) // 1MB string
      mockRedisOperations.mockSetSuccess()
      
      const result = await CacheService.set('large-key', largeValue)
      expect(result).toBe(true)
    })

    test('handles empty string values', async () => {
      mockRedisOperations.mockGetSuccess('empty-key', '')
      
      const result = await CacheService.get('empty-key')
      expect(result).toBe('')
    })

    test('handles special characters in keys', async () => {
      const specialKey = 'key:with:colons-and_underscores.and.dots'
      mockRedisOperations.mockGetSuccess(specialKey, 'value')
      
      const result = await CacheService.get(specialKey)
      expect(result).toBe('value')
    })

    test('handles Unicode values', async () => {
      const unicodeValue = '你好世界 🌍 emoji test'
      mockRedisOperations.mockGetSuccess('unicode-key', unicodeValue)
      
      const result = await CacheService.get('unicode-key')
      expect(result).toBe(unicodeValue)
    })

    test('concurrent operations', async () => {
      mockRedisOperations.mockGetSuccess('concurrent-key', 'value')
      
      // Make multiple concurrent requests
      const promises = Array(10).fill(null).map((_, i) => 
        CacheService.get(`concurrent-key`)
      )
      
      const results = await Promise.all(promises)
      results.forEach(result => {
        expect(result).toBe('value')
      })
    })
  })

  describe('Cache Invalidation Patterns', () => {
    test('invalidatePattern with complex patterns', async () => {
      const testCases = [
        {
          pattern: 'user:*:profile',
          keys: ['user:123:profile', 'user:456:profile'],
        },
        {
          pattern: 'session:*',
          keys: ['session:abc123', 'session:def456', 'session:ghi789'],
        },
        {
          pattern: 'temp:*',
          keys: ['temp:upload:1', 'temp:upload:2'],
        }
      ]

      for (const testCase of testCases) {
        mockRedisClient.keys.mockResolvedValue(testCase.keys)
        mockRedisClient.del.mockResolvedValue(testCase.keys.length)
        
        await CacheService.invalidatePattern(testCase.pattern)
        
        expect(mockRedisClient.keys).toHaveBeenCalledWith(testCase.pattern)
        if (testCase.keys.length > 0) {
          expect(mockRedisClient.del).toHaveBeenCalledWith(...testCase.keys)
        }
      }
    })
  })
})