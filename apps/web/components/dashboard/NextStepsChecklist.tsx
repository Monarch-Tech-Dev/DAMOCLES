'use client';

/**
 * Next Steps Checklist
 *
 * Reusable component showing prioritized action items for the user.
 * Adapts to different dashboard modes with varying levels of detail.
 */

import { CheckCircle2, Circle, ArrowRight, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { NextStep } from '@/lib/user-progress';

interface NextStepsChecklistProps {
  steps: NextStep[];
  variant?: 'default' | 'compact' | 'detailed';
  maxSteps?: number;
  showProgress?: boolean;
  className?: string;
}

export function NextStepsChecklist({
  steps,
  variant = 'default',
  maxSteps = 5,
  showProgress = true,
  className = '',
}: NextStepsChecklistProps) {
  const displaySteps = steps.slice(0, maxSteps);
  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (steps.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-3">🎉</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Gratulerer! Du er oppdatert!
          </h3>
          <p className="text-gray-600 text-sm">
            Du har fullført alle anbefalte steg. Sjekk tilbake senere for nye oppgaver.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return <CompactChecklist steps={displaySteps} className={className} />;
  }

  if (variant === 'detailed') {
    return (
      <DetailedChecklist
        steps={displaySteps}
        progressPercentage={progressPercentage}
        showProgress={showProgress}
        className={className}
      />
    );
  }

  return <DefaultChecklist steps={displaySteps} className={className} />;
}

/**
 * Default variant - balanced view
 */
function DefaultChecklist({ steps, className }: { steps: NextStep[]; className: string }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>📋</span>
        Dine neste steg
      </h2>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
              index === 0 && !step.completed
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
              <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
            </div>
            {step.ctaUrl && !step.completed && index === 0 && (
              <Link
                href={step.ctaUrl}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
              >
                {step.ctaLabel || 'Start'} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact variant - minimal space
 */
function CompactChecklist({ steps, className }: { steps: NextStep[]; className: string }) {
  const nextIncompleteStep = steps.find((s) => !s.completed);

  if (!nextIncompleteStep) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-green-500" size={20} />
          <span className="text-sm font-medium text-green-900">Alle steg fullført! 🎉</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{nextIncompleteStep.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm">{nextIncompleteStep.title}</h4>
          <p className="text-xs text-gray-600 mt-1">{nextIncompleteStep.description}</p>
          {nextIncompleteStep.ctaUrl && (
            <Link
              href={nextIncompleteStep.ctaUrl}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
            >
              {nextIncompleteStep.ctaLabel || 'Start'}
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Detailed variant - comprehensive view with progress
 */
function DetailedChecklist({
  steps,
  progressPercentage,
  showProgress,
  className,
}: {
  steps: NextStep[];
  progressPercentage: number;
  showProgress: boolean;
  className: string;
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>📋</span>
          Anbefalte neste steg
        </h2>
        {showProgress && (
          <span className="text-sm font-medium text-gray-600">{progressPercentage}% fullført</span>
        )}
      </div>

      {showProgress && (
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isHighPriority = step.priority <= 3;
          const isNextAction = index === 0 && !step.completed;

          return (
            <div
              key={step.id}
              className={`relative border-2 rounded-lg p-4 transition-all ${
                step.completed
                  ? 'border-green-200 bg-green-50'
                  : isNextAction
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Priority Badge */}
              {isHighPriority && !step.completed && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    <Star size={12} />
                    Viktig
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      step.completed
                        ? 'bg-green-100'
                        : isNextAction
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="text-green-600" size={24} />
                    ) : (
                      <span>{step.icon}</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>

                  {/* Action Buttons */}
                  {!step.completed && (
                    <div className="flex items-center gap-3">
                      {step.ctaUrl ? (
                        <Link
                          href={step.ctaUrl}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            isNextAction
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {step.ctaLabel || 'Start nå'}
                          <ArrowRight size={16} />
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock size={16} />
                          <span>Venter på forrige steg</span>
                        </div>
                      )}
                    </div>
                  )}

                  {step.completed && (
                    <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                      <CheckCircle2 size={16} />
                      Fullført!
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {steps.every((s) => s.completed) && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white text-center">
          <p className="font-semibold mb-1">🎊 Fantastisk arbeid!</p>
          <p className="text-sm text-green-100">
            Du har fullført alle anbefalte steg. Fortsett å overvåke dine saker.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Sidebar widget variant - for use in sidebars or small spaces
 */
export function NextStepWidget({ steps }: { steps: NextStep[] }) {
  const nextStep = steps.find((s) => !s.completed);

  if (!nextStep) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="text-center">
          <CheckCircle2 className="text-green-500 mx-auto mb-2" size={24} />
          <p className="text-xs font-medium text-green-900">Alt oppdatert! ✅</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="text-xs font-medium text-blue-900 mb-2">Neste steg:</p>
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xl">{nextStep.icon}</span>
        <p className="text-xs text-gray-700 flex-1">{nextStep.title}</p>
      </div>
      {nextStep.ctaUrl && (
        <Link
          href={nextStep.ctaUrl}
          className="block w-full text-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
        >
          {nextStep.ctaLabel || 'Start'} →
        </Link>
      )}
    </div>
  );
}
