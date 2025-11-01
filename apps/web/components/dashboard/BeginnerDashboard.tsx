'use client';

/**
 * Beginner Dashboard
 *
 * Simplified dashboard for first-time users with clear next steps.
 * Shows only essential information to avoid overwhelm.
 */

import { CheckCircle2, Circle, Play, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { NextStep, UserProgressState, getCompletionPercentage } from '@/lib/user-progress';

interface BeginnerDashboardProps {
  user: {
    name?: string;
    swordTokenBalance: number;
    shieldTier: string;
  };
  nextSteps: NextStep[];
  progressState: UserProgressState;
}

export function BeginnerDashboard({ user, nextSteps, progressState }: BeginnerDashboardProps) {
  const completionPercentage = getCompletionPercentage(progressState);
  const primaryStep = nextSteps[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          👋 Velkommen tilbake{user.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-blue-100">
          La oss komme i gang med din første sak
        </p>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Din fremgang</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          <div className="h-3 bg-blue-400 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary Action Card */}
      {primaryStep && (
        <div className="bg-white rounded-lg border-2 border-blue-500 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{primaryStep.icon}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {primaryStep.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {primaryStep.description}
              </p>
              {primaryStep.ctaUrl && (
                <Link
                  href={primaryStep.ctaUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {primaryStep.ctaLabel || 'Kom i gang'}
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Next Steps Checklist */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span>
          Dine neste steg
        </h2>

        <div className="space-y-3">
          {nextSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                index === 0
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50'
              }`}
            >
              <div className="mt-1">
                {step.completed ? (
                  <CheckCircle2 className="text-green-500" size={20} />
                ) : (
                  <Circle className="text-gray-400" size={20} />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{step.title}</h4>
                <p className="text-sm text-gray-600 mt-0.5">
                  {step.description}
                </p>
              </div>
              {step.ctaUrl && index === 0 && (
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

      {/* Quick Start Guide */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💡</span>
          Slik fungerer det
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Legg til gjeld</h4>
              <p className="text-sm text-gray-600">
                Registrer en gjeld du vil bestride
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Vi sender GDPR-forespørsel</h4>
              <p className="text-sm text-gray-600">
                Juridisk forespørsel genereres automatisk
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Spor svar & brudd</h4>
              <p className="text-sm text-gray-600">
                AI analyserer for GDPR-brudd
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Få forlik automatisk</h4>
              <p className="text-sm text-gray-600">
                Vi forhandler basert på bruddene
              </p>
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
          <Play size={18} />
          Se 2-minutters video
        </button>
      </div>

      {/* Simple Token Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🪙</span>
            <div>
              <h3 className="text-sm font-medium text-gray-600">SWORD Tokens</h3>
              <p className="text-2xl font-bold text-gray-900">
                {user.swordTokenBalance.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Tjen tokens ved å utøve dine rettigheter
          </p>
          <Link
            href="/dashboard/glossary#sword_token"
            className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
          >
            Hva er SWORD tokens? →
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🛡️</span>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Shield Tier</h3>
              <p className="text-2xl font-bold text-gray-900">
                {user.shieldTier}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Ditt beskyttelsesnivå basert på tokens
          </p>
          <Link
            href="/dashboard/glossary#shield_tier"
            className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
          >
            Les mer om tiers →
          </Link>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="font-bold text-gray-900 mb-2">Trenger du hjelp?</h3>
        <p className="text-gray-700 mb-4">
          Se ordlisten vår for forklaringer på alle tekniske termer, eller ta omvisningen på nytt.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/glossary"
            className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
          >
            📚 Åpne ordliste
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('onboarding-tour-completed');
              window.location.reload();
            }}
            className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
          >
            🎯 Start omvisning på nytt
          </button>
        </div>
      </div>

      {/* Advanced Mode Teaser */}
      <div className="text-center py-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">
          Klar for mer? Se alle funksjoner i avansert modus.
        </p>
        <Link
          href="/dashboard?mode=advanced"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          <Sparkles size={16} />
          Bytt til avansert visning
        </Link>
      </div>
    </div>
  );
}
