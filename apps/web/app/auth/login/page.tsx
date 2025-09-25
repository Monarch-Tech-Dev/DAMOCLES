'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'bankid'>('email')
  const { login } = useAuth()
  const router = useRouter()

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setStep('bankid')
    }
  }

  const handleBankIdLogin = async () => {
    setIsLoading(true)
    try {
      // Mock BankID token for development
      const mockBankIdToken = 'dev_token_' + Date.now()
      await login(email, mockBankIdToken)
    } catch (error) {
      console.error('Login error:', error)
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
              Logg inn til DAMOCLES
            </CardTitle>
            <CardDescription className="text-slate-300">
              Sikker innlogging med BankID
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    E-postadresse
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="din@epost.no"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                  disabled={!email}
                >
                  Fortsett til BankID
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-900/30 border border-blue-800 rounded-lg">
                  <p className="text-blue-200 text-sm mb-2">
                    Innlogging for: <strong>{email}</strong>
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setStep('email')}
                    className="text-blue-300 border-blue-600 hover:bg-blue-800"
                  >
                    Endre e-post
                  </Button>
                </div>

                <Button
                  onClick={handleBankIdLogin}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Autentiserer...
                    </div>
                  ) : (
                    'Logg inn med BankID (Mock)'
                  )}
                </Button>

                <div className="text-center text-xs text-slate-400">
                  Utviklingsmodus: BankID-integrasjon simuleres
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-slate-400 text-sm">
                Har du ikke konto?{' '}
                <Link
                  href="/auth/register"
                  className="text-red-400 hover:text-red-300 underline"
                >
                  Registrer deg her
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}