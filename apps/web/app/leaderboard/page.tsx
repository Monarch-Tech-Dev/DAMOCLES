'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, Users, Target, Calendar, Award } from 'lucide-react'

interface RegionalScore {
  rank: number
  regionName: string
  regionCode: string
  averagePDI: number
  totalParticipants: number
  monthlyChange: number
  trend: 'improving' | 'worsening' | 'stable'
  lastWeekRank: number
  mayor?: string
  status: 'excellent' | 'good' | 'caution' | 'crisis'
}

interface Competition {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  prize: string
  participants: number
  currentLeader: string
  isActive: boolean
}

export default function LeaderboardPage() {
  const [regions, setRegions] = useState<RegionalScore[]>([
    {
      rank: 1,
      regionName: 'Stavanger',
      regionCode: 'NO_STAVANGER',
      averagePDI: 77.5,
      totalParticipants: 9800,
      monthlyChange: 2.3,
      trend: 'improving',
      lastWeekRank: 2,
      mayor: 'Kari Nessa Nordtun',
      status: 'good'
    },
    {
      rank: 2,
      regionName: 'Østlandet',
      regionCode: 'NO_OST',
      averagePDI: 75.6,
      totalParticipants: 35400,
      monthlyChange: 1.8,
      trend: 'improving',
      lastWeekRank: 3,
      mayor: 'Multiple',
      status: 'good'
    },
    {
      rank: 3,
      regionName: 'Oslo',
      regionCode: 'NO_OSLO',
      averagePDI: 74.1,
      totalParticipants: 24500,
      monthlyChange: -0.5,
      trend: 'stable',
      lastWeekRank: 1,
      mayor: 'Raymond Johansen',
      status: 'good'
    },
    {
      rank: 4,
      regionName: 'Vestlandet',
      regionCode: 'NO_VEST',
      averagePDI: 73.0,
      totalParticipants: 18900,
      monthlyChange: 1.2,
      trend: 'improving',
      lastWeekRank: 5,
      status: 'good'
    },
    {
      rank: 5,
      regionName: 'Trondheim',
      regionCode: 'NO_TRONDHEIM',
      averagePDI: 72.1,
      totalParticipants: 8700,
      monthlyChange: 0.8,
      trend: 'improving',
      lastWeekRank: 4,
      status: 'good'
    },
    {
      rank: 6,
      regionName: 'Nord-Norge',
      regionCode: 'NO_NORD',
      averagePDI: 70.3,
      totalParticipants: 15600,
      monthlyChange: 3.1,
      trend: 'improving',
      lastWeekRank: 8,
      status: 'caution'
    },
    {
      rank: 7,
      regionName: 'Bergen',
      regionCode: 'NO_BERGEN',
      averagePDI: 68.7,
      totalParticipants: 12300,
      monthlyChange: -1.2,
      trend: 'worsening',
      lastWeekRank: 6,
      mayor: 'Marte Mjøs Persen',
      status: 'caution'
    },
    {
      rank: 8,
      regionName: 'Sørlandet',
      regionCode: 'NO_SOR',
      averagePDI: 65.5,
      totalParticipants: 7200,
      monthlyChange: -2.1,
      trend: 'worsening',
      lastWeekRank: 7,
      status: 'caution'
    }
  ])

  const [competitions, setCompetitions] = useState<Competition[]>([
    {
      id: 'october-challenge',
      title: 'October Debt Health Challenge',
      description: 'Region with highest PDI improvement wins 1M NOK for local financial literacy programs',
      startDate: '2025-10-01',
      endDate: '2025-10-31',
      prize: '1,000,000 NOK',
      participants: 678750,
      currentLeader: 'Nord-Norge (+3.1 improvement)',
      isActive: true
    },
    {
      id: 'municipal-mayors',
      title: 'Mayors Financial Health Cup',
      description: 'Municipal leaders compete to improve their region\'s debt health score',
      startDate: '2025-09-15',
      endDate: '2025-12-15',
      prize: 'National Recognition',
      participants: 42,
      currentLeader: 'Stavanger (Mayor Kari Nessa Nordtun)',
      isActive: true
    },
    {
      rank: 3,
      id: 'youth-engagement',
      title: 'Youth Financial Awareness Drive',
      description: 'Students aged 18-25 help improve their region\'s participation rate',
      startDate: '2025-09-01',
      endDate: '2025-11-30',
      prize: 'University Scholarships',
      participants: 24650,
      currentLeader: 'Oslo (45% youth participation)',
      isActive: true
    }
  ])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-400" />
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />
      case 3:
        return <Trophy className="h-8 w-8 text-amber-600" />
      default:
        return <div className="h-8 w-8 flex items-center justify-center bg-gray-600 rounded-full text-white font-bold">{rank}</div>
    }
  }

  const getRankChange = (currentRank: number, lastWeekRank: number) => {
    const change = lastWeekRank - currentRank
    if (change > 0) {
      return (
        <div className="flex items-center text-green-400 text-sm">
          <TrendingUp className="h-4 w-4 mr-1" />
          +{change}
        </div>
      )
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-400 text-sm">
          <TrendingDown className="h-4 w-4 mr-1" />
          {change}
        </div>
      )
    } else {
      return <div className="text-gray-400 text-sm">-</div>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-400/20 border-green-400/30'
      case 'good': return 'text-blue-400 bg-blue-400/20 border-blue-400/30'
      case 'caution': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      case 'crisis': return 'text-red-400 bg-red-400/20 border-red-400/30'
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30'
    }
  }

  const getPDIColor = (score: number) => {
    if (score >= 75) return 'text-green-400'
    if (score >= 70) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Regional <span className="text-yellow-400">Leaderboard</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Which Norwegian region has the healthiest debt profile?
            Real-time rankings updated as citizens join the movement.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full">
              <Trophy className="h-4 w-4 mr-2" />
              Live Competition
            </div>
            <div className="flex items-center bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full">
              <Users className="h-4 w-4 mr-2" />
              678,750 Participants
            </div>
            <div className="flex items-center bg-green-500/20 text-green-400 px-4 py-2 rounded-full">
              <Target className="h-4 w-4 mr-2" />
              Real Prizes
            </div>
          </div>
        </div>

        {/* Current Leader Spotlight */}
        <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/50 p-8 mb-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Crown className="h-16 w-16 text-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold mb-2">🎉 Current Leader: Stavanger</h2>
            <div className="text-6xl font-bold text-yellow-400 mb-4">77.5/100</div>
            <p className="text-gray-300 mb-6">
              Led by Mayor Kari Nessa Nordtun, Stavanger has achieved the highest regional debt health score
              with 9,800 active participants (+2.3 improvement this month)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-500/20 p-4 rounded-lg">
                <div className="font-semibold text-green-400">Improvement Rate</div>
                <div className="text-2xl font-bold">+2.3%</div>
                <div className="text-gray-400">This month</div>
              </div>
              <div className="bg-blue-500/20 p-4 rounded-lg">
                <div className="font-semibold text-blue-400">Participants</div>
                <div className="text-2xl font-bold">9,800</div>
                <div className="text-gray-400">Citizens enrolled</div>
              </div>
              <div className="bg-purple-500/20 p-4 rounded-lg">
                <div className="font-semibold text-purple-400">Rank Change</div>
                <div className="text-2xl font-bold">+1</div>
                <div className="text-gray-400">Since last week</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Regional Rankings */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Regional Rankings</h2>

          <div className="space-y-4">
            {regions.map((region) => (
              <Card key={region.regionCode} className="bg-gray-800 border-gray-700 p-6 hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {getRankIcon(region.rank)}
                    </div>

                    {/* Region Info */}
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold mb-1">{region.regionName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {region.totalParticipants.toLocaleString()} participants
                        </span>
                        {region.mayor && region.mayor !== 'Multiple' && (
                          <span>Mayor: {region.mayor}</span>
                        )}
                      </div>
                    </div>

                    {/* PDI Score */}
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getPDIColor(region.averagePDI)}`}>
                        {region.averagePDI.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">PDI Score</div>
                    </div>

                    {/* Change */}
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${region.monthlyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {region.monthlyChange >= 0 ? '+' : ''}{region.monthlyChange.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">30 days</div>
                    </div>

                    {/* Rank Change */}
                    <div className="text-center">
                      {getRankChange(region.rank, region.lastWeekRank)}
                      <div className="text-xs text-gray-400 mt-1">vs last week</div>
                    </div>

                    {/* Status */}
                    <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(region.status)}`}>
                      {region.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Competitions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Active Competitions</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <Card key={competition.id} className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Award className="h-6 w-6 text-yellow-400 mr-3" />
                    <h3 className="text-lg font-semibold">{competition.title}</h3>
                  </div>
                  {competition.isActive && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-gray-400 text-sm mb-4">{competition.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Prize:</span>
                    <span className="font-semibold text-yellow-400">{competition.prize}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Participants:</span>
                    <span>{competition.participants.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Leader:</span>
                    <span className="text-green-400 font-semibold">{competition.currentLeader}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Ends:</span>
                    <span>{new Date(competition.endDate).toLocaleDateString('no-NO')}</span>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${Math.random() * 60 + 20}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {Math.floor((new Date(competition.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Competition Rules */}
        <Card className="bg-gray-800 border-gray-700 p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">How Regional Competition Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Scoring System</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>PDI Score:</strong> Regional average of all participants</li>
                <li>• <strong>Participation Rate:</strong> % of population enrolled</li>
                <li>• <strong>Improvement Rate:</strong> Month-over-month change</li>
                <li>• <strong>Community Engagement:</strong> Local initiatives and campaigns</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-400">How to Improve Your Region</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>Spread the Word:</strong> Invite friends and family to join</li>
                <li>• <strong>Improve Your PDI:</strong> Follow personalized recommendations</li>
                <li>• <strong>Organize Locally:</strong> Community debt health events</li>
                <li>• <strong>Challenge Other Regions:</strong> Social media campaigns</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start">
              <Trophy className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-400 mb-1">Want to Start a Competition?</h4>
                <p className="text-sm text-gray-300">
                  Mayors, community leaders, and organizations can propose new competitions.
                  Email: <a href="mailto:competitions@damocles.no" className="text-blue-400">competitions@damocles.no</a>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Help Your Region Win</h2>
          <p className="text-gray-300 mb-6">
            Every citizen who calculates their PDI score helps improve their region's ranking.
            Join your neighbors in building Norway's financial health.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/dashboard/pdi"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Calculate My PDI Score
            </a>
            <a
              href="/founding-members"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Join First 1000
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}