import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function HowItWorksPage() {
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
              Slik fungerer
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700">
                DAMOCLES
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Du kontrollerer prosessen i ditt eget tempo
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-2xl shadow-blue-500/25">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Registrer deg</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Opprett konto og legg inn dine inkassokrav. Ingen kredittkort påkrevd for grunnleggende funksjoner.
                </p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>✓ Sikker verifisering</li>
                  <li>✓ GDPR-kompatibel datahåndtering</li>
                  <li>✓ Rask oppstart</li>
                </ul>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-2xl shadow-indigo-500/25">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Analyser gjeld</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Beregn PDI og se potensielle brudd. Systemet gir deg informasjon - du bestemmer hva du gjør med den.
                </p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>✓ Personal Debt Index-beregning</li>
                  <li>✓ Deteksjon av potensielle feil</li>
                  <li>✓ Identifisering av brudd</li>
                </ul>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-2xl shadow-slate-500/25">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Utøv rettigheter</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Send GDPR-forespørsler eller velg andre tiltak. Du beveger deg i ditt eget tempo.
                </p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>✓ Automatiserte GDPR-forespørsler</li>
                  <li>✓ Juridiske klageskjemaer</li>
                  <li>✓ Deltakelse i samarbeid</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Hva gjør DAMOCLES annerledes</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🤖 Automatisering</h3>
                <p className="text-gray-600">
                  I motsetning til manuelle rådgivningstjenester bruker DAMOCLES teknologi til å oppdage potensielle brudd
                  og generere GDPR-forespørsler automatisk.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⚖️ Juridisk kunnskap</h3>
                <p className="text-gray-600">
                  Bygget med forståelse for GDPR og inkassoloven for å sikre at alle handlinger er juridisk korrekte.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Du bestemmer</h3>
                <p className="text-gray-600">
                  DAMOCLES gir deg verktøy og informasjon. Du bestemmer selv hva du vil gjøre og beveger deg i ditt eget tempo.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🛡️ Personvern først</h3>
                <p className="text-gray-600">
                  Dine data forblir private og sikre. Full GDPR-samsvar garantert.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Klar til å utøve dine rettigheter?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Beveg deg i ditt eget tempo. Ingen kredittkort påkrevd for gratis verktøy.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Kom i gang gratis
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}