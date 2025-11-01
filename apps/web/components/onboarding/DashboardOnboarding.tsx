'use client';

/**
 * Dashboard Onboarding Integration
 *
 * Wraps the main dashboard with the onboarding tour.
 * Automatically triggers for first-time users.
 */

import { OnboardingTour, defaultTourSteps, useOnboardingTour } from './OnboardingTour';
import { HelpCircle, Play } from 'lucide-react';

interface DashboardOnboardingProps {
  children: React.ReactNode;
  userId?: string;
  gdprProfileComplete?: boolean;
}

export function DashboardOnboarding({
  children,
  userId,
  gdprProfileComplete = false,
}: DashboardOnboardingProps) {
  const { isOpen, hasCompletedTour, completeTour, skipTour, startTour } = useOnboardingTour();

  // Filter tour steps based on user state
  const tourSteps = defaultTourSteps.map((step) => {
    if (step.id === 'complete-profile') {
      return {
        ...step,
        condition: () => !gdprProfileComplete,
      };
    }
    return step;
  });

  return (
    <>
      {children}

      {/* Onboarding Tour */}
      <OnboardingTour
        steps={tourSteps}
        isOpen={isOpen}
        onComplete={completeTour}
        onSkip={skipTour}
        onClose={() => {}}
      />

      {/* Restart Tour Button (for users who want to see it again) */}
      {hasCompletedTour && (
        <button
          onClick={startTour}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
          aria-label="Start omvisning på nytt"
        >
          <Play size={18} />
          <span className="font-medium">Vis omvisning</span>
        </button>
      )}
    </>
  );
}

/**
 * Help button to restart tour
 */
export function RestartTourButton() {
  const { startTour } = useOnboardingTour();

  return (
    <button
      onClick={startTour}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <HelpCircle size={16} />
      Start omvisning
    </button>
  );
}
