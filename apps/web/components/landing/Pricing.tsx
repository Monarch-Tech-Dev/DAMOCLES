import Link from 'next/link'
import { CheckIcon } from '@heroicons/react/24/solid'

export function Pricing() {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-blue-50 rounded-full border border-blue-200">
            <span className="text-sm font-medium text-blue-700">Transparent Prising</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Betal kun for det du bruker
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Ingen abonnement. Ingen skjulte kostnader. Du bestemmer selv når og hva du betaler for.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Free Tier */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Gratis</h3>
              <div className="text-4xl font-black text-slate-900 mb-4">0 kr</div>
              <p className="text-slate-600">Kom i gang uten kostnad</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Grunnleggende GDPR-forespørsel</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">PDI-beregning (gjeldshelse)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Manuell dokumentopplasting</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
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
                <CheckIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white">Alt i Gratis</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white">Matematisk brudddeteksjon</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white">Automatisk dokumentanalyse</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white">Motstridighetsdeteksjon</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
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
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Alt i Standard</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Komplett bevispakke</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Blockchain-bevissikring</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Automatisk eskalering</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
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

        {/* Pricing Disclaimer */}
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
  )
}
