'use client';

/**
 * Intermediate Dashboard
 *
 * Balanced view for users with some experience.
 * Shows basic metrics, active cases, and newly unlocked features.
 */

import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { NextStep, UserProgressState, FeatureUnlock, getUnlockedFeatures, shouldPromptAdvancedMode } from '@/lib/user-progress';

interface IntermediateDashboardProps {
  user: {
    name?: string;
    swordTokenBalance: number;
    shieldTier: string;
  };
  metrics: {
    totalDebts: number;
    activeGdprRequests: number;
    violationsDetected: number;
    totalRecoveryAmount: number;
    pdiScore?: number;
  };
  recentCases: Array<{
    id: string;
    creditorName: string;
    status: 'pending' | 'active' | 'response_received' | 'settled';
    debtAmount: number;
    createdAt: Date;
  }>;
  nextSteps: NextStep[];
  progressState: UserProgressState;
}

export function IntermediateDashboard({
  user,
  metrics,
  recentCases,
  nextSteps,
  progressState,
}: IntermediateDashboardProps) {
  const unlockedFeatures = getUnlockedFeatures(progressState);
  const showAdvancedPrompt = shouldPromptAdvancedMode(progressState);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hei{user.name ? `, ${user.name}` : ''}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Her er en oversikt over dine aktive saker
          </p>
        </div>
        <Link
          href="/dashboard?mode=advanced"
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Sparkles size={16} />
          Avansert visning
        </Link>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Debts */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Registrerte gjeld</h3>
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalDebts}</p>
          <Link href="/dashboard/debts" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Se alle →
          </Link>
        </div>

        {/* Active GDPR Requests */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Aktive forespørsler</h3>
            <span className="text-2xl">⚖️</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.activeGdprRequests}</p>
          <p className="text-sm text-gray-500 mt-1">
            GDPR Art. 15 forespørsler
          </p>
        </div>

        {/* Violations Detected */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Brudd oppdaget</h3>
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{metrics.violationsDetected}</p>
          {metrics.violationsDetected > 0 && (
            <Link href="/dashboard/violations" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
              Se detaljer →
            </Link>
          )}
        </div>

        {/* SWORD Tokens */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">SWORD Tokens</h3>
            <span className="text-2xl">🪙</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {user.swordTokenBalance.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {user.shieldTier}
          </p>
        </div>
      </div>

      {/* PDI Score Card (if unlocked) */}
      {metrics.pdiScore !== undefined && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                📊 Din PDI Score (Personal Debt Index)
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                Score fra 0-100 som måler din gjeldshelse
              </p>
              <div className="flex items-end gap-4">
                <div className="text-6xl font-bold">{metrics.pdiScore}</div>
                <div className="mb-2">
                  {metrics.pdiScore >= 70 ? (
                    <div className="flex items-center gap-1 text-green-300">
                      <TrendingUp size={20} />
                      <span className="text-sm font-medium">Sunn gjeldshelse</span>
                    </div>
                  ) : metrics.pdiScore >= 40 ? (
                    <div className="flex items-center gap-1 text-yellow-300">
                      <AlertCircle size={20} />
                      <span className="text-sm font-medium">Moderat risiko</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-300">
                      <TrendingDown size={20} />
                      <span className="text-sm font-medium">Høy risiko</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/pdi"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Se fullstendig analyse →
            </Link>
          </div>
        </div>
      )}

      {/* Newly Unlocked Features */}
      {unlockedFeatures.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="text-purple-600" size={24} />
            Nye funksjoner tilgjengelig!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unlockedFeatures.slice(0, 4).map((feature) => (
              <div
                key={feature.id}
                className="bg-white rounded-lg border border-purple-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{feature.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {feature.description}
                    </p>
                    {feature.ctaUrl && (
                      <Link
                        href={feature.ctaUrl}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-2 inline-block"
                      >
                        {feature.ctaLabel || 'Prøv nå'} →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Cases */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Dine aktive saker</h2>
          <Link
            href="/dashboard/debts"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Se alle saker →
          </Link>
        </div>

        {recentCases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Du har ingen registrerte saker ennå</p>
            <Link
              href="/dashboard/debts/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ➕ Legg til din første gjeld
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCases.slice(0, 5).map((case_) => (
              <div
                key={case_.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0">
                    {case_.status === 'settled' ? (
                      <CheckCircle2 className="text-green-500" size={24} />
                    ) : case_.status === 'response_received' ? (
                      <AlertCircle className="text-yellow-500" size={24} />
                    ) : case_.status === 'active' ? (
                      <Clock className="text-blue-500" size={24} />
                    ) : (
                      <Clock className="text-gray-400" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {case_.creditorName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {case_.debtAmount.toLocaleString('nb-NO')} NOK
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        case_.status === 'settled'
                          ? 'bg-green-100 text-green-700'
                          : case_.status === 'response_received'
                          ? 'bg-yellow-100 text-yellow-700'
                          : case_.status === 'active'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {case_.status === 'settled'
                        ? 'Avsluttet'
                        : case_.status === 'response_received'
                        ? 'Svar mottatt'
                        : case_.status === 'active'
                        ? 'Aktiv'
                        : 'Venter'}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/debts/${case_.id}`}
                  className="ml-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Se detaljer →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Anbefalte neste steg</h2>
          <div className="space-y-3">
            {nextSteps.slice(0, 3).map((step) => (
              <div
                key={step.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
              >
                <span className="text-2xl">{step.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
                </div>
                {step.ctaUrl && (
                  <Link
                    href={step.ctaUrl}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                  >
                    {step.ctaLabel} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Mode Prompt */}
      {showAdvancedPrompt && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Sparkles size={24} />
                Klar for mer avanserte funksjoner?
              </h3>
              <p className="text-indigo-100 mb-4">
                Du har nok erfaring til å bruke avansert visning med detaljert analyse,
                sammenligningsverktøy, og prediktive innsikter.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard?mode=advanced"
                  className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                >
                  Prøv avansert visning →
                </Link>
                <button className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-indigo-600 transition-colors font-medium">
                  Forblir her
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="text-center py-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">
          Trenger du hjelp med noe? Se vår ordliste eller ta omvisningen på nytt.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard/glossary"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            📚 Åpne ordliste
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('onboarding-tour-completed');
              window.location.reload();
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            🎯 Start omvisning på nytt
          </button>
        </div>
      </div>
    </div>
  );
}
