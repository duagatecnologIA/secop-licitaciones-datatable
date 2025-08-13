'use client'

import { createContext, useContext, useEffect, useState } from 'react'
// ✅ CORRECCIÓN: Se importa el tipo 'User' directamente de Supabase
import { type User } from '@supabase/supabase-js'
import { supabaseAuth } from '@/lib/supabaseAuthClient'

interface AuthContextType {
  // ✅ CORRECCIÓN: Se usa el tipo 'User' en lugar de 'AuthUser'
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function useAuthContext() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ✅ CORRECCIÓN: Se usa el tipo 'User' en el estado
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabaseAuth.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
