'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { User, Shield, Mail, Phone, Calendar, Award, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { user, token } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('http://localhost:3001/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profil oppdatert!' })
        setIsEditing(false)

        // Update localStorage
        const userData = await response.json()
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Kunne ikke oppdatere profil' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Nettverksfeil. Vennligst prøv igjen.' })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Ikke tilgjengelig'
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getShieldColor = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum shield':
        return 'from-slate-400 to-slate-600'
      case 'gold shield':
        return 'from-yellow-400 to-yellow-600'
      case 'silver shield':
        return 'from-gray-300 to-gray-500'
      default:
        return 'from-orange-400 to-orange-600'
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Min Profil</h1>
        <p className="text-slate-600">Administrer din personlige informasjon og preferanser</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Personlig Informasjon</h2>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="text-sm"
              >
                Rediger profil
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Fullt navn
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ditt fulle navn"
                />
              ) : (
                <p className="text-slate-900 px-4 py-2 bg-slate-50 rounded-lg">{user?.name || 'Ikke oppgitt'}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                E-post
              </label>
              <p className="text-slate-900 px-4 py-2 bg-slate-50 rounded-lg">{user?.email}</p>
              <p className="text-xs text-slate-500 mt-1">E-post kan ikke endres</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Telefonnummer
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+47 XXX XX XXX"
                />
              ) : (
                <p className="text-slate-900 px-4 py-2 bg-slate-50 rounded-lg">{user?.phoneNumber || 'Ikke oppgitt'}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {loading ? 'Lagrer...' : 'Lagre endringer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phoneNumber: user?.phoneNumber || '',
                    })
                  }}
                >
                  Avbryt
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Account Info Card */}
        <div className="space-y-6">
          {/* Shield Tier */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${getShieldColor(user?.shieldTier)} rounded-xl flex items-center justify-center shadow-sm`}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Shield Tier</p>
                <p className="text-lg font-semibold text-slate-900">{user?.shieldTier || 'Bronze Shield'}</p>
              </div>
            </div>
          </div>

          {/* Token Balance */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">SWORD Tokens</p>
                <p className="text-lg font-semibold text-slate-900">{user?.tokenBalance?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Verifiseringsstatus</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Vipps</span>
                {user?.vippsVerified ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Check className="h-3 w-3" />
                    Verifisert
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    <X className="h-3 w-3" />
                    Ikke verifisert
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Account Dates */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Kontoinformasjon</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-600 mb-1">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Medlem siden
                </p>
                <p className="text-sm text-slate-900">{formatDate(user?.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Sist innlogget
                </p>
                <p className="text-sm text-slate-900">{formatDate(user?.lastLoginAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}