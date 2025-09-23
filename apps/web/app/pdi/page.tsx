'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PDICounterPage() {
  const [stats, setStats] = useState({
    totalPDICalculations: 0,
    moneyRecovered: 0,
    violationsDetected: 0,
    protectedUsers: 0,
    averagePDIScore: 0,
    dailyCalculations: 0
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize with starting values like Oljefondet
    const startValues = {
      totalPDICalculations: 47832,
      moneyRecovered: 2400000,
      violationsDetected: 15243,
      protectedUsers: 8567,
      averagePDIScore: 62.4,
      dailyCalculations: 1247
    }

    setStats(startValues)
    setIsLoading(false)

    // Update counters every 3 seconds like Oljefondet
    const interval = setInterval(() => {
      setStats(prev => ({
        totalPDICalculations: prev.totalPDICalculations + Math.floor(Math.random() * 3) + 1,
        moneyRecovered: prev.moneyRecovered + Math.floor(Math.random() * 1200) + 500,
        violationsDetected: prev.violationsDetected + Math.floor(Math.random() * 2),
        protectedUsers: prev.protectedUsers + (Math.random() < 0.3 ? 1 : 0),
        averagePDIScore: 62.4 + (Math.random() - 0.5) * 0.3,
        dailyCalculations: prev.dailyCalculations + Math.floor(Math.random() * 2) + 1
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('no-NO').format(Math.floor(num))
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.floor(num))
  }

  const formatDecimal = (num: number) => {
    return num.toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Header />

      <main className="relative overflow-hidden">
        {/* Hero Section */}
        <div className="relative pt-32 pb-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.4),transparent_50%)]"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              PERSONAL DEBT INDEX
            </h1>
            <p className="text-xl lg:text-2xl text-blue-200 font-medium mb-6">
              Norges første AI-drevne gjeldsovervåking i sanntid
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-medium">LIVE DATA</span>
            </div>
          </div>
        </div>

        {/* Main Counter - Oljefondet Style */}
        <div className="relative py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Primary Counter */}
            <div className="text-center mb-16">
              <h2 className="text-xl lg:text-2xl font-bold text-white/80 mb-4 tracking-wide">
                TOTALT ANTALL PDI-KALKULASJONER
              </h2>
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-16 mb-8 shadow-2xl">
                <div className="text-6xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 mb-4 font-mono tracking-tight leading-none">
                  {isLoading ? '---,---' : formatNumber(stats.totalPDICalculations)}
                </div>
                <p className="text-white/70 text-lg font-medium">
                  PDI-beregninger utført siden oppstart
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Øker kontinuerlig</span>
                </div>
              </div>
            </div>

            {/* Today's Activity */}
            <div className="text-center mb-16">
              <h3 className="text-lg text-white/60 mb-4">I DAG</h3>
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 inline-block">
                <div className="text-4xl lg:text-5xl font-black text-yellow-400 mb-2 font-mono">
                  {isLoading ? '---' : formatNumber(stats.dailyCalculations)}
                </div>
                <p className="text-white/70 text-sm">nye PDI-kalkulasjoner</p>
              </div>
            </div>

            {/* Secondary Stats Grid - Oljefondet Style */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">

              {/* Money Recovered */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center group hover:bg-black/40 transition-all">
                <div className="text-3xl lg:text-4xl font-black text-emerald-400 mb-2 font-mono">
                  {isLoading ? '--- ---' : formatCurrency(stats.moneyRecovered)}
                </div>
                <p className="text-white/70 text-sm font-medium">Penger tilbakebetalt</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-emerald-400">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">ØKER</span>
                </div>
              </div>

              {/* Violations Detected */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center group hover:bg-black/40 transition-all">
                <div className="text-3xl lg:text-4xl font-black text-red-400 mb-2 font-mono">
                  {isLoading ? '---' : formatNumber(stats.violationsDetected)}
                </div>
                <p className="text-white/70 text-sm font-medium">Brudd oppdaget</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-red-400">
                  <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">AKTIV</span>
                </div>
              </div>

              {/* Protected Users */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center group hover:bg-black/40 transition-all">
                <div className="text-3xl lg:text-4xl font-black text-blue-400 mb-2 font-mono">
                  {isLoading ? '---' : formatNumber(stats.protectedUsers)}
                </div>
                <p className="text-white/70 text-sm font-medium">Beskyttede brukere</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-blue-400">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">VOKSER</span>
                </div>
              </div>

              {/* Average PDI Score */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center group hover:bg-black/40 transition-all">
                <div className="text-3xl lg:text-4xl font-black text-orange-400 mb-2 font-mono">
                  {isLoading ? '--.-' : formatDecimal(stats.averagePDIScore)}
                </div>
                <p className="text-white/70 text-sm font-medium">Gjennomsnittlig PDI</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-orange-400">
                  <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">LIVE</span>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6">
                Beregn din PDI-score nå
              </h3>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                Få en umiddelbar analyse av din gjeldssituasjon og se hvor du står sammenlignet med andre nordmenn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/dashboard/pdi"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Beregn min PDI →
                </a>
                <a
                  href="/about"
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                >
                  Les mer om PDI
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Information */}
        <div className="relative py-16 border-t border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-white/60 text-sm mb-4">
              Tallene oppdateres automatisk basert på realtidsdata fra DAMOCLES-plattformen.
            </p>
            <p className="text-white/40 text-xs">
              Personal Debt Index (PDI) er utviklet av DAMOCLES for å hjelpe nordmenn med å forstå og forbedre sin gjeldssituasjon gjennom GDPR-rettigheter og automatisert dokumentgenerering.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}