export function CTA() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Modern background patterns */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-slate-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-sm font-medium text-gray-200">Start når du er klar</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
          Klar til å ta
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-slate-400">
            kontrollen?
          </span>
        </h2>

        <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
          Start med{' '}
          <span className="text-white font-semibold">gratis verktøy</span>{' '}
          for å forstå din gjeldssituasjon. Ingen kredittkort påkrevd.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <a
            href="/auth/register"
            className="group relative px-10 py-5 bg-blue-600 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl"
          >
            Kom i gang gratis
          </a>

          <a
            href="/auth/login"
            className="px-10 py-5 bg-white/10 backdrop-blur-md rounded-2xl font-bold text-white text-lg border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            Logg inn
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-xl">📊</span>
            <span className="text-gray-300">PDI-beregning</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-xl">📝</span>
            <span className="text-gray-300">GDPR-forespørsler</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-xl">🔍</span>
            <span className="text-gray-300">Brudddeteksjon</span>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-8 italic">
          Du bestemmer hvert steg. Beveg deg i ditt eget tempo.
        </p>
      </div>
    </section>
  )
}