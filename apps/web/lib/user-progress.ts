/**
 * User Progress State Tracking
 *
 * Determines dashboard mode and feature unlocks based on user activity.
 */

export type DashboardMode = 'beginner' | 'intermediate' | 'advanced';

export interface UserProgressState {
  // Profile
  profileComplete: boolean;

  // Activity
  debtCount: number;
  gdprRequestsSent: number;
  responsesReceived: number;
  violationsDetected: number;
  settlementsCompleted: number;

  // Engagement
  daysActive: number;
  lastLoginAt: Date | null;

  // Learning
  hasViewedTutorial: boolean;
  hasViewedGlossary: boolean;
  completedOnboarding: boolean;

  // Preferences
  preferredMode: DashboardMode | null;

  // Achievements
  swordTokenBalance: number;
  shieldTier: string;
}

export interface FeatureUnlock {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (state: UserProgressState) => boolean;
  unlockMessage: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

/**
 * Determine which dashboard mode to show
 */
export function getDashboardMode(state: UserProgressState): DashboardMode {
  // User explicitly chose a mode
  if (state.preferredMode) {
    return state.preferredMode;
  }

  // Beginner: No activity yet
  if (state.debtCount === 0 || state.gdprRequestsSent === 0) {
    return 'beginner';
  }

  // Advanced: Experienced user
  if (
    state.debtCount >= 3 ||
    state.responsesReceived >= 2 ||
    state.settlementsCompleted >= 1 ||
    state.daysActive > 14
  ) {
    return 'advanced';
  }

  // Intermediate: In between
  return 'intermediate';
}

/**
 * Define all feature unlocks
 */
export const featureUnlocks: FeatureUnlock[] = [
  {
    id: 'pdi-dashboard',
    name: 'PDI Score Tracking',
    description: 'Track your personal debt health score over time',
    icon: '📊',
    unlocked: false,
    condition: (state) => state.debtCount >= 1,
    unlockMessage: '📊 PDI Score Tracking Unlocked! Track your debt health over time.',
    ctaLabel: 'View PDI Dashboard',
    ctaUrl: '/dashboard/pdi',
  },
  {
    id: 'violation-analytics',
    name: 'Violation Analytics',
    description: 'See detailed compliance reports and violation trends',
    icon: '🔍',
    unlocked: false,
    condition: (state) => state.responsesReceived >= 1 || state.violationsDetected >= 1,
    unlockMessage: '🔍 Violation Analytics Unlocked! See detailed compliance reports.',
    ctaLabel: 'View Analytics',
    ctaUrl: '/dashboard/violations',
  },
  {
    id: 'comparison-mode',
    name: 'Case Comparison',
    description: 'Compare multiple cases side-by-side',
    icon: '📈',
    unlocked: false,
    condition: (state) => state.debtCount >= 2,
    unlockMessage: '📈 Compare Mode Unlocked! Compare cases side-by-side.',
    ctaLabel: 'Compare Cases',
    ctaUrl: '/dashboard?tab=compare',
  },
  {
    id: 'predictive-insights',
    name: 'Predictive Insights',
    description: 'AI-powered outcome predictions for your cases',
    icon: '🔮',
    unlocked: false,
    condition: (state) => state.gdprRequestsSent >= 3,
    unlockMessage: '🔮 Predictive Insights Unlocked! See AI-powered outcome predictions.',
    ctaLabel: 'View Predictions',
    ctaUrl: '/dashboard?tab=predict',
  },
  {
    id: 'regional-dashboard',
    name: 'Regional Statistics',
    description: 'See national statistics and regional trends',
    icon: '🌍',
    unlocked: false,
    condition: (state) => state.debtCount >= 5 || state.daysActive > 30,
    unlockMessage: '🌍 Regional Dashboard Unlocked! See national statistics.',
    ctaLabel: 'View Regional Data',
    ctaUrl: '/dashboard?tab=regional',
  },
  {
    id: 'settlement-optimizer',
    name: 'Settlement Optimizer',
    description: 'Advanced settlement negotiation tools',
    icon: '🤝',
    unlocked: false,
    condition: (state) => state.violationsDetected >= 3,
    unlockMessage: '🤝 Settlement Optimizer Unlocked! Advanced negotiation tools available.',
    ctaLabel: 'Optimize Settlement',
    ctaUrl: '/dashboard/settlements',
  },
  {
    id: 'bulk-actions',
    name: 'Bulk Operations',
    description: 'Manage multiple cases at once',
    icon: '⚡',
    unlocked: false,
    condition: (state) => state.debtCount >= 5,
    unlockMessage: '⚡ Bulk Operations Unlocked! Manage multiple cases at once.',
  },
  {
    id: 'advanced-filtering',
    name: 'Advanced Filters',
    description: 'Powerful filtering and search capabilities',
    icon: '🔎',
    unlocked: false,
    condition: (state) => state.debtCount >= 3,
    unlockMessage: '🔎 Advanced Filters Unlocked! Powerful search capabilities.',
  },
];

/**
 * Get unlocked features for a user
 */
export function getUnlockedFeatures(state: UserProgressState): FeatureUnlock[] {
  return featureUnlocks
    .map((feature) => ({
      ...feature,
      unlocked: feature.condition(state),
    }))
    .filter((feature) => feature.unlocked);
}

/**
 * Get features that were just unlocked (for notifications)
 */
export function getNewlyUnlockedFeatures(
  previousState: UserProgressState,
  currentState: UserProgressState
): FeatureUnlock[] {
  const previouslyUnlocked = new Set(
    getUnlockedFeatures(previousState).map((f) => f.id)
  );

  return getUnlockedFeatures(currentState).filter(
    (feature) => !previouslyUnlocked.has(feature.id)
  );
}

/**
 * Get next steps for user (for beginner/intermediate mode)
 */
export function getNextSteps(state: UserProgressState): NextStep[] {
  const steps: NextStep[] = [];

  if (!state.profileComplete) {
    steps.push({
      id: 'complete-profile',
      title: 'Fullfør profilen din',
      description: 'Legg til adresse og fødselsdato (påkrevd for GDPR-forespørsler)',
      icon: '📝',
      completed: false,
      priority: 1,
      ctaLabel: 'Fullfør profil',
      ctaUrl: '/dashboard/profile/complete',
    });
  }

  if (state.debtCount === 0) {
    steps.push({
      id: 'add-first-debt',
      title: 'Legg til din første gjeld',
      description: 'Registrer en gjeld du vil bestride',
      icon: '➕',
      completed: false,
      priority: 2,
      ctaLabel: 'Legg til gjeld',
      ctaUrl: '/dashboard/debts/add',
    });
  }

  if (state.debtCount > 0 && state.gdprRequestsSent === 0) {
    steps.push({
      id: 'send-gdpr-request',
      title: 'Send GDPR-forespørsel',
      description: 'Vi genererer en juridisk forespørsel for deg',
      icon: '⚖️',
      completed: false,
      priority: 3,
      ctaLabel: 'Generer forespørsel',
      ctaUrl: '/dashboard/debts',
    });
  }

  if (state.gdprRequestsSent > 0 && state.responsesReceived === 0) {
    steps.push({
      id: 'wait-response',
      title: 'Vent på svar fra kreditor',
      description: 'Vi varsler deg når kreditor svarer (innen 30 dager)',
      icon: '⏳',
      completed: false,
      priority: 4,
    });
  }

  if (state.responsesReceived > 0 && state.violationsDetected === 0) {
    steps.push({
      id: 'review-response',
      title: 'Se svaranalyse',
      description: 'Vi har analysert kreditors svar',
      icon: '🔍',
      completed: false,
      priority: 5,
      ctaLabel: 'Se analyse',
      ctaUrl: '/dashboard/debts',
    });
  }

  if (!state.hasViewedTutorial) {
    steps.push({
      id: 'watch-tutorial',
      title: 'Se veiledningsvideo',
      description: '2 minutter som forklarer hvordan plattformen fungerer',
      icon: '🎬',
      completed: false,
      priority: 10,
      ctaLabel: 'Se video',
      ctaUrl: '#tutorial',
    });
  }

  return steps.sort((a, b) => a.priority - b.priority);
}

export interface NextStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  priority: number;
  ctaLabel?: string;
  ctaUrl?: string;
}

