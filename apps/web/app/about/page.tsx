import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 leading-tight">
              Om
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700">
                DAMOCLES
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Verktøy for å utøve dine GDPR-rettigheter mot inkassobransjen
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Vårt oppdrag</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Inkassokrav inneholder ofte feil. DAMOCLES gir deg verktøy til å utøve dine GDPR-rettigheter
                og oppdage brudd automatisk. Vi bygger teknologi som gjør det enklere å be om dokumentasjon
                og kontrollere at alt er korrekt.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚖️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Juridisk kunnskap</h3>
                <p className="text-gray-600">
                  Bygget med forståelse for GDPR og inkassoloven
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Automatisering</h3>
                <p className="text-gray-600">
                  Teknologi som hjelper deg å oppdage potensielle brudd
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Du bestemmer</h3>
                <p className="text-gray-600">
                  Du beveger deg i ditt eget tempo og velger selv hva du vil gjøre
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Hvorfor DAMOCLES finnes</h2>
              <div className="prose prose-lg text-gray-600">
                <p className="mb-6">
                  Inkassokrav inneholder ofte feil. Gebyrer over lovlig maksimum, feilberegnet rente, manglende
                  dokumentasjon. Men det er tidkrevende å sjekke alt manuelt, og mange vet ikke hvor de skal starte.
                </p>
                <p className="mb-6">
                  Navnet "DAMOCLES" kommer fra den greske historien om et sverd som henger i en tråd—et symbol på den
                  konstante trusselen inkassoselskaper bruker for å presse folk, selv når deres egne praksis kan
                  bryte loven.
                </p>
                <p className="mb-6">
                  DAMOCLES gir deg verktøy til å be om dokumentasjon via GDPR-rettigheter og oppdage potensielle
                  brudd automatisk. Du bestemmer selv hva du vil gjøre med informasjonen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Teknologien</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Personal Debt Index (PDI)</h3>
                <p className="text-gray-600 mb-6">
                  En algoritme som analyserer gjeldssituasjonen din og identifiserer potensielle brudd i gebyrer,
                  renter og innkrevingspraksis.
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">GDPR-automatisering</h3>
                <p className="text-gray-600 mb-6">
                  Genererer og sender juridisk korrekte GDPR-forespørsler til inkassoselskaper, som tvinger dem
                  til å utlevere all data de har om deg.
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">SWORD Tokens</h3>
                <p className="text-gray-600">
                  Blockchain-baserte tokens som muliggjør koordinert handling. Når nok brukere rapporterer samme brudd,
                  kan vi samarbeide for større effekt.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-4">Beta-status</h3>
                <div className="space-y-4">
                  <div className="bg-white/20 p-4 rounded-lg">
                    <div className="text-xl font-bold mb-2">Verktøy, ikke magi</div>
                    <div className="text-blue-100">
                      DAMOCLES er et verktøy som hjelper deg å utøve dine rettigheter. Vi garanterer ikke økonomiske resultater.
                    </div>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg">
                    <div className="text-xl font-bold mb-2">Beta-versjon</div>
                    <div className="text-blue-100">
                      Plattformen er under utvikling. Funksjoner kan endre seg og resultater varierer.
                    </div>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg">
                    <div className="text-xl font-bold mb-2">Åpen kildekode</div>
                    <div className="text-blue-100">
                      AGPL-3.0 lisens - transparent og etisk design.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Kom i gang med DAMOCLES</h2>
            <p className="text-xl mb-8 text-blue-100">
              Beveg deg i ditt eget tempo. Ingen kredittkort påkrevd for gratis verktøy.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Kom i gang gratis
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}