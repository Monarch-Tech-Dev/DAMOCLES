'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Search,
  Plus,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface Creditor {
  id: string
  name: string
  organizationNumber?: string
  type: string
  violationScore: number
  averageSettlementRate: number
  _count: {
    debts: number
  }
}

interface CreditorType {
  value: string
  label: string
  description: string
}

export default function AddDebtPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchingCreditors, setSearchingCreditors] = useState(false)
  
  // Form data
  const [selectedCreditor, setSelectedCreditor] = useState<Creditor | null>(null)
  const [originalAmount, setOriginalAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  
  // Creditor search
  const [creditorSearch, setCreditorSearch] = useState('')
  const [creditors, setCreditors] = useState<Creditor[]>([])
  const [creditorTypes, setCreditorTypes] = useState<CreditorType[]>([])
  
  // New creditor form
  const [showNewCreditorForm, setShowNewCreditorForm] = useState(false)
  const [newCreditorName, setNewCreditorName] = useState('')
  const [newCreditorOrgNumber, setNewCreditorOrgNumber] = useState('')
  const [newCreditorType, setNewCreditorType] = useState('')
  const [newCreditorEmail, setNewCreditorEmail] = useState('')

  const searchCreditors = async (searchTerm: string = '') => {
    setSearchingCreditors(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`${apiUrl}/api/creditors?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (response.ok) {
        const data = await response.json()
        setCreditors(data.creditors || [])
      } else {
        console.error('Failed to fetch creditors:', response.statusText)
        toast.error('Kunne ikke laste kreditorer')
      }
    } catch (error) {
      console.error('Error searching creditors:', error)
      toast.error('Nettverksfeil ved lasting av kreditorer')
    } finally {
      setSearchingCreditors(false)
    }
  }

  const fetchCreditorTypes = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/creditors/types`)

      if (response.ok) {
        const data = await response.json()
        setCreditorTypes(data.types || [])
      } else {
        console.error('Failed to fetch creditor types')
      }
    } catch (error) {
      console.error('Error fetching creditor types:', error)
    }
  }

  useEffect(() => {
    searchCreditors()
    fetchCreditorTypes()
  }, [])

  useEffect(() => {
    if (creditorSearch) {
      const debounce = setTimeout(() => {
        searchCreditors(creditorSearch)
      }, 300)
      return () => clearTimeout(debounce)
    } else {
      searchCreditors()
    }
  }, [creditorSearch])

  const createNewCreditor = async () => {
    if (!newCreditorName || !newCreditorType) {
      toast.error('Navn og type er påkrevd')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Du må være logget inn')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

      const response = await fetch(`${apiUrl}/api/creditors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCreditorName,
          organizationNumber: newCreditorOrgNumber || undefined,
          type: newCreditorType,
          privacyEmail: newCreditorEmail || undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        const newCreditor: Creditor = {
          ...data.creditor,
          averageSettlementRate: data.creditor.averageSettlementRate || 0,
          _count: { debts: 0 }
        }

        setSelectedCreditor(newCreditor)
        setShowNewCreditorForm(false)
        setStep(2)
        toast.success('Ny kreditor opprettet')

        // Refresh creditor list
        await searchCreditors(creditorSearch)
      } else if (response.status === 409) {
        const data = await response.json()
        toast.error('Kreditor finnes allerede')

        // If creditor exists, use it
        if (data.creditor) {
          const existingCreditor: Creditor = {
            ...data.creditor,
            averageSettlementRate: 0,
            _count: { debts: 0 }
          }
          setSelectedCreditor(existingCreditor)
          setShowNewCreditorForm(false)
          setStep(2)
        }
      } else {
        const data = await response.json()
        toast.error(data.error || 'Feil ved opprettelse av kreditor')
      }
    } catch (error) {
      console.error('Error creating creditor:', error)
      toast.error('Nettverksfeil ved opprettelse av kreditor')
    } finally {
      setLoading(false)
    }
  }

  const submitDebt = async () => {
    if (!selectedCreditor || !originalAmount || !currentAmount) {
      toast.error('Alle påkrevde felt må fylles ut')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Du må være logget inn')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

      const response = await fetch(`${apiUrl}/api/debts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          creditorId: selectedCreditor.id,
          originalAmount: parseFloat(originalAmount),
          currentAmount: parseFloat(currentAmount),
          accountNumber: accountNumber || undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Gjeld lagt til')
        router.push('/dashboard/debts')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Feil ved opprettelse av gjeld')
      }
    } catch (error) {
      console.error('Error submitting debt:', error)
      toast.error('Nettverksfeil ved opprettelse av gjeld')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score > 40) return 'text-red-600'
    if (score > 20) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-damocles-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/debts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-damocles-primary">Legg til gjeld</h1>
            <p className="text-gray-600">Registrer en ny gjeld for sporing og behandling</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 1 ? 'bg-damocles-accent text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-damocles-accent' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 2 ? 'bg-damocles-accent text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Select Creditor */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Velg kreditor</h2>
              
              {/* Search */}
              <div className="relative mb-6">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Søk etter kreditor..."
                  value={creditorSearch}
                  onChange={(e) => setCreditorSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Create New Creditor Button */}
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => setShowNewCreditorForm(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Opprett ny kreditor
                </Button>
              </div>

              {/* Creditors List */}
              {searchingCreditors ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {creditors.map(creditor => (
                    <motion.div
                      key={creditor.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedCreditor(creditor)
                        setStep(2)
                      }}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-damocles-accent hover:bg-blue-50 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-damocles-primary">
                            {creditor.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {creditor.organizationNumber && `Org.nr: ${creditor.organizationNumber}`}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {creditor.type}
                            </span>
                            <span className="text-gray-500">
                              {creditor._count.debts} gjeldsposter
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-500">Overtredelsescore</p>
                          <p className={`font-semibold ${getRiskColor(creditor.violationScore)}`}>
                            {creditor.violationScore}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {creditors.length === 0 && !searchingCreditors && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Ingen kreditorer funnet</p>
                </div>
              )}
            </Card>

            {/* New Creditor Modal */}
            {showNewCreditorForm && (
              <Card className="p-6 border-2 border-damocles-accent">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Opprett ny kreditor</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewCreditorForm(false)}
                  >
                    Avbryt
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="creditorName">Navn *</Label>
                    <Input
                      id="creditorName"
                      value={newCreditorName}
                      onChange={(e) => setNewCreditorName(e.target.value)}
                      placeholder="F.eks. DNB Bank"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="orgNumber">Organisasjonsnummer</Label>
                    <Input
                      id="orgNumber"
                      value={newCreditorOrgNumber}
                      onChange={(e) => setNewCreditorOrgNumber(e.target.value)}
                      placeholder="9 siffer"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="creditorType">Type *</Label>
                    <select
                      id="creditorType"
                      value={newCreditorType}
                      onChange={(e) => setNewCreditorType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-damocles-accent focus:border-transparent"
                    >
                      <option value="">Velg type</option>
                      {creditorTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="privacyEmail">Personvern e-post</Label>
                    <Input
                      id="privacyEmail"
                      type="email"
                      value={newCreditorEmail}
                      onChange={(e) => setNewCreditorEmail(e.target.value)}
                      placeholder="personvern@eksempel.no"
                    />
                  </div>
                  
                  <Button
                    onClick={createNewCreditor}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Oppretter...' : 'Opprett kreditor'}
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* Step 2: Debt Details */}
        {step === 2 && selectedCreditor && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Gjeldsinformasjon</h2>
              
              {/* Selected Creditor */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-damocles-primary">
                      {selectedCreditor.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedCreditor.organizationNumber && `Org.nr: ${selectedCreditor.organizationNumber}`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep(1)}
                  >
                    Endre
                  </Button>
                </div>
                
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className={getRiskColor(selectedCreditor.violationScore)}>
                      Overtredelsescore: {selectedCreditor.violationScore}
                    </span>
                  </span>
                  <span className="text-green-600">
                    Gj.snitt oppgjør: {(selectedCreditor.averageSettlementRate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="originalAmount">Opprinnelig beløp *</Label>
                  <Input
                    id="originalAmount"
                    type="number"
                    value={originalAmount}
                    onChange={(e) => setOriginalAmount(e.target.value)}
                    placeholder="Beløp i NOK"
                    step="0.01"
                    min="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Det originale gjeldsbeløpet
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="currentAmount">Gjeldende beløp *</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="Beløp i NOK"
                    step="0.01"
                    min="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Det nåværende gjeldsbeløpet (inkl. renter og gebyrer)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="accountNumber">Kontonummer / Referanse</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Kontonummer eller referansenummer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Valgfritt - hjelper med identifisering
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Tilbake
                </Button>
                <Button
                  onClick={submitDebt}
                  disabled={loading || !originalAmount || !currentAmount}
                  className="flex-1"
                >
                  {loading ? 'Legger til...' : 'Legg til gjeld'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}