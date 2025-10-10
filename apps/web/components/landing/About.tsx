export function About() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-white rounded-full border border-slate-200 shadow-sm">
            <span className="text-sm font-medium text-slate-700">Hvorfor DAMOCLES eksisterer</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Vi snur maktdynamikken
          </h2>
        </div>

        {/* Story */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed">
              <strong>Inkasso i Norge er ødelagt.</strong> Selskaper rutinemessig krever ulovlige gebyrer,
              feilberegner renter, og mangler dokumentasjon for kravene sine. Det er
              <strong> 26 milliarder kroner årlig</strong> i inkassokrav, og mange inneholder feil.
            </p>

            <p className="text-slate-700 leading-relaxed">
              Men å utfordre inkassobyråer er komplisert, tidkrevende, og krever juridisk kunnskap som
              de fleste ikke har. Systemet er bygget for å favorisere inkassobyråene - ikke deg.
            </p>

            <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Namnet "DAMOCLES"</h3>

            <p className="text-slate-700 leading-relaxed">
              Namnet kommer fra den gamle greske fortellingen om Damokles' sverd - et sverd som hang
              i en enkel tråd over hodet til Damokles for å vise farene ved makt.
            </p>

            <p className="text-slate-700 leading-relaxed">
              <strong>I inkassobransjen er det du som har sverdet over deg.</strong> Trusler om betalingsanmerkninger,
              inkassokrav, og juridiske skritt holder folk i konstant frykt - selv når kravene er ulovlige.
            </p>

            <p className="text-xl text-blue-600 font-semibold leading-relaxed">
              Vi snur den maktdynamikken. DAMOCLES gir deg sverdet.
            </p>

            <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Hvorfor åpen kildekode?</h3>

            <p className="text-slate-700 leading-relaxed">
              Vi har gjort hele DAMOCLES-plattformen 100% åpen kildekode under AGPL-3.0 lisens.
              Dette betyr:
            </p>

            <ul className="space-y-2 text-slate-700">
              <li><strong>Fullstendig transparens</strong> - Du kan se nøyaktig hva systemet gjør</li>
              <li><strong>Ingen skjult agenda</strong> - Ingen mørke mønstre eller manipulasjon</li>
              <li><strong>Kan ikke kjøpes opp og stenges ned</strong> - Fellesskapet kan alltid forke prosjektet</li>
              <li><strong>Kollektiv forbedring</strong> - Alle kan bidra til å gjøre systemet bedre</li>
            </ul>

            <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Vår tilnærming</h3>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-6">
              <p className="text-slate-700 leading-relaxed mb-0">
                <strong>Vi presser aldri desperate brukere.</strong> Hvis du er i en sårbar situasjon,
                vil systemet varsle deg om at hastige beslutninger kan være skadelige. Vi bygger tålmodighet
                inn i kjernen av plattformen.
              </p>
            </div>

            <p className="text-slate-700 leading-relaxed">
              DAMOCLES er bygget på <strong>matematisk sannhet</strong>, ikke markedsføringshype.
              Vi bruker automatisering til å oppdage faktiske brudd i inkassokrav - ikke til å
              skape falsk frykt.
            </p>

            <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Dette er verktøy, ikke magi</h3>

            <p className="text-slate-700 leading-relaxed">
              DAMOCLES er ikke juridisk rådgivning. Vi tilbyr ikke garantier for økonomiske resultater.
              Vi gir deg <strong>verktøy</strong> til å:
            </p>

            <ul className="space-y-2 text-slate-700">
              <li>Utøve dine lovfestede GDPR-rettigheter (Artikkel 15)</li>
              <li>Oppdage matematiske feil i inkassokrav automatisk</li>
              <li>Bygge bevis for eventuelle juridiske utfordringer</li>
              <li>Forstå din gjeldssituasjon med PDI (Personal Debt Index)</li>
            </ul>

            <p className="text-slate-700 leading-relaxed">
              <strong>Du bestemmer hvert steg.</strong> Du beveger deg i ditt eget tempo. Ingen press. Ingen tvang.
            </p>

            <div className="bg-slate-100 border border-slate-200 rounded-xl p-6 mt-8">
              <p className="text-slate-800 font-medium mb-2">
                <strong>Vår visjon:</strong>
              </p>
              <p className="text-slate-700 leading-relaxed mb-0">
                Et Norge der inkassokrav automatisk blir verifisert for lovlighet.
                Der forbrukere har samme teknologiske våpen som inkassobyråer.
                Der maktbalansen er jevn.
              </p>
            </div>
          </div>
        </div>

        {/* Footer message */}
        <div className="text-center mt-12">
          <p className="text-slate-600 italic">
            Bygget av fellesskapet. For fellesskapet. Åpen for alltid.
          </p>
        </div>
      </div>
    </section>
  )
}
