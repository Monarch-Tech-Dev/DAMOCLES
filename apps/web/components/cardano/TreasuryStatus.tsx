'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Shield, Clock, AlertTriangle, ExternalLink, Coins } from 'lucide-react'
import cardanoClient, { TreasuryStatus, PendingWithdrawal } from '@/lib/cardano-client'

export default function TreasuryStatusComponent() {
  const [treasuryStatus, setTreasuryStatus] = useState<TreasuryStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTreasuryStatus = async () => {
      try {
        setLoading(true)
        const status = await cardanoClient.getTreasuryStatus()
        setTreasuryStatus(status)
        setError(null)
      } catch (err) {
        setError('Failed to fetch treasury status')
        console.error('Treasury fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTreasuryStatus()

    // Subscribe to real-time updates
    const unsubscribe = cardanoClient.subscribeToUpdates((data) => {
      if (data.data.treasury) {
        setTreasuryStatus(data.data.treasury)
      }
    })

    return unsubscribe
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount * 12) // Rough ADA to NOK conversion
  }

  const getStatusBadge = (status: PendingWithdrawal['status']) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Venter' },
      approved: { color: 'bg-blue-100 text-blue-800', text: 'Godkjent' },
      executable: { color: 'bg-green-100 text-green-800', text: 'Klar' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Kansellert' }
    }
    const variant = variants[status]
    return <Badge className={variant.color}>{variant.text}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Treasury Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !treasuryStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Treasury Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-2"
          >
            Prøv igjen
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Treasury Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              DAMOCLES Treasury
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`${cardanoClient.getNetworkInfo().explorerUrl}/address/${cardanoClient.getNetworkInfo().contracts.treasuryAddress}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Coins className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-900">
                {cardanoClient.constructor.formatAda(treasuryStatus.balance * 1000000)} ADA
              </div>
              <div className="text-sm text-green-700">
                {formatCurrency(treasuryStatus.balance)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Treasury Balance
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {cardanoClient.constructor.formatAda(treasuryStatus.totalWithdrawn * 1000000)} ADA
              </div>
              <div className="text-sm text-blue-700">
                {formatCurrency(treasuryStatus.totalWithdrawn)}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Total Withdrawn
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">
                {treasuryStatus.pendingWithdrawals.length}
              </div>
              <div className="text-xs text-orange-600 mt-1">
                Pending Withdrawals
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Network: {cardanoClient.getNetworkInfo().network}</span>
            <span>Last updated: {new Date(treasuryStatus.lastActivity).toLocaleString('no-NO')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pending Withdrawals */}
      {treasuryStatus.pendingWithdrawals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-600" />
              Pending Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {treasuryStatus.pendingWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">
                        {cardanoClient.constructor.formatAda(withdrawal.amount * 1000000)} ADA
                      </div>
                      <div className="text-sm text-gray-600">
                        {withdrawal.recipient}
                      </div>
                      <div className="text-xs text-gray-500">
                        Requested: {new Date(withdrawal.requestedAt).toLocaleDateString('no-NO')}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(withdrawal.status)}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Signatures: {withdrawal.currentSignatures}/{withdrawal.requiredSignatures}</span>
                      {withdrawal.timeRemaining > 0 && (
                        <span className="text-orange-600">
                          {cardanoClient.constructor.formatTimeRemaining(withdrawal.timeRemaining)} remaining
                        </span>
                      )}
                    </div>
                    <Progress
                      value={(withdrawal.currentSignatures / withdrawal.requiredSignatures) * 100}
                      className="h-2"
                    />
                  </div>

                  {withdrawal.status === 'executable' && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="flex items-center text-green-800">
                        <Shield className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">
                          Ready for execution - Time lock period completed
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">
                Multi-Signature Security
              </div>
              <div className="text-blue-700">
                All treasury withdrawals require 3-of-5 signatures and 48-hour time delays for amounts over 100k ADA.
                This prevents single-point-of-failure attacks and gives the community time to review large transactions.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}