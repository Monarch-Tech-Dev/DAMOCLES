'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  X,
  Check
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
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [debts, setDebts] = useState<Debt[]>([])
  const [apiUrl, setApiUrl] = useState('')
  const [selectedDebts, setSelectedDebts] = useState<Set<string>>(new Set())
  const [editingDebt, setEditingDebt] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState<number>(0)
  const [editStatus, setEditStatus] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    // Set API URL on client side to avoid hydration mismatch
    const url = process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? window.location.origin
        : 'http://localhost:3001');
    console.log('[DEBUG] Mine gjeld - Environment:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
      computedApiUrl: url
    })
    setApiUrl(url)
  }, [])

  useEffect(() => {
    if (apiUrl) {
      fetchDebts()
    }
  }, [apiUrl])

  const fetchDebts = async () => {
    console.log('[DEBUG] fetchDebts called with apiUrl:', apiUrl)
    try {
      const token = localStorage.getItem('token')
      console.log('[DEBUG] Token exists:', !!token)

      if (!token) {
        console.warn('[DEBUG] No token found - user not authenticated')
        setLoading(false)
        return
      }

      const url = `${apiUrl}/api/debts`
      console.log('[DEBUG] Fetching debts from:', url)

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('[DEBUG] Fetch debts response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (response.ok) {
        const data = await response.json()
        console.log('[DEBUG] Debts data received:', data)
        console.log('[DEBUG] Number of debts:', data.debts?.length || 0)
        setDebts(data.debts || [])
      } else {
        const errorText = await response.text().catch(() => 'Could not read error')
        console.error('[DEBUG] Failed to fetch debts:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        toast.error('Kunne ikke laste gjeld')
      }
    } catch (error) {
      console.error('[DEBUG] Error fetching debts:', error)
      if (error instanceof TypeError) {
        console.error('[DEBUG] Network error - cannot reach API')
        toast.error('Nettverksfeil - kan ikke nå serveren')
      } else {
        toast.error('Nettverksfeil ved lasting av gjeld')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDebt = async (debtId: string, updates: { currentAmount?: number; status?: string }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${apiUrl}/api/debts/${debtId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        toast.success('Gjeld oppdatert')
        fetchDebts()
        setEditingDebt(null)
      } else {
        toast.error('Kunne ikke oppdatere gjeld')
      }
    } catch (error) {
      console.error('Error updating debt:', error)
      toast.error('Nettverksfeil ved oppdatering')
    }
  }

  const handleDeleteDebt = async (debtId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne gjeldsposten?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${apiUrl}/api/debts/${debtId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Gjeld slettet')
        fetchDebts()
        selectedDebts.delete(debtId)
        setSelectedDebts(new Set(selectedDebts))
      } else {
        const data = await response.json()
        toast.error(data.error || 'Kunne ikke slette gjeld')
      }
    } catch (error) {
      console.error('Error deleting debt:', error)
      toast.error('Nettverksfeil ved sletting')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedDebts.size === 0) return
    if (!confirm(`Er du sikker på at du vil slette ${selectedDebts.size} gjeldsposter?`)) {
      return
    }

    const promises = Array.from(selectedDebts).map(debtId => handleDeleteDebt(debtId))
    await Promise.all(promises)
    setSelectedDebts(new Set())
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedDebts.size === 0) return

    const promises = Array.from(selectedDebts).map(debtId =>
      handleUpdateDebt(debtId, { status: newStatus })
    )
    await Promise.all(promises)
    setSelectedDebts(new Set())
  }

  const toggleSelectDebt = (debtId: string) => {
    const newSelected = new Set(selectedDebts)
    if (newSelected.has(debtId)) {
      newSelected.delete(debtId)
    } else {
      newSelected.add(debtId)
    }
    setSelectedDebts(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedDebts.size === filteredDebts.length) {
      setSelectedDebts(new Set())
    } else {
      setSelectedDebts(new Set(filteredDebts.map(d => d.id)))
    }
  }

  const startEditing = (debt: Debt) => {
    setEditingDebt(debt.id)
    setEditAmount(debt.currentAmount)
    setEditStatus(debt.status)
  }

  const cancelEditing = () => {
    setEditingDebt(null)
    setEditAmount(0)
    setEditStatus('')
  }

  const saveEdit = () => {
    if (editingDebt) {
      handleUpdateDebt(editingDebt, {
        currentAmount: editAmount,
        status: editStatus
      })
    }
  }

  // Filter debts based on search term and status
  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.creditor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.creditor.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || debt.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
          <Button
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
            onClick={() => router.push('/dashboard/debts/add')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Legg til gjeld
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Søk etter gjeld..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Button
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-slate-50"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Alle</option>
                    <option value="active">Aktive</option>
                    <option value="negotiating">Under forhandling</option>
                    <option value="resolved">Løst</option>
                    <option value="settled">Gjort opp</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions */}
        {selectedDebts.size > 0 && (
          <Card className="bg-blue-50 border-blue-200 shadow-sm mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm font-medium text-slate-900">
                  {selectedDebts.size} gjeld valgt
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('active')}>
                    Marker som aktiv
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('negotiating')}>
                    Marker som forhandling
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('resolved')}>
                    Marker som løst
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Slett valgte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Select All */}
        {filteredDebts.length > 0 && (
          <div className="mb-4">
            <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDebts.size === filteredDebts.length && filteredDebts.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Velg alle ({filteredDebts.length})</span>
            </label>
          </div>
        )}

        {/* Debt List */}
        {filteredDebts.length > 0 ? (
          <div className="space-y-4">
            {filteredDebts.map((debt) => (
              <Card key={debt.id} className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    {/* Top Row: Checkbox and Creditor Info */}
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedDebts.has(debt.id)}
                        onChange={() => toggleSelectDebt(debt.id)}
                        className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{debt.creditor.name}</h3>
                          {editingDebt === debt.id ? (
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="px-2 py-1 text-sm border border-slate-300 rounded-md"
                            >
                              <option value="active">Aktiv</option>
                              <option value="negotiating">Forhandling</option>
                              <option value="resolved">Løst</option>
                              <option value="settled">Gjort opp</option>
                            </select>
                          ) : (
                            <Badge variant={debt.status === 'active' ? 'destructive' : debt.status === 'negotiating' ? 'default' : 'secondary'}>
                              {debt.status === 'active' ? 'Aktiv' : debt.status === 'negotiating' ? 'Forhandling' : debt.status === 'resolved' ? 'Løst' : 'Gjort opp'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm">{debt.creditor.type}</p>
                        <p className="text-xs text-slate-500 mt-1" suppressHydrationWarning>
                          Opprettet: {new Date(debt.createdAt).toLocaleDateString('no-NO')}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Amount and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pl-8">
                      <div>
                        {editingDebt === debt.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(Number(e.target.value))}
                              className="w-40"
                            />
                            <span className="text-slate-600">NOK</span>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-slate-900">
                            {debt.currentAmount.toLocaleString()} NOK
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          Opprinnelig: {debt.originalAmount.toLocaleString()} NOK
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {editingDebt === debt.id ? (
                          <>
                            <Button size="sm" variant="outline" onClick={saveEdit}>
                              <Check className="w-4 h-4 mr-1" />
                              Lagre
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditing}>
                              <X className="w-4 h-4 mr-1" />
                              Avbryt
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/dashboard/debts/${debt.id}`)}
                            >
                              Se detaljer
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => startEditing(debt)}>
                              <Edit2 className="w-4 h-4 mr-1" />
                              Rediger
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteDebt(debt.id)}
                              disabled={debt.status === 'settled'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
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
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push('/dashboard/debts/add')}
              >
                Legg til din første gjeld
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}