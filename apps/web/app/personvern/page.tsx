import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PersonvernPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Personvern
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700">
                og datahåndtering
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Hvordan DAMOCLES beskytter dine data og respekterer dine rettigheter
            </p>
          </div>
        </section>

        {/* Core Principles */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Våre prinsipper</h2>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
                <p className="text-lg text-gray-700 leading-relaxed">
                  <strong>DAMOCLES er bygget på prinsippet om dataminimalisering.</strong> Vi samler kun
                  data som er nødvendig for å utøve dine GDPR-rettigheter og oppdage brudd i inkassokrav.
                </p>
              </div>
            </div>

            {/* What Data We Collect */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Hvilke data samler vi?</h3>

              <div className="space-y-6">
                <div className="border-l-4 border-blue-600 pl-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Kontodata</h4>
                  <p className="text-gray-600 mb-2">
                    E-post, navn, telefonnummer (valgfritt). Ingen personnummer lagres i klartekst – kun
                    en kryptografisk hash for å forhindre duplikate kontoer.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Formål:</strong> Identifikasjon, kommunikasjon, kontooppretting
                  </p>
                </div>

                <div className="border-l-4 border-indigo-600 pl-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Gjeldsdata</h4>
                  <p className="text-gray-600 mb-2">
                    Kreditorinformasjon, opprinnelig beløp, gjeldende beløp, kontonummer (valgfritt).
                    Ingen sensitive betalingsdata lagres.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Formål:</strong> PDI-beregning, brudddeteksjon, GDPR-forespørselgenerering
                  </p>
                </div>

                <div className="border-l-4 border-slate-600 pl-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">GDPR-forespørsler</h4>
                  <p className="text-gray-600 mb-2">
                    Innholdet i dine GDPR-forespørsler og svarene fra kreditorene. Disse lagres for å
                    oppdage brudd og bygge bevispakker.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Formål:</strong> Brudddeteksjon, juridisk dokumentasjon, kollektive søksmål
                  </p>
                </div>

                <div className="border-l-4 border-green-600 pl-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Blockchain-bevis</h4>
                  <p className="text-gray-600 mb-2">
                    Kryptografiske hasher av dine GDPR-forespørsler lagres på Cardano blockchain.
                    Dette er uforanderlige beviser for rettslig bruk.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Formål:</strong> Juridisk bevis, tidsmerking, dokumentintegritet
                  </p>
                </div>
              </div>
            </div>

            {/* What We DON'T Collect */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Hva samler vi IKKE?</h3>

              <div className="bg-green-50 p-6 rounded-2xl">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span><strong>Ingen sporingsverktøy:</strong> Ingen Google Analytics, Facebook Pixel, eller 3.-parts sporingskakser</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span><strong>Ingen datadeling:</strong> Vi selger eller deler aldri dataene dine med tredjeparter</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span><strong>Ingen adferdsprofil:</strong> Vi bygger ikke profiler for målrettet reklame</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                    <span><strong>Ingen unødvendig datainnsamling:</strong> Vi ber kun om det vi trenger for å levere tjenesten</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Dine rettigheter</h3>

              <p className="text-gray-600 mb-6">
                Som bruker av DAMOCLES har du fulle GDPR-rettigheter over dataene dine:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Rett til innsyn (Art. 15)</h4>
                  <p className="text-gray-600 text-sm">
                    Du kan når som helst be om en kopi av alle data vi har om deg.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Rett til sletting (Art. 17)</h4>
                  <p className="text-gray-600 text-sm">
                    Du kan be om at dataene dine slettes, med unntak av juridisk påkrevd dokumentasjon.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Rett til dataportabilitet (Art. 20)</h4>
                  <p className="text-gray-600 text-sm">
                    Du kan eksportere alle dataene dine i maskinlesbart format (JSON).
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Rett til å klage (Art. 77)</h4>
                  <p className="text-gray-600 text-sm">
                    Du kan klage til Datatilsynet hvis du mener vi bryter personvernreglene.
                  </p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sikkerhet</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Kryptering</h4>
                    <p className="text-gray-600">
                      Alle data krypteres både i transitt (TLS 1.3) og i hvile (AES-256).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Dataisolering</h4>
                    <p className="text-gray-600">
                      Dine data er strengt isolert fra andre brukere og tilgjengelig kun for deg.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⏱️</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Datasletting</h4>
                    <p className="text-gray-600">
                      Data som ikke lenger er nødvendig slettes automatisk etter 3 år (foreldelsesfrist).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Spørsmål om personvern?</h3>
              <p className="text-gray-600 mb-4">
                Har du spørsmål om hvordan vi behandler dataene dine? Kontakt vårt personvernteam:
              </p>
              <p className="text-gray-700">
                📧 <strong>privacy@damocles.no</strong>
              </p>
              <p className="text-gray-700 mt-2">
                🏛️ <strong>Datatilsynet:</strong> <a href="https://www.datatilsynet.no" className="text-blue-600 underline">www.datatilsynet.no</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
