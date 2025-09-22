'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner, LoadingState, CardSkeleton, TableSkeleton } from '@/components/ui/loading-spinner'
import { useToast } from '@/components/ui/toast'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react'

export default function ComponentDemo() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(33)
  const { success, error, warning, info } = useToast()

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">DAMOCLES UI Components</h1>
        <p className="text-lg text-gray-600">Complete component library for developer reference</p>
      </div>

      {/* Toast Notifications */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Toast Notifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button onClick={() => success('Operation completed successfully!')}>
            Success Toast
          </Button>
          <Button onClick={() => error('Something went wrong!')}>
            Error Toast
          </Button>
          <Button onClick={() => warning('Please check your input')}>
            Warning Toast
          </Button>
          <Button onClick={() => info('Here is some information')}>
            Info Toast
          </Button>
        </div>
      </Card>

      {/* Buttons */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </Card>

      {/* Loading States */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Loading States</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Loading Spinners</h3>
            <div className="flex gap-4 items-center">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
              <LoadingSpinner size="xl" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Loading State Component</h3>
            <Button onClick={() => setLoading(!loading)} className="mb-4">
              Toggle Loading State
            </Button>
            <LoadingState loading={loading}>
              <div className="p-4 bg-green-50 rounded">
                Content is loaded! Click toggle to see loading state.
              </div>
            </LoadingState>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Skeleton Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <TableSkeleton rows={3} />
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Bars */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Progress Indicators</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Progress: {progress}%</span>
              <Button onClick={() => setProgress(Math.min(100, progress + 10))}>
                Increase
              </Button>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>
      </Card>

      {/* Alerts */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Alert Components</h2>
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Success! Your PDI calculation has been completed.
            </AlertDescription>
          </Alert>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Warning: Some debt information may be incomplete.
            </AlertDescription>
          </Alert>

          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Error: Unable to connect to the database.
            </AlertDescription>
          </Alert>

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Info: Your PDI score will be calculated based on regional data.
            </AlertDescription>
          </Alert>
        </div>
      </Card>

      {/* Cards */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Card Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Basic Card</h3>
            <p className="text-gray-600">This is a basic card component with content.</p>
          </Card>

          <Card className="p-4 border-blue-200 bg-blue-50">
            <h3 className="font-semibold mb-2 text-blue-800">Accent Card</h3>
            <p className="text-blue-600">This card has custom styling.</p>
          </Card>

          <Card className="p-4 shadow-lg">
            <h3 className="font-semibold mb-2">Shadow Card</h3>
            <p className="text-gray-600">This card has enhanced shadow.</p>
          </Card>
        </div>
      </Card>

      {/* Form Elements Preview */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text Input</label>
              <input
                type="text"
                placeholder="Enter your income"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Dropdown</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select your region</option>
                <option>North America</option>
                <option>Europe</option>
                <option>Asia Pacific</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Number Input</label>
              <input
                type="number"
                placeholder="50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Textarea</label>
              <textarea
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Status Indicators */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Status Indicators</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <span className="text-sm text-green-700">Online</span>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
            <span className="text-sm text-yellow-700">Pending</span>
          </div>
          <div className="text-center p-4 bg-red-50 rounded">
            <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2"></div>
            <span className="text-sm text-red-700">Offline</span>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="w-3 h-3 bg-gray-500 rounded-full mx-auto mb-2"></div>
            <span className="text-sm text-gray-700">Unknown</span>
          </div>
        </div>
      </Card>

      <div className="text-center py-8">
        <p className="text-gray-600">
          🚀 All components are production-ready and responsive
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Developer can now integrate with backend APIs
        </p>
      </div>
    </div>
  )
}