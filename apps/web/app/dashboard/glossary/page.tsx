'use client';

/**
 * Glossary Page
 *
 * Comprehensive reference for all technical terms used in the DAMOCLES platform.
 * Helps non-technical users understand complex concepts.
 */

import { useState } from 'react';
import { Search, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { glossary, getTermsByCategory, searchGlossary, type GlossaryEntry } from '@/components/ui/glossary-data';

const categories = [
  { id: 'all', name: 'Alle termer', icon: '📚' },
  { id: 'legal', name: 'Juridiske termer', icon: '⚖️' },
  { id: 'financial', name: 'Økonomiske termer', icon: '💰' },
  { id: 'blockchain', name: 'Blockchain & Tokens', icon: '🔗' },
  { id: 'technical', name: 'Tekniske termer', icon: '⚙️' },
] as const;

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | GlossaryEntry['category']>('all');

  // Filter terms based on search and category
  const filteredTerms = (() => {
    let terms: Array<keyof typeof glossary>;

    if (searchQuery) {
      terms = searchGlossary(searchQuery);
    } else if (selectedCategory === 'all') {
      terms = Object.keys(glossary) as Array<keyof typeof glossary>;
    } else {
      terms = getTermsByCategory(selectedCategory);
    }

    // Sort alphabetically by title
    return terms.sort((a, b) => {
      const titleA = glossary[a].title.toLowerCase();
      const titleB = glossary[b].title.toLowerCase();
      return titleA.localeCompare(titleB);
    });
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Tilbake til dashboard
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Ordliste
            </h1>
          </div>

          <p className="text-gray-600 max-w-2xl">
            Forklaringer på alle tekniske termer brukt i DAMOCLES-plattformen.
            Perfekt for å forstå juridiske, økonomiske, og blockchain-konsepter.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Søk etter termer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Viser <span className="font-semibold">{filteredTerms.length}</span> termer
          {searchQuery && ` for "${searchQuery}"`}
        </div>

        {/* Glossary Terms */}
        {filteredTerms.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ingen termer funnet
            </h3>
            <p className="text-gray-600">
              Prøv et annet søk eller velg en annen kategori.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTerms.map((term) => {
              const entry = glossary[term];
              return (
                <div
                  key={term}
                  id={term}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {entry.title}
                    </h3>
                    {entry.category && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        entry.category === 'legal'
                          ? 'bg-purple-100 text-purple-700'
                          : entry.category === 'financial'
                          ? 'bg-green-100 text-green-700'
                          : entry.category === 'blockchain'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {entry.category === 'legal' && '⚖️ Juridisk'}
                        {entry.category === 'financial' && '💰 Økonomi'}
                        {entry.category === 'blockchain' && '🔗 Blockchain'}
                        {entry.category === 'technical' && '⚙️ Teknisk'}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="text-gray-700 mb-4">
                    {typeof entry.description === 'string' ? (
                      <p>{entry.description}</p>
                    ) : (
                      entry.description
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {entry.learnMoreUrl ? (
                      <a
                        href={entry.learnMoreUrl}
                        target={entry.learnMoreUrl.startsWith('http') ? '_blank' : undefined}
                        rel={entry.learnMoreUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Lær mer →
                      </a>
                    ) : (
                      <div />
                    )}

                    {entry.relatedTerms && entry.relatedTerms.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Relatert:</span>
                        <div className="flex gap-1">
                          {entry.relatedTerms.slice(0, 3).map((relatedTerm) => (
                            <a
                              key={relatedTerm}
                              href={`#${relatedTerm}`}
                              onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(relatedTerm)?.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'center',
                                });
                              }}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            >
                              {glossary[relatedTerm].title.split('(')[0].trim()}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Links to Common Terms */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📌 Mest søkte termer
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['pdi_score', 'sword_token', 'gdpr_article_15', 'violation_score', 'settlement', 'datatilsynet', 'shield_tier', 'platform_fee'].map((term) => (
              <a
                key={term}
                href={`#${term}`}
                onClick={(e) => {
                  e.preventDefault();
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setTimeout(() => {
                    document.getElementById(term)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    });
                  }, 100);
                }}
                className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-50 transition-colors text-center"
              >
                {glossary[term as keyof typeof glossary].title.split('(')[0].trim()}
              </a>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Trenger du mer hjelp?
          </h3>
          <p className="text-gray-700 mb-4">
            Finner du ikke svaret du leter etter? Ta kontakt med support-teamet vårt.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard/support"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kontakt Support
            </Link>
            <Link
              href="/docs"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Les Dokumentasjonen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
