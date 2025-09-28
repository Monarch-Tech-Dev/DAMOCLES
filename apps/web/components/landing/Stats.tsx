export function Stats() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 overflow-hidden">
      {/* Modern background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="group">
            <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="text-5xl lg:text-6xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-300">€2.4M</div>
              <div className="text-white/80 font-medium uppercase tracking-wide">Penger Gjenopprettet</div>
              <div className="mt-2 w-full h-1 bg-gradient-to-r from-purple-300 to-white/50 rounded-full"></div>
            </div>
          </div>

          <div className="group">
            <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="text-5xl lg:text-6xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-300">15,000+</div>
              <div className="text-white/80 font-medium uppercase tracking-wide">Brudd Oppdaget</div>
              <div className="mt-2 w-full h-1 bg-gradient-to-r from-pink-300 to-white/50 rounded-full"></div>
            </div>
          </div>

          <div className="group">
            <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="text-5xl lg:text-6xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-300">8,500</div>
              <div className="text-white/80 font-medium uppercase tracking-wide">Beskyttede Brukere</div>
              <div className="mt-2 w-full h-1 bg-gradient-to-r from-cyan-300 to-white/50 rounded-full"></div>
            </div>
          </div>

          <div className="group">
            <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="text-5xl lg:text-6xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-300">95%</div>
              <div className="text-white/80 font-medium uppercase tracking-wide">Suksessrate</div>
              <div className="mt-2 w-full h-1 bg-gradient-to-r from-emerald-300 to-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}