'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PencilIcon,
    CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface Creditor {
  id: string
  name: string
  organizationNumber?: string
  type: string
  violationScore: number
  totalViolations: number
  averageSettlementRate: number
}

interface Settlement {
  id: string
  status: string
  originalAmount: number
  settledAmount?: number
  savedAmount?: number
  platformFee?: number
  proposedAt: string
  completedAt?: string
}

interface Debt {
  id: string
  originalAmount: number
  currentAmount: number
  status: string
  accountNumber?: string
  createdAt: string
  updatedAt: string
  creditor: Creditor
  settlements: Settlement[]
}

export default function DebtDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [debt, setDebt] = useState<Debt | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editAmount, setEditAmount] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [apiUrl, setApiUrl] = useState('')

  // Set API URL on client side to avoid hydration mismatch
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? window.location.origin
        : 'http://localhost:3001');
    setApiUrl(url);
  }, []);

  const fetchDebt = async () => {
    if (!apiUrl) return;
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(`${apiUrl}/api/debts/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDebt(data.debt)
        setEditAmount(data.debt.currentAmount.toString())
        setEditStatus(data.debt.status)
      } else if (response.status === 404) {
        toast.error('Gjeld ikke funnet')
        router.push('/dashboard/debts')
      }
    } catch (error) {
      console.error('Error fetching debt:', error)
      toast.error('Feil ved henting av gjeld')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id && apiUrl) {
      fetchDebt()
    }
  }, [params.id, apiUrl])

  const updateDebt = async () => {
    if (!debt || !apiUrl) return

    setUpdating(true)
    try {
      const token = localStorage.getItem('token')
      const updates: any = {}

      if (editAmount !== debt.currentAmount.toString()) {
        updates.currentAmount = parseFloat(editAmount)
      }

      if (editStatus !== debt.status) {
        updates.status = editStatus
      }

      if (Object.keys(updates).length === 0) {
        setEditMode(false)
        return
      }

      const response = await fetch(`${apiUrl}/api/debts/${debt.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        await fetchDebt()
        setEditMode(false)
        toast.success('Gjeld oppdatert')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Feil ved oppdatering')
      }
    } catch (error) {
      toast.error('Feil ved oppdatering av gjeld')
    } finally {
      setUpdating(false)
    }
  }

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

  const getRiskColor = (score: number) => {
    if (score > 40) return 'text-red-600'
    if (score > 20) return 'text-yellow-600'
    return 'text-green-600'
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('no-NO', {
      style: 'currency',
      currency: 'NOK'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-damocles-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!debt) {
    return (
      <div className="min-h-screen bg-damocles-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900">Gjeld ikke funnet</h2>
            <p className="text-gray-500 mt-2">Denne gjeldsposten eksisterer ikke eller du har ikke tilgang til den.</p>
            <Link href="/dashboard/debts">
              <Button className="mt-4">Tilbake til gjeld</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-damocles-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/debts">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Tilbake
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-damocles-primary">
                {debt.creditor.name}
              </h1>
              <p className="text-gray-600">Gjeldsinformasjon og historie</p>
            </div>
          </div>
          
          <Button
            onClick={() => setEditMode(!editMode)}
            variant="outline"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            {editMode ? 'Avbryt' : 'Rediger'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Debt Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Gjeldsoversikt</h2>
                <Badge className={`${getStatusColor(debt.status)}`}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(debt.status)}
                    {debt.status === 'active' && 'Aktiv'}
                    {debt.status === 'negotiating' && 'Forhandler'}
                    {debt.status === 'settled' && 'Løst'}
                  </span>
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Gjeldende beløp</p>
                  {editMode ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      step="0.01"
                      className="text-2xl font-bold text-damocles-primary bg-transparent border-b border-gray-300 focus:border-damocles-accent outline-none w-full"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-damocles-primary" suppressHydrationWarning>
                      {formatCurrency(debt.currentAmount)}
                    </p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Opprinnelig beløp</p>
                  <p className="text-2xl font-bold text-gray-600" suppressHydrationWarning>
                    {formatCurrency(debt.originalAmount)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {editMode ? (
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-damocles-accent focus:border-transparent"
                    >
                      <option value="active">Aktiv</option>
                      <option value="negotiating">Under forhandling</option>
                      <option value="settled">Løst</option>
                    </select>
                  ) : (
                    <p className="font-semibold text-gray-900 mt-1">
                      {debt.status === 'active' && 'Aktiv'}
                      {debt.status === 'negotiating' && 'Under forhandling'}
                      {debt.status === 'settled' && 'Løst'}
                    </p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Kontonummer</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {debt.accountNumber || 'Ikke oppgitt'}
                  </p>
                </div>
              </div>

              {editMode && (
                <div className="flex gap-4 mt-6 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setEditMode(false)
                      setEditAmount(debt.currentAmount.toString())
                      setEditStatus(debt.status)
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Avbryt
                  </Button>
                  <Button
                    onClick={updateDebt}
                    disabled={updating}
                    className="flex-1"
                  >
                    {updating ? 'Lagrer...' : 'Lagre endringer'}
                  </Button>
                </div>
              )}
            </Card>

            {/* Settlement History */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Oppgjørshistorie</h2>
              
              {debt.settlements.length === 0 ? (
                <div className="text-center py-8">
                  <BanknotesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen oppgjør ennå</h3>
                  <p className="text-gray-500 mb-4">
                    Det har ikke vært noen oppgjørsforhandlinger for denne gjelden.
                  </p>
                  <Button>Start forhandling</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {debt.settlements.map((settlement, index) => (
                    <motion.div
                      key={settlement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">
                            Oppgjør #{index + 1}
                          </h4>
                          <p className="text-sm text-gray-500" suppressHydrationWarning>
                            Foreslått {new Date(settlement.proposedAt).toLocaleDateString('no-NO')}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(settlement.status)}`}>
                          {settlement.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Opprinnelig</p>
                          <p className="font-semibold" suppressHydrationWarning>
                            {formatCurrency(settlement.originalAmount)}
                          </p>
                        </div>

                        {settlement.settledAmount && (
                          <div>
                            <p className="text-gray-500">Oppgjørsbeløp</p>
                            <p className="font-semibold text-green-600" suppressHydrationWarning>
                              {formatCurrency(settlement.settledAmount)}
                            </p>
                          </div>
                        )}

                        {settlement.savedAmount && (
                          <div>
                            <p className="text-gray-500">Spart</p>
                            <p className="font-semibold text-green-600" suppressHydrationWarning>
                              {formatCurrency(settlement.savedAmount)}
                            </p>
                          </div>
                        )}

                        {settlement.platformFee && (
                          <div>
                            <p className="text-gray-500">Plattformavgift</p>
                            <p className="font-semibold" suppressHydrationWarning>
                              {formatCurrency(settlement.platformFee)}
                            </p>
                          </div>
                        )}
                      </div>

                      {settlement.completedAt && (
                        <p className="text-sm text-gray-500 mt-2" suppressHydrationWarning>
                          Fullført {new Date(settlement.completedAt).toLocaleDateString('no-NO')}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creditor Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Kreditorinformasjon</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Navn</p>
                  <p className="font-semibold">{debt.creditor.name}</p>
                </div>
                
                {debt.creditor.organizationNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Org.nummer</p>
                    <p className="font-semibold">{debt.creditor.organizationNumber}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold capitalize">{debt.creditor.type}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Overtredelsescore</p>
                  <p className={`font-semibold ${getRiskColor(debt.creditor.violationScore)}`}>
                    {debt.creditor.violationScore} / 100
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {debt.creditor.totalViolations} totale overtredelser
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Gjennomsnittlig oppgjør</p>
                  <p className="font-semibold text-green-600">
                    {(debt.creditor.averageSettlementRate * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Handlinger</h3>
              
              <div className="space-y-3">
                <Link href={`/dashboard/debts/${debt.id}/gdpr`}>
                  <Button className="w-full" variant="outline">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    GDPR-forespørsel
                  </Button>
                </Link>
                
                <Button className="w-full" variant="outline">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                  Start forhandling
                </Button>
                
                <Button className="w-full" variant="outline">
                  <BanknotesIcon className="w-4 h-4 mr-2" />
                  Foreslå oppgjør
                </Button>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Tidslinje</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-damocles-accent rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Gjeld opprettet</p>
                    <p className="text-sm text-gray-500" suppressHydrationWarning>
                      {new Date(debt.createdAt).toLocaleDateString('no-NO')}
                    </p>
                  </div>
                </div>

                {debt.updatedAt !== debt.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Sist oppdatert</p>
                      <p className="text-sm text-gray-500" suppressHydrationWarning>
                        {new Date(debt.updatedAt).toLocaleDateString('no-NO')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}