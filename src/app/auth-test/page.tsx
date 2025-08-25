'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'

export default function AuthTestPage() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signOut, user, session } = useAuth()

  const testSignUp = async () => {
    setLoading(true)
    setStatus('Testing sign up...')
    
    try {
      await signUp(email, password, {
        first_name: 'Test',
        last_name: 'User'
      })
      setStatus('Sign up successful!')
    } catch (error: any) {
      setStatus(`Sign up error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testSignIn = async () => {
    setLoading(true)
    setStatus('Testing sign in...')
    
    try {
      await signIn(email, password)
      setStatus('Sign in successful!')
    } catch (error: any) {
      setStatus(`Sign in error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testGetUser = async () => {
    const userInfo = user ? {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      user_metadata: user.user_metadata
    } : null
    
    const sessionInfo = session ? {
      access_token: session.access_token ? 'present' : 'missing',
      refresh_token: session.refresh_token ? 'present' : 'missing',
      expires_at: session.expires_at,
      user: session.user ? { id: session.user.id, email: session.user.email } : null
    } : null
    
    setStatus(`Current user: ${JSON.stringify(userInfo, null, 2)}\n\nCurrent session: ${JSON.stringify(sessionInfo, null, 2)}`)
  }

  const clearSession = async () => {
    setLoading(true)
    setStatus('Clearing session...')
    
    try {
      await signOut()
      setStatus('Session cleared')
    } catch (error: any) {
      setStatus(`Error clearing session: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Button onClick={testSignUp} disabled={loading}>
            Test Sign Up
          </Button>
          <Button onClick={testSignIn} disabled={loading}>
            Test Sign In
          </Button>
          <Button onClick={testGetUser} disabled={loading}>
            Get Current User
          </Button>
          <Button onClick={clearSession} variant="outline" disabled={loading}>
            Clear Session
          </Button>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-medium mb-2">Status:</h3>
          <pre className="text-sm whitespace-pre-wrap">{status}</pre>
        </div>
      </div>
    </div>
  )
}