'use client'

import { Loader2 } from 'lucide-react'

interface SimpleLoaderProps {
  isVisible: boolean
}

export function SimpleLoader({ isVisible }: SimpleLoaderProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200/50">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          <span className="text-slate-700 font-medium">Laster...</span>
        </div>
      </div>
    </div>
  )
}
