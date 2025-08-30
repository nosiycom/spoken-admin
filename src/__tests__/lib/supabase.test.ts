import { createClientSupabase, createSupabaseAdminClient } from '@/lib/supabase'

// Mock the Supabase modules
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}))

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

describe('Supabase Client Functions', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('createClientSupabase', () => {
    test('creates browser client with correct parameters', () => {
      const { createBrowserClient } = require('@supabase/ssr')
      const mockClient = { auth: {}, from: jest.fn() }
      createBrowserClient.mockReturnValue(mockClient)

      const client = createClientSupabase()

      expect(createBrowserClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      )
      expect(client).toBe(mockClient)
    })

    test('throws error when SUPABASE_URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL

      expect(() => createClientSupabase()).toThrow()
    })

    test('throws error when SUPABASE_ANON_KEY is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      expect(() => createClientSupabase()).toThrow()
    })
  })

  describe('createSupabaseAdminClient', () => {
    test('creates admin client with service role key', () => {
      const { createClient } = require('@supabase/supabase-js')
      const mockAdminClient = { auth: {}, from: jest.fn() }
      createClient.mockReturnValue(mockAdminClient)

      const adminClient = createSupabaseAdminClient()

      expect(createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-service-role-key',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      expect(adminClient).toBe(mockAdminClient)
    })

    test('throws error when service role key is missing', () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY

      expect(() => createSupabaseAdminClient()).toThrow('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
    })

    test('configures admin client correctly for server-side operations', () => {
      const { createClient } = require('@supabase/supabase-js')
      const mockAdminClient = { auth: {}, from: jest.fn() }
      createClient.mockReturnValue(mockAdminClient)

      createSupabaseAdminClient()

      // Verify the admin client is configured for server-side use
      const callArgs = createClient.mock.calls[0]
      expect(callArgs[2]).toEqual({
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    })
  })

  describe('Environment Variable Validation', () => {
    test('validates all required environment variables', () => {
      // Test each required variable
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
      ]

      requiredVars.forEach(varName => {
        const originalValue = process.env[varName]
        delete process.env[varName]

        if (varName === 'SUPABASE_SERVICE_ROLE_KEY') {
          expect(() => createSupabaseAdminClient()).toThrow()
        } else {
          expect(() => createClientSupabase()).toThrow()
        }

        process.env[varName] = originalValue
      })
    })

    test('handles empty string environment variables', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      expect(() => createClientSupabase()).toThrow()

      process.env.SUPABASE_SERVICE_ROLE_KEY = ''
      expect(() => createSupabaseAdminClient()).toThrow()
    })
  })

  describe('Client Configuration', () => {
    test('client configuration is appropriate for browser use', () => {
      const { createBrowserClient } = require('@supabase/ssr')
      createBrowserClient.mockReturnValue({ auth: {}, from: jest.fn() })

      createClientSupabase()

      // Browser client should use SSR helper
      expect(createBrowserClient).toHaveBeenCalled()
    })

    test('admin client configuration is appropriate for server use', () => {
      const { createClient } = require('@supabase/supabase-js')
      createClient.mockReturnValue({ auth: {}, from: jest.fn() })

      createSupabaseAdminClient()

      const config = createClient.mock.calls[0][2]
      
      // Admin client should not auto-refresh tokens or persist sessions
      expect(config.auth.autoRefreshToken).toBe(false)
      expect(config.auth.persistSession).toBe(false)
    })
  })

  describe('Error Handling', () => {
    test('gracefully handles malformed URLs', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url'
      
      const { createBrowserClient } = require('@supabase/ssr')
      createBrowserClient.mockReturnValue({ auth: {}, from: jest.fn() })

      // Should still attempt to create client (Supabase will handle URL validation)
      expect(() => createClientSupabase()).not.toThrow()
    })

    test('handles special characters in keys', () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'key-with-special-chars!@#$%'
      
      const { createClient } = require('@supabase/supabase-js')
      createClient.mockReturnValue({ auth: {}, from: jest.fn() })

      expect(() => createSupabaseAdminClient()).not.toThrow()
    })
  })

  describe('Multiple Client Instances', () => {
    test('creates new client instances on each call', () => {
      const { createBrowserClient } = require('@supabase/ssr')
      const mockClient1 = { auth: {}, from: jest.fn(), id: 1 }
      const mockClient2 = { auth: {}, from: jest.fn(), id: 2 }
      
      createBrowserClient
        .mockReturnValueOnce(mockClient1)
        .mockReturnValueOnce(mockClient2)

      const client1 = createClientSupabase()
      const client2 = createClientSupabase()

      expect(createBrowserClient).toHaveBeenCalledTimes(2)
      expect(client1).toBe(mockClient1)
      expect(client2).toBe(mockClient2)
    })

    test('admin clients are independent instances', () => {
      const { createClient } = require('@supabase/supabase-js')
      const mockAdmin1 = { auth: {}, from: jest.fn(), id: 'admin1' }
      const mockAdmin2 = { auth: {}, from: jest.fn(), id: 'admin2' }
      
      createClient
        .mockReturnValueOnce(mockAdmin1)
        .mockReturnValueOnce(mockAdmin2)

      const admin1 = createSupabaseAdminClient()
      const admin2 = createSupabaseAdminClient()

      expect(createClient).toHaveBeenCalledTimes(2)
      expect(admin1).toBe(mockAdmin1)
      expect(admin2).toBe(mockAdmin2)
    })
  })
})