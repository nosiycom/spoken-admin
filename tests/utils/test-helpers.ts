import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { testDb } from './test-db'

// Custom render function with providers
export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean
  withAuth?: boolean
}

export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { withRouter = false, withAuth = false, ...renderOptions } = options
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, {}, children)
  }
  
  if (withRouter) {
    // Would wrap with router provider if needed
  }
  
  if (withAuth) {
    // Would wrap with auth provider if needed
  }
  
  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  })
}

// Test data factories
export const createMockUser = (overrides: any = {}) => ({
  id: `user-${Date.now()}`,
  email: `user${Date.now()}@example.com`,
  name: 'Mock User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockCourse = (overrides: any = {}) => ({
  id: `course-${Date.now()}`,
  title: 'Mock Course',
  description: 'A mock course for testing',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  published: false,
  ...overrides,
})

// API testing utilities
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(data),
  text: jest.fn().mockResolvedValue(JSON.stringify(data)),
})

export const mockFetch = (response: any, status = 200) => {
  global.fetch = jest.fn().mockResolvedValue(mockApiResponse(response, status))
}

// Database test utilities
export const withTestDatabase = () => {
  beforeAll(async () => {
    await testDb.setup()
  })
  
  afterAll(async () => {
    await testDb.teardown()
  })
  
  beforeEach(async () => {
    // Clear test data before each test
    try {
      await testDb.teardown()
    } catch (error) {
      console.warn('Failed to clear test data:', error)
    }
  })
}

// Auth test utilities
export const mockAuthenticatedUser = (user = createMockUser()) => {
  const mockAuth = {
    user,
    session: {
      access_token: 'mock-access-token',
      user,
    },
  }
  
  // Mock Supabase auth
  jest.mock('@/lib/supabase', () => ({
    supabase: {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user }, error: null }),
        getSession: jest.fn().mockResolvedValue({ 
          data: { session: mockAuth.session }, 
          error: null 
        }),
      },
    },
  }))
  
  return mockAuth
}

// Error simulation utilities
export const simulateNetworkError = () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'))
}

export const simulateApiError = (status = 500, message = 'Internal Server Error') => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: jest.fn().mockResolvedValue({ error: message }),
  })
}

// Async test utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const waitForElement = async (selector: string, timeout = 5000) => {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const element = document.querySelector(selector)
    if (element) return element
    await waitFor(100)
  }
  throw new Error(`Element ${selector} not found within ${timeout}ms`)
}

// Component testing utilities
export const getByTestId = (testId: string) => 
  document.querySelector(`[data-testid="${testId}"]`)

export const getAllByTestId = (testId: string) => 
  Array.from(document.querySelectorAll(`[data-testid="${testId}"]`))

// Mock environment
export const mockEnvironment = (env: Record<string, string>) => {
  const originalEnv = { ...process.env }
  
  beforeAll(() => {
    Object.assign(process.env, env)
  })
  
  afterAll(() => {
    process.env = originalEnv
  })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'