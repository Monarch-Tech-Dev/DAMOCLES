'use client'

import React, { useState } from 'react'
import {
  Card,
  Title,
  Text,
  Badge,
  Flex,
  Grid,
  Callout,
} from '@tremor/react'
import {
  Crown,
  Shield,
  Zap,
  CheckCircle,
  X,
  ArrowUpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubscriptionTier {
  name: string
  price: number
  period: string
  description: string
  features: string[]
  limitations?: string[]
  icon: React.ComponentType<any>
  popular?: boolean
  current?: boolean
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    name: 'Free',
    price: 0,
    period: 'month',
    description: 'Basic debt protection for individuals',
    features: [
      'PDI calculation and basic analysis',
      'Debt portfolio overview',
      'Basic violation detection',
      'Educational resources',
      'Community support'
    ],
    limitations: [
      'Manual GDPR requests only',
      'No automated monitoring',
      'Basic reporting',
      'Standard support'
    ],
    icon: Shield,
    current: true
  },
  {
    name: 'Premium',
    price: 9.99,
    period: 'month',
    description: 'Automated protection with enhanced features',
    features: [
      'Everything in Free',
      'Automated GDPR request generation',
      'Real-time debt monitoring',
      'Advanced violation detection',
      'Priority email support',
      'Monthly detailed reports',
      'Document templates'
    ],
    icon: Zap,
    popular: true
  },
  {
    name: 'Pro',
    price: 29.99,
    period: 'month',
    description: 'Complete legal automation for serious cases',
    features: [
      'Everything in Premium',
      'Full legal document automation',
      'Case progress tracking',
      'Recovery commission optimization',
      'Phone support',
      'Dedicated case manager',
      'Court-ready documentation',
      'Settlement negotiation tools'
    ],
    icon: Crown
  }
]

export default function SubscriptionPage() {
  const [currentTier, setCurrentTier] = useState('Free')
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async (tierName: string) => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setCurrentTier(tierName)
      setLoading(false)
    }, 1500)
  }

  const totalRecovered = 2450 // Mock data
  const commissionEarned = totalRecovered * 0.25

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Title>Subscription Management</Title>
        <Text>Choose the right plan for your debt protection needs</Text>
      </div>

      {/* Current Status */}
      <Card>
        <Flex alignItems="center" className="space-x-4">
          <div className="flex-1">
            <Text className="text-sm text-slate-600">Current Plan</Text>
            <Title className="text-xl">{currentTier} Plan</Title>
            <Text>
              {currentTier === 'Free'
                ? 'Upgrade to unlock automated features'
                : `Billed monthly • Next payment: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}`
              }
            </Text>
          </div>
          {totalRecovered > 0 && (
            <div className="text-right">
              <Text className="text-sm text-slate-600">Recovered This Year</Text>
              <Title className="text-2xl text-green-600">{totalRecovered.toLocaleString()} NOK</Title>
              <Text className="text-sm">Commission earned: {commissionEarned.toLocaleString()} NOK</Text>
            </div>
          )}
        </Flex>
      </Card>

      {/* Recovery Commission Info */}
      <Callout
        title="Recovery Commission Model"
        icon={ArrowUpCircle}
        color="green"
      >
        We earn 25% commission only when we successfully recover money for you.
        No recovery = no fees. Your success is our success.
      </Callout>

      {/* Subscription Tiers */}
      <Grid numItems={1} numItemsLg={3} className="gap-6">
        {subscriptionTiers.map((tier) => {
          const IconComponent = tier.icon
          const isCurrent = tier.name === currentTier

          return (
            <Card
              key={tier.name}
              className={`relative ${tier.popular ? 'ring-2 ring-blue-500' : ''} ${isCurrent ? 'bg-blue-50' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge color="blue">Most Popular</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge color="green">Current Plan</Badge>
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <IconComponent className="w-8 h-8 mx-auto text-blue-600" />
                  <Title className="text-xl">{tier.name}</Title>
                  <Text className="text-sm text-slate-600">{tier.description}</Text>
                </div>

                {/* Price */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-3xl font-bold">{tier.price === 0 ? 'Free' : `€${tier.price}`}</span>
                    {tier.price > 0 && <span className="text-slate-600">/{tier.period}</span>}
                  </div>
                  {tier.price > 0 && (
                    <Text className="text-xs text-slate-500 mt-1">+ recovery commissions</Text>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <Text className="font-medium text-slate-900">Included:</Text>
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <Text className="text-sm">{feature}</Text>
                      </li>
                    ))}
                  </ul>

                  {tier.limitations && (
                    <>
                      <Text className="font-medium text-slate-600 mt-4">Limitations:</Text>
                      <ul className="space-y-2">
                        {tier.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <Text className="text-sm text-slate-600">{limitation}</Text>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrent ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : tier.name === 'Free' ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUpgrade(tier.name)}
                      loading={loading}
                    >
                      Downgrade to Free
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleUpgrade(tier.name)}
                      loading={loading}
                    >
                      Upgrade to {tier.name}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </Grid>

      {/* Enterprise Option */}
      <Card>
        <div className="p-6 text-center space-y-4">
          <Title>Enterprise & Family Plans</Title>
          <Text>
            Need to manage multiple cases or require custom integrations?
            Contact us for enterprise pricing starting at €299/month.
          </Text>
          <div className="flex justify-center space-x-4">
            <Button variant="outline">Contact Sales</Button>
            <Button variant="outline">Schedule Demo</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}