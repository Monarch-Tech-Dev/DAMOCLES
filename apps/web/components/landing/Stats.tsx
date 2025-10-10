export function Stats() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Modern background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Transparency Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Transparente Metrics
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Vi viser faktiske plattformdata, ikke markedsføringspåstander
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 text-center mb-12">
          {/* Stat 1: Beta Status */}
          <div className="group">
            <div className="relative p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="text-4xl lg:text-5xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                Beta
              </div>
              <div className="text-white/90 font-semibold mb-2">GDPR-forespørsler sendt</div>
              <div className="text-white/60 text-sm">Plattformen er i aktiv utvikling</div>
              <div className="mt-2 w-full h-1 bg-gradient-to-r from-orange-400 to-white/50 rounded-full"></div>
            </div>
          </div>

          {/* Stat 2: Real Improvement */}
          <div className="group">
            <div className="relative p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="text-4xl lg:text-5xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                20% → 85%
              </div>
              <div className="text-white/90 font-semibold mb-2">Maloptimalisering</div>
              <div className="text-white/60 text-sm">Dokumentert forbedring gjennom kollektiv læring</div>
              <div className="mt-2 w-full h-1 bg-gradient-to-r from-green-400 to-white/50 rounded-full"></div>
            </div>
          </div>

          {/* Stat 3: Open Source */}
          <div className="group">
            <div className="relative p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="text-4xl lg:text-5xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                AGPL-3.0
              </div>
              <div className="text-white/90 font-semibold mb-2">Åpen kildekode</div>
              <div className="text-white/60 text-sm">All kode er offentlig tilgjengelig på GitHub</div>
              <div className="mt-2 w-full h-1 bg-gradient-to-r from-blue-400 to-white/50 rounded-full"></div>
            </div>
          </div>

          {/* Stat 4: Legal Grounding */}
          <div className="group">
            <div className="relative p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="text-4xl lg:text-5xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                Art. 15
              </div>
              <div className="text-white/90 font-semibold mb-2">GDPR lovfestet innsynsrett</div>
              <div className="text-white/60 text-sm">Vi bruker eksisterende rettigheter, ikke oppfinner nye</div>
              <div className="mt-2 w-full h-1 bg-gradient-to-r from-purple-400 to-white/50 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Disclaimer Box - Radical Transparency */}
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">Om disse tallene</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                Vi viser faktiske plattformdata. <strong>Beta</strong> betyr at vi fortsatt samler data.
                <strong> 20% → 85%</strong> viser forbedring i vårt AI-system for maloptimalisering gjennom kollektiv læring.
                <strong>AGPL-3.0</strong> betyr du kan verifisere alt vi gjør.
                <strong>Art. 15</strong> er ditt juridiske grunnlag - vi utnytter eksisterende lov.
              </p>
              <p className="text-white/60 text-sm italic">
                Dette er faktiske plattformdata, ikke markedsføringspåstander. Resultater varierer basert på din situasjon.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Trust Signals */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
            <div className="text-2xl mb-2">🔓</div>
            <div className="text-white font-semibold mb-1">Ingen abonnement</div>
            <div className="text-white/60 text-sm">Betal kun for det du bruker</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
            <div className="text-2xl mb-2">🛡️</div>
            <div className="text-white font-semibold mb-1">Ingen skjulte kostnader</div>
            <div className="text-white/60 text-sm">Alt er transparent og forutsigbart</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
            <div className="text-2xl mb-2">⚖️</div>
            <div className="text-white font-semibold mb-1">Ikke juridisk rådgivning</div>
            <div className="text-white/60 text-sm">Vi gir deg verktøy, du bestemmer</div>
          </div>
        </div>
      </div>
    </section>
  )
}
