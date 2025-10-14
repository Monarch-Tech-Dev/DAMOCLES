'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface Debt {
  id: string
  creditor: {
    id: string
    name: string
    type: string
  }
  originalAmount: number
  currentAmount: number
  status: string
  createdAt: string
}

export default function DebtsPage() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debts, setDebts] = useState<Debt[]>([])
  const [apiUrl, setApiUrl] = useState('')

  useEffect(() => {
    // Set API URL on client side to avoid hydration mismatch
    const url = process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? window.location.origin
        : 'http://localhost:3001');
    setApiUrl(url)
  }, [])

  useEffect(() => {
    if (apiUrl) {
      fetchDebts()
    }
  }, [apiUrl])

  const fetchDebts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${apiUrl}/api/debts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDebts(data.debts || [])
      } else {
        console.error('Failed to fetch debts')
        toast.error('Kunne ikke laste gjeld')
      }
    } catch (error) {
      console.error('Error fetching debts:', error)
      toast.error('Nettverksfeil ved lasting av gjeld')
    } finally {
      setLoading(false)
    }
  }

  // Filter debts based on search term
  const filteredDebts = debts.filter(debt =>
    debt.creditor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    debt.creditor.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/60 rounded-xl w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white/60 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Mine Gjeld</h1>
            <p className="text-slate-600 mt-2">
              Administrer og spor dine gjeldsposter
            </p>
          </div>
          <Link href="/dashboard/debts/add">
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Legg til gjeld
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Søk etter gjeld..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-slate-50">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Totalt Gjeld</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {debts.reduce((sum, debt) => sum + debt.currentAmount, 0).toLocaleString()} NOK
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Aktive</p>
                  <p className="text-2xl font-bold text-red-600">
                    {debts.filter(debt => debt.status === 'active').length}
                  </p>
                </div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Under forhandling</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {debts.filter(debt => debt.status === 'negotiating').length}
                  </p>
                </div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Løst</p>
                  <p className="text-2xl font-bold text-green-600">
                    {debts.filter(debt => debt.status === 'resolved').length}
                  </p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debt List */}
        {filteredDebts.length > 0 ? (
          <div className="space-y-4">
            {filteredDebts.map((debt) => (
              <Card key={debt.id} className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{debt.creditor.name}</h3>
                        <Badge variant={debt.status === 'active' ? 'destructive' : debt.status === 'negotiating' ? 'default' : 'secondary'}>
                          {debt.status === 'active' ? 'Aktiv' : debt.status === 'negotiating' ? 'Forhandling' : 'Løst'}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm">{debt.creditor.type}</p>
                      <p className="text-xs text-slate-500 mt-1" suppressHydrationWarning>Opprettet: {new Date(debt.createdAt).toLocaleDateString('no-NO')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">
                        {debt.currentAmount.toLocaleString()} NOK
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <Link href={`/dashboard/debts/${debt.id}`}>
                          <Button size="sm" variant="outline">Se detaljer</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchTerm ? (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <Search className="mx-auto h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Ingen resultater funnet</h3>
              <p className="text-slate-600 mb-6">
                Prøv et annet søkebegrep eller fjern filtrene.
              </p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Fjern søk
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Ingen gjeld funnet</h3>
              <p className="text-slate-600 mb-6">
                Du har ikke lagt til noen gjeld ennå.
              </p>
              <Link href="/dashboard/debts/add">
                <Button className="bg-blue-600 hover:bg-blue-700">Legg til din første gjeld</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}