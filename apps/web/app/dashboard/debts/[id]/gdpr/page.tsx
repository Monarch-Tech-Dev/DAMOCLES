'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import toast from 'react-hot-toast'

interface Debt {
  id: string
  creditor: {
    id: string
    name: string
    type: string
    violationScore: number
  }
}

interface GDPRRequest {
  id: string
  reference_id: string
  status: string
  sent_at?: string
  response_due?: string
  content?: string
  created_at: string
}

export default function GDPRRequestPage() {
  const params = useParams()
  const router = useRouter()
  const [debt, setDebt] = useState<Debt | null>(null)
  const [gdprRequests, setGdprRequests] = useState<GDPRRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState('')

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Get debt details
      const debtResponse = await fetch(`http://localhost:3000/api/debts/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (debtResponse.ok) {
        const debtData = await debtResponse.json()
        setDebt(debtData.debt)
        
        // Get user ID from token (simplified for demo)
        const userPayload = JSON.parse(atob(token!.split('.')[1]))
        const userId = userPayload.userId
        
        // Get GDPR requests for this user
        const gdprResponse = await fetch(`http://localhost:8001/gdpr/requests/${userId}`, {
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (gdprResponse.ok) {
          const gdprData = await gdprResponse.json()
          setGdprRequests(gdprData.requests || [])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Feil ved henting av data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const generateGDPRRequest = async () => {
    if (!debt) return
    
    setGenerating(true)
    try {
      const token = localStorage.getItem('token')
      const userPayload = JSON.parse(atob(token!.split('.')[1]))
      
      const response = await fetch('http://localhost:8001/gdpr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userPayload.userId,
          creditor_id: debt.creditor.id,
          request_type: 'article_15'
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('GDPR forespørsel generert!')
        await fetchData() // Refresh data
      } else {
        throw new Error('Failed to generate GDPR request')
      }
    } catch (error) {
      console.error('Error generating GDPR request:', error)
      toast.error('Feil ved generering av GDPR forespørsel')
    } finally {
      setGenerating(false)
    }
  }

  const sendGDPRRequest = async (requestId: string) => {
    setSending(requestId)
    try {
      const response = await fetch(`http://localhost:8001/gdpr/send/${requestId}`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('GDPR forespørsel sendt!')
        await fetchData() // Refresh data
      } else {
        throw new Error('Failed to send GDPR request')
      }
    } catch (error) {
      console.error('Error sending GDPR request:', error)
      toast.error('Feil ved sending av GDPR forespørsel')
    } finally {
      setSending('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'responded': return 'bg-green-100 text-green-800'
      case 'escalated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <ClockIcon className="w-4 h-4" />
      case 'sent': return <PaperAirplaneIcon className="w-4 h-4" />
      case 'responded': return <CheckCircleIcon className="w-4 h-4" />
      case 'escalated': return <ExclamationTriangleIcon className="w-4 h-4" />
      default: return <DocumentTextIcon className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-damocles-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!debt) {
    return (
      <div className="min-h-screen bg-damocles-gray-50 p-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Gjeld ikke funnet</h2>
          <Link href="/dashboard/debts">
            <Button className="mt-4">Tilbake til gjeld</Button>
          </Link>
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
            <Link href={`/dashboard/debts/${params.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Tilbake
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-damocles-primary">
                GDPR Forespørsler
              </h1>
              <p className="text-gray-600">{debt.creditor.name}</p>
            </div>
          </div>
        </div>

        {/* Creditor Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Kreditor Informasjon</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Navn</p>
              <p className="font-semibold">{debt.creditor.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-semibold capitalize">{debt.creditor.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Overtredelsescore</p>
              <p className={`font-semibold ${
                debt.creditor.violationScore > 40 ? 'text-red-600' :
                debt.creditor.violationScore > 20 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {debt.creditor.violationScore} / 100
              </p>
            </div>
          </div>
        </Card>

        {/* Generate New Request */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Ny GDPR Forespørsel</h3>
              <p className="text-gray-600">
                Generer automatisk GDPR Artikkel 15 forespørsel for denne kreditoren
              </p>
            </div>
            <Button
              onClick={generateGDPRRequest}
              disabled={generating}
              className="bg-damocles-accent hover:bg-indigo-700"
            >
              {generating ? (
                'Genererer...'
              ) : (
                <>
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Generer Forespørsel
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* GDPR Requests List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Mine GDPR Forespørsler</h2>
          
          {gdprRequests.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen forespørsler ennå</h3>
              <p className="text-gray-500 mb-4">
                Du har ikke sendt noen GDPR forespørsler til denne kreditoren.
              </p>
              <Button onClick={generateGDPRRequest} disabled={generating}>
                Opprett din første forespørsel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {gdprRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">
                        Forespørsel #{request.reference_id}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Opprettet {new Date(request.created_at).toLocaleDateString('no-NO')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(request.status)}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </Badge>
                      
                      {request.status.toLowerCase() === 'pending' && (
                        <Button
                          onClick={() => sendGDPRRequest(request.id)}
                          disabled={sending === request.id}
                          size="sm"
                        >
                          {sending === request.id ? (
                            'Sender...'
                          ) : (
                            <>
                              <PaperAirplaneIcon className="w-4 h-4 mr-1" />
                              Send
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {request.sent_at && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Sendt</p>
                        <p className="font-semibold">
                          {new Date(request.sent_at).toLocaleDateString('no-NO')}
                        </p>
                      </div>
                      
                      {request.response_due && (
                        <div>
                          <p className="text-gray-500">Svar frist</p>
                          <p className="font-semibold">
                            {new Date(request.response_due).toLocaleDateString('no-NO')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {request.content && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-damocles-accent font-medium">
                        Vis forespørsel innhold
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded text-sm max-h-40 overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: request.content.substring(0, 500) + '...' }} />
                      </div>
                    </details>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}