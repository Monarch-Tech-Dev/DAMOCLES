'use client'

import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/lib/auth-context'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  )
}