/**
 * Calculate completion percentage
 */
export function getCompletionPercentage(state: UserProgressState): number {
  const milestones = [
    state.profileComplete,
    state.debtCount >= 1,
    state.gdprRequestsSent >= 1,
    state.responsesReceived >= 1,
    state.violationsDetected >= 1,
    state.hasViewedTutorial,
  ];

  const completed = milestones.filter(Boolean).length;
  return Math.round((completed / milestones.length) * 100);
}

/**
 * Check if user should see upgrade prompt to advanced mode
 */
export function shouldPromptAdvancedMode(state: UserProgressState): boolean {
  // Already in advanced mode
  if (state.preferredMode === 'advanced') {
    return false;
  }

  // Has enough experience
  return (
    state.debtCount >= 3 &&
    state.gdprRequestsSent >= 2 &&
    state.daysActive >= 7
  );
}

/**
 * Get achievements/milestones reached
 */
export function getAchievements(state: UserProgressState): Achievement[] {
  const achievements: Achievement[] = [];

  if (state.profileComplete) {
    achievements.push({
      id: 'profile-complete',
      title: 'Profil fullført',
      icon: '✅',
      earnedAt: new Date(),
    });
  }

  if (state.debtCount >= 1) {
    achievements.push({
      id: 'first-debt',
      title: 'Første gjeld registrert',
      icon: '🎯',
      earnedAt: new Date(),
    });
  }

  if (state.gdprRequestsSent >= 1) {
    achievements.push({
      id: 'first-gdpr',
      title: 'Første GDPR-forespørsel sendt',
      icon: '📨',
      earnedAt: new Date(),
    });
  }

  if (state.violationsDetected >= 1) {
    achievements.push({
      id: 'first-violation',
      title: 'Første brudd oppdaget',
      icon: '🔍',
      earnedAt: new Date(),
    });
  }

  if (state.swordTokenBalance >= 1000) {
    achievements.push({
      id: 'sword-1k',
      title: '1,000 SWORD tokens',
      icon: '🪙',
      earnedAt: new Date(),
    });
  }

  if (state.shieldTier !== 'Bronze Shield') {
    achievements.push({
      id: 'shield-upgrade',
      title: `${state.shieldTier} oppnådd`,
      icon: '🛡️',
      earnedAt: new Date(),
    });
  }

  return achievements;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  earnedAt: Date;
}
