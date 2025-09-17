'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Title,
  Text,
  Metric,
  Flex,
  ProgressBar,
  BadgeDelta,
  AreaChart,
  BarChart,
  DonutChart,
  List,
  ListItem,
  Badge,
  Grid,
  Button
} from '@tremor/react'
import {
  Brain,
  TrendingUp,
  Users,
  Target,
  Zap,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  Download
} from 'lucide-react'

// Mock data for learning analytics
const learningMetrics = {
  totalEvents: 15847,
  successRateImprovement: 47.3, // Percentage improvement over time
  activeCreditors: 156,
  classActionReady: 8,
  avgResponseTime: 12.4, // days
  systemEfficiency: 73.2,
  collectiveIntelligence: 89.5,
  recentLearnings: 234
}

const successRateEvolution = [
  { month: 'Jan', initialRate: 21, optimizedRate: 23, creditors: 45 },
  { month: 'Feb', initialRate: 23, optimizedRate: 28, creditors: 62 },
  { month: 'Mar', initialRate: 25, optimizedRate: 34, creditors: 78 },
  { month: 'Apr', initialRate: 27, optimizedRate: 42, creditors: 94 },
  { month: 'May', initialRate: 29, optimizedRate: 51, creditors: 112 },
  { month: 'Jun', initialRate: 31, optimizedRate: 58, creditors: 134 },
  { month: 'Jul', initialRate: 33, optimizedRate: 67, creditors: 156 }
]

const topStrategies = [
  { strategy: 'GDPR Inkasso Template + Legal Citation', successRate: 73.2, uses: 2847, improvement: '+23%' },
  { strategy: 'Fee Documentation Challenge', successRate: 68.9, uses: 1956, improvement: '+31%' },
  { strategy: 'Compound Interest Violation', successRate: 64.1, uses: 1534, improvement: '+19%' },
  { strategy: 'Missing Notice Documentation', successRate: 61.8, uses: 1342, improvement: '+28%' },
  { strategy: 'Excessive Charge Analysis', successRate: 59.2, uses: 1178, improvement: '+15%' }
]

const classActionReadyCreditors = [
  { name: 'Kredinor AS', type: 'Inkasso', affectedUsers: 2847, totalHarm: '4.7M NOK', strength: 'Conclusive' },
  { name: 'Lindorff AS', type: 'Inkasso', affectedUsers: 1934, totalHarm: '3.2M NOK', strength: 'Strong' },
  { name: 'Klarna Bank AB', type: 'BNPL', affectedUsers: 1567, totalHarm: '2.1M NOK', strength: 'Strong' },
  { name: 'Santander Consumer', type: 'Bank', affectedUsers: 1234, totalHarm: '1.8M NOK', strength: 'Moderate' },
  { name: 'Collector Bank', type: 'Inkasso', affectedUsers: 987, totalHarm: '1.4M NOK', strength: 'Strong' },
  { name: 'Komplett Bank', type: 'Bank', affectedUsers: 856, totalHarm: '1.1M NOK', strength: 'Moderate' },
  { name: 'Vipps AS', type: 'BNPL', affectedUsers: 634, totalHarm: '890K NOK', strength: 'Moderate' },
  { name: 'Svea Ekonomi', type: 'Inkasso', affectedUsers: 523, totalHarm: '720K NOK', strength: 'Strong' }
]

const recentLearnings = [
  { creditor: 'Kredinor AS', learning: 'Response pattern: 92% admission rate with "Inkassoloven §19" citation', impact: 'High', time: '2 hours ago' },
  { creditor: 'Klarna Bank', learning: 'New violation type: BNPL consent manipulation detected', impact: 'Critical', time: '5 hours ago' },
  { creditor: 'Lindorff AS', learning: 'Optimal timing: Tuesday 10 AM responses 34% higher success', impact: 'Medium', time: '8 hours ago' },
  { creditor: 'Santander Consumer', learning: 'Evidence strength: PDF documents 67% more effective than email', impact: 'High', time: '12 hours ago' },
  { creditor: 'Collector Bank', learning: 'Strategy refinement: Combined GDPR+Inkasso requests 28% improvement', impact: 'Medium', time: '1 day ago' }
]

const strategyEvolution = [
  { week: 'Week 1', genericSuccess: 20, learningSuccess: 20 },
  { week: 'Week 2', genericSuccess: 19, learningSuccess: 23 },
  { week: 'Week 4', genericSuccess: 21, learningSuccess: 31 },
  { week: 'Week 8', genericSuccess: 22, learningSuccess: 42 },
  { week: 'Week 12', genericSuccess: 20, learningSuccess: 54 },
  { week: 'Week 16', genericSuccess: 21, learningSuccess: 63 },
  { week: 'Week 20', genericSuccess: 19, learningSuccess: 71 }
]

