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
              Automated debt protection platform using GDPR rights and violation detection.
            </p>
            <p className="text-gray-400 text-xs">
              Defending your rights against illegal debt collection.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</a></li>
              <li><a href="/dashboard/pdi" className="text-gray-300 hover:text-white">Debt Health Check</a></li>
              <li><a href="/dashboard/debts" className="text-gray-300 hover:text-white">Manage Debts</a></li>
              <li><a href="/how-it-works" className="text-gray-300 hover:text-white">How It Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="text-gray-300 hover:text-white">About</a></li>
              <li><a href="/pricing" className="text-gray-300 hover:text-white">Pricing</a></li>
              <li><a href="/how-it-works" className="text-gray-300 hover:text-white">How It Works</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/contact" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Terms of Service</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-white">GDPR Compliance</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 DAMOCLES Platform. Automated debt protection for everyone.</p>
          <p className="mt-2">🛡️ Defending your rights against illegal debt collection ⚖️</p>
        </div>
      </div>
    </footer>
  )
}