'use client'

import React from 'react'
import { Card, Title, Text, Button, Badge } from '@tremor/react'
import { Crown, Lock, ArrowUpCircle } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionTier, SubscriptionFeatures, hasFeature, getFeatureDescription } from '@/lib/subscription'

interface PremiumGateProps {
  userTier: SubscriptionTier
  feature: keyof SubscriptionFeatures
  children: React.ReactNode
  title?: string
  description?: string
  requiredTier?: SubscriptionTier
  showUpgrade?: boolean
}

export function PremiumGate({
  userTier,
  feature,
  children,
  title,
  description,
  requiredTier = 'premium',
  showUpgrade = true
}: PremiumGateProps) {
  const hasAccess = hasFeature(userTier, feature)

  if (hasAccess) {
    return <>{children}</>
  }

  const tierNames = {
    premium: 'Premium',
    pro: 'Pro'
  }

  return (
    <Card className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50/30 backdrop-blur-sm rounded-lg" />
      <div className="relative p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <Badge color="blue" className="mx-auto">
            {tierNames[requiredTier]} Feature
          </Badge>
          <Title className="text-xl">{title || `${tierNames[requiredTier]} Required`}</Title>
          <Text className="text-slate-600 max-w-md mx-auto">
            {description || getFeatureDescription(feature)}
          </Text>
        </div>

        {showUpgrade && (
          <div className="space-y-3">
            <Link href="/dashboard/subscription">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Upgrade to {tierNames[requiredTier]}
              </Button>
            </Link>
            <Text className="text-xs text-slate-500">
              Unlock advanced features and automated protection
            </Text>
          </div>
        )}
      </div>
    </Card>
  )
}

interface FeatureLockedProps {
  userTier: SubscriptionTier
  feature: keyof SubscriptionFeatures
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureLocked({ userTier, feature, children, fallback }: FeatureLockedProps) {
  const hasAccess = hasFeature(userTier, feature)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
        <div className="bg-white rounded-lg p-4 shadow-lg text-center space-y-2">
          <Lock className="w-6 h-6 text-slate-400 mx-auto" />
          <Text className="text-sm text-slate-600 font-medium">Premium Feature</Text>
          <Link href="/dashboard/subscription">
            <Button size="xs" variant="outline">
              Upgrade
            </Button>
          </Link>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
    </div>
  )
}

interface UsageLimitProps {
  userTier: SubscriptionTier
  type: 'debts' | 'recoveries'
  current: number
  children: React.ReactNode
}

export function UsageLimit({ userTier, type, current, children }: UsageLimitProps) {
  const limits = {
    free: { debts: 3, recoveries: 1 },
    premium: { debts: 10, recoveries: 5 },
    pro: { debts: -1, recoveries: -1 }
  }

  const limit = limits[userTier][type]
  const hasReachedLimit = limit !== -1 && current >= limit

  if (!hasReachedLimit) {
    return <>{children}</>
  }

  const nextTier = userTier === 'free' ? 'Premium' : 'Pro'

  return (
    <Card>
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6 text-yellow-600" />
        </div>
        <div className="space-y-2">
          <Title>Usage Limit Reached</Title>
          <Text className="text-slate-600">
            You've reached your {type} limit ({current}/{limit}).
            Upgrade to {nextTier} for {nextTier === 'Pro' ? 'unlimited' : `${limits[nextTier.toLowerCase() as SubscriptionTier][type]}`} {type}.
          </Text>
        </div>
        <Link href="/dashboard/subscription">
          <Button>
            Upgrade to {nextTier}
          </Button>
        </Link>
      </div>
    </Card>
  )
}