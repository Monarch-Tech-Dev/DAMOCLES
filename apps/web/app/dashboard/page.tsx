'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { userAPI, debtAPI, tokenAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Coins, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Eye,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalDebts: number
  activeDebts: number
  totalViolations: number
  completedSettlements: number
  totalSaved: number
  tokenBalance: number
}

interface Debt {
  id: string
  creditor: {
    name: string
    type: string
    violationScore: number
  }
  originalAmount: number
  currentAmount: number
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentDebts, setRecentDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, debtsResponse] = await Promise.all([
          userAPI.getStats(),
          debtAPI.getDebts()
        ])

        setStats(statsResponse.data.stats)
        setRecentDebts(debtsResponse.data.debts.slice(0, 3))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-800 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getShieldColor = (tier: string) => {
    switch (tier) {
      case 'gold': return 'text-yellow-400'
      case 'silver': return 'text-slate-300'
      default: return 'text-orange-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500'
      case 'negotiating': return 'bg-yellow-500'
      case 'settled': return 'bg-green-500'
      default: return 'bg-slate-500'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Velkommen tilbake, {user?.email?.split('@')[0]}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <Shield className={`h-5 w-5 ${getShieldColor(user?.shieldTier || 'bronze')}`} />
                <span className="text-slate-300 capitalize">
                  {user?.shieldTier} Shield
                </span>
              </div>
              <Badge variant="outline" className="text-slate-300 border-slate-600">
                {user?.onboardingStatus}
              </Badge>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/debts/add">
                <Plus className="h-4 w-4 mr-2" />
                Legg til gjeld
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-slate-600 text-slate-300">
              <Link href="/gdpr/generate">
                <FileText className="h-4 w-4 mr-2" />
                Generer GDPR-forespørsel
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">SWORD Tokens</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.tokenBalance?.toLocaleString() || '0'}
                  </p>
                </div>
                <Coins className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Aktive gjeld</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.activeDebts || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Totale gjeld</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalDebts || 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Oppgjør</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.completedSettlements || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Spart (NOK)</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalSaved?.toLocaleString() || '0'}
                  </p>
                </div>
                <Coins className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Brudd funnet</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalViolations || 0}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Debts */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Nylige gjeld
                <Button variant="ghost" size="sm" asChild className="text-slate-400">
                  <Link href="/dashboard/debts">
                    Se alle
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentDebts.length > 0 ? (
                recentDebts.map((debt) => (
                  <div key={debt.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{debt.creditor.name}</p>
                      <p className="text-sm text-slate-400">
                        {debt.currentAmount.toLocaleString()} NOK
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={`${getStatusColor(debt.status)} text-white`}
                      >
                        {debt.status}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/debts/${debt.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Ingen gjeld registrert ennå</p>
                  <Button asChild className="mt-3" variant="outline">
                    <Link href="/dashboard/debts/add">Legg til din første gjeld</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Hurtighandlinger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/debt/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrer ny gjeld
                </Link>
              </Button>
              
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/gdpr/generate">
                  <FileText className="h-4 w-4 mr-2" />
                  Generer GDPR-forespørsel
                </Link>
              </Button>
              
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/violations">
                  <Shield className="h-4 w-4 mr-2" />
                  Se brudd og overtredelser
                </Link>
              </Button>
              
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/settlements">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Oppgjør og forhandlinger
                </Link>
              </Button>
              
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/tokens">
                  <Coins className="h-4 w-4 mr-2" />
                  Administrer SWORD tokens
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}