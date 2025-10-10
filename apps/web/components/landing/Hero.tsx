'use client'

import Link from 'next/link'
import { ShieldCheckIcon, ScaleIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Legal Banner - Layer 1: Legal Authority */}
      <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white py-2 px-4 text-center z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <ScaleIcon className="w-4 h-4" />
            <strong>Inkassokrav har 3-års foreldelsesfrist</strong> (norsk lov)
          </span>
          <span className="hidden md:inline">•</span>
          <span className="flex items-center gap-2">
            <DocumentMagnifyingGlassIcon className="w-4 h-4" />
            <strong>GDPR Art. 15</strong> - 30 dagers svarfrist
          </span>
          <span className="hidden md:inline">•</span>
          <span className="text-blue-100">26 milliarder NOK årlig inkassobransje</span>
        </div>
      </div>

      {/* Subtle geometric background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Minimal grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Message */}
          <div>
            {/* Beta Badge - Honest about status */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">Beta-versjon</span>
              <div className="px-2 py-1 bg-blue-100 rounded-md text-xs font-semibold text-blue-700">AGPL-3.0</div>
            </div>

            {/* Honest Urgency Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
              <span className="block text-slate-900 mb-2">
                Utfordre ulovlige inkassogebyrer
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700">
                med automatiserte GDPR-verktøy
              </span>
            </h1>

            {/* Value Proposition */}
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              <span className="font-semibold text-slate-900">26 milliarder NOK årlig.</span>{' '}
              Mange inkassokrav inneholder feil. DAMOCLES gir deg verktøy til å
              utøve dine GDPR-rettigheter og oppdage brudd automatisk.
            </p>

            {/* CTA Buttons - Clear, no pressure */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/auth/register"
                className="group relative px-8 py-4 bg-blue-600 rounded-xl font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 text-center"
              >
                Start gratis GDPR-forespørsel
              </Link>

              <Link
                href="/how-it-works"
                className="px-8 py-4 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm text-center"
              >
                Hvordan det virker
              </Link>
            </div>

            {/* No Pressure Statement */}
            <p className="text-sm text-slate-500 italic">
              Beveg deg i ditt eget tempo. Ingen kredittkort påkrevd for gratis verktøy.
            </p>
          </div>

          {/* Right Column - Common Errors Panel */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <DocumentMagnifyingGlassIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Vanlige feil i inkassokrav</h3>
                <p className="text-sm text-slate-600">(dokumentert)</p>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Ulovlige salærer</p>
                  <p className="text-sm text-slate-600">Inkassoloven § 18 - Gebyrer over lovlig maksimum</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Feilberegnet rente</p>
                  <p className="text-sm text-slate-600">Forsinkelsesrente beregnet feil eller dobbelt</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Manglende dokumentasjon</p>
                  <p className="text-sm text-slate-600">Inkassoloven § 15 - Mangler beviskrav</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-bold">4</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Inkonsekvente opplysninger</p>
                  <p className="text-sm text-slate-600">Motstridende beløp eller datoer i dokumenter</p>
                </div>
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
                DAMOCLES automatisk oppdager disse mønstrene med GDPR Art. 15 forespørsler
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clean scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center bg-white/50 backdrop-blur-sm">
          <div className="w-1 h-3 bg-slate-500 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  )
}
