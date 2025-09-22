import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function ContactPage() {
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
              Get in
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
                Touch
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Need help with debt protection or interested in enterprise solutions? We're here to help.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 mb-16">

              {/* Support */}
              <div className="text-center p-8 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🆘</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">User Support</h3>
                <p className="text-gray-600 mb-4">
                  Questions about your debt protection or how DAMOCLES works?
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>📧 support@damocles.io</p>
                  <p>🕐 Response within 24 hours</p>
                </div>
              </div>

              {/* Enterprise */}
              <div className="text-center p-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏢</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Enterprise Sales</h3>
                <p className="text-purple-100 mb-4">
                  Bulk GDPR management, white-label solutions, and custom integrations.
                </p>
                <div className="space-y-2 text-sm text-purple-100">
                  <p>📧 enterprise@damocles.io</p>
                  <p>📞 +47 123 45 678</p>
                </div>
              </div>

              {/* Legal */}
              <div className="text-center p-8 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚖️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Legal Inquiries</h3>
                <p className="text-gray-600 mb-4">
                  Legal questions, partnerships, or compliance matters?
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>📧 legal@damocles.io</p>
                  <p>🕐 Response within 48 hours</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Send Us a Message</h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Your first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option>Select a topic</option>
                      <option>User Support</option>
                      <option>Enterprise Sales</option>
                      <option>Legal Inquiry</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    Send Message
                  </button>
                </form>

                <p className="text-sm text-gray-500 text-center mt-6">
                  We typically respond within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Office Info */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Office</h2>
              <p className="text-xl text-gray-600">
                Based in Oslo, serving consumers across Europe
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">DAMOCLES Platform AS</h3>
                <div className="space-y-3 text-gray-600">
                  <p className="flex items-center">
                    <span className="mr-3">📍</span>
                    Storgata 123, 0184 Oslo, Norway
                  </p>
                  <p className="flex items-center">
                    <span className="mr-3">🏢</span>
                    Organization number: 123 456 789
                  </p>
                  <p className="flex items-center">
                    <span className="mr-3">⏰</span>
                    Monday - Friday: 9:00 - 17:00 CET
                  </p>
                  <p className="flex items-center">
                    <span className="mr-3">🌐</span>
                    Licensed under Norwegian Financial Authority
                  </p>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Follow Us</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                      <span className="sr-only">LinkedIn</span>
                      <span className="text-2xl">💼</span>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                      <span className="sr-only">Twitter</span>
                      <span className="text-2xl">🐦</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-8 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-4">Need Immediate Help?</h3>
                <p className="text-purple-100 mb-6">
                  If you're dealing with aggressive debt collectors or urgent legal issues,
                  don't wait. Get started with DAMOCLES protection right away.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-block bg-white text-purple-600 px-6 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Start Protection Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}