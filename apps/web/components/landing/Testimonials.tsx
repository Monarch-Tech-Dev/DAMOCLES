export function Testimonials() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-white via-gray-50 to-slate-100 overflow-hidden">
      {/* Modern background patterns */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-gray-900/5 backdrop-blur-md rounded-full border border-gray-900/10">
            <span className="text-sm font-medium text-purple-700">User Voices</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Real People
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
              Getting Results
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            How DAMOCLES helped people fight illegal debt collection
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="group relative">
            <div className="relative p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-purple-600 font-black text-xl border border-purple-500/20">
                    🛡️
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-gray-900">Anonymous User</h4>
                    <p className="text-purple-600 font-medium">Debt Violation Detected</p>
                  </div>
                </div>

                <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                  "DAMOCLES found illegal fees in my debt collection and automatically sent GDPR requests.
                  I got €2,400 back and they stopped calling me illegally."
                </blockquote>

                <div className="flex items-center mt-6">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">⭐</span>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-500 font-medium">Illegal Fees Recovered</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="relative p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xl border border-emerald-500/20">
                    ⚖️
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-gray-900">Protected Individual</h4>
                    <p className="text-emerald-600 font-medium">GDPR Request Success</p>
                  </div>
                </div>

                <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                  "The GDPR request tool got all my personal data from 12 debt collectors.
                  Found multiple violations and joined collective action through SWORD tokens."
                </blockquote>

                <div className="flex items-center mt-6">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">⭐</span>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-500 font-medium">Legal Violations Found</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}