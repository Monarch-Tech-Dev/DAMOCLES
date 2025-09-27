'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  // Sync NextAuth session with AuthContext
  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.email || '1',
        email: session.user.email || '',
        name: session.user.name || 'User'
      })
    } else {
      setUser(null)
    }
  }, [session])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: loading || status === 'loading' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}