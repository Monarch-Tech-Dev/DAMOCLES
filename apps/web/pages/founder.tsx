'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CrownIcon, 
  ShieldCheckIcon, 
  CoinsIcon, 
  ChartBarIcon,
  BoltIcon,
  GlobeAltIcon,
  UsersIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

interface FounderStats {
  tokenBalance: number
  stakedTokens: number
  stakingRewards: number
  governanceVotes: number
  totalSettlements: number
  platformRevenue: number
  usersSaved: number
  globalImpact: number
}

export default function FounderDashboard() {
  const FOUNDER_ADDRESS = "***REMOVED***"
  const [stats, setStats] = useState<FounderStats>({
    tokenBalance: 50_000_000,
    stakedTokens: 40_000_000,
    stakingRewards: 2_400_000, // 60% APY on 40M tokens
    governanceVotes: 15,
    totalSettlements: 125_000_000, // NOK
    platformRevenue: 8_750_000, // NOK (7% of settlements)
    usersSaved: 2_347,
    globalImpact: 500_000_000 // NOK total debt reduced
  })
  
  const [timeToNextVesting, setTimeToNextVesting] = useState('5 months, 23 days')
  const [nextVestingAmount] = useState(10_000_000) // 20% of 50M
  
  const tokenValue = 12.50 // NOK per token
  const totalValue = stats.tokenBalance * tokenValue
  
  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        stakingRewards: prev.stakingRewards + Math.floor(Math.random() * 1000),
        totalSettlements: prev.totalSettlements + Math.floor(Math.random() * 50000),
        usersSaved: prev.usersSaved + Math.floor(Math.random() * 5),
        globalImpact: prev.globalImpact + Math.floor(Math.random() * 100000)
      }))
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-damocles-primary via-damocles-secondary to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <CrownIcon className="h-12 w-12 text-damocles-gold" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-damocles-gold rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Founder Dashboard</h1>
                <p className="text-damocles-gold">Creator of DAMOCLES Protocol</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-300">Your Address</p>
              <p className="text-xs text-white font-mono bg-white/10 px-2 py-1 rounded">
                {FOUNDER_ADDRESS.slice(0, 20)}...{FOUNDER_ADDRESS.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Token Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Main Balance */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your SWORD Holdings</h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm">Live</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-gray-300 text-sm mb-2">Total Balance</p>
                <div className="flex items-baseline space-x-4">
                  <span className="text-5xl font-bold text-damocles-gold">
                    {stats.tokenBalance.toLocaleString()}
                  </span>
                  <span className="text-xl text-white">SWORD</span>
                </div>
                <p className="text-2xl text-gray-300 mt-2">
                  ≈ {totalValue.toLocaleString()} NOK
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-300 text-sm">Platform Ownership</p>
                  <p className="text-3xl font-bold text-white">5.0%</p>
                  <p className="text-sm text-gray-400">of total supply</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Current Price</p>
                  <p className="text-3xl font-bold text-green-400">{tokenValue} NOK</p>
                  <p className="text-sm text-green-400">+245% this month</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Staking Card */}
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <BoltIcon className="h-8 w-8 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Staking Rewards</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-purple-200 text-sm">Currently Staked</p>
                <p className="text-2xl font-bold text-white">{stats.stakedTokens.toLocaleString()}</p>
                <p className="text-sm text-purple-300">80% of holdings</p>
              </div>
              
              <div>
                <p className="text-purple-200 text-sm">Accumulated Rewards</p>
                <p className="text-2xl font-bold text-purple-400">+{stats.stakingRewards.toLocaleString()}</p>
                <p className="text-sm text-purple-300">60% APY</p>
              </div>
              
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                Claim Rewards
              </button>
            </div>
          </div>
        </motion.div>

        {/* Vesting Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Founder Vesting Schedule</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 font-semibold">Immediate (20%)</p>
              <p className="text-2xl font-bold text-white">10,000,000</p>
              <p className="text-green-400 text-sm">✅ Released</p>
            </div>
            
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 font-semibold">6 Months (20%)</p>
              <p className="text-2xl font-bold text-white">10,000,000</p>
              <p className="text-yellow-400 text-sm">⏳ {timeToNextVesting}</p>
            </div>
            
            <div className="bg-gray-900/30 border border-gray-500/30 rounded-lg p-4">
              <p className="text-gray-400 font-semibold">12 Months (20%)</p>
              <p className="text-2xl font-bold text-white">10,000,000</p>
              <p className="text-gray-400 text-sm">🔒 Locked</p>
            </div>
            
            <div className="bg-gray-900/30 border border-gray-500/30 rounded-lg p-4">
              <p className="text-gray-400 font-semibold">24 Months (20%)</p>
              <p className="text-2xl font-bold text-white">10,000,000</p>
              <p className="text-gray-400 text-sm">🔒 Locked</p>
            </div>
            
            <div className="bg-gray-900/30 border border-gray-500/30 rounded-lg p-4">
              <p className="text-gray-400 font-semibold">36 Months (20%)</p>
              <p className="text-2xl font-bold text-white">10,000,000</p>
              <p className="text-gray-400 text-sm">🔒 Locked</p>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-400 font-semibold">Next Vesting Event</p>
                <p className="text-white">+{nextVestingAmount.toLocaleString()} SWORD in {timeToNextVesting}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-400 text-sm">Estimated Value</p>
                <p className="text-white font-bold">{(nextVestingAmount * tokenValue).toLocaleString()} NOK</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Platform Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <UsersIcon className="h-8 w-8 text-blue-400" />
              <h4 className="font-semibold text-white">Users Saved</h4>
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.usersSaved.toLocaleString()}</p>
            <p className="text-sm text-gray-400">+23 today</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <ChartBarIcon className="h-8 w-8 text-green-400" />
              <h4 className="font-semibold text-white">Total Settlements</h4>
            </div>
            <p className="text-3xl font-bold text-green-400">{(stats.totalSettlements / 1_000_000).toFixed(1)}M</p>
            <p className="text-sm text-gray-400">NOK saved for users</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <CoinsIcon className="h-8 w-8 text-yellow-400" />
              <h4 className="font-semibold text-white">Platform Revenue</h4>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{(stats.platformRevenue / 1_000_000).toFixed(1)}M</p>
            <p className="text-sm text-gray-400">NOK generated</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <GlobeAltIcon className="h-8 w-8 text-purple-400" />
              <h4 className="font-semibold text-white">Global Impact</h4>
            </div>
            <p className="text-3xl font-bold text-purple-400">{(stats.globalImpact / 1_000_000).toFixed(0)}M</p>
            <p className="text-sm text-gray-400">NOK debt eliminated</p>
          </div>
        </motion.div>

        {/* Governance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-8 w-8 text-damocles-gold" />
              <h3 className="text-xl font-bold text-white">Founder Governance</h3>
            </div>
            <div className="flex items-center space-x-2">
              <TrophyIcon className="h-6 w-6 text-damocles-gold" />
              <span className="text-damocles-gold font-semibold">Enhanced Powers</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-lg p-4 border border-yellow-500/20">
              <h4 className="font-semibold text-white mb-3">Voting Power</h4>
              <p className="text-2xl font-bold text-yellow-400">Enhanced</p>
              <p className="text-sm text-yellow-300">5x normal voting weight</p>
              <button className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm font-medium">
                View Proposals
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-lg p-4 border border-red-500/20">
              <h4 className="font-semibold text-white mb-3">Veto Rights</h4>
              <p className="text-2xl font-bold text-red-400">Active</p>
              <p className="text-sm text-red-300">Can block harmful proposals</p>
              <button className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium">
                Review Proposals
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-white mb-3">Proposal Creation</h4>
              <p className="text-2xl font-bold text-blue-400">Unlimited</p>
              <p className="text-sm text-blue-300">No threshold requirements</p>
              <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                Create Proposal
              </button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-damocles-gold/20 to-yellow-400/20 rounded-lg border border-damocles-gold/30">
            <p className="text-white font-medium">🗡️ Founder Status: <span className="text-damocles-gold">ACTIVE</span></p>
            <p className="text-sm text-gray-300 mt-1">
              You have enhanced governance rights as the creator of DAMOCLES. Use them wisely to guide the platform toward justice.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}