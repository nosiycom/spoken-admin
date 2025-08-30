// Mock Supabase client for testing

export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  rpc: jest.fn(),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      list: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
}

// Mock the createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}))

// Mock our custom Supabase utilities
jest.mock('@/lib/supabase', () => ({
  createClientSupabase: jest.fn(() => mockSupabaseClient),
  createSupabaseAdminClient: jest.fn(() => mockSupabaseClient),
}))

jest.mock('@/lib/supabase-server', () => ({
  createServerClient: jest.fn(() => mockSupabaseClient),
}))

// Helper functions for test setup
export const mockSupabaseAuth = {
  mockSignedInUser: (user: any) => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user, access_token: 'mock-token' } },
      error: null,
    })
  },
  
  mockSignedOutUser: () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
  },
  
  mockAuthError: (error: string) => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: error },
    })
  },
}

export const mockSupabaseData = {
  mockQuerySuccess: (data: any) => {
    const mockChain = mockSupabaseClient.from()
    mockChain.single.mockResolvedValue({ data, error: null })
    return mockChain
  },
  
  mockQueryError: (error: string) => {
    const mockChain = mockSupabaseClient.from()
    mockChain.single.mockResolvedValue({
      data: null,
      error: { message: error },
    })
    return mockChain
  },
  
  mockInsertSuccess: (data: any) => {
    const mockChain = mockSupabaseClient.from()
    mockChain.single.mockResolvedValue({ data, error: null })
    return mockChain
  },
  
  mockUpdateSuccess: (data: any) => {
    const mockChain = mockSupabaseClient.from()
    mockChain.single.mockResolvedValue({ data, error: null })
    return mockChain
  },
}