export default function LearningDashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [simulationRunning, setSimulationRunning] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  const runSimulation = async () => {
    setSimulationRunning(true)
    try {
      // In real implementation, this would call the learning engine API
      console.log('Running learning simulation...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    } finally {
      setSimulationRunning(false)
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength.toLowerCase()) {
      case 'conclusive': return 'green'
      case 'strong': return 'blue'
      case 'moderate': return 'yellow'
      default: return 'gray'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'critical': return 'red'
      case 'high': return 'orange'
      case 'medium': return 'yellow'
      default: return 'gray'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <Title className="text-2xl">Learning Evolution Dashboard</Title>
          <Text className="text-slate-600">
            Collective intelligence and strategy optimization analytics
          </Text>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={runSimulation}
            disabled={simulationRunning}
            variant="secondary"
            size="sm"
          >
            {simulationRunning ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run Simulation
              </>
            )}
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
          >
            {refreshing ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Key Learning Metrics */}
      <Grid numItems={1} numItemsLg={4} className="gap-6">
        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Total Learning Events</Text>
              <Metric>{learningMetrics.totalEvents.toLocaleString()}</Metric>
              <BadgeDelta deltaType="increase" size="xs">
                +{learningMetrics.recentLearnings} this week
              </BadgeDelta>
            </div>
            <Brain className="w-8 h-8 text-purple-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Success Rate Improvement</Text>
              <Metric>{learningMetrics.successRateImprovement}%</Metric>
              <Text className="text-xs text-slate-600">
                vs generic templates
              </Text>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Class Actions Ready</Text>
              <Metric>{learningMetrics.classActionReady}</Metric>
              <Text className="text-xs text-slate-600">
                {learningMetrics.activeCreditors} creditors analyzed
              </Text>
            </div>
            <Shield className="w-8 h-8 text-red-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>System Efficiency</Text>
              <Metric>{learningMetrics.systemEfficiency}%</Metric>
              <ProgressBar
                value={learningMetrics.systemEfficiency}
                color="blue"
                className="mt-3"
              />
            </div>
            <Target className="w-8 h-8 text-blue-600" />
          </Flex>
        </Card>
      </Grid>

      {/* Learning Evolution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Title>Success Rate Evolution</Title>
          <Text className="mb-4">Generic vs Learning-Optimized strategies over time</Text>
          <AreaChart
            className="h-72"
            data={strategyEvolution}
            index="week"
            categories={["genericSuccess", "learningSuccess"]}
            colors={["gray", "blue"]}
            yAxisWidth={50}
            valueFormatter={(value) => `${value}%`}
          />
        </Card>

        <Card>
          <Title>Strategy Performance Matrix</Title>
          <Text className="mb-4">Top performing learned strategies by success rate</Text>
          <BarChart
            className="h-72"
            data={topStrategies.slice(0, 5)}
            index="strategy"
            categories={["successRate"]}
            colors={["green"]}
            yAxisWidth={50}
            valueFormatter={(value) => `${value}%`}
          />
        </Card>
      </div>

      {/* Top Strategies & Recent Learnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Title>Top Performing Strategies</Title>
          <Text className="mb-4">Learned strategies ranked by success rate</Text>
          <List>
            {topStrategies.slice(0, 5).map((strategy, index) => (
              <ListItem key={index}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <Text className="font-medium text-sm">{strategy.strategy}</Text>
                    <div className="flex items-center space-x-4 mt-1">
                      <Text className="text-xs text-slate-600">
                        {strategy.uses.toLocaleString()} uses
                      </Text>
                      <Badge color="green" size="xs">
                        {strategy.improvement}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text className="font-bold text-lg">{strategy.successRate}%</Text>
                  </div>
                </div>
              </ListItem>
            ))}
          </List>
        </Card>

        <Card>
          <Title>Recent System Learnings</Title>
          <Text className="mb-4">Latest pattern discoveries and optimizations</Text>
          <List>
            {recentLearnings.map((learning, index) => (
              <ListItem key={index}>
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Text className="font-medium text-sm">{learning.creditor}</Text>
                      <Badge color={getImpactColor(learning.impact)} size="xs">
                        {learning.impact}
                      </Badge>
                    </div>
                    <Text className="text-xs text-slate-700">{learning.learning}</Text>
                    <Text className="text-xs text-slate-500 mt-1">{learning.time}</Text>
                  </div>
                </div>
              </ListItem>
            ))}
          </List>
        </Card>
      </div>

      {/* Class Action Ready Creditors */}
      <Card>
        <Title>Class Action Ready Creditors</Title>
        <Text className="mb-4">Creditors with sufficient evidence for collective action</Text>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">Creditor</th>
                <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">Type</th>
                <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">Affected Users</th>
                <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">Total Harm</th>
                <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">Evidence Strength</th>
                <th className="text-left py-3 px-4 font-medium text-sm text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {classActionReadyCreditors.map((creditor, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="py-3 px-4">
                    <Text className="font-medium">{creditor.name}</Text>
                  </td>
                  <td className="py-3 px-4">
                    <Badge color="gray" size="xs">{creditor.type}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Text>{creditor.affectedUsers.toLocaleString()}</Text>
                  </td>
                  <td className="py-3 px-4">
                    <Text className="font-medium">{creditor.totalHarm}</Text>
                  </td>
                  <td className="py-3 px-4">
                    <Badge color={getStrengthColor(creditor.strength)} size="xs">
                      {creditor.strength}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button size="xs" variant="secondary">
                      Initiate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* System Evolution Summary */}
      <Grid numItems={1} numItemsLg={3} className="gap-6">
        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Collective Intelligence</Text>
              <Metric>{learningMetrics.collectiveIntelligence}%</Metric>
              <Text className="text-xs text-slate-600 mt-1">
                Knowledge consolidation rate
              </Text>
            </div>
            <Brain className="w-8 h-8 text-purple-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Avg Response Time</Text>
              <Metric>{learningMetrics.avgResponseTime} days</Metric>
              <Text className="text-xs text-slate-600 mt-1">
                Improved by 43% from learning
              </Text>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Active Learning</Text>
              <Metric>{learningMetrics.activeCreditors}</Metric>
              <Text className="text-xs text-slate-600 mt-1">
                Creditors under analysis
              </Text>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>
      </Grid>
    </div>
  )
}