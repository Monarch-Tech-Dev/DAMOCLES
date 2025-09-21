export function CTA() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Modern background patterns */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-200">Stop Illegal Debt Collection</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
          Ready to Fight Back
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
            Against Illegal Fees?
          </span>
        </h2>

        <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
          Get automated legal protection that puts{' '}
          <span className="text-white font-bold">your rights first</span>.
          Start with a free debt health check and GDPR violation scan.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <a
            href="/auth/register"
            className="group relative px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
          >
            <span className="relative z-10">Check My Debt</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>

          <a
            href="/auth/login"
            className="px-10 py-5 bg-white/10 backdrop-blur-md rounded-2xl font-bold text-white text-lg border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            Sign In
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-2xl">✓</span>
            <span className="text-gray-300">GDPR Violation Detection</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-2xl">⚖️</span>
            <span className="text-gray-300">Automated Legal Requests</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-2xl">🎯</span>
            <span className="text-gray-300">Collective Action Ready</span>
          </div>
        </div>
      </div>
    </section>
  )
}