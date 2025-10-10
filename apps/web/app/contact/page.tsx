import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Kontakt
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700">
                DAMOCLES
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Trenger du hjelp med gjeldsbeskyttelse eller har spørsmål? Vi er her for å hjelpe.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 mb-16">

              {/* Support */}
              <div className="text-center p-8 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🆘</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Brukerstøtte</h3>
                <p className="text-gray-600 mb-4">
                  Spørsmål om gjeldsbeskyttelse eller hvordan DAMOCLES fungerer?
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>📧 support@damocles.no</p>
                  <p>🕐 Svar innen 24 timer</p>
                </div>
              </div>

              {/* Enterprise */}
              <div className="text-center p-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏢</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Bedriftsløsninger</h3>
                <p className="text-blue-100 mb-4">
                  Massehåndtering av GDPR, white-label løsninger, og tilpassede integrasjoner.
                </p>
                <div className="space-y-2 text-sm text-blue-100">
                  <p>📧 enterprise@damocles.no</p>
                  <p>📞 +47 123 45 678</p>
                </div>
              </div>

              {/* Legal */}
              <div className="text-center p-8 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚖️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Juridiske henvendelser</h3>
                <p className="text-gray-600 mb-4">
                  Juridiske spørsmål, partnerskap, eller samsvarsforhold?
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>📧 legal@damocles.no</p>
                  <p>🕐 Svar innen 48 timer</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Send oss en melding</h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        Fornavn
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ditt fornavn"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Etternavn
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ditt etternavn"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-post
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="din.epost@eksempel.no"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Emne
                    </label>
                    <select
                      id="subject"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Velg et tema</option>
                      <option>Brukerstøtte</option>
                      <option>Bedriftsløsninger</option>
                      <option>Juridisk henvendelse</option>
                      <option>Partnerskap</option>
                      <option>Annet</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Melding
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Fortell oss hvordan vi kan hjelpe..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                  >
                    Send melding
                  </button>
                </form>

                <p className="text-sm text-gray-500 text-center mt-6">
                  Vi svarer vanligvis innen 24 timer i løpet av virkedager.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Office Info */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Vårt kontor</h2>
              <p className="text-xl text-gray-600">
                Basert i Oslo, betjener forbrukere over hele Norge
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">DAMOCLES Platform AS</h3>
                <div className="space-y-3 text-gray-600">
                  <p className="flex items-center">
                    <span className="mr-3">📍</span>
                    Storgata 123, 0184 Oslo, Norge
                  </p>
                  <p className="flex items-center">
                    <span className="mr-3">🏢</span>
                    Organisasjonsnummer: 123 456 789
                  </p>
                  <p className="flex items-center">
                    <span className="mr-3">⏰</span>
                    Mandag - Fredag: 9:00 - 17:00 CET
                  </p>
                  <p className="flex items-center">
                    <span className="mr-3">🌐</span>
                    AGPL-3.0 Lisens - Åpen kildekode
                  </p>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Følg oss</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <span className="sr-only">LinkedIn</span>
                      <span className="text-2xl">💼</span>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <span className="sr-only">Twitter</span>
                      <span className="text-2xl">🐦</span>
                    </a>
                    <a href="https://github.com" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <span className="sr-only">GitHub</span>
                      <span className="text-2xl">⚙️</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-4">Trenger umiddelbar hjelp?</h3>
                <p className="text-blue-100 mb-6">
                  Hvis du opplever aggressive inkassokrav eller haster med juridiske spørsmål,
                  ikke vent. Kom i gang med DAMOCLES-beskyttelse med en gang.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-block bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Start beskyttelse nå
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Transparency Note */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📧 Om e-postkommunikasjon</h3>
              <p className="text-gray-700 leading-relaxed">
                Når du sender oss en melding via dette skjemaet, lagres informasjonen i henhold til vår{' '}
                <Link href="/personvern" className="text-blue-600 underline">personvernpolicy</Link>.
                Vi deler aldri kontaktinformasjonen din med tredjeparter.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
