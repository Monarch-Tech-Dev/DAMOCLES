'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { AlertTriangle, Shield, Play, Pause, Clock, Users, ExternalLink } from 'lucide-react'
import cardanoClient, { EmergencyStatus, EmergencyEvent } from '@/lib/cardano-client'

export default function EmergencyStatusComponent() {
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmergencyStatus = async () => {
      try {
        setLoading(true)
        const status = await cardanoClient.getEmergencyStatus()
        setEmergencyStatus(status)
        setError(null)
      } catch (err) {
        setError('Failed to fetch emergency status')
        console.error('Emergency status fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEmergencyStatus()

    // Subscribe to real-time updates
    const unsubscribe = cardanoClient.subscribeToUpdates((data) => {
      if (data.data.emergency) {
        setEmergencyStatus(data.data.emergency)
      }
    })

    return unsubscribe
  }, [])

  const getStatusIcon = () => {
    if (!emergencyStatus) return <Shield className="h-5 w-5" />

    if (emergencyStatus.isPaused) {
      return <Pause className="h-5 w-5 text-red-600" />
    }

    return <Shield className="h-5 w-5 text-green-600" />
  }

  const getStatusBadge = () => {
    if (!emergencyStatus) return null

    if (emergencyStatus.isPaused) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          SYSTEM PAUSED
        </Badge>
      )
    }

    if (!emergencyStatus.isActive) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          MAINTENANCE
        </Badge>
      )
    }

    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        FULLY OPERATIONAL
      </Badge>
    )
  }

  const getActionIcon = (action: EmergencyEvent['action']) => {
    switch (action) {
      case 'pause':
        return <Pause className="h-4 w-4 text-red-500" />
      case 'unpause':
        return <Play className="h-4 w-4 text-green-500" />
      case 'vote':
        return <Users className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const formatTimeSince = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h ago`
    }
    return `${diffHours}h ago`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Emergency Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !emergencyStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Emergency Status Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <Card className={emergencyStatus.isPaused ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon()}
              <span className="ml-2">System Status</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`${cardanoClient.getNetworkInfo().explorerUrl}/address/${cardanoClient.getNetworkInfo().contracts.emergencyAddress}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          {emergencyStatus.isPaused ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <div className="font-medium text-red-900">
                  Platform Currently Paused
                </div>
                <div className="text-sm text-red-700 mt-1">
                  {emergencyStatus.pauseReason || 'Emergency maintenance in progress'}
                </div>
                {emergencyStatus.pausedSince && (
                  <div className="text-xs text-red-600 mt-1">
                    Paused since: {new Date(emergencyStatus.pausedSince).toLocaleString('no-NO')}
                    ({formatTimeSince(emergencyStatus.pausedSince)})
                  </div>
                )}
              </div>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <div className="font-medium text-green-900">
                  All Systems Operational
                </div>
                <div className="text-sm text-green-700 mt-1">
                  The DAMOCLES platform is running normally with all security measures active.
                </div>
              </div>
            </Alert>
          )}

          {/* Unpause Voting (if paused) */}
          {emergencyStatus.isPaused && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">
                  {emergencyStatus.unpauseVotes}
                </div>
                <div className="text-sm text-blue-700">
                  Current Votes
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-900">
                  {emergencyStatus.requiredVotes}
                </div>
                <div className="text-sm text-purple-700">
                  Required Votes
                </div>
              </div>
            </div>
          )}

          {/* Unpause Progress */}
          {emergencyStatus.isPaused && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Unpause Progress</span>
                <span>{emergencyStatus.unpauseVotes}/{emergencyStatus.requiredVotes}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(emergencyStatus.unpauseVotes / emergencyStatus.requiredVotes) * 100}%`
                  }}
                ></div>
              </div>
              {emergencyStatus.canUnpause && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Ready to unpause - Sufficient votes received
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency History */}
      {emergencyStatus.emergencyHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emergencyStatus.emergencyHistory.slice(0, 5).map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getActionIcon(event.action)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-gray-900 capitalize">
                        {event.action === 'pause' ? 'System Paused' :
                         event.action === 'unpause' ? 'System Resumed' :
                         'Governance Vote'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimeSince(event.timestamp)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.initiator}
                    </div>
                    {event.reason && (
                      <div className="text-xs text-gray-500 mt-1">
                        {event.reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">
                Emergency Pause System
              </div>
              <div className="text-blue-700 space-y-1">
                <p>
                  The emergency pause system can halt all platform operations instantly to protect users during
                  security incidents or major exploits.
                </p>
                <ul className="text-xs mt-2 space-y-1">
                  <li>• Authorized entities can trigger emergency pause</li>
                  <li>• {emergencyStatus.requiredVotes} governance signatures required to resume</li>
                  <li>• All funds remain secure during pause periods</li>
                  <li>• System automatically monitors for threats</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}