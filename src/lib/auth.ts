import { createServerSupabase } from './supabase-server'
import { redirect } from 'next/navigation'

export async function getServerUser() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      // Don't log errors for expected auth states
      if (error.message !== 'Auth session missing!' && error.message !== 'JWT expired' && !error.message.includes('Invalid JWT')) {
        console.error('Error getting server user:', error.message)
      }
      return null
    }
    
    return user
  } catch (error) {
    // Don't log errors for expected auth states - users not being logged in is normal
    return null
  }
}

export async function getServerSession() {
  try {
    const supabase = await createServerSupabase()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting server session:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error in getServerSession:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/sign-in?redirect=/dashboard')
  }
  
  return user
}