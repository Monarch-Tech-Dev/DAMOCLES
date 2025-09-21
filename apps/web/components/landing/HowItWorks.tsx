export function HowItWorks() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
      {/* Modern background patterns */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-gray-900/5 backdrop-blur-md rounded-full border border-gray-900/10">
            <span className="text-sm font-medium text-purple-700">Three Simple Steps</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 leading-tight">
            How DAMOCLES
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
              Protects Your Rights
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get automated legal protection from illegal debt collection practices
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="group relative text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-2xl shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Register & Verify</h3>
            <p className="text-gray-600 leading-relaxed">
              Create your account with secure BankID verification and activate automated debt protection
            </p>
          </div>

          <div className="group relative text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-2xl shadow-pink-500/25 group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Debt Health Check</h3>
            <p className="text-gray-600 leading-relaxed">
              Calculate your Personal Debt Index and automatically scan for illegal fees and collection violations
            </p>
          </div>

          <div className="group relative text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-2xl shadow-cyan-500/25 group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Take Legal Action</h3>
            <p className="text-gray-600 leading-relaxed">
              Automatically generate GDPR requests, file complaints, and join collective action through SWORD tokens
            </p>
          </div>
        </div>

        {/* Process flow visualization */}
        <div className="flex justify-center items-center mt-16 space-x-4">
          <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
          <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full"></div>
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
          <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"></div>
        </div>
      </div>
    </section>
  )
}