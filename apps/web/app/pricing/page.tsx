import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Enkel og
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700">
                transparent prising
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Ingen abonnement. Ingen skjulte kostnader. Du bestemmer selv når og hva du betaler for.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">

              {/* Free Tier */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Gratis</h3>
                  <div className="text-4xl font-black text-slate-900 mb-4">0 kr</div>
                  <p className="text-slate-600">Kom i gang uten kostnad</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-slate-700">Grunnleggende GDPR-forespørsel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-slate-700">PDI-beregning (gjeldshelse)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-slate-700">Manuell dokumentopplasting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-slate-700">Tilgang til fellesskapsressurser</span>
                  </li>
                </ul>

                <Link
                  href="/auth/register"
                  className="block w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-center hover:bg-slate-200 transition-colors duration-200"
                >
                  Start gratis
                </Link>
              </div>

              {/* Standard Tier - Most Popular */}
              <div className="bg-blue-600 border-2 border-blue-600 rounded-2xl p-8 relative transform hover:scale-105 transition-all duration-200 shadow-lg">
                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-2xl rounded-tr-2xl text-sm font-semibold">
                  Mest populær
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Standard</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-lg text-white/80">Fra</span>
                    <div className="text-4xl font-black text-white">299 kr</div>
                  </div>
                  <p className="text-white/90">Per GDPR-sak med AI-analyse</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-white flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-white">Alt i Gratis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-white">Matematisk brudddeteksjon</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-white">Automatisk dokumentanalyse</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-white">Motstridighetsdeteksjon</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-white">Oppfølgingspåminnelser</span>
                  </li>
                </ul>

                <Link
                  href="/auth/register"
                  className="block w-full px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold text-center hover:bg-blue-50 transition-colors duration-200"
                >
                  Kom i gang
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-lg text-slate-600">Fra</span>
                    <div className="text-4xl font-black text-slate-900">999 kr</div>
                  </div>
                  <p className="text-slate-600">For komplekse saker</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-slate-700">Alt i Standard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-slate-700">Komplett bevispakke</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-slate-700">Blockchain-bevissikring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-slate-700">Automatisk eskalering</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-slate-700">SWORD token-tilgang</span>
                  </li>
                </ul>

                <Link
                  href="/auth/register"
                  className="block w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-center hover:bg-slate-200 transition-colors duration-200"
                >
                  Kom i gang
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Disclaimer */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-blue-50 border border-blue-200 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Om prising:</h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Start alltid gratis</strong> - Test systemet før du betaler noe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Betal kun for tjenester du faktisk trenger</strong> - Ingen tvungne pakker</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Ingen abonnement eller skjulte kostnader</strong> - Transparent prising</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Resultater varierer</strong> - Vi garanterer ikke økonomiske resultater</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Ofte stilte spørsmål</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hva skjer hvis jeg ikke finner noen feil?</h3>
                <p className="text-gray-600">
                  Gratis-versjonen koster ingenting. Betalte tjenester betales kun når du velger å bruke dem.
                  Vi garanterer ikke resultater - verktøyet gir deg informasjon, du bestemmer hva du gjør med den.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hvor lang tid tar prosessen?</h3>
                <p className="text-gray-600">
                  GDPR-forespørsler har 30 dagers svarfrist ifølge loven. Kompleksiteten varierer avhengig av saken.
                  Du beveger deg i ditt eget tempo.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Kan jeg avslutte når som helst?</h3>
                <p className="text-gray-600">
                  Ja, det er ingen binding. Gratis-tjenestene er alltid tilgjengelige. Betalte tjenester betales per bruk.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Start gratis gjeldshelse-sjekk</h2>
            <p className="text-xl mb-8 text-blue-100">
              Se hvilke potensielle feil som finnes i inkassokravet ditt. Ingen kostnad, ingen forpliktelse.
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