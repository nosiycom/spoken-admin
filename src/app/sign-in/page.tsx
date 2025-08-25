'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Metadata } from 'next'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const { signIn, user } = useAuth()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'auth_error') {
      setError('Authentication failed. Please try again.')
    } else if (error === 'server_error') {
      setError('Server error. Please try again later.')
    } else if (error === 'no_code') {
      setError('Authentication code missing. Please try again.')
    }
  }, [searchParams])

  // Check for existing user on load
  useEffect(() => {
    if (user) {
      console.log('User already authenticated, redirecting to:', redirect)
      router.push(redirect)
    }
  }, [user, router, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      console.log('Sign in successful, redirecting to:', redirect)
    } catch (error: any) {
      console.error('Sign in error:', error)
      
      let errorMessage = 'Failed to sign in'
      if (error.message === 'Invalid login credentials') {
        errorMessage = 'Invalid email or password. Make sure you have signed up first and your email is verified.'
      } else if (error.message.includes('email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.'
      } else {
        errorMessage = error.message || 'Failed to sign in'
      }
      
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Spoken Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Manage your French learning content
          </p>
        </div>
        
        <div className="bg-white p-8 shadow-lg rounded-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
            <strong>Debug Info:</strong> If you don't have an account yet, please{' '}
            <Link href="/sign-up" className="underline">
              sign up first
            </Link>
            . Check browser console for authentication logs.
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 active:scale-95 disabled:active:scale-100"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 space-y-3 opacity-50">
              <p className="text-sm text-gray-500 text-center">OAuth providers temporarily disabled</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}