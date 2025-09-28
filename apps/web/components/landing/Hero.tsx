'use client'

import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Subtle geometric background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Minimal grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Modern badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-slate-700">Aktiv beskyttelse</span>
          <div className="px-2 py-1 bg-blue-100 rounded-md text-xs font-semibold text-blue-700">GDPR Klar</div>
        </div>

        {/* Modern heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
          <span className="block text-slate-900 mb-2">DAMOCLES</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700">
            Beskytt deg mot ulovlig inkasso
          </span>
        </h1>

        {/* Modern subtitle */}
        <p className="text-xl sm:text-2xl text-slate-600 mb-8 font-medium leading-relaxed">
          Automatisk gjeldsforsvar med{' '}
          <span className="text-slate-900 font-semibold">GDPR-rettigheter</span> og{' '}
          <span className="text-blue-600 font-semibold">bruddoppdagelse</span>
        </p>

        {/* Modern description */}
        <p className="max-w-2xl mx-auto text-lg text-slate-500 mb-12 leading-relaxed">
          Ta kontroll over gjelden din med juridiske automatiseringsverktøy som oppdager ulovlige gebyrer,
          sender GDPR-forespørsler, og sporer din gjeldshelse gjennom vårt PDI-system.
        </p>

        {/* Modern CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/auth/register"
            className="group relative px-8 py-4 bg-blue-600 rounded-xl font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25"
          >
            Sjekk min gjeld
          </Link>

          <Link
            href="/about"
            className="px-8 py-4 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
          >
            Les mer
          </Link>
        </div>

        {/* Modern stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">€2.4M</div>
            <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Gjenopprettet for brukere</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">15,000+</div>
            <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Brudd oppdaget</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">8,500</div>
            <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Beskyttede brukere</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">24/7</div>
            <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Automatisk beskyttelse</div>
          </div>
        </div>

        {/* Modern tech badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-16">
          <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 text-sm text-slate-600 font-medium shadow-sm">
            Cardano Blokkjede
          </div>
          <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 text-sm text-slate-600 font-medium shadow-sm">
            GDPR Kompatibel
          </div>
          <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 text-sm text-slate-600 font-medium shadow-sm">
            Automatisk Beskyttelse
          </div>
          <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 text-sm text-slate-600 font-medium shadow-sm">
            Juridisk Samsvar
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