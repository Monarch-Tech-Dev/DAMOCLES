'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )
}

interface LoadingStateProps {
  children: React.ReactNode
  loading: boolean
  fallback?: React.ReactNode
  className?: string
}

export function LoadingState({ children, loading, fallback, className }: LoadingStateProps) {
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        {fallback || <LoadingSpinner text="Loading..." />}
      </div>
    )
  }

  return <>{children}</>
}

// Skeleton components for better loading UX
export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 bg-gray-200 rounded"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 bg-gray-100 rounded"></div>
      ))}
    </div>
  )
}