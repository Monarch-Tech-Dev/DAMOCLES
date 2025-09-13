'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

interface Creditor {
  id: string
  name: string
  type: string
  violationScore: number
  averageSettlementRate: number
}

interface Debt {
  id: string
  originalAmount: number
  currentAmount: number
  status: string
  accountNumber?: string
  createdAt: string
  creditor: Creditor
  settlements?: Array<{
    id: string
    status: string
    settledAmount?: number
    savedAmount?: number
  }>
  _count: {
    settlements: number
  }
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const fetchDebts = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      
      const response = await fetch(`http://localhost:3000/api/debts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDebts(data.debts)
      }
    } catch (error) {
      console.error('Error fetching debts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebts()
  }, [statusFilter])

  const filteredDebts = debts.filter(debt =>
    debt.creditor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    debt.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800'
      case 'negotiating': return 'bg-yellow-100 text-yellow-800'
      case 'settled': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'negotiating': return <ClockIcon className="w-4 h-4" />
      case 'settled': return <CheckCircleIcon className="w-4 h-4" />
      default: return null
    }
  }

  const getTotalAmount = () => {
    return filteredDebts.reduce((sum, debt) => sum + debt.currentAmount, 0)
  }

  const getStatusCounts = () => {
    return {
      active: debts.filter(d => d.status === 'active').length,
      negotiating: debts.filter(d => d.status === 'negotiating').length,
      settled: debts.filter(d => d.status === 'settled').length
    }
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="min-h-screen bg-damocles-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-damocles-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-damocles-primary">Mine Gjeld</h1>
            <p className="text-gray-600 mt-2">
              Administrer og spor dine gjeldsposter
            </p>
          </div>
          <Link href="/dashboard/debts/add">
            <Button className="bg-damocles-accent hover:bg-indigo-700">
              <PlusIcon className="w-4 h-4 mr-2" />
              Legg til gjeld
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totalt Gjeld</p>
                <p className="text-2xl font-bold text-damocles-primary">
                  {getTotalAmount().toLocaleString('no-NO', { 
                    style: 'currency', 
                    currency: 'NOK' 
                  })}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktive</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.active}</p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under forhandling</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.negotiating}</p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Løst</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.settled}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Søk etter kreditor eller kontonummer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-damocles-accent focus:border-transparent"
            >
              <option value="">Alle statuser</option>
              <option value="active">Aktive</option>
              <option value="negotiating">Under forhandling</option>
              <option value="settled">Løst</option>
            </select>
          </div>
        </div>

        {/* Debts List */}
        {filteredDebts.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen gjeld funnet</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter 
                ? "Ingen gjeld matcher dine søkekriterier." 
                : "Du har ikke lagt til noen gjeld ennå."
              }
            </p>
            <Link href="/dashboard/debts/add">
              <Button>Legg til din første gjeld</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDebts.map((debt, index) => (
              <motion.div
                key={debt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-damocles-primary">
                            {debt.creditor.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${getStatusColor(debt.status)}`}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(debt.status)}
                                {debt.status === 'active' && 'Aktiv'}
                                {debt.status === 'negotiating' && 'Forhandler'}
                                {debt.status === 'settled' && 'Løst'}
                              </span>
                            </Badge>
                            <Badge className="bg-gray-100 text-gray-800 text-xs">
                              {debt.creditor.type}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Gjeldende beløp</p>
                          <p className="text-xl font-bold text-damocles-primary">
                            {debt.currentAmount.toLocaleString('no-NO', {
                              style: 'currency',
                              currency: 'NOK'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Opprinnelig beløp</p>
                          <p className="font-semibold">
                            {debt.originalAmount.toLocaleString('no-NO', {
                              style: 'currency',
                              currency: 'NOK'
                            })}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500">Kontonummer</p>
                          <p className="font-semibold">{debt.accountNumber || 'N/A'}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500">Opprettet</p>
                          <p className="font-semibold">
                            {new Date(debt.createdAt).toLocaleDateString('no-NO')}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500">Forhandlinger</p>
                          <p className="font-semibold">{debt._count.settlements}</p>
                        </div>
                      </div>

                      {/* Creditor Risk Info */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-gray-500">Overtredelsescore:</span>
                              <span className={`ml-2 font-semibold ${
                                debt.creditor.violationScore > 40 ? 'text-red-600' :
                                debt.creditor.violationScore > 20 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {debt.creditor.violationScore}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Gjennomsnittlig oppgjør:</span>
                              <span className="ml-2 font-semibold text-green-600">
                                {(debt.creditor.averageSettlementRate * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          
                          <Link href={`/dashboard/debts/${debt.id}`}>
                            <Button variant="outline" size="sm">
                              Vis detaljer
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}