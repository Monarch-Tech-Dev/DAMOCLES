import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-gray-900 via-purple-900 to-slate-800 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
              About
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                DAMOCLES
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Defending your rights against illegal debt collection through automated legal protection
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Every year, millions of people face illegal debt collection practices—excessive fees, privacy violations,
                and harassment. DAMOCLES uses technology and legal expertise to automatically detect these violations
                and take action, giving ordinary people the power to fight back.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚖️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Legal Expertise</h3>
                <p className="text-gray-600">
                  Built by consumer rights lawyers and GDPR experts who understand the system
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Automation</h3>
                <p className="text-gray-600">
                  Technology that works 24/7 to detect violations and generate legal responses
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Collective Action</h3>
                <p className="text-gray-600">
                  Strength in numbers—join thousands fighting illegal debt practices together
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why DAMOCLES Exists</h2>
              <div className="prose prose-lg text-gray-600">
                <p className="mb-6">
                  Debt collection in Europe is broken. Companies routinely charge illegal fees, violate GDPR privacy rights,
                  and use harassment tactics that are explicitly forbidden by law. But individual consumers rarely have the
                  knowledge, time, or resources to fight back effectively.
                </p>
                <p className="mb-6">
                  The name "DAMOCLES" comes from the ancient Greek story of a sword hanging by a thread—representing how
                  debt collectors use the constant threat of legal action to intimidate people, even when their own practices
                  are illegal.
                </p>
                <p className="mb-6">
                  We turn that power dynamic around. Instead of you being threatened by debt collectors, DAMOCLES becomes
                  the sword hanging over them—automatically detecting when they break the law and taking immediate legal action.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">The Technology</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Personal Debt Index (PDI)</h3>
                <p className="text-gray-600 mb-6">
                  Our proprietary algorithm analyzes your debt situation and automatically identifies potential
                  violations in fees, interest rates, and collection practices.
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">GDPR Automation</h3>
                <p className="text-gray-600 mb-6">
                  Automatically generates and sends legally-compliant GDPR requests to debt collectors and credit
                  agencies, forcing them to disclose all data they hold about you.
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">SWORD Tokens</h3>
                <p className="text-gray-600">
                  Blockchain-based tokens that enable coordinated legal action. When enough users report the same
                  violation, we can take collective action for maximum impact.
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-8 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-4">Real Results</h3>
                <div className="space-y-4">
                  <div className="bg-white/20 p-4 rounded-lg">
                    <div className="text-3xl font-bold">€2.4M</div>
                    <div className="text-purple-100">Recovered in illegal fees</div>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg">
                    <div className="text-3xl font-bold">15,000+</div>
                    <div className="text-purple-100">GDPR violations detected</div>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg">
                    <div className="text-3xl font-bold">8,500</div>
                    <div className="text-purple-100">Active users protected</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Join the Fight Against Illegal Debt Collection</h2>
            <p className="text-xl mb-8 text-purple-100">
              Take back control of your financial future with automated legal protection.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Check My Debt
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}