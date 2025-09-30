'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Bell,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Download,
  Check,
  X,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserSettings {
  emailNotifications: boolean
  gdprAlerts: boolean
  settlementUpdates: boolean
  weeklyReports: boolean
  marketingEmails: boolean
  allowDataAnalysis: boolean
  anonymousStatistics: boolean
}

export default function SettingsPage() {
  const { user, token, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    gdprAlerts: true,
    settlementUpdates: true,
    weeklyReports: false,
    marketingEmails: false,
    allowDataAnalysis: true,
    anonymousStatistics: true,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSaveSettings = async () => {
    setLoading(true)
    setMessage(null)

    try {
      // In production, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 500))
      localStorage.setItem('userSettings', JSON.stringify(settings))
      setMessage({ type: 'success', text: 'Innstillinger lagret!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Kunne ikke lagre innstillinger' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passordene matcher ikke' })
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Passord må være minst 8 tegn' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Passord endret!' })
        setShowPasswordChange(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Kunne ikke endre passord' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Nettverksfeil. Vennligst prøv igjen.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadData = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`http://localhost:3001/api/users/export-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `damocles-data-${user?.id}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setMessage({ type: 'success', text: 'Data lastet ned!' })
      } else {
        setMessage({ type: 'error', text: 'Kunne ikke laste ned data' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Nettverksfeil. Vennligst prøv igjen.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`http://localhost:3001/api/users/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Konto slettet' })
        setTimeout(() => logout(), 2000)
      } else {
        setMessage({ type: 'error', text: 'Kunne ikke slette konto' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Nettverksfeil. Vennligst prøv igjen.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Innstillinger</h1>
        <p className="text-slate-600">Administrer dine preferanser og kontoinnstillinger</p>
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

      <div className="space-y-6">
        {/* Notification Settings */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Varsler</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">E-postvarsler</p>
                <p className="text-xs text-slate-600">Motta viktige oppdateringer på e-post</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">GDPR varsler</p>
                <p className="text-xs text-slate-600">Varsler om GDPR forespørsler og svar</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, gdprAlerts: !settings.gdprAlerts })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.gdprAlerts ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.gdprAlerts ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Forliksoppdateringer</p>
                <p className="text-xs text-slate-600">Varsler om nye forliksmuligheter</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, settlementUpdates: !settings.settlementUpdates })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.settlementUpdates ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.settlementUpdates ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Ukentlig rapport</p>
                <p className="text-xs text-slate-600">Motta ukentlig oppsummering</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, weeklyReports: !settings.weeklyReports })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.weeklyReports ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Markedsføring</p>
                <p className="text-xs text-slate-600">Motta nyheter og tilbud</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, marketingEmails: !settings.marketingEmails })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.marketingEmails ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleSaveSettings}
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? 'Lagrer...' : 'Lagre innstillinger'}
            </Button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Personvern</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Tillat dataanalyse</p>
                <p className="text-xs text-slate-600">Hjelp oss forbedre tjenesten med anonymiserte data</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, allowDataAnalysis: !settings.allowDataAnalysis })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.allowDataAnalysis ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.allowDataAnalysis ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Anonym statistikk</p>
                <p className="text-xs text-slate-600">Del anonymisert statistikk for forskning</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, anonymousStatistics: !settings.anonymousStatistics })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.anonymousStatistics ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.anonymousStatistics ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Sikkerhet</h2>
          </div>

          {!showPasswordChange ? (
            <Button
              onClick={() => setShowPasswordChange(true)}
              variant="outline"
              className="w-full justify-start"
            >
              <Lock className="h-4 w-4 mr-2" />
              Endre passord
            </Button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nåværende passord</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nytt passord</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bekreft nytt passord</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
                  {loading ? 'Endrer...' : 'Endre passord'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordChange(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                >
                  Avbryt
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Data Management */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Download className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Dine data</h2>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleDownloadData}
              disabled={loading}
              variant="outline"
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Last ned alle mine data (GDPR)
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-900">Faresone</h2>
          </div>

          {!showDeleteConfirm ? (
            <div>
              <p className="text-sm text-red-800 mb-4">
                Når du sletter kontoen din, vil alle dine data bli permanent fjernet. Dette kan ikke angres.
              </p>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Slett kontoen min
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-red-800 mb-4 font-semibold">
                Er du sikker? Dette vil permanent slette all din data og kan ikke angres.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {loading ? 'Sletter...' : 'Ja, slett kontoen min'}
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                >
                  Avbryt
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}