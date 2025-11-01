'use client';

/**
 * Onboarding Tour Component
 *
 * Interactive step-by-step guide for first-time users.
 * Shows users how to navigate the platform and complete key actions.
 *
 * Tour Steps:
 * 1. Welcome to DAMOCLES
 * 2. Complete your profile (GDPR requirement)
 * 3. Add your first debt
 * 4. Generate GDPR request
 * 5. Track progress
 * 6. Earn SWORD tokens
 */

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  condition?: () => boolean; // Skip step if condition is false
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function OnboardingTour({
  steps,
  onComplete,
  onSkip,
  isOpen = true,
  onClose,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  // Filter out steps that don't meet conditions
  const activeSteps = steps.filter((step) => !step.condition || step.condition());

  const currentStepData = activeSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === activeSteps.length - 1;

  // Highlight target element
  useEffect(() => {
    if (!currentStepData?.target) {
      setHighlightedElement(null);
      return;
    }

    const element = document.querySelector(currentStepData.target) as HTMLElement;
    if (element) {
      setHighlightedElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      setHighlightedElement(null);
    };
  }, [currentStepData]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose?.();
  };

  const handleSkip = () => {
    onSkip?.();
    onClose?.();
  };

  if (!isOpen || activeSteps.length === 0) {
    return null;
  }

  // Calculate tooltip position based on highlighted element
  const getTooltipStyle = (): React.CSSProperties => {
    if (!highlightedElement || currentStepData?.position === 'center') {
      // Center of screen
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001,
      };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const position = currentStepData.position || 'bottom';

    const styles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 10001,
    };

    switch (position) {
      case 'top':
        styles.bottom = `${window.innerHeight - rect.top + 16}px`;
        styles.left = `${rect.left + rect.width / 2}px`;
        styles.transform = 'translateX(-50%)';
        break;
      case 'right':
        styles.top = `${rect.top + rect.height / 2}px`;
        styles.left = `${rect.right + 16}px`;
        styles.transform = 'translateY(-50%)';
        break;
      case 'bottom':
        styles.top = `${rect.bottom + 16}px`;
        styles.left = `${rect.left + rect.width / 2}px`;
        styles.transform = 'translateX(-50%)';
        break;
      case 'left':
        styles.top = `${rect.top + rect.height / 2}px`;
        styles.right = `${window.innerWidth - rect.left + 16}px`;
        styles.transform = 'translateY(-50%)';
        break;
    }

    return styles;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[10000]"
        onClick={handleSkip}
      />

      {/* Highlight spotlight */}
      {highlightedElement && (
        <div
          className="fixed pointer-events-none z-[10000]"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 4,
            left: highlightedElement.getBoundingClientRect().left - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
          }}
        />
      )}

      {/* Tooltip Card */}
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full"
        style={getTooltipStyle()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {activeSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {currentStep + 1} av {activeSteps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Lukk"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {currentStepData.title}
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {currentStepData.content}
          </p>

          {/* Action Button */}
          {currentStepData.action && (
            <div className="mt-4">
              {currentStepData.action.href ? (
                <a
                  href={currentStepData.action.href}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {currentStepData.action.label} →
                </a>
              ) : (
                <button
                  onClick={currentStepData.action.onClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {currentStepData.action.label}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Hopp over
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`p-2 rounded-lg transition-colors ${
                isFirstStep
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Forrige"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isLastStep ? (
                <>
                  <Check size={18} />
                  Fullfør
                </>
              ) : (
                <>
                  Neste
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Default tour steps for DAMOCLES platform
 */
export const defaultTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Velkommen til DAMOCLES!',
    content: 'DAMOCLES hjelper deg å håndheve dine GDPR-rettigheter og få kontroll over gjelden din. La oss ta en rask omvisning!',
    position: 'center',
  },
  {
    id: 'complete-profile',
    title: '📝 Fullfør profilen din',
    content: 'For å sende GDPR-forespørsler må vi verifisere din identitet (lovpålagt under GDPR Artikkel 12(6)). Klikk her for å legge til adresse og fødselsdato.',
    target: '[data-tour="profile-complete"]',
    position: 'bottom',
    action: {
      label: 'Fullfør profil',
      href: '/dashboard/profile/complete',
    },
    condition: () => {
      // Only show if profile is incomplete
      // This would check user.gdprProfileComplete in real implementation
      return true;
    },
  },
  {
    id: 'add-debt',
    title: '➕ Legg til din første gjeld',
    content: 'Start med å registrere en gjeld du har hos inkassoselskap, bank, eller BNPL-tjeneste. Vi bruker dette til å generere juridiske GDPR-forespørsler.',
    target: '[data-tour="add-debt"]',
    position: 'bottom',
    action: {
      label: 'Legg til gjeld',
      href: '/dashboard/debts/add',
    },
  },
  {
    id: 'gdpr-request',
    title: '⚖️ Generer GDPR-forespørsel',
    content: 'Når du har lagt til en gjeld, kan du generere en automatisk GDPR-forespørsel. Vi sender den til kreditor og sporer svaret for deg.',
    target: '[data-tour="gdpr-request"]',
    position: 'left',
  },
  {
    id: 'violation-detection',
    title: '🔍 Automatisk brudd-deteksjon',
    content: 'Når kreditor svarer, analyserer vår AI svaret for GDPR-brudd. Vi oppdager 6 typer brudd automatisk og beregner din forhandlingsstyrke.',
    target: '[data-tour="violations"]',
    position: 'right',
  },
  {
    id: 'pdi-score',
    title: '📊 PDI Score - Din gjeldshelse',
    content: 'Personal Debt Index (PDI) gir deg en score fra 0-100 basert på din økonomiske situasjon. Følg utviklingen og få personlige anbefalinger.',
    target: '[data-tour="pdi-score"]',
    position: 'bottom',
  },
  {
    id: 'sword-tokens',
    title: '🪙 Tjen SWORD Tokens',
    content: 'Du tjener SWORD tokens for hver handling du tar (100-10,000 SWORD). Bruk dem til staking (15-100% APY), governance, eller settlement funding.',
    target: '[data-tour="token-balance"]',
    position: 'bottom',
  },
  {
    id: 'glossary',
    title: '📚 Trenger du hjelp?',
    content: 'Se ordlisten vår for forklaringer på alle tekniske termer. Klikk på ❓-ikonene rundt om i appen for rask hjelp.',
    target: '[data-tour="glossary-link"]',
    position: 'left',
    action: {
      label: 'Åpne ordliste',
      href: '/dashboard/glossary',
    },
  },
  {
    id: 'complete',
    title: '🎉 Du er klar!',
    content: 'Du har nå fullført omvisningen! Start med å fullføre profilen din og legge til din første gjeld. Lykke til!',
    position: 'center',
  },
];

/**
 * Hook to manage onboarding tour state
 */
export function useOnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    // Check if user has completed tour (stored in localStorage)
    const completed = localStorage.getItem('onboarding-tour-completed') === 'true';
    setHasCompletedTour(completed);

    // Auto-start tour for new users
    if (!completed) {
      // Delay to let page load
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const startTour = () => setIsOpen(true);

  const completeTour = () => {
    setIsOpen(false);
    setHasCompletedTour(true);
    localStorage.setItem('onboarding-tour-completed', 'true');
  };

  const skipTour = () => {
    setIsOpen(false);
    localStorage.setItem('onboarding-tour-skipped', 'true');
  };

  const resetTour = () => {
    setHasCompletedTour(false);
    localStorage.removeItem('onboarding-tour-completed');
    localStorage.removeItem('onboarding-tour-skipped');
    setIsOpen(true);
  };

  return {
    isOpen,
    hasCompletedTour,
    startTour,
    completeTour,
    skipTour,
    resetTour,
  };
}
