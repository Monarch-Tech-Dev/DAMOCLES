export function Features() {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.02)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-blue-50 rounded-full border border-blue-200">
            <span className="text-sm font-medium text-blue-700">Verktøy, ikke magi</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
            Hva DAMOCLES gjør
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700">
              for deg
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Vi gir deg verktøy til å utøve dine lovfestede rettigheter
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group relative">
            <div className="relative p-8 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl group-hover:bg-blue-200 transition-colors duration-200">
                  📊
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">PDI-beregning</h3>
                <p className="text-slate-600 leading-relaxed">
                  Beregn din Personal Debt Index og forstå din gjeldshelse. Ikke et løfte om å fjerne gjeld, men et verktøy for oversikt.
                </p>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="relative p-8 bg-white border border-slate-200 rounded-2xl hover:border-green-300 hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl group-hover:bg-green-200 transition-colors duration-200">
                  📝
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">GDPR-forespørsler</h3>
                <p className="text-slate-600 leading-relaxed">
                  Automatiser GDPR Art. 15 forespørsler til inkassoselskap. Du bestemmer når og til hvem.
                </p>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="relative p-8 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl group-hover:bg-indigo-200 transition-colors duration-200">
                  🔍
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Brudddeteksjon</h3>
                <p className="text-slate-600 leading-relaxed">
                  Matematisk analyse av inkassokrav for å oppdage potensielle brudd på Inkassoloven. Ikke juridisk rådgivning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}