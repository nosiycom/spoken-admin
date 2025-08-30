// Mock Redis client for testing

export const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  keys: jest.fn(),
  flushall: jest.fn(),
  quit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  ping: jest.fn(),
  hget: jest.fn(),
  hset: jest.fn(),
  hdel: jest.fn(),
  hgetall: jest.fn(),
  sadd: jest.fn(),
  srem: jest.fn(),
  smembers: jest.fn(),
  sismember: jest.fn(),
}

// Mock Redis library
jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedisClient),
}))

jest.mock('ioredis', () => {
  return jest.fn(() => mockRedisClient)
})

// Mock our custom Redis utilities
jest.mock('@/lib/redis', () => ({
  __esModule: true,
  default: mockRedisClient,
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
  clearCache: jest.fn(),
}))

// Helper functions for test setup
export const mockRedisOperations = {
  mockGetSuccess: (key: string, value: any) => {
    mockRedisClient.get.mockImplementation((k) => {
      if (k === key) {
        return Promise.resolve(typeof value === 'string' ? value : JSON.stringify(value))
      }
      return Promise.resolve(null)
    })
  },
  
  mockGetError: (error: string) => {
    mockRedisClient.get.mockRejectedValue(new Error(error))
  },
  
  mockSetSuccess: () => {
    mockRedisClient.set.mockResolvedValue('OK')
  },
  
  mockSetError: (error: string) => {
    mockRedisClient.set.mockRejectedValue(new Error(error))
  },
  
  mockDelSuccess: (count = 1) => {
    mockRedisClient.del.mockResolvedValue(count)
  },
  
  mockExistsSuccess: (exists = true) => {
    mockRedisClient.exists.mockResolvedValue(exists ? 1 : 0)
  },
  
  reset: () => {
    Object.values(mockRedisClient).forEach((mock: any) => {
      if (jest.isMockFunction(mock)) {
        mock.mockReset()
      }
    })
  },
}