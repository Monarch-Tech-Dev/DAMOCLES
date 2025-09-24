'use client'

import React from 'react'
import { Card, Title, Text, Badge } from '@tremor/react'
import { Button } from '@/components/ui/button'
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
  className?: string
}

export function PremiumGate({
  userTier,
  feature,
  children,
  title,
  description,
  requiredTier = 'premium',
  showUpgrade = true,
  className
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
    <Card className={className}>
      <div className="p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <Badge color="blue">
            {tierNames[requiredTier]} Feature
          </Badge>
          <Title>{title || `${tierNames[requiredTier]} Required`}</Title>
          <Text>
            {description || getFeatureDescription(feature)}
          </Text>
        </div>

        {showUpgrade && (
          <div className="space-y-3">
            <Link href="/dashboard/subscription" className="center">
              <Button className="inline-flex items-center space-x-2">
                <ArrowUpCircle className="w-4 h-4" />
                <span>Upgrade to {tierNames[requiredTier]}</span>
              </Button>
            </Link>
            <Text className="text-xs">
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
  className?: string
}

export function FeatureLocked({ userTier, feature, children, fallback, className }: FeatureLockedProps) {
  const hasAccess = hasFeature(userTier, feature)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Card className={className}>
      <div className="p-6 text-center space-y-4">
        <Lock className="w-8 h-8 text-slate-400 mx-auto" />
        <div className="space-y-2">
          <Title>Premium Feature</Title>
          <Text>This feature requires a premium subscription</Text>
        </div>
        <Link href="/dashboard/subscription">
          <Button>
            Upgrade Now
          </Button>
        </Link>
      </div>
    </Card>
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