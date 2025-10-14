'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  UserIcon,
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
  PhoneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface ProfileData {
  name: string
  streetAddress: string
  postalCode: string
  city: string
  country: string
  dateOfBirth: string
  phoneNumber: string
}

export default function ProfileCompletePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [apiUrl, setApiUrl] = useState('')
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    streetAddress: '',
    postalCode: '',
    city: '',
    country: 'Norway',
    dateOfBirth: '',
    phoneNumber: ''
  })

  // Set API URL on client side
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? window.location.origin
        : 'http://localhost:3001');
    setApiUrl(url);
  }, []);

  // Fetch existing profile data
  useEffect(() => {
    if (!apiUrl) return;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${apiUrl}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          const user = data.user

          setFormData({
            name: user.name || '',
            streetAddress: user.streetAddress || '',
            postalCode: user.postalCode || '',
            city: user.city || '',
            country: user.country || 'Norway',
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            phoneNumber: user.phoneNumber || ''
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [apiUrl])

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.name || formData.name.length < 2) {
      toast.error('Vennligst skriv inn ditt fulle navn')
      return false
    }
    if (!formData.streetAddress || formData.streetAddress.length < 5) {
      toast.error('Vennligst skriv inn din gateadresse')
      return false
    }
    if (!formData.postalCode || formData.postalCode.length < 4) {
      toast.error('Vennligst skriv inn et gyldig postnummer')
      return false
    }
    if (!formData.city || formData.city.length < 2) {
      toast.error('Vennligst skriv inn din by')
      return false
    }
    if (!formData.dateOfBirth) {
      toast.error('Vennligst velg din fødselsdato')
      return false
    }

    // Validate date of birth is not in the future and user is at least 18
    const dob = new Date(formData.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - dob.getFullYear()

    if (dob > today) {
      toast.error('Fødselsdato kan ikke være i fremtiden')
      return false
    }
    if (age < 18) {
      toast.error('Du må være minst 18 år gammel')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (!apiUrl) {
      toast.error('API ikke tilgjengelig')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()

        if (data.user.gdprProfileComplete) {
          toast.success('Profilen din er fullført!')

          // Redirect back to where they came from or to dashboard
          const returnUrl = sessionStorage.getItem('profileCompleteReturnUrl')
          sessionStorage.removeItem('profileCompleteReturnUrl')

          router.push(returnUrl || '/dashboard')
        } else {
          toast.error('Vennligst fyll ut alle obligatoriske felt')
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Feil ved oppdatering av profil')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Feil ved oppdatering av profil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-damocles-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-damocles-accent rounded-full mb-4">
                <CheckCircleIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-damocles-primary mb-2">
                Fullfør din profil
              </h1>
              <p className="text-gray-600">
                For å generere lovlige GDPR-forespørsler må vi kunne verifisere din identitet
              </p>
            </div>

            {/* Legal explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Hvorfor trenger vi denne informasjonen?</h3>
              <p className="text-sm text-blue-800">
                I henhold til GDPR Artikkel 12(6) kan kreditorer kreve identitetsbekreftelse før de
                utleverer personopplysninger. Uten disse detaljene kan kreditorer lovlig avvise forespørselen din.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4" />
                  Fullt navn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ola Nordmann"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-damocles-accent focus:border-transparent"
                  required
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <HomeIcon className="w-4 h-4" />
                  Gateadresse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  placeholder="Storgata 1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-damocles-accent focus:border-transparent"
                  required
                />
              </div>

              {/* Postal Code and City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="w-4 h-4" />
                    Postnummer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="0123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-damocles-accent focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="w-4 h-4" />
                    By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Oslo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-damocles-accent focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="w-4 h-4" />
                  Land
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-damocles-accent focus:border-transparent"
                >
                  <option value="Norway">Norge</option>
                  <option value="Sweden">Sverige</option>
                  <option value="Denmark">Danmark</option>
                  <option value="Finland">Finland</option>
                  <option value="Other">Annet</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="w-4 h-4" />
                  Fødselsdato <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-damocles-accent focus:border-transparent"
                  required
                />
              </div>

              {/* Phone Number (optional) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="w-4 h-4" />
                  Telefonnummer (valgfritt)
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+47 123 45 678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-damocles-accent focus:border-transparent"
                />
              </div>

              {/* Privacy Notice */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600">
                  <strong>Personvern:</strong> Denne informasjonen lagres sikkert og brukes kun for å verifisere
                  din identitet når du sender GDPR-forespørsler til kreditorer. Vi deler aldri dine personopplysninger
                  uten ditt samtykke, bortsett fra som nødvendig for å behandle dine GDPR-forespørsler.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-damocles-accent hover:bg-indigo-700 text-white py-3"
              >
                {loading ? 'Lagrer...' : 'Fullfør profil'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
