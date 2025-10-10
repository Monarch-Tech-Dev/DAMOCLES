export function HowItWorks() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
      {/* Modern background patterns */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-gray-900/5 backdrop-blur-md rounded-full border border-gray-900/10">
            <span className="text-sm font-medium text-blue-700">Tre enkle steg</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Slik fungerer
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700">
              DAMOCLES
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Du kontrollerer prosessen i ditt eget tempo
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="group relative text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-2xl shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                1
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Registrer deg</h3>
            <p className="text-gray-600 leading-relaxed">
              Opprett konto og legg inn dine inkassokrav. Ingen kredittkort påkrevd for grunnleggende funksjoner.
            </p>
          </div>

          <div className="group relative text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-2xl shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
                2
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Analyser gjeld</h3>
            <p className="text-gray-600 leading-relaxed">
              Beregn PDI og se potensielle brudd. Systemet gir deg informasjon - du bestemmer hva du gjør med den.
            </p>
          </div>

          <div className="group relative text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-2xl shadow-slate-500/25 group-hover:scale-110 transition-transform duration-300">
                3
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Utøv rettigheter</h3>
            <p className="text-gray-600 leading-relaxed">
              Send GDPR-forespørsler eller velg andre tiltak. Du beveger deg i ditt eget tempo.
            </p>
          </div>
        </div>

        {/* Process flow visualization */}
        <div className="flex justify-center items-center mt-16 space-x-4">
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-slate-500 rounded-full"></div>
          <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
          <div className="w-12 h-1 bg-gradient-to-r from-slate-500 to-blue-600 rounded-full"></div>
        </div>
      </div>
    </section>
  )
}