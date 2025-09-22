'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  actions?: Array<{
    label: string
    onClick: () => void
  }>
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message: string, title?: string) => {
    addToast({ type: 'success', message, title })
  }, [addToast])

  const error = useCallback((message: string, title?: string) => {
    addToast({ type: 'error', message, title })
  }, [addToast])

  const warning = useCallback((message: string, title?: string) => {
    addToast({ type: 'warning', message, title })
  }, [addToast])

  const info = useCallback((message: string, title?: string) => {
    addToast({ type: 'info', message, title })
  }, [addToast])

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info,
    }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast()

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const Icon = icons[toast.type]

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  }

  return (
    <div className={cn(
      'rounded-lg border p-4 shadow-lg animate-in slide-in-from-right',
      bgColors[toast.type]
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5', iconColors[toast.type])} />

        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-medium text-gray-900 mb-1">
              {toast.title}
            </h4>
          )}
          <p className="text-sm text-gray-700">{toast.message}</p>

          {toast.actions && toast.actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {toast.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => removeToast(toast.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}