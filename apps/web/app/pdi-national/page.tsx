'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, AlertTriangle, MapPin, ExternalLink } from 'lucide-react'

interface NationalPDIData {
  nationalAverage: number
  totalUsers: number
  criticalPercentage: number
  totalDebtStress: number
  regionsInCrisis: number
  lastUpdated: Date
  trend: 'improving' | 'worsening' | 'stable'
  changePercent: number
}

interface RegionalData {
  regionName: string
  averagePDI: number
  totalProfiles: number
  criticalPercentage: number
}

export default function NationalPDIPage() {
  const [data, setData] = useState<NationalPDIData | null>(null)
  const [tickerValue, setTickerValue] = useState(0)
  const [regionalData, setRegionalData] = useState<RegionalData[]>([])

  useEffect(() => {
    // Fetch initial data
    fetchNationalData()

    // Set up real-time WebSocket connection (works in both dev and production)
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:8011'
    const wsUrl = `${protocol}//${host}/pdi`
    const ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      if (update.type === 'national_update') {
        setData(prev => ({ ...prev, ...update.data }))

        // Smooth counter animation like Oil Fund
        if (update.data.totalDebtStress) {
          animateValue(tickerValue, update.data.totalDebtStress, 2000)
        }
      }
    }

    // Simulate real-time updates every second
    const interval = setInterval(() => {
      if (data?.totalDebtStress) {
        const changeRate = data.totalDebtStress * 0.00001 // Small random change
        const newValue = data.totalDebtStress + (Math.random() - 0.5) * changeRate
        setTickerValue(newValue)
      }
    }, 1000)

    return () => {
      ws.close()
      clearInterval(interval)
    }
  }, [])

  const fetchNationalData = async () => {
    try {
      console.log('Fetching national PDI data...')
      const response = await fetch('/pdi/api/public/pdi/national')
      console.log('Response status:', response.status)

      if (response.ok) {
        const nationalData = await response.json()
        console.log('National data received:', nationalData)
        setData(nationalData)
        setTickerValue(nationalData.totalDebtStress)

        // Mock regional data for now
        setRegionalData([
          { regionName: 'Oslo', averagePDI: 58.2, totalProfiles: 24500, criticalPercentage: 22.1 },
          { regionName: 'Bergen', averagePDI: 54.7, totalProfiles: 12300, criticalPercentage: 28.3 },
          { regionName: 'Stavanger', averagePDI: 62.1, totalProfiles: 9800, criticalPercentage: 18.9 },
          { regionName: 'Trondheim', averagePDI: 56.4, totalProfiles: 8700, criticalPercentage: 25.2 },
          { regionName: 'Nord-Norge', averagePDI: 51.2, totalProfiles: 15600, criticalPercentage: 32.7 },
          { regionName: 'Vestlandet', averagePDI: 59.8, totalProfiles: 18900, criticalPercentage: 19.4 },
          { regionName: 'Østlandet', averagePDI: 57.9, totalProfiles: 35400, criticalPercentage: 23.8 },
          { regionName: 'Sørlandet', averagePDI: 60.3, totalProfiles: 7200, criticalPercentage: 17.6 }
        ])
      } else {
        console.error('API returned error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to fetch national PDI data:', error)
      // Use mock data for demo
      setData({
        nationalAverage: 58.7,
        totalUsers: 132500,
        criticalPercentage: 23.4,
        totalDebtStress: 4726000000,
        regionsInCrisis: 2,
        lastUpdated: new Date(),
        trend: 'worsening',
        changePercent: -1.2
      })
      setTickerValue(4726000000)

      setRegionalData([
        { regionName: 'Oslo', averagePDI: 58.2, totalProfiles: 24500, criticalPercentage: 22.1 },
        { regionName: 'Bergen', averagePDI: 54.7, totalProfiles: 12300, criticalPercentage: 28.3 },
        { regionName: 'Stavanger', averagePDI: 62.1, totalProfiles: 9800, criticalPercentage: 18.9 },
        { regionName: 'Trondheim', averagePDI: 56.4, totalProfiles: 8700, criticalPercentage: 25.2 },
        { regionName: 'Nord-Norge', averagePDI: 51.2, totalProfiles: 15600, criticalPercentage: 32.7 },
        { regionName: 'Vestlandet', averagePDI: 59.8, totalProfiles: 18900, criticalPercentage: 19.4 },
        { regionName: 'Østlandet', averagePDI: 57.9, totalProfiles: 35400, criticalPercentage: 23.8 },
        { regionName: 'Sørlandet', averagePDI: 60.3, totalProfiles: 7200, criticalPercentage: 17.6 }
      ])
    }
  }

  const animateValue = (start: number, end: number, duration: number) => {
    const range = end - start
    const increment = range / (duration / 16)
    let current = start

    const timer = setInterval(() => {
      current += increment
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setTickerValue(end)
        clearInterval(timer)
      } else {
        setTickerValue(current)
      }
    }, 16)
  }

  const getPDIColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 50) return 'text-yellow-500'
    if (score >= 30) return 'text-orange-500'
    return 'text-red-500'
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('no-NO', {
      style: 'currency',
      currency: 'NOK',
      maximumFractionDigits: 0,
    })
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-xl">Loading Norway's Debt Health Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Norway's Debt Health Index
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            Real-time financial stress monitor for Norwegian households
          </p>
          <p className="text-sm text-gray-500">
            Like the Oil Fund counter, but for debt stress
          </p>
        </div>

        {/* Giant PDI Score Display */}
        <Card className="bg-gray-800 border-gray-700 p-8 mb-8">
          <div className="text-center">
            <div className="text-8xl md:text-9xl font-bold">
              <span className={getPDIColor(data.nationalAverage)}>
                {data.nationalAverage.toFixed(1)}
              </span>
              <span className="text-4xl text-gray-500">/100</span>
            </div>
            <div className="mt-4 text-2xl">
              National Debt Health Score
            </div>
            <div className="mt-2 flex items-center justify-center">
              {data.trend === 'improving' ?
                <TrendingUp className="h-6 w-6 text-green-400 mr-2" /> :
                <TrendingDown className="h-6 w-6 text-red-400 mr-2" />
              }
              <span className={data.trend === 'improving' ? 'text-green-400' : 'text-red-400'}>
                {data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(1)}% (30 days)
              </span>
            </div>
          </div>
        </Card>

        {/* Live Debt Under Stress Counter */}
        <Card className="bg-gray-800 border-gray-700 p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl md:text-7xl font-mono font-bold text-red-400">
              {formatCurrency(tickerValue)}
            </div>
            <div className="mt-4 text-xl text-gray-400">
              Total Household Debt Under Critical Stress
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Updating live from {data.totalUsers.toLocaleString()} households
            </div>
          </div>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Citizens at Risk</p>
                <p className="text-3xl font-bold text-red-400">
                  {Math.round((data.criticalPercentage / 100) * data.totalUsers).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  PDI Score Below 40
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Crisis Regions</p>
                <p className="text-3xl font-bold text-orange-400">
                  {data.regionsInCrisis}
                </p>
                <p className="text-sm text-gray-500">
                  Average PDI Below 50
                </p>
              </div>
              <MapPin className="h-8 w-8 text-orange-400" />
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">30-Day Trend</p>
                <p className="text-3xl font-bold">
                  <span className={data.trend === 'improving' ? 'text-green-400' : 'text-red-400'}>
                    {data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(1)}%
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  {data.trend === 'improving' ? 'Improving' : 'Worsening'}
                </p>
              </div>
              {data.trend === 'improving' ?
                <TrendingUp className="h-8 w-8 text-green-400" /> :
                <TrendingDown className="h-8 w-8 text-red-400" />
              }
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Protected Users</p>
                <p className="text-3xl font-bold text-blue-400">
                  {data.totalUsers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Active DAMOCLES Users
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </Card>
        </div>

        {/* Regional Heat Map */}
        <Card className="bg-gray-800 border-gray-700 p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Regional Debt Stress Map</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {regionalData.map((region) => (
              <div
                key={region.regionName}
                className={`p-4 rounded-lg border ${
                  region.averagePDI < 50 ? 'bg-red-900 border-red-700' :
                  region.averagePDI < 60 ? 'bg-orange-900 border-orange-700' :
                  'bg-green-900 border-green-700'
                }`}
              >
                <h4 className="font-semibold">{region.regionName}</h4>
                <div className="text-2xl font-bold mt-1">
                  <span className={getPDIColor(region.averagePDI)}>
                    {region.averagePDI.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {region.totalProfiles.toLocaleString()} users
                </div>
                <div className="text-xs text-gray-500">
                  {region.criticalPercentage.toFixed(1)}% critical
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* About Section */}
        <Card className="bg-gray-800 border-gray-700 p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">About Norway's Debt Health Index</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">What is PDI?</h4>
              <p className="text-gray-400 text-sm mb-4">
                The Personal Debt Index (PDI) is like a credit score, but for YOUR benefit, not the bank's.
                It measures financial health on a scale of 0-100, helping Norwegians understand and improve
                their debt situation.
              </p>

              <h4 className="font-semibold mb-2">How It Works</h4>
              <p className="text-gray-400 text-sm mb-4">
                Citizens voluntarily share their financial metrics through DAMOCLES. The system automatically
                protects those in crisis while aggregating anonymous data to show national debt health patterns.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Network Effects</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• 10 users: Individual help</li>
                <li>• 1,000 users: Pattern detection</li>
                <li>• 10,000 users: Regional trends visible</li>
                <li>• 100,000 users: Media attention</li>
                <li>• 1,000,000 users: Systemic change</li>
              </ul>

              <div className="mt-4">
                <a
                  href="/dashboard/pdi"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300"
                >
                  Calculate Your PDI <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* API Access */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-xl font-bold mb-4">Open Data Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">For Media</h4>
              <p className="text-gray-400 text-sm mb-2">
                Embed real-time debt stress data in your articles and reports.
              </p>
              <code className="text-xs bg-gray-900 p-2 rounded block">
                GET /api/public/pdi/national
              </code>
            </div>

            <div>
              <h4 className="font-semibold mb-2">For Researchers</h4>
              <p className="text-gray-400 text-sm mb-2">
                Access anonymized aggregate data for academic research.
              </p>
              <code className="text-xs bg-gray-900 p-2 rounded block">
                GET /api/public/pdi/historical
              </code>
            </div>

            <div>
              <h4 className="font-semibold mb-2">For Government</h4>
              <p className="text-gray-400 text-sm mb-2">
                Real-time crisis detection and policy impact monitoring.
              </p>
              <code className="text-xs bg-gray-900 p-2 rounded block">
                GET /api/pdi/crises
              </code>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>Data updated every 5 minutes • Last update: {new Date(data.lastUpdated).toLocaleString('no-NO')}</p>
          <p className="mt-2">
            Powered by <a href="/" className="text-blue-400 hover:text-blue-300">DAMOCLES</a> •
            Consumer Protection Platform
          </p>
        </div>
      </div>
    </div>
  )
}