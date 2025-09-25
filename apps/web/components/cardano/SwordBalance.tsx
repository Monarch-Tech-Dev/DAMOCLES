'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sword, Clock, TrendingUp, ExternalLink, Calendar } from 'lucide-react'
import cardanoClient, { SwordTokenBalance, VestingEvent } from '@/lib/cardano-client'

interface SwordBalanceProps {
  userAddress?: string
}

export default function SwordBalanceComponent({ userAddress }: SwordBalanceProps) {
  const [swordBalance, setSwordBalance] = useState<SwordTokenBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSwordBalance = async () => {
      try {
        setLoading(true)
        const balance = await cardanoClient.getSwordBalance(userAddress)
        setSwordBalance(balance)
        setError(null)
      } catch (err) {
        setError('Failed to fetch SWORD balance')
        console.error('SWORD balance fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSwordBalance()
  }, [userAddress])

  const calculateVestingProgress = () => {
    if (!swordBalance || swordBalance.total === 0) return 0
    return (swordBalance.vested / swordBalance.total) * 100
  }

  const getNextVestingEvent = (): VestingEvent | null => {
    if (!swordBalance?.vestingSchedule.length) return null

    const now = new Date()
    return swordBalance.vestingSchedule.find(event =>
      new Date(event.date) > now
    ) || null
  }

  const getVestingTypeColor = (type: VestingEvent['type']) => {
    const colors = {
      founder: 'bg-purple-100 text-purple-800',
      team: 'bg-blue-100 text-blue-800',
      advisor: 'bg-green-100 text-green-800'
    }
    return colors[type]
  }

  const getVestingTypeLabel = (type: VestingEvent['type']) => {
    const labels = {
      founder: 'Founder',
      team: 'Team',
      advisor: 'Advisor'
    }
    return labels[type]
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sword className="h-5 w-5 mr-2" />
            SWORD Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !swordBalance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <Sword className="h-5 w-5 mr-2" />
            SWORD Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Show empty state if user has no tokens
  if (swordBalance.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sword className="h-5 w-5 mr-2 text-gray-400" />
            SWORD Tokens
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <Sword className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No SWORD tokens found</p>
            <p className="text-sm mt-2">
              SWORD tokens are earned through platform participation and governance.
            </p>
          </div>
          <Button variant="outline" size="sm">
            Learn More
          </Button>
        </CardContent>
      </Card>
    )
  }

  const nextVesting = getNextVestingEvent()
  const vestingProgress = calculateVestingProgress()

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Sword className="h-5 w-5 mr-2 text-orange-600" />
              SWORD Token Balance
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`${cardanoClient.getNetworkInfo().explorerUrl}/policy/${cardanoClient.getNetworkInfo().contracts.swordPolicyId}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-900">
                {cardanoClient.constructor.formatSword(swordBalance.total)}
              </div>
              <div className="text-xs text-orange-600">
                Total SWORD
              </div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-900">
                {cardanoClient.constructor.formatSword(swordBalance.available)}
              </div>
              <div className="text-xs text-green-600">
                Available
              </div>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-900">
                {cardanoClient.constructor.formatSword(swordBalance.vested)}
              </div>
              <div className="text-xs text-blue-600">
                Vested
              </div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-900">
                {cardanoClient.constructor.formatSword(swordBalance.locked)}
              </div>
              <div className="text-xs text-purple-600">
                Locked
              </div>
            </div>
          </div>

          {/* Vesting Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Vesting Progress</span>
              <span className="font-medium">{vestingProgress.toFixed(1)}%</span>
            </div>
            <Progress value={vestingProgress} className="h-3" />
          </div>

          {/* Next Vesting Event */}
          {nextVesting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Next Vesting</span>
                </div>
                <Badge className={getVestingTypeColor(nextVesting.type)}>
                  {getVestingTypeLabel(nextVesting.type)}
                </Badge>
              </div>
              <div className="text-sm text-blue-700">
                <div className="font-semibold">
                  {cardanoClient.constructor.formatSword(nextVesting.amount)} SWORD
                </div>
                <div>
                  {new Date(nextVesting.date).toLocaleDateString('no-NO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vesting Schedule */}
      {swordBalance.vestingSchedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Vesting Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {swordBalance.vestingSchedule.map((event, index) => {
                const isPast = new Date(event.date) < new Date()
                const isNext = event === nextVesting

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isNext
                        ? 'bg-blue-50 border-blue-200'
                        : isPast
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {isPast ? (
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      ) : isNext ? (
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      )}
                      <div>
                        <div className={`font-medium ${isPast ? 'text-gray-600' : 'text-gray-900'}`}>
                          {new Date(event.date).toLocaleDateString('no-NO')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cardanoClient.constructor.formatSword(event.amount)} SWORD
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getVestingTypeColor(event.type)}>
                        {getVestingTypeLabel(event.type)}
                      </Badge>
                      {isPast && (
                        <Badge className="bg-green-100 text-green-800">
                          Released
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Utility Info */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <Sword className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-orange-900 mb-1">
                SWORD Token Utility
              </div>
              <ul className="text-orange-700 space-y-1 text-xs">
                <li>• Governance voting on platform decisions</li>
                <li>• Access to premium DAMOCLES features</li>
                <li>• Reduced fees on debt management services</li>
                <li>• Staking rewards from treasury performance</li>
                <li>• Early access to new platform features</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}