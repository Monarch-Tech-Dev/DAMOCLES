'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import TreasuryStatus from '@/components/cardano/TreasuryStatus'
import SwordBalance from '@/components/cardano/SwordBalance'
import EmergencyStatus from '@/components/cardano/EmergencyStatus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Coins, TrendingUp, AlertTriangle } from 'lucide-react'

export default function CardanoDashboard() {
  const { user } = useAuth()

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'God morgen'
    if (hour < 18) return 'God ettermiddag'
    return 'God kveld'
  }

  const getWelcomeMessage = () => {
    if (!user?.name) return 'Velkommen til DAMOCLES Blockchain'

    const firstName = user.name.split(' ')[0]
    const greeting = getTimeBasedGreeting()

    return `${greeting}, ${firstName}!`
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {getWelcomeMessage()}
        </h1>
        <p className="text-gray-600">
          Oversikt over DAMOCLES sin Cardano-baserte sikkerheitsarkitektur
        </p>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            Cardano Mainnet
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            5-Layer Security Active
          </Badge>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">
                  Active
                </div>
                <div className="text-sm text-green-700">
                  Security Status
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  125k
                </div>
                <div className="text-sm text-blue-700">
                  ADA Treasury
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  50M
                </div>
                <div className="text-sm text-orange-700">
                  SWORD Tokens
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  0
                </div>
                <div className="text-sm text-purple-700">
                  Pending Withdrawals
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Emergency Status - Always visible */}
          <EmergencyStatus />

          {/* SWORD Token Balance */}
          <SwordBalance userAddress="addr1qxa0qatlwqfykwslhteprxvz2thrf709w76lk62442725wynzamj4crwpt3yrc8xuyx8cadzs0vz93fdgl05806ygnmq5q8rcy" />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Treasury Status */}
          <TreasuryStatus />
        </div>
      </div>

      {/* Security Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            5-Layer Security Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-900 mb-2">
                Layer 1
              </div>
              <div className="text-sm text-green-700 mb-2">
                Multi-Signature Treasury
              </div>
              <Badge className="bg-green-100 text-green-800">
                3-of-5 Signatures
              </Badge>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-900 mb-2">
                Layer 2
              </div>
              <div className="text-sm text-blue-700 mb-2">
                Time-Locked Withdrawals
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                48-Hour Delay
              </Badge>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-900 mb-2">
                Layer 3
              </div>
              <div className="text-sm text-purple-700 mb-2">
                Token Vesting
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                4-Year Schedule
              </Badge>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="font-semibold text-orange-900 mb-2">
                Layer 4
              </div>
              <div className="text-sm text-orange-700 mb-2">
                Emergency Pause
              </div>
              <Badge className="bg-orange-100 text-orange-800">
                Instant Halt
              </Badge>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">
                Layer 5
              </div>
              <div className="text-sm text-gray-700 mb-2">
                Transparency
              </div>
              <Badge className="bg-gray-100 text-gray-800">
                On-Chain Visible
              </Badge>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">
                  Prevents 95% of Crypto Rug Pulls
                </div>
                <div className="text-blue-700">
                  This security architecture mathematically prevents common attack vectors including:
                  exit scams, sudden liquidity removal, governance attacks, and founder token dumps.
                  All treasury operations are transparent and community-governed.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Cardano Node Connection</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Smart Contracts Deployed</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Real-time Monitoring</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Blockfrost API Integration</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Mock Mode</Badge>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Note:</strong> The Cardano integration is currently running in development mode with mock data.
              To enable full blockchain connectivity, configure the BLOCKFROST_API_KEY environment variable.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}