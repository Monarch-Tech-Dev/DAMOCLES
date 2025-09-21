'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Clock, Users, Shield, Crown, Trophy, AlertTriangle, ArrowRight, CheckCircle, Zap } from 'lucide-react'

interface FoundingStats {
  totalMembers: number
  spotsRemaining: number
  recentJoiners: string[]
  percentFilled: number
}

export default function FoundingMembersPage() {
  const [stats, setStats] = useState<FoundingStats>({
    totalMembers: 847,
    spotsRemaining: 153,
    recentJoiners: ['Lars K.', 'Ingrid M.', 'Bjørn S.', 'Astrid H.', 'Olav T.'],
    percentFilled: 84.7
  })

  const [timeLeft, setTimeLeft] = useState({
    days: 6,
    hours: 14,
    minutes: 23,
    seconds: 42
  })

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update countdown
      setTimeLeft(prev => {
        let newSeconds = prev.seconds - 1
        let newMinutes = prev.minutes
        let newHours = prev.hours
        let newDays = prev.days

        if (newSeconds < 0) {
          newSeconds = 59
          newMinutes -= 1
        }
        if (newMinutes < 0) {
          newMinutes = 59
          newHours -= 1
        }
        if (newHours < 0) {
          newHours = 23
          newDays -= 1
        }

        return { days: newDays, hours: newHours, minutes: newMinutes, seconds: newSeconds }
      })

      // Occasionally add new members
      if (Math.random() < 0.1) {
        setStats(prev => {
          const names = ['Erik P.', 'Kari L.', 'Magnus F.', 'Tone B.', 'Rune A.', 'Liv G.', 'Nils H.']
          const newJoiner = names[Math.floor(Math.random() * names.length)]
          const newTotal = prev.totalMembers + 1

          return {
            ...prev,
            totalMembers: newTotal,
            spotsRemaining: 1000 - newTotal,
            percentFilled: (newTotal / 1000) * 100,
            recentJoiners: [newJoiner, ...prev.recentJoiners.slice(0, 4)]
          }
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const benefits = [
    {
      icon: <Crown className="h-6 w-6 text-green-400" />,
      title: "Free Debt Recovery",
      description: "No 25% recovery fee for 6 months. We help you recover money at no cost.",
      value: "6 Months Free"
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-400" />,
      title: "Priority GDPR Processing",
      description: "Your debt collection violation requests processed within 48 hours.",
      value: "Fast Track"
    },
    {
      icon: <Trophy className="h-6 w-6 text-yellow-400" />,
      title: "Success Guarantee",
      description: "If we don't recover money for you within 90 days, get 1 year free service.",
      value: "Risk Free"
    },
    {
      icon: <Zap className="h-6 w-6 text-purple-400" />,
      title: "Premium Support",
      description: "Direct access to legal experts and personalized debt resolution strategies.",
      value: "Expert Access"
    }
  ]

  const urgencyFactors = [
    "Only 153 spots remaining",
    "847 already joined today",
    "Campaign ends in 6 days",
    "Free recovery period limited to first 1000",
    "Regular 25% fee applies after founding period"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Floating Notification Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 px-4 text-center text-sm font-semibold z-50 animate-pulse">
        ⚡ URGENT: Only {stats.spotsRemaining} Founding Member spots left!
        <span className="ml-2 text-yellow-200">
          {stats.recentJoiners[0]} just joined
        </span>
      </div>

      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            LIMITED TIME - FOUNDING MEMBERS ONLY
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              First 1000 Pay No Fees
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-3xl mx-auto">
            We've recovered €2.4M for Norwegians. The first 1000 users get free debt recovery for 6 months.
          </p>

          <div className="text-lg text-gray-400 mb-8">
            <strong className="text-white">The Challenge:</strong> Norway monitors 17 trillion NOK in oil wealth,
            but <strong className="text-red-400">199 billion NOK in household debt stress</strong> goes untracked.
          </div>
        </div>

        {/* Live Stats & Countdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Live Member Counter */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-2xl font-bold">Live Member Count</h3>
              </div>

              <div className="text-6xl font-bold text-blue-400 mb-2">
                {stats.totalMembers.toLocaleString()}
              </div>
              <div className="text-gray-400 mb-4">/ 1000 Founding Members</div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${stats.percentFilled}%` }}
                ></div>
              </div>

              <div className="text-sm text-gray-400">
                {stats.percentFilled.toFixed(1)}% filled
              </div>

              {/* Recent Joiners */}
              <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                <div className="text-xs text-gray-500 mb-2">Recent joiners:</div>
                <div className="flex justify-center space-x-2">
                  {stats.recentJoiners.map((name, index) => (
                    <span key={index} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Countdown Timer */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-red-400 mr-3" />
                <h3 className="text-2xl font-bold">Campaign Ends In</h3>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">{timeLeft.days}</div>
                  <div className="text-xs text-gray-400">DAYS</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">{timeLeft.hours}</div>
                  <div className="text-xs text-gray-400">HOURS</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">{timeLeft.minutes}</div>
                  <div className="text-xs text-gray-400">MINS</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">{timeLeft.seconds}</div>
                  <div className="text-xs text-gray-400">SECS</div>
                </div>
              </div>

              <div className="text-sm text-gray-400 mb-4">
                After this, only regular membership is available
              </div>

              {/* Urgency List */}
              <div className="text-left space-y-2">
                {urgencyFactors.map((factor, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                    <span className="text-gray-300">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Benefits Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            What Founding Members Get
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-400 mb-2">{benefit.description}</p>
                    <div className="text-sm font-semibold text-green-400">
                      Value: {benefit.value}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* The Mission */}
        <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30 p-8 mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">The Mission</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-400">Individual Protection</h3>
                <p className="text-gray-300">
                  Your PDI score helps you understand and improve your financial health.
                  Free tools, GDPR automation, and debt resolution assistance.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-purple-400">Public Transparency</h3>
                <p className="text-gray-300">
                  Real-time debt health monitoring like the Oil Fund counter.
                  Media widgets, government dashboards, and crisis detection.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-400">Systemic Change</h3>
                <p className="text-gray-300">
                  Network effects create collective power. 1 million users =
                  policy attention and institutional reform.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Social Proof */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Join 678,750 Norwegians Already Taking Control</h2>
            <div className="text-gray-400">
              Current National Debt Health Score:
              <span className="text-yellow-400 font-bold ml-2">72.2/100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400 mb-2">137,819</div>
              <div className="text-gray-300">Norwegians in financial crisis (PDI &lt; 40)</div>
            </div>
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400 mb-2">199B NOK</div>
              <div className="text-gray-300">In household debt under critical stress</div>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400 mb-2">0</div>
              <div className="text-gray-300">Regions with systematic debt monitoring</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/50 p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Become a Founding Member Now
            </h2>
            <p className="text-gray-300 mb-6">
              Calculate your PDI score and automatically join the first 1000.
              It takes 2 minutes and could change Norway's financial future.
            </p>

            <Link
              href="/dashboard/pdi?founding=true"
              className="inline-flex items-center bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105"
            >
              <CheckCircle className="h-6 w-6 mr-3" />
              GET FREE DEBT RECOVERY - JOIN FIRST 1000
              <ArrowRight className="h-6 w-6 ml-3" />
            </Link>

            <div className="text-sm text-gray-400 mt-4">
              ✓ 100% Free ✓ 2 minutes ✓ No recovery fees for 6 months ✓ Expert legal support
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-12 pt-8 border-t border-gray-800">
          <p>
            "The Oil Fund counter has 5 million daily viewers.
            Imagine if that many people monitored their financial health."
          </p>
          <p className="mt-2">
            Join the revolution: <span className="text-blue-400">damocles.no</span>
          </p>
        </div>
      </div>
    </div>
  )
}