'use client'

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BeginnerDashboard } from '@/components/dashboard/BeginnerDashboard';
import { IntermediateDashboard } from '@/components/dashboard/IntermediateDashboard';
import { AdvancedDashboard } from '@/components/dashboard/AdvancedDashboard';
import { DashboardModeToggle } from '@/components/dashboard/DashboardModeToggle';
import { FeatureUnlockNotification, useFeatureUnlockTracking } from '@/components/dashboard/FeatureUnlockNotification';
import {
  getDashboardMode,
  getNextSteps,
  UserProgressState,
  DashboardMode
} from '@/lib/user-progress';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [progressState, setProgressState] = useState<UserProgressState | null>(null);
  const [userDebts, setUserDebts] = useState<any[]>([]);
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('beginner');

  // Track feature unlocks for notifications - Temporarily disabled
  // const previousProgressState = useFeatureUnlockTracking(progressState || {
  //   profileComplete: false,
  //   debtCount: 0,
  //   gdprRequestsSent: 0,
  //   responsesReceived: 0,
  //   violationsDetected: 0,
  //   settlementsCompleted: 0,
  //   daysActive: 0,
  //   lastLoginAt: null,
  //   hasViewedTutorial: false,
  //   hasViewedGlossary: false,
  //   completedOnboarding: false,
  //   preferredMode: null,
  //   swordTokenBalance: 0,
  //   shieldTier: 'Bronze Shield',
  // });

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch user data and calculate progress state
    fetchUserProgress();
  }, [user, loading, router]);

  const fetchUserProgress = async () => {
    try {
      // Fetch debts and profile
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      const [debtsResponse, profileResponse] = await Promise.all([
        fetch(`${apiUrl}/api/debts`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const debtsData = await debtsResponse.json();
      const debts = debtsData.debts || [];
      setUserDebts(debts);

      const profileData = await profileResponse.json();
      const profile = profileData.user || {};

      // Calculate progress state from real data
      const state: UserProgressState = {
        profileComplete: !!profile.gdprProfileComplete,
        debtCount: debts.length,
        gdprRequestsSent: debts.filter((d: any) => d.gdprRequestSent).length,
        responsesReceived: debts.filter((d: any) => d.responseReceived).length,
        violationsDetected: debts.reduce((sum: number, d: any) => sum + (d.violations?.length || 0), 0),
        settlementsCompleted: debts.filter((d: any) => d.status === 'settled').length,
        daysActive: user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        lastLoginAt: user?.lastLoginAt ? new Date(user.lastLoginAt) : null,
        hasViewedTutorial: localStorage.getItem('onboarding-tour-completed') === 'true',
        hasViewedGlossary: localStorage.getItem('glossary-viewed') === 'true',
        completedOnboarding: localStorage.getItem('onboarding-completed') === 'true',
        preferredMode: (localStorage.getItem('dashboard-mode-preference') as DashboardMode) || null,
        swordTokenBalance: profile.tokenBalance || 0,
        shieldTier: profile.shieldTier || 'Bronze Shield',
      };

      setProgressState(state);

      // Determine dashboard mode
      const mode = getDashboardMode(state);
      setDashboardMode(mode);
    } catch (error) {
      console.error('Failed to fetch user progress:', error);

      // Fallback to basic state
      const fallbackState: UserProgressState = {
        profileComplete: false,
        debtCount: 0,
        gdprRequestsSent: 0,
        responsesReceived: 0,
        violationsDetected: 0,
        settlementsCompleted: 0,
        daysActive: 0,
        lastLoginAt: null,
        hasViewedTutorial: false,
        hasViewedGlossary: false,
        completedOnboarding: false,
        preferredMode: null,
        swordTokenBalance: 0,
        shieldTier: 'Bronze Shield',
      };
      setProgressState(fallbackState);
      setDashboardMode('beginner');
    }
  };

  const handleModeChange = (mode: DashboardMode) => {
    setDashboardMode(mode);
    if (progressState) {
      setProgressState({
        ...progressState,
        preferredMode: mode,
      });
    }
  };

  if (loading || !progressState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const nextSteps = getNextSteps(progressState);

  // Prepare user data
  const userData = {
    name: user.name,
    swordTokenBalance: progressState.swordTokenBalance,
    shieldTier: progressState.shieldTier,
  };

  // Prepare metrics for intermediate dashboard
  const metrics = {
    totalDebts: progressState.debtCount,
    activeGdprRequests: progressState.gdprRequestsSent - progressState.responsesReceived,
    violationsDetected: progressState.violationsDetected,
    totalRecoveryAmount: userDebts.reduce((sum, d) => sum + (d.currentAmount || 0), 0),
    pdiScore: undefined, // Will be set when PDI is unlocked
  };

  // Prepare recent cases
  const recentCases = userDebts.slice(0, 5).map(debt => ({
    id: debt.id,
    creditorName: debt.creditor?.name || 'Unknown',
    status: debt.gdprRequestSent ? 'active' : 'pending',
    debtAmount: debt.currentAmount || 0,
    createdAt: new Date(debt.createdAt),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Mode Toggle */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <DashboardModeToggle
            currentMode={dashboardMode}
            onModeChange={handleModeChange}
          />
        </div>
      </div>

      {/* Feature Unlock Notifications - Temporarily disabled to fix infinite loop */}
      {/* {previousProgressState && (
        <FeatureUnlockNotification
          currentProgressState={progressState}
          previousProgressState={previousProgressState}
        />
      )} */}

      {/* Dashboard Content - Progressive Disclosure */}
      {dashboardMode === 'beginner' && (
        <BeginnerDashboard
          user={userData}
          nextSteps={nextSteps}
          progressState={progressState}
        />
      )}

      {dashboardMode === 'intermediate' && (
        <IntermediateDashboard
          user={userData}
          metrics={metrics}
          recentCases={recentCases}
          nextSteps={nextSteps}
          progressState={progressState}
        />
      )}

      {dashboardMode === 'advanced' && (
        <AdvancedDashboard
          user={userData}
          metrics={metrics}
          recentCases={recentCases}
          progressState={progressState}
        />
      )}
    </div>
  );
}
