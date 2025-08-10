'use client'

import { useAuthContext } from '@/components/AuthProvider'
import { supabaseAuth } from '@/lib/supabaseAuthClient'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        router.push('/panel')
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabaseAuth.auth.signOut()
      if (error) {
        throw error
      }
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    user,
    loading,
    signIn,
    signOut,
  }
}
