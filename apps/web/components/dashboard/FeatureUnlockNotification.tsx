'use client';

/**
 * Feature Unlock Notification System
 *
 * Shows celebratory toast notifications when users unlock new features.
 * Tracks which unlocks have been shown to avoid repeats.
 */

import { useEffect, useState } from 'react';
import { Trophy, X, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { FeatureUnlock, getNewlyUnlockedFeatures, UserProgressState } from '@/lib/user-progress';

interface FeatureUnlockNotificationProps {
  currentProgressState: UserProgressState;
  previousProgressState?: UserProgressState;
}

export function FeatureUnlockNotification({
  currentProgressState,
  previousProgressState,
}: FeatureUnlockNotificationProps) {
  const [visibleUnlocks, setVisibleUnlocks] = useState<FeatureUnlock[]>([]);
  const [shownUnlockIds, setShownUnlockIds] = useState<Set<string>>(new Set());
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Load previously shown unlocks from localStorage
    const stored = localStorage.getItem('shown-feature-unlocks');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setShownUnlockIds(new Set(parsed));
      } catch (e) {
        console.error('Failed to parse shown unlocks:', e);
      }
    }
    setHasInitialized(true);
  }, []);

  useEffect(() => {
    if (!hasInitialized || !previousProgressState) return;

    // Get newly unlocked features
    const newUnlocks = getNewlyUnlockedFeatures(previousProgressState, currentProgressState);

    // Filter out unlocks we've already shown
    const unseenUnlocks = newUnlocks.filter((unlock) => !shownUnlockIds.has(unlock.id));

    if (unseenUnlocks.length > 0) {
      // Mark as shown immediately to prevent duplicates
      const newShownIds = new Set(shownUnlockIds);
      unseenUnlocks.forEach(unlock => newShownIds.add(unlock.id));
      setShownUnlockIds(newShownIds);
      localStorage.setItem('shown-feature-unlocks', JSON.stringify([...newShownIds]));

      // Show notifications one at a time, with delay
      unseenUnlocks.forEach((unlock, index) => {
        setTimeout(() => {
          setVisibleUnlocks((prev) => {
            // Double-check it's not already visible
            if (prev.some(u => u.id === unlock.id)) return prev;
            return [...prev, unlock];
          });

          // Auto-dismiss after 10 seconds
          setTimeout(() => {
            setVisibleUnlocks((prev) => prev.filter((u) => u.id !== unlock.id));
          }, 10000);
        }, index * 1000); // Stagger notifications by 1 second
      });
    }
  }, [hasInitialized, currentProgressState, previousProgressState, shownUnlockIds]);

  const dismissUnlock = (unlockId: string) => {
    setVisibleUnlocks((prev) => prev.filter((u) => u.id !== unlockId));
  };

  if (visibleUnlocks.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-md">
      {visibleUnlocks.map((unlock) => (
        <UnlockToast key={unlock.id} unlock={unlock} onDismiss={() => dismissUnlock(unlock.id)} />
      ))}
    </div>
  );
}

interface UnlockToastProps {
  unlock: FeatureUnlock;
  onDismiss: () => void;
}

function UnlockToast({ unlock, onDismiss }: UnlockToastProps) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-2xl p-5 text-white animate-slide-in-right border-2 border-purple-400">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-3xl animate-bounce">
            {unlock.icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-300" size={20} />
              <h3 className="font-bold text-lg">Ny funksjon låst opp!</h3>
            </div>
            <button
              onClick={onDismiss}
              className="text-white hover:text-purple-200 transition-colors flex-shrink-0"
              aria-label="Lukk"
            >
              <X size={20} />
            </button>
          </div>

          <h4 className="font-semibold text-white mb-1">{unlock.name}</h4>
          <p className="text-purple-100 text-sm mb-3">{unlock.description}</p>

          {unlock.ctaUrl && (
            <Link
              href={unlock.ctaUrl}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium text-sm"
              onClick={onDismiss}
            >
              {unlock.ctaLabel || 'Prøv nå'}
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Sparkle effects */}
      <div className="absolute -top-2 -right-2 text-yellow-300 animate-pulse">
        <Sparkles size={24} />
      </div>
      <div className="absolute -bottom-1 -left-1 text-yellow-300 animate-pulse delay-150">
        <Sparkles size={20} />
      </div>
    </div>
  );
}

/**
 * Hook to track user progress changes and trigger unlock notifications
 */
export function useFeatureUnlockTracking(currentState: UserProgressState) {
  const [previousState, setPreviousState] = useState<UserProgressState | null>(null);

  useEffect(() => {
    // Load previous state from localStorage
    const stored = localStorage.getItem('user-progress-state');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreviousState(parsed);
      } catch (e) {
        console.error('Failed to parse previous progress state:', e);
      }
    }

    // Save current state for next comparison
    localStorage.setItem('user-progress-state', JSON.stringify(currentState));
  }, [currentState]);

  return previousState;
}
