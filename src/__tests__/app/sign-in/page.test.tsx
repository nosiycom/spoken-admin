import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import SignInPage from '@/app/sign-in/page'
import { useAuth } from '@/components/providers/AuthProvider'

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

// Mock AuthProvider
jest.mock('@/components/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

const mockSearchParams = {
  get: jest.fn(),
}

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(useAuth as jest.Mock).mockReturnValue({
      signIn: jest.fn(),
      user: null,
    })
    mockSearchParams.get.mockReturnValue(null)
  })

  describe('Rendering', () => {
    test('renders sign-in form correctly', () => {
      render(<SignInPage />)

      expect(screen.getByText('Sign in to Spoken Admin')).toBeInTheDocument()
      expect(screen.getByText('Manage your French learning content')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    })

    test('shows sign up helper info', () => {
      render(<SignInPage />)

      expect(screen.getByText(/New user?/)).toBeInTheDocument()
      expect(screen.getByText('Create an account')).toBeInTheDocument()
    })

    test('shows link to forgot password', () => {
      render(<SignInPage />)

      const forgotPasswordLink = screen.getByText('Forgot your password?')
      expect(forgotPasswordLink).toBeInTheDocument()
      expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/auth/forgot-password')
    })

    test('shows link to sign up', () => {
      render(<SignInPage />)

      const signUpLink = screen.getByText('Sign up for free')
      expect(signUpLink).toBeInTheDocument()
      expect(signUpLink.closest('a')).toHaveAttribute('href', '/sign-up')
    })

    test('shows OAuth providers as disabled', () => {
      render(<SignInPage />)

      expect(screen.getByText('OAuth providers temporarily disabled')).toBeInTheDocument()
      expect(screen.getByText('Coming soon')).toBeInTheDocument()
    })
  })

  describe('Error Handling from URL', () => {
    test('displays auth error from URL parameter', () => {
      mockSearchParams.get.mockImplementation((param) => {
        if (param === 'error') return 'auth_error'
        if (param === 'redirect') return null
        return null
      })

      render(<SignInPage />)

      expect(screen.getByText('Authentication failed. Please try again.')).toBeInTheDocument()
    })

    test('displays server error from URL parameter', () => {
      mockSearchParams.get.mockImplementation((param) => {
        if (param === 'error') return 'server_error'
        if (param === 'redirect') return null
        return null
      })

      render(<SignInPage />)

      expect(screen.getByText('Server error. Please try again later.')).toBeInTheDocument()
    })

    test('displays no code error from URL parameter', () => {
      mockSearchParams.get.mockImplementation((param) => {
        if (param === 'error') return 'no_code'
        if (param === 'redirect') return null
        return null
      })

      render(<SignInPage />)

      expect(screen.getByText('Authentication code missing. Please try again.')).toBeInTheDocument()
    })
  })

  describe('Redirect Logic', () => {
    test('redirects authenticated user to default dashboard', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        signIn: jest.fn(),
        user: { id: 'user-1', email: 'test@example.com' },
      })

      render(<SignInPage />)

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })

    test('redirects authenticated user to custom redirect URL', () => {
      mockSearchParams.get.mockImplementation((param) => {
        if (param === 'redirect') return '/custom-page'
        return null
      })

      ;(useAuth as jest.Mock).mockReturnValue({
        signIn: jest.fn(),
        user: { id: 'user-1', email: 'test@example.com' },
      })

      render(<SignInPage />)

      expect(mockRouter.push).toHaveBeenCalledWith('/custom-page')
    })
  })

  describe('Form Interaction', () => {
    test('updates email and password fields', () => {
      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    test('calls signIn on form submission', async () => {
      const mockSignIn = jest.fn().mockResolvedValue(undefined)
      ;(useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        user: null,
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign in' })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    test('shows loading state during sign in', async () => {
      const mockSignIn = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      ;(useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        user: null,
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign in' })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      expect(screen.getByText('Signing in...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })
    })

    test('prevents form submission when required fields are empty', () => {
      render(<SignInPage />)

      const submitButton = screen.getByRole('button', { name: 'Sign in' })
      
      // HTML5 validation should prevent submission
      fireEvent.click(submitButton)

      const emailInput = screen.getByLabelText('Email address') as HTMLInputElement
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement

      expect(emailInput.validity.valid).toBe(false)
      expect(passwordInput.validity.valid).toBe(false)
    })
  })

  describe('Error Handling', () => {
    test('displays generic error for sign in failure', async () => {
      const mockSignIn = jest.fn().mockRejectedValue(new Error('Generic error'))
      ;(useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        user: null,
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign in' })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Generic error')).toBeInTheDocument()
      })
    })

    test('displays specific error for invalid credentials', async () => {
      const mockSignIn = jest.fn().mockRejectedValue(new Error('Invalid login credentials'))
      ;(useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        user: null,
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign in' })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Invalid email or password/)).toBeInTheDocument()
      })
    })

    test('displays specific error for unconfirmed email', async () => {
      const mockSignIn = jest.fn().mockRejectedValue(new Error('email not confirmed'))
      ;(useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        user: null,
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign in' })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Please check your email and click the confirmation link/)).toBeInTheDocument()
      })
    })

    test('resets loading state after error', async () => {
      const mockSignIn = jest.fn().mockRejectedValue(new Error('Sign in error'))
      ;(useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        user: null,
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign in' })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Sign in error')).toBeInTheDocument()
      })

      expect(screen.getByText('Sign in')).toBeInTheDocument()
      expect(submitButton).not.toBeDisabled()
    })

    test('clears error when retrying', async () => {
      const mockSignIn = jest.fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(undefined)

      ;(useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        user: null,
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign in' })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      // First attempt - should show error
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument()
      })

      // Second attempt - should clear error
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    test('has proper form labels and structure', () => {
      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('required')

      // Check that inputs have proper labelling
      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
    })

    test('has proper heading hierarchy', () => {
      render(<SignInPage />)

      const mainHeading = screen.getByRole('heading', { level: 2, name: 'Sign in to Spoken Admin' })
      expect(mainHeading).toBeInTheDocument()
    })
  })
})