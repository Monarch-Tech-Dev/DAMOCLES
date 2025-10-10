export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">🗡️</span>
              DAMOCLES
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Automatisert gjeldsbeskyttelse med GDPR-rettigheter og brudddeteksjon.
            </p>
            <p className="text-gray-400 text-xs">
              Automatisert gjeldsbeskyttelse for alle.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Plattform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</a></li>
              <li><a href="/dashboard/pdi" className="text-gray-300 hover:text-white">Gjeldshelse-sjekk</a></li>
              <li><a href="/dashboard/debts" className="text-gray-300 hover:text-white">Administrer gjeld</a></li>
              <li><a href="/how-it-works" className="text-gray-300 hover:text-white">Hvordan det virker</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Selskap</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="text-gray-300 hover:text-white">Om oss</a></li>
              <li><a href="/pricing" className="text-gray-300 hover:text-white">Prising</a></li>
              <li><a href="/how-it-works" className="text-gray-300 hover:text-white">Hvordan det virker</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Kontakt</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Juridisk</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/contact" className="text-gray-300 hover:text-white">Personvern</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Vilkår for bruk</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-white">GDPR-samsvar</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Kontakt</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 DAMOCLES Platform. Automatisert gjeldsbeskyttelse for alle.</p>
          <p className="mt-2">🛡️ Verktøy for å utøve dine GDPR-rettigheter ⚖️</p>
        </div>
      </div>
    </footer>
  )
}