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
  PaperAirplaneIcon,
  XCircleIcon,
  UserIcon,
  EnvelopeIcon,
  EyeIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline'
// XCircleIcon to be imported with outline icons
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import toast from 'react-hot-toast'
import DOMPurify from 'dompurify'

// Helper function to safely sanitize HTML content
const sanitizeContent = (html: string, maxLength?: number): string => {
  try {
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: []
    });

    if (maxLength) {
      const div = document.createElement('div');
      div.innerHTML = sanitized;
      const text = div.textContent || div.innerText || '';
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }

    return sanitized;
  } catch (error) {
    console.error('Sanitization error:', error);
    return '';
  }
};

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

interface UserProfile {
  gdprProfileComplete: boolean
  name?: string
  email: string
}

interface EmailTracking {
  id: string
  subject: string
  status: string
  sentAt?: string
  deliveredAt?: string
  respondedAt?: string
  trackingPixelViewed: boolean
  createdAt: string
}

// Helper function to safely parse JWT token
const getUserIdFromToken = (token: string | null): string | null => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.userId || payload.sub || null;
  } catch (error) {
    console.error('Token parsing error:', error);
    return null;
  }
};

export default function GDPRRequestPage() {
  const params = useParams()
  const router = useRouter()
  const [debt, setDebt] = useState<Debt | null>(null)
  const [gdprRequests, setGdprRequests] = useState<GDPRRequest[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState('')
  const [mounted, setMounted] = useState(false)
  const [apiUrl, setApiUrl] = useState('')
  const [gdprApiUrl, setGdprApiUrl] = useState('')
  const [emailHistory, setEmailHistory] = useState<Record<string, EmailTracking[]>>({})

  // Set API URLs on client side to avoid hydration mismatch
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? window.location.origin
        : 'http://localhost:3001');
    setApiUrl(url);

    const gdprUrl = process.env.NEXT_PUBLIC_GDPR_ENGINE_URL ||
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? `${window.location.origin}/gdpr-api`
        : 'http://localhost:8001');
    setGdprApiUrl(gdprUrl);
  }, []);

  const fetchData = async () => {
    if (!apiUrl || !gdprApiUrl) return;

    console.log('Fetching debt and GDPR data...', { debtId: params.id, apiUrl, gdprApiUrl })

    try {
      const token = localStorage.getItem('token')

      // Fetch user profile to check if GDPR profile is complete
      const profileResponse = await fetch(`${apiUrl}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile({
          gdprProfileComplete: profileData.user.gdprProfileComplete,
          name: profileData.user.name,
          email: profileData.user.email
        })
      }

      const debtResponse = await fetch(`${apiUrl}/api/debts/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log('Debt fetch response:', debtResponse.status)

      if (debtResponse.ok) {
        const debtData = await debtResponse.json()
        console.log('Debt data:', debtData)
        setDebt(debtData.debt)

        // Get user ID from token safely
        const userId = getUserIdFromToken(token)
        if (!userId) {
          toast.error('Ugyldig autentisering')
          router.push('/login')
          return
        }

        // Get GDPR requests for this user
        const gdprResponse = await fetch(`${gdprApiUrl}/gdpr/requests/${userId}`, {
          headers: { 'Content-Type': 'application/json' }
        })

        console.log('GDPR fetch response:', gdprResponse.status)

        if (gdprResponse.ok) {
          const gdprData = await gdprResponse.json()
          console.log('GDPR data:', gdprData)
          setGdprRequests(gdprData.requests || [])
        }
      } else {
        console.error('Debt not found, status:', debtResponse.status)
        toast.error('Gjeld ikke funnet')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Feil ved henting av data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id && apiUrl && gdprApiUrl) {
      fetchData()
    }
  }, [params.id, apiUrl, gdprApiUrl])

  useEffect(() => {
    setMounted(true)
  }, [])

  const generateGDPRRequest = async () => {
    if (!debt || !gdprApiUrl) return

    // Check if profile is complete before generating GDPR request
    if (!userProfile?.gdprProfileComplete) {
      toast.error('Du må fullføre profilen din før du kan generere GDPR forespørsler')
      // Save current path to return after profile completion
      sessionStorage.setItem('profileCompleteReturnUrl', window.location.pathname)
      router.push('/dashboard/profile/complete')
      return
    }

    setGenerating(true)
    try {
      const token = localStorage.getItem('token')
      const userId = getUserIdFromToken(token)

      if (!userId) {
        toast.error('Ugyldig autentisering')
        router.push('/login')
        setGenerating(false)
        return
      }

      console.log('Generating GDPR request...', { userId, creditorId: debt.creditor.id, gdprApiUrl })

      const response = await fetch(`${gdprApiUrl}/gdpr/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          creditor_id: debt.creditor.id,
          request_type: 'article_15'
        })
      })

      console.log('Generate response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('GDPR request generated:', data)
        toast.success('GDPR forespørsel generert!')
        await fetchData() // Refresh data
      } else {
        const error = await response.json()
        console.error('Failed to generate GDPR request:', error)
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
    if (!apiUrl) return

    setSending(requestId)
    try {
      const token = localStorage.getItem('token')
      console.log('Sending GDPR request via email...', { requestId, apiUrl })

      const response = await fetch(`${apiUrl}/api/email/send-gdpr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gdprRequestId: requestId
        })
      })

      console.log('Send response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('GDPR request sent via email:', data)
        toast.success(`GDPR forespørsel sendt til ${data.sentTo}!`)
        console.log('Refreshing data after send...')
        await fetchData() // Refresh data
        await fetchEmailHistory(requestId) // Fetch email history
        console.log('Data refreshed')
      } else {
        const error = await response.json()
        console.error('Failed to send GDPR request:', error)
        toast.error(error.error || 'Feil ved sending av GDPR forespørsel')
      }
    } catch (error) {
      console.error('Error sending GDPR request:', error)
      toast.error('Feil ved sending av GDPR forespørsel')
    } finally {
      setSending('')
    }
  }

  const fetchEmailHistory = async (requestId: string) => {
    if (!apiUrl) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${apiUrl}/api/email/gdpr/${requestId}/emails`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEmailHistory(prev => ({
          ...prev,
          [requestId]: data.emails
        }))
      }
    } catch (error) {
      console.error('Error fetching email history:', error)
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
      case 'escalated': return <XCircleIcon className="w-4 h-4" />
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

        {/* Profile Incomplete Warning */}
        {userProfile && !userProfile.gdprProfileComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <XCircleIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    Profil ufullstendig
                  </h3>
                  <p className="text-sm text-yellow-800 mb-4">
                    For å generere lovlige GDPR-forespørsler må vi kunne verifisere din identitet.
                    I henhold til GDPR Artikkel 12(6) kan kreditorer kreve identitetsbekreftelse før
                    de utleverer personopplysninger.
                  </p>
                  <Button
                    onClick={() => {
                      sessionStorage.setItem('profileCompleteReturnUrl', window.location.pathname)
                      router.push('/dashboard/profile/complete')
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Fullfør profil
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

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
              disabled={generating || !userProfile?.gdprProfileComplete}
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
                      <p className="text-sm text-gray-500" suppressHydrationWarning>
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
                        <p className="font-semibold" suppressHydrationWarning>
                          {new Date(request.sent_at).toLocaleDateString('no-NO')}
                        </p>
                      </div>
                      
                      {request.response_due && (
                        <div>
                          <p className="text-gray-500">Svar frist</p>
                          <p className="font-semibold" suppressHydrationWarning>
                            {new Date(request.response_due).toLocaleDateString('no-NO')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Email Tracking Timeline */}
                  {request.status.toLowerCase() !== 'pending' && mounted && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <EnvelopeIcon className="w-4 h-4" />
                        E-postsporing
                      </h5>
                      <div className="space-y-2">
                        {emailHistory[request.id]?.length > 0 ? (
                          emailHistory[request.id].map((email, idx) => (
                            <div key={email.id} className="text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                <span className="font-medium">Sendt</span>
                                <span className="text-gray-500" suppressHydrationWarning>
                                  {email.sentAt && new Date(email.sentAt).toLocaleString('no-NO')}
                                </span>
                              </div>
                              {email.deliveredAt && (
                                <div className="flex items-center gap-2 mb-1 ml-6">
                                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                  <span className="font-medium">Levert</span>
                                  <span className="text-gray-500" suppressHydrationWarning>
                                    {new Date(email.deliveredAt).toLocaleString('no-NO')}
                                  </span>
                                </div>
                              )}
                              {email.trackingPixelViewed && (
                                <div className="flex items-center gap-2 mb-1 ml-6">
                                  <EyeIcon className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium">Åpnet av mottaker</span>
                                </div>
                              )}
                              {email.respondedAt && (
                                <div className="flex items-center gap-2 ml-6">
                                  <ArrowUturnLeftIcon className="w-4 h-4 text-indigo-600" />
                                  <span className="font-medium">Svar mottatt</span>
                                  <span className="text-gray-500" suppressHydrationWarning>
                                    {new Date(email.respondedAt).toLocaleString('no-NO')}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <button
                            onClick={() => fetchEmailHistory(request.id)}
                            className="text-sm text-damocles-accent hover:underline"
                          >
                            Last inn e-posthistorikk
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {request.content && mounted && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-damocles-accent font-medium hover:underline">
                        Vis fullstendig forespørsel innhold
                      </summary>
                      <div className="mt-2 p-4 bg-gray-50 rounded text-sm max-h-96 overflow-y-auto border border-gray-200">
                        <div dangerouslySetInnerHTML={{ __html: sanitizeContent(request.content) }} />
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