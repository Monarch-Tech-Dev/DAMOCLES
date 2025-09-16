'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api } from './api'
import toast from 'react-hot-toast'
import { SubscriptionTier } from './subscription'

interface User {
  id: string
  email: string
  shieldTier: string
  subscriptionTier: SubscriptionTier
  tokenBalance: number
  onboardingStatus: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, bankIdToken: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  loading: boolean
}

interface RegisterData {
  email: string
  phoneNumber?: string
  personalNumber: string
  bankIdToken: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token')
    if (token) {
      // Set token in API client
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Try to refresh token to validate it
      refreshToken()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, bankIdToken: string) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/login', {
        email,
        bankIdToken
      })

      const { token, user: userData } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(userData)
      toast.success('Velkommen tilbake!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Innlogging mislyktes')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/register', data)

      const { token, user: userData } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(userData)
      toast.success('Konto opprettet! Velkommen til DAMOCLES.')
      router.push('/onboarding')
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.response?.data?.message || 'Registrering mislyktes')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Du er nå logget ut')
    router.push('/')
  }

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh')
      const { token } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Get user profile (mock data for demo)
      setUser({
        id: '1',
        email: 'demo@damocles.no',
        shieldTier: 'bronze',
        subscriptionTier: 'free',
        tokenBalance: 150,
        onboardingStatus: 'completed'
      })
    } catch (error) {
      console.error('Token refresh error:', error)
      // Token is invalid, clear it
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    refreshToken,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}