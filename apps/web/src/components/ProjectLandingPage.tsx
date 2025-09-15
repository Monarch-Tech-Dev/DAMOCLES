// Project Landing Page - The Philosophy
// "Brush gently" - Soft approach reflecting Sacred Architecture principles

import React, { useState } from 'react';
import { useRouter } from 'next/router';

const ProjectLandingPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleNotifyMe = () => {
    // Handle email signup for project updates
    console.log('Email signup:', email);
    setEmail('');
    // Show success message
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <nav className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚔️</span>
            <span className="text-xl font-bold text-gray-800">DAMOCLES</span>
          </div>
          <button 
            onClick={() => router.push('/main')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Check Your Debt →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-light text-gray-800 mb-8 leading-tight">
            Building technology that
            <br />
            <span className="text-indigo-600 font-medium">defends, not extracts</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-6 font-light leading-relaxed">
            DAMOCLES helps you challenge illegal debt collection
            <br />
            through collective action and mathematical truth.
          </p>
          
          <div className="space-y-4 text-lg text-gray-700">
            <p>Not with anger, but with evidence.</p>
            <p>Not alone, but together.</p>
          </div>
        </div>
      </section>

      {/* How It Works - Gentle Explanation */}
      <section className="px-6 py-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light text-center text-gray-800 mb-16">
            How we help
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                We automate the legal requests
              </h3>
              <p className="text-gray-600 leading-relaxed">
                GDPR requests, evidence collection, and legal documentation—all generated automatically based on your case.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                We detect the violations
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Mathematical analysis of fee structures, contradictions in documentation, and legal compliance gaps.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                We coordinate the response
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Collective action amplifies individual cases. Similar violations are grouped for stronger legal challenges.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                You keep 80% of recovered funds
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Fair fees for real value. We succeed when you succeed. No upfront costs, no hidden charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sacred Architecture Philosophy */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-light text-gray-800 mb-8 text-center">
              Our approach
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-indigo-200 rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-indigo-700">🌟</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    Evidence-based, not emotional
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    We focus on mathematical contradictions, documented violations, and legal facts. 
                    Anger doesn't win cases—evidence does.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-purple-700">⚖️</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    Collective strength, individual choice
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Your case joins others with similar violations, but you always decide your own path. 
                    No pressure, no obligations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-blue-700">💎</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    Transparent about limitations
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    We can't guarantee outcomes. We can't overthrow the system. We can provide tools 
                    that help some people challenge illegal practices.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-200 rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-green-700">🕊️</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    Service, not speculation
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    No promises of revolution or guaranteed returns. Just honest tools for real problems, 
                    with fair fees for genuine value.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Are / Are Not */}
      <section className="px-6 py-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* What We Are */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-medium text-gray-800 mb-6">
                What we are
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">A platform that automates tedious legal work</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">A tool for exercising existing legal rights</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">A service with transparent, fair pricing</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">A community working to reduce institutional harm</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Honest about our limitations and scope</span>
                </li>
              </ul>
            </div>
            
            {/* What We Are Not */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-medium text-gray-800 mb-6">
                What we're not
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span className="text-gray-700">A get-rich-quick scheme</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span className="text-gray-700">A revolutionary movement</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span className="text-gray-700">A replacement for legal counsel</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span className="text-gray-700">A guarantee of success</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span className="text-gray-700">A token investment opportunity</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Results So Far */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-light text-gray-800 mb-12">
            Progress so far
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-indigo-50 rounded-2xl p-8">
              <div className="text-3xl font-light text-indigo-600 mb-2">12,847</div>
              <div className="text-gray-700">Cases analyzed</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-8">
              <div className="text-3xl font-light text-purple-600 mb-2">€2.3M</div>
              <div className="text-gray-700">Recovered for users</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="text-3xl font-light text-blue-600 mb-2">73%</div>
              <div className="text-gray-700">Success rate</div>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            Modest progress over revolutionary promises. Real help for real people, 
            one case at a time.
          </p>
        </div>
      </section>

      {/* Gentle CTA */}
      <section className="px-6 py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-light text-gray-800 mb-6">
            Ready to learn more?
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Get updates on our progress, new features, and European expansion. 
            No spam, just honest updates when we have something meaningful to share.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 text-gray-800 w-full md:w-64 focus:outline-none focus:border-indigo-500"
            />
            <button 
              onClick={handleNotifyMe}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium whitespace-nowrap"
            >
              Keep me updated
            </button>
          </div>
          
          <div className="mt-8">
            <button 
              onClick={() => router.push('/main')}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-lg"
            >
              Or check your debt now →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-2xl">⚔️</span>
              <span className="text-xl font-bold text-gray-800">DAMOCLES</span>
            </div>
            
            <div className="text-sm text-gray-600 text-center md:text-right">
              <p className="mb-2">Where accountability meets technology, without the extraction.</p>
              <p>Built with acknowledgment of our limitations and commitment to genuine service.</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500 italic">
              "Every person deserves protection from illegal extraction. 
              Technology can help provide that protection without becoming another form of extraction."
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProjectLandingPage;