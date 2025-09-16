export type SubscriptionTier = 'free' | 'premium' | 'pro'

export interface SubscriptionFeatures {
  automatedGDPR: boolean
  realtimeMonitoring: boolean
  advancedViolationDetection: boolean
  documentGeneration: boolean
  prioritySupport: boolean
  recoveryCommission: boolean
  legalAutomation: boolean
  caseManager: boolean
  courtDocumentation: boolean
  settlementTools: boolean
  maxDebts: number
  maxRecoveries: number
  supportLevel: 'community' | 'email' | 'phone'
}

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    automatedGDPR: false,
    realtimeMonitoring: false,
    advancedViolationDetection: false,
    documentGeneration: false,
    prioritySupport: false,
    recoveryCommission: false,
    legalAutomation: false,
    caseManager: false,
    courtDocumentation: false,
    settlementTools: false,
    maxDebts: 3,
    maxRecoveries: 1,
    supportLevel: 'community'
  },
  premium: {
    automatedGDPR: true,
    realtimeMonitoring: true,
    advancedViolationDetection: true,
    documentGeneration: true,
    prioritySupport: true,
    recoveryCommission: true,
    legalAutomation: false,
    caseManager: false,
    courtDocumentation: false,
    settlementTools: false,
    maxDebts: 10,
    maxRecoveries: 5,
    supportLevel: 'email'
  },
  pro: {
    automatedGDPR: true,
    realtimeMonitoring: true,
    advancedViolationDetection: true,
    documentGeneration: true,
    prioritySupport: true,
    recoveryCommission: true,
    legalAutomation: true,
    caseManager: true,
    courtDocumentation: true,
    settlementTools: true,
    maxDebts: -1, // unlimited
    maxRecoveries: -1, // unlimited
    supportLevel: 'phone'
  }
}

export function hasFeature(tier: SubscriptionTier, feature: keyof SubscriptionFeatures): boolean {
  return Boolean(SUBSCRIPTION_FEATURES[tier][feature])
}

export function getMaxAllowed(tier: SubscriptionTier, type: 'debts' | 'recoveries'): number {
  const key = type === 'debts' ? 'maxDebts' : 'maxRecoveries'
  return SUBSCRIPTION_FEATURES[tier][key]
}

export function canAddMore(tier: SubscriptionTier, type: 'debts' | 'recoveries', current: number): boolean {
  const max = getMaxAllowed(tier, type)
  return max === -1 || current < max
}

export function getFeatureDescription(feature: keyof SubscriptionFeatures): string {
  const descriptions: Record<keyof SubscriptionFeatures, string> = {
    automatedGDPR: 'Automatically generate and send GDPR data requests',
    realtimeMonitoring: 'Real-time monitoring of debt portfolio changes',
    advancedViolationDetection: 'AI-powered violation detection algorithms',
    documentGeneration: 'Generate legal documents and templates',
    prioritySupport: 'Priority email and phone support',
    recoveryCommission: 'Earn 25% commission on successful recoveries',
    legalAutomation: 'Full legal document automation',
    caseManager: 'Dedicated case manager assignment',
    courtDocumentation: 'Court-ready documentation preparation',
    settlementTools: 'Advanced settlement negotiation tools',
    maxDebts: 'Maximum number of debts you can track',
    maxRecoveries: 'Maximum number of recovery cases',
    supportLevel: 'Level of customer support available'
  }
  return descriptions[feature]
}