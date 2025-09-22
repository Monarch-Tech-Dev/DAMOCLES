'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // reportError(error, errorInfo)
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props

      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} reset={this.reset} />
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  reset: () => void
}

export function DefaultErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>

        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>

        <p className="text-gray-600 mb-4">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 mb-2">
              Error Details (Dev Mode)
            </summary>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="space-y-2">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Reload Page
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Hook for functional components error handling
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // reportError(error, errorInfo)
    }
  }
}