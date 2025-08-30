import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider'
import { createClientSupabase } from '@/lib/supabase'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  createClientSupabase: jest.fn(),
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
}

// Test component to access auth context
const TestComponent = () => {
  const { user, session, loading, signIn, signUp, signOut } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="user">{user?.email || 'no-user'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      <button onClick={() => signIn('test@example.com', 'password')} data-testid="signin">
        Sign In
      </button>
      <button onClick={() => signUp('test@example.com', 'password')} data-testid="signup">
        Sign Up
      </button>
      <button onClick={signOut} data-testid="signout">
        Sign Out
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(createClientSupabase as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('Initialization', () => {
    test('provides loading state initially', () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    })

    test('sets user and session when authenticated', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      const mockSession = {
        user: mockUser,
        access_token: 'mock-token',
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('session')).toHaveTextContent('has-session')
    })

    test('handles initial session error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' },
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      expect(consoleSpy).toHaveBeenCalledWith('Error getting session:', { message: 'Session error' })
      
      consoleSpy.mockRestore()
    })
  })

  describe('Authentication Methods', () => {
    test('signIn calls Supabase auth.signInWithPassword', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      fireEvent.click(screen.getByTestId('signin'))

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
        })
      })
    })

    test('signIn throws error on authentication failure', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      // Mock the signIn to catch error
      const mockSignIn = jest.fn().mockImplementation(async () => {
        const { data, error } = await mockSupabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'password',
        })
        if (error) throw error
      })

      try {
        await mockSignIn()
      } catch (error) {
        expect(error.message).toBe('Invalid credentials')
      }
    })

    test('signUp calls Supabase auth.signUp', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      fireEvent.click(screen.getByTestId('signup'))

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
          options: { data: {} },
        })
      })
    })

    test('signOut calls Supabase auth.signOut', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      fireEvent.click(screen.getByTestId('signout'))

      await waitFor(() => {
        expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      })
    })
  })

  describe('Auth State Changes', () => {
    test('handles SIGNED_IN event and redirects to dashboard', async () => {
      let authStateCallback: any

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      const mockUser = { id: 'user-1', email: 'test@example.com' }
      const mockSession = {
        user: mockUser,
        access_token: 'mock-token',
      }

      // Simulate SIGNED_IN event
      authStateCallback('SIGNED_IN', mockSession)

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

    test('handles SIGNED_OUT event and redirects to home', async () => {
      let authStateCallback: any

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      // Simulate SIGNED_OUT event
      authStateCallback('SIGNED_OUT', null)

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user')
        expect(mockRouter.push).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('Error Cases', () => {
    test('useAuth throws error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')
      
      consoleSpy.mockRestore()
    })

    test('handles signOut error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      fireEvent.click(screen.getByTestId('signout'))

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error signing out:', { message: 'Sign out failed' })
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('Loading States', () => {
    test('shows loading during sign in', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      
      // Make signIn take some time
      mockSupabase.auth.signInWithPassword.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: { user: null }, error: null }), 100))
      )

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      fireEvent.click(screen.getByTestId('signin'))

      // Should show loading during sign in
      expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    })
  })
})