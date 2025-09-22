import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function HowItWorksPage() {
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
              How DAMOCLES
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
                Protects Your Rights
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Get automated legal protection from illegal debt collection practices in three simple steps
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-2xl shadow-purple-500/25">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Register & Verify</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Create your account with secure BankID verification and activate automated debt protection
                </p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>✓ Secure BankID verification</li>
                  <li>✓ GDPR-compliant data handling</li>
                  <li>✓ Instant activation</li>
                </ul>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-2xl shadow-pink-500/25">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Debt Health Check</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Calculate your Personal Debt Index and automatically scan for illegal fees and collection violations
                </p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>✓ Personal Debt Index calculation</li>
                  <li>✓ Illegal fee detection</li>
                  <li>✓ Violation identification</li>
                </ul>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-2xl shadow-cyan-500/25">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Take Legal Action</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Automatically generate GDPR requests, file complaints, and join collective action through SWORD tokens
                </p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>✓ Automated GDPR requests</li>
                  <li>✓ Legal complaint filing</li>
                  <li>✓ Collective action participation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Makes DAMOCLES Different</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🤖 Automated Protection</h3>
                <p className="text-gray-600">
                  Unlike manual debt advice services, DAMOCLES uses AI to automatically detect violations and generate legal responses 24/7.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⚖️ Legal Expertise</h3>
                <p className="text-gray-600">
                  Built with GDPR lawyers and consumer rights experts to ensure every action is legally sound and effective.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Collective Power</h3>
                <p className="text-gray-600">
                  Join thousands of users through SWORD tokens to create coordinated legal action against illegal debt practices.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🛡️ Privacy First</h3>
                <p className="text-gray-600">
                  Your data stays private and secure while we fight for your rights. Full GDPR compliance guaranteed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Rights?</h2>
            <p className="text-xl mb-8 text-purple-100">
              Join thousands of people who have recovered money and stopped illegal debt collection.
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