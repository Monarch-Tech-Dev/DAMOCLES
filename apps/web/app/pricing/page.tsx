import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Simple
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
                Fair Pricing
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              No hidden fees. No upfront costs. We only succeed when you do.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">

              {/* Free Plan */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 relative">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Debt Health Check</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black text-gray-900">Free</span>
                  <span className="text-gray-600 ml-2">Forever</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-emerald-500 mr-3">✓</span>
                    Personal Debt Index (PDI) calculation
                  </li>
                  <li className="flex items-center">
                    <span className="text-emerald-500 mr-3">✓</span>
                    Basic violation detection
                  </li>
                  <li className="flex items-center">
                    <span className="text-emerald-500 mr-3">✓</span>
                    Educational resources
                  </li>
                  <li className="flex items-center">
                    <span className="text-emerald-500 mr-3">✓</span>
                    Debt health monitoring
                  </li>
                </ul>
                <Link
                  href="/auth/register"
                  className="block w-full text-center bg-gray-100 text-gray-900 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 relative text-white transform scale-105">
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold mb-4">Legal Protection</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black">25%</span>
                  <span className="ml-2">of money recovered</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-purple-200 mr-3">✓</span>
                    Everything in Free plan
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-200 mr-3">✓</span>
                    Automated GDPR requests
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-200 mr-3">✓</span>
                    Legal complaint filing
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-200 mr-3">✓</span>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-200 mr-3">✓</span>
                    SWORD token participation
                  </li>
                </ul>
                <Link
                  href="/auth/register"
                  className="block w-full text-center bg-white text-purple-600 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Start Legal Protection
                </Link>
                <p className="text-purple-200 text-sm mt-4 text-center">
                  Only pay when we recover money for you
                </p>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 relative">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black text-gray-900">Custom</span>
                  <span className="text-gray-600 ml-2">Pricing</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-emerald-500 mr-3">✓</span>
                    Everything in Legal Protection
                  </li>
                  <li className="flex items-center">
                    <span className="text-emerald-500 mr-3">✓</span>
                    Bulk GDPR request management
                  </li>
                  <li className="flex items-center">
                    <span className="text-emerald-500 mr-3">✓</span>
                    Legal team consultation
                  </li>
                  <li className="flex items-center">
                    <span className="text-emerald-500 mr-3">✓</span>
                    Custom integration
                  </li>
                  <li className="flex items-center">
                    <span className="text-emerald-500 mr-3">✓</span>
                    White-label options
                  </li>
                </ul>
                <Link
                  href="/contact"
                  className="block w-full text-center bg-gray-900 text-white py-3 rounded-2xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How Success Fee Works */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How Our Success Fee Works</h2>
              <p className="text-xl text-gray-600 mb-12">
                We only get paid when we successfully recover money for you. This aligns our interests with yours.
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="text-3xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">We Find Violations</h3>
                  <p className="text-gray-600">
                    Our AI scans your debt for illegal fees, GDPR violations, and improper collection practices.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="text-3xl mb-4">⚖️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">We Take Action</h3>
                  <p className="text-gray-600">
                    Automated legal requests, complaints, and negotiations with debt collectors on your behalf.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="text-3xl mb-4">💰</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">You Keep 75%</h3>
                  <p className="text-gray-600">
                    When we successfully recover money, you keep 75% and we take 25% as our success fee.
                  </p>
                </div>
              </div>

              <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-4">Example Recovery</h3>
                <div className="text-left max-w-2xl mx-auto">
                  <div className="mb-2">Illegal collection fees found: €1,200</div>
                  <div className="mb-2">GDPR violation penalty: €800</div>
                  <div className="border-t border-purple-300 pt-2 mb-2 font-bold">
                    Total recovered: €2,000
                  </div>
                  <div className="text-purple-200">You receive: €1,500 (75%)</div>
                  <div className="text-purple-200">Our fee: €500 (25%)</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">What if you don't recover any money?</h3>
                <p className="text-gray-600">
                  You pay nothing. Our Legal Protection plan only charges a success fee when we actually recover money for you.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">How long does the process take?</h3>
                <p className="text-gray-600">
                  GDPR requests typically get responses within 30 days. Violation claims can take 2-6 months depending on complexity.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600">
                  Yes, you can cancel your Legal Protection plan anytime. We'll complete any active cases at no additional charge.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Start Your Free Debt Health Check</h2>
            <p className="text-xl mb-8 text-purple-100">
              See what violations we can find in your debt collection. No cost, no commitment.
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