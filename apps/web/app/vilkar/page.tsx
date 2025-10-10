import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function VilkarPage() {
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
              Vilkår
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700">
                for bruk
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Klare regler uten skjult jusspråk
            </p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Important Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-2">⚠️ Viktig å forstå</h3>
              <p className="text-gray-700 leading-relaxed">
                DAMOCLES er et <strong>verktøy</strong> som hjelper deg å utøve dine GDPR-rettigheter.
                Vi er <strong>ikke</strong> advokater, og gir ikke juridisk rådgivning. Du bestemmer selv
                hva du gjør med informasjonen systemet gir deg.
              </p>
            </div>

            {/* 1. Acceptance */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aksept av vilkår</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Ved å bruke DAMOCLES-plattformen aksepterer du disse vilkårene. Hvis du ikke aksepterer
                vilkårene, må du ikke bruke tjenesten.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Vi forbeholder oss retten til å oppdatere disse vilkårene. Vesentlige endringer vil bli
                kommunisert via e-post minst 30 dager før de trer i kraft.
              </p>
            </div>

            {/* 2. Services */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Tjenestebeskrivelse</h2>

              <h3 className="text-lg font-bold text-gray-900 mb-2">Hva DAMOCLES gjør:</h3>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 flex-shrink-0 mt-0.5">•</span>
                  <span>Beregner Personal Debt Index (PDI) basert på dine gjeldsdata</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 flex-shrink-0 mt-0.5">•</span>
                  <span>Genererer GDPR-forespørsler (Artikkel 15) til kreditorene dine</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 flex-shrink-0 mt-0.5">•</span>
                  <span>Analyserer svar fra kreditorer for potensielle brudd på inkassoloven og GDPR</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 flex-shrink-0 mt-0.5">•</span>
                  <span>Lagrer bevis på Cardano blockchain for rettslig bruk</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 flex-shrink-0 mt-0.5">•</span>
                  <span>Koordinerer kollektive tiltak via SWORD-tokens (når implementert)</span>
                </li>
              </ul>

              <h3 className="text-lg font-bold text-gray-900 mb-2">Hva DAMOCLES IKKE gjør:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 flex-shrink-0 mt-0.5">✗</span>
                  <span>Gir ikke juridisk rådgivning eller representerer deg i retten</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 flex-shrink-0 mt-0.5">✗</span>
                  <span>Garanterer ikke at du får slettet eller redusert gjeld</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 flex-shrink-0 mt-0.5">✗</span>
                  <span>Forhandler ikke direkte med kreditorene på dine vegne</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 flex-shrink-0 mt-0.5">✗</span>
                  <span>Gir ingen garantier for økonomiske resultater</span>
                </li>
              </ul>
            </div>

            {/* 3. User Responsibilities */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Ditt ansvar</h2>

              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Du er ansvarlig for:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">→</span>
                    <span>Å oppgi korrekt og sannferdig informasjon</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">→</span>
                    <span>Å ta egne beslutninger basert på informasjonen du får fra DAMOCLES</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">→</span>
                    <span>Å ikke bruke tjenesten for å unnvike legitim gjeld</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">→</span>
                    <span>Å konsultere en advokat hvis du trenger juridisk rådgivning</span>
                  </li>
                </ul>
              </div>

              <p className="text-gray-600 leading-relaxed">
                <strong>Misbruk av tjenesten:</strong> Vi forbeholder oss retten til å suspendere kontoer
                som brukes til å generere falske krav, trakassere kreditorer, eller andre formål som strider
                mot tjenestens formål.
              </p>
            </div>

            {/* 4. Pricing */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prising og betaling</h2>

              <p className="text-gray-600 leading-relaxed mb-4">
                Grunnleggende funksjoner (PDI-beregning, enkel GDPR-forespørsel) er gratis.
                Avanserte funksjoner (AI-analyse, brudddeteksjon, blockchain-bevissikring) har en engangskostnad
                per sak som spesifisert på <Link href="/pricing" className="text-blue-600 underline">prissiden</Link>.
              </p>

              <div className="bg-blue-50 p-6 rounded-2xl mb-4">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Ingen skjulte kostnader</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 flex-shrink-0 mt-0.5">✓</span>
                    <span>Ingen abonnement eller medlemskap</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 flex-shrink-0 mt-0.5">✓</span>
                    <span>Du betaler kun for tjenester du aktivt velger</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 flex-shrink-0 mt-0.5">✓</span>
                    <span>Alle priser oppgitt inkludert mva</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 flex-shrink-0 mt-0.5">✓</span>
                    <span>Betalinger håndteres av Stripe/Vipps (vi lagrer ikke kortinformasjon)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 5. Limitations */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Ansvarsfraskrivelse</h2>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Viktig juridisk informasjon</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  DAMOCLES leveres "som det er" uten garantier av noe slag. Vi garanterer ikke at:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">•</span>
                    <span>Kreditorer vil respondere på GDPR-forespørsler</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">•</span>
                    <span>Oppdagede brudd vil føre til økonomisk kompensasjon</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">•</span>
                    <span>AI-analysen er feilfri eller fullstendig</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">•</span>
                    <span>Tjenesten vil være tilgjengelig 100% av tiden</span>
                  </li>
                </ul>
              </div>

              <p className="text-gray-600 leading-relaxed">
                <strong>Ansvarsbegrensning:</strong> DAMOCLES sitt ansvar er begrenset til det du har betalt
                for tjenesten de siste 12 månedene. Vi er ikke ansvarlige for indirekte tap, tapt inntekt,
                eller andre følgeskader.
              </p>
            </div>

            {/* 6. Beta Status */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Beta-status</h2>

              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  DAMOCLES er i aktiv utvikling (Beta). Dette betyr:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">→</span>
                    <span>Funksjoner kan endre seg uten forvarsel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">→</span>
                    <span>Det kan forekomme feil eller ustabilitet</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">→</span>
                    <span>Vi forbeholder oss retten til å justere priser og tjenester</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5">→</span>
                    <span>Du bør alltid ha backup av viktige data</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 7. Termination */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Avslutning av tjeneste</h2>

              <p className="text-gray-600 leading-relaxed mb-4">
                Du kan når som helst avslutte kontoen din og slette dataene dine via innstillinger.
                Vi kan avslutte din tilgang til tjenesten hvis du bryter disse vilkårene.
              </p>

              <p className="text-gray-600 leading-relaxed">
                Hvis tjenesten avsluttes permanent, vil vi gi minst 90 dagers varsel slik at du kan
                eksportere dataene dine.
              </p>
            </div>

            {/* 8. Open Source */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Åpen kildekode</h2>

              <p className="text-gray-600 leading-relaxed mb-4">
                DAMOCLES-plattformen er lisensiert under <strong>AGPL-3.0</strong>. Dette betyr:
              </p>

              <ul className="space-y-2 text-gray-600 mb-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                  <span>Kildekoden er offentlig tilgjengelig på GitHub</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                  <span>Du kan inspisere nøyaktig hvordan systemet fungerer</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                  <span>Uavhengige sikkerhetseksperter kan verifisere koden</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                  <span>Hvis vi forsvinner, kan andre fortsette prosjektet</span>
                </li>
              </ul>

              <p className="text-gray-600 leading-relaxed">
                Dette er en bevisst etisk beslutning for å sikre transparens og tillit.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Spørsmål om vilkårene?</h3>
              <p className="text-gray-600 mb-4">
                Hvis du har spørsmål om disse vilkårene, eller trenger avklaring, kontakt oss:
              </p>
              <p className="text-gray-700">
                📧 <strong>legal@damocles.no</strong>
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Sist oppdatert: 10. oktober 2025
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
