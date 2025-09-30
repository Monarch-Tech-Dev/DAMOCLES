'use client'

import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/contexts/AuthContext'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  )
}