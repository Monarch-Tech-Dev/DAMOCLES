'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Shield, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    personalNumber: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'bankid'>('form')
  const { register } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.email && formData.personalNumber) {
      setStep('bankid')
    }
  }

  const handleBankIdRegister = async () => {
    setIsLoading(true)
    try {
      // Mock BankID token for development
      const mockBankIdToken = 'dev_token_' + Date.now()
      await register({
        ...formData,
        bankIdToken: mockBankIdToken
      })
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tilbake til forsiden
        </Link>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">
              Bli med i DAMOCLES
            </CardTitle>
            <CardDescription className="text-slate-300">
              Opprett din konto for å begynne å beskytte dine rettigheter
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 'form' ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    E-postadresse *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="din@epost.no"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-white">
                    Telefonnummer
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+47 123 45 678"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalNumber" className="text-white">
                    Fødselsnummer *
                  </Label>
                  <Input
                    id="personalNumber"
                    type="text"
                    placeholder="11 siffer"
                    value={formData.personalNumber}
                    onChange={(e) => handleInputChange('personalNumber', e.target.value)}
                    required
                    maxLength={11}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                  />
                  <p className="text-xs text-slate-400">
                    Brukes kun for BankID-verifisering og lagres kryptert
                  </p>
                </div>

                <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-white">Ved å registrere deg godtar du:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-300">
                        Våre brukervilkår og personvernregler
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-300">
                        At DAMOCLES kan sende automatiserte juridiske forespørsler på dine vegne
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                  disabled={!formData.email || !formData.personalNumber}
                >
                  Fortsett til BankID-verifisering
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-900/30 border border-blue-800 rounded-lg">
                  <h4 className="text-blue-200 font-medium mb-2">Registrering for:</h4>
                  <div className="space-y-1 text-sm text-blue-300">
                    <p><strong>E-post:</strong> {formData.email}</p>
                    {formData.phoneNumber && (
                      <p><strong>Telefon:</strong> {formData.phoneNumber}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setStep('form')}
                    className="mt-3 text-blue-300 border-blue-600 hover:bg-blue-800"
                  >
                    Endre informasjon
                  </Button>
                </div>

                <Button
                  onClick={handleBankIdRegister}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Oppretter konto...
                    </div>
                  ) : (
                    'Fullfør registrering med BankID (Mock)'
                  )}
                </Button>

                <div className="text-center text-xs text-slate-400">
                  Utviklingsmodus: BankID-integrasjon simuleres
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-slate-400 text-sm">
                Har du allerede konto?{' '}
                <Link
                  href="/auth/login"
                  className="text-red-400 hover:text-red-300 underline"
                >
                  Logg inn her
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}