'use client'

import React, { useState } from 'react'
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
  CategoryBar,
  Badge,
  Grid,
  Select,
  SelectItem,
} from '@tremor/react'
import {
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  FileText,
  Eye,
  Download,
  Calendar,
  Target,
  Activity,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const platformMetrics = [
  { month: 'Jan', users: 1800, revenue: 95000, cases: 890, gdpr: 156, violations: 67 },
  { month: 'Feb', users: 2100, revenue: 115000, cases: 980, gdpr: 189, violations: 82 },
  { month: 'Mar', users: 2350, revenue: 128000, cases: 1050, gdpr: 234, violations: 91 },
  { month: 'Apr', users: 2580, revenue: 135000, cases: 1120, gdpr: 267, violations: 105 },
  { month: 'May', users: 2720, revenue: 140000, cases: 1180, gdpr: 298, violations: 112 },
  { month: 'Jun', users: 2847, revenue: 142500, cases: 1205, gdpr: 321, violations: 118 },
]

const revenueBreakdown = [
  { category: 'Subscription Revenue', value: 85400, color: 'blue' },
  { category: 'Document Services', value: 28600, color: 'green' },
  { category: 'Premium Features', value: 18900, color: 'yellow' },
  { category: 'Commission Recovery', value: 9600, color: 'purple' },
]

const userEngagementData = [
  { metric: 'Daily Active Users', value: 68, target: 75, color: 'blue' },
  { metric: 'Weekly Retention', value: 82, target: 80, color: 'green' },
  { metric: 'Feature Adoption', value: 45, target: 60, color: 'yellow' },
  { metric: 'Support Satisfaction', value: 91, target: 85, color: 'green' },
]

const platformEfficiency = [
  { month: 'Jan', automated: 65, manual: 35, successRate: 78 },
  { month: 'Feb', automated: 72, manual: 28, successRate: 82 },
  { month: 'Mar', automated: 78, manual: 22, successRate: 85 },
  { month: 'Apr', automated: 83, manual: 17, successRate: 87 },
  { month: 'May', automated: 87, manual: 13, successRate: 89 },
  { month: 'Jun', automated: 91, manual: 9, successRate: 92 },
]

const geoData = [
  { region: 'Oslo', users: 842, revenue: 45200 },
  { region: 'Bergen', users: 567, revenue: 28900 },
  { region: 'Trondheim', users: 398, revenue: 19800 },
  { region: 'Stavanger', users: 321, revenue: 16200 },
  { region: 'Tromsø', users: 298, revenue: 14100 },
  { region: 'Other', users: 421, revenue: 18300 },
]

const topMetrics = {
  totalRevenue: 142500,
  revenueGrowth: 8.2,
  totalUsers: 2847,
  userGrowth: 12.5,
  activeUsers: 1932,
  churnRate: 4.2,
  avgRevenuePerUser: 50.1,
  conversionRate: 26.1,
  caseSuccessRate: 87.3,
  gdprCompliance: 98.5,
  platformUptime: 99.7,
  customerSatisfaction: 4.6
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6m')
  const [metricView, setMetricView] = useState('revenue')

  const exportReport = () => {
    // Create comprehensive analytics report
    const reportData = {
      timeRange,
      metrics: topMetrics,
      platformData: platformMetrics,
      revenueBreakdown,
      userEngagement: userEngagementData,
      efficiency: platformEfficiency,
      geography: geoData,
      generatedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `damocles-analytics-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <Title className="text-2xl">Platform Analytics</Title>
          <Text className="text-slate-600">
            Comprehensive performance metrics and business intelligence
          </Text>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </Select>
          <Button
            onClick={exportReport}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Top KPIs */}
      <Grid numItems={1} numItemsLg={4} className="gap-6">
        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Monthly Revenue</Text>
              <Metric>{topMetrics.totalRevenue.toLocaleString()} NOK</Metric>
              <BadgeDelta deltaType="increase" size="xs">
                +{topMetrics.revenueGrowth}% vs last month
              </BadgeDelta>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Total Users</Text>
              <Metric>{topMetrics.totalUsers.toLocaleString()}</Metric>
              <BadgeDelta deltaType="increase" size="xs">
                +{topMetrics.userGrowth}% growth
              </BadgeDelta>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Case Success Rate</Text>
              <Metric>{topMetrics.caseSuccessRate}%</Metric>
              <ProgressBar
                value={topMetrics.caseSuccessRate}
                color="green"
                className="mt-3"
              />
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Platform Uptime</Text>
              <Metric>{topMetrics.platformUptime}%</Metric>
              <Text className="text-xs text-slate-600">SLA: 99.9%</Text>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </Flex>
        </Card>
      </Grid>

      {/* Revenue & User Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Title>Platform Growth Metrics</Title>
          <Text className="mb-4">User acquisition and case volume trends</Text>
          <AreaChart
            className="h-72"
            data={platformMetrics}
            index="month"
            categories={["users", "cases"]}
            colors={["blue", "green"]}
            yAxisWidth={60}
          />
        </Card>

        <Card>
          <Title>Revenue & GDPR Activity</Title>
          <Text className="mb-4">Financial performance and compliance metrics</Text>
          <AreaChart
            className="h-72"
            data={platformMetrics}
            index="month"
            categories={["revenue", "gdpr"]}
            colors={["green", "purple"]}
            yAxisWidth={70}
            valueFormatter={(value) => `${value}`}
          />
        </Card>
      </div>

      {/* Revenue Breakdown & User Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Title>Revenue Breakdown</Title>
          <Text className="mb-4">Income sources distribution</Text>
          <DonutChart
            className="h-72"
            data={revenueBreakdown}
            category="value"
            index="category"
            colors={["blue", "green", "yellow", "purple"]}
            showLabel={true}
            valueFormatter={(value) => `${(value / 1000).toFixed(0)}k NOK`}
          />
        </Card>

        <Card>
          <Title>User Engagement Metrics</Title>
          <Text className="mb-4">Platform usage and satisfaction indicators</Text>
          <div className="space-y-4 mt-6">
            {userEngagementData.map((item) => (
              <div key={item.metric}>
                <Flex>
                  <Text>{item.metric}</Text>
                  <Text className="font-medium">{item.value}%</Text>
                </Flex>
                <CategoryBar
                  values={[item.value]}
                  colors={[item.color]}
                  className="mt-2"
                />
                <Text className="text-xs text-slate-500 mt-1">
                  Target: {item.target}% • {item.value >= item.target ? '✅ On Track' : '⚠️ Needs Attention'}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Platform Efficiency */}
      <Card>
        <Title>Platform Automation Efficiency</Title>
        <Text className="mb-4">Automation vs manual processing and success rates</Text>
        <BarChart
          className="h-72"
          data={platformEfficiency}
          index="month"
          categories={["automated", "manual", "successRate"]}
          colors={["green", "orange", "blue"]}
          yAxisWidth={50}
          stack={false}
        />
      </Card>

      {/* Geographic Distribution & Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Title>Geographic Distribution</Title>
          <Text className="mb-4">User base by Norwegian regions</Text>
          <div className="space-y-3 mt-6">
            {geoData.map((region) => (
              <div key={region.region} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <Text className="font-medium">{region.region}</Text>
                  <Text className="text-sm text-slate-600">{region.users} users</Text>
                </div>
                <div className="text-right">
                  <Text className="font-medium">{region.revenue.toLocaleString()} NOK</Text>
                  <Text className="text-xs text-slate-600">
                    {Math.round(region.revenue / region.users)} NOK/user
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Title>Key Performance Indicators</Title>
          <Text className="mb-4">Critical business metrics summary</Text>
          <Grid numItems={1} numItemsLg={2} className="gap-4 mt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text className="text-sm">Conversion Rate</Text>
                <Text className="font-medium">{topMetrics.conversionRate}%</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-sm">Churn Rate</Text>
                <Text className="font-medium text-red-600">{topMetrics.churnRate}%</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-sm">ARPU</Text>
                <Text className="font-medium">{topMetrics.avgRevenuePerUser} NOK</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-sm">Customer Satisfaction</Text>
                <Text className="font-medium">{topMetrics.customerSatisfaction}/5.0</Text>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text className="text-sm">GDPR Compliance</Text>
                <Text className="font-medium text-green-600">{topMetrics.gdprCompliance}%</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-sm">Platform Uptime</Text>
                <Text className="font-medium">{topMetrics.platformUptime}%</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-sm">Active Users</Text>
                <Text className="font-medium">{Math.round((topMetrics.activeUsers / topMetrics.totalUsers) * 100)}%</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-sm">Case Success Rate</Text>
                <Text className="font-medium text-green-600">{topMetrics.caseSuccessRate}%</Text>
              </div>
            </div>
          </Grid>
        </Card>
      </div>

      {/* Financial Performance Summary */}
      <Card>
        <Title>Financial Performance Summary</Title>
        <Grid numItems={1} numItemsLg={4} className="gap-6 mt-6">
          <div className="text-center">
            <Metric className="text-green-600">{topMetrics.totalRevenue.toLocaleString()}</Metric>
            <Text className="text-sm text-slate-600">Monthly Revenue (NOK)</Text>
            <BadgeDelta deltaType="increase" size="xs" className="mt-2">
              +{topMetrics.revenueGrowth}%
            </BadgeDelta>
          </div>

          <div className="text-center">
            <Metric className="text-blue-600">{topMetrics.avgRevenuePerUser}</Metric>
            <Text className="text-sm text-slate-600">ARPU (NOK)</Text>
            <Text className="text-xs text-slate-500 mt-2">Per user per month</Text>
          </div>

          <div className="text-center">
            <Metric className="text-purple-600">{topMetrics.conversionRate}%</Metric>
            <Text className="text-sm text-slate-600">Conversion Rate</Text>
            <Text className="text-xs text-slate-500 mt-2">Free to paid</Text>
          </div>

          <div className="text-center">
            <Metric className="text-orange-600">{topMetrics.churnRate}%</Metric>
            <Text className="text-sm text-slate-600">Monthly Churn</Text>
            <Text className="text-xs text-slate-500 mt-2">Target: &lt;5%</Text>
          </div>
        </Grid>
      </Card>
    </div>
  )
}