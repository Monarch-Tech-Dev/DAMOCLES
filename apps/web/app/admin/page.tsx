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
  Badge,
  Callout,
  List,
  ListItem,
  Grid,
} from '@tremor/react'
import {
  Users,
  Shield,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Database,
  Server,
  Zap,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Mock admin metrics data
const adminMetrics = {
  totalUsers: 2847,
  activeUsers: 1023,
  newUsersToday: 47,
  totalCases: 1205,
  activeCases: 342,
  completedCases: 863,
  monthlyRevenue: 142500,
  totalRevenue: 827300,
  commissionEarned: 206825,
  gdprRequests: 1842,
  pendingGdprRequests: 23,
  violationsDetected: 567,
  usersInDistress: 18,
  systemHealth: 98.5,
  responseTime: 245,
  uptime: 99.97
}

const platformMetrics = [
  { month: 'Jan', users: 1800, revenue: 95000, cases: 890 },
  { month: 'Feb', users: 2100, revenue: 115000, cases: 980 },
  { month: 'Mar', users: 2350, revenue: 128000, cases: 1050 },
  { month: 'Apr', users: 2580, revenue: 135000, cases: 1120 },
  { month: 'May', users: 2720, revenue: 140000, cases: 1180 },
  { month: 'Jun', users: 2847, revenue: 142500, cases: 1205 },
]

const userDistributionData = [
  { category: 'Free Users', value: 1895, color: 'gray' },
  { category: 'Premium Users', value: 742, color: 'blue' },
  { category: 'Pro Users', value: 210, color: 'green' },
]

const recentAlerts = [
  { id: 1, type: 'high_distress', user: 'user_2847', message: 'User showing high financial distress indicators', time: '5 min ago', severity: 'high' },
  { id: 2, type: 'gdpr_backlog', message: 'GDPR request queue exceeding SLA', time: '12 min ago', severity: 'medium' },
  { id: 3, type: 'payment_failure', user: 'user_1205', message: 'Subscription payment failed', time: '18 min ago', severity: 'low' },
  { id: 4, type: 'violation_detected', user: 'user_2156', message: 'New debt collection violation detected', time: '25 min ago', severity: 'medium' },
]

const systemStatus = [
  { service: 'User Service', status: 'healthy', uptime: '99.98%', responseTime: '120ms' },
  { service: 'PDI Engine', status: 'healthy', uptime: '99.95%', responseTime: '340ms' },
  { service: 'GDPR Engine', status: 'healthy', uptime: '99.97%', responseTime: '280ms' },
  { service: 'Trust Engine', status: 'warning', uptime: '98.12%', responseTime: '580ms' },
  { service: 'Database', status: 'healthy', uptime: '99.99%', responseTime: '45ms' },
  { service: 'Redis Cache', status: 'healthy', uptime: '99.94%', responseTime: '12ms' },
]

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
      setLastRefresh(new Date())
    }, 1500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'green'
      case 'warning': return 'yellow'
      case 'error': return 'red'
      default: return 'gray'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'red'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <Title className="text-2xl">DAMOCLES Admin Dashboard</Title>
          <Text className="text-slate-600">Platform overview and critical metrics</Text>
        </div>
        <div className="flex items-center space-x-3">
          <Text className="text-sm text-slate-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Text>
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

      {/* Critical Alerts */}
      {adminMetrics.usersInDistress > 15 && (
        <Callout
          className="mt-4"
          title="⚠️ High Priority: Users in Distress Alert"
          color="red"
        >
          {adminMetrics.usersInDistress} users are showing high financial distress indicators.
          Immediate intervention may be required.
          <Link href="/admin/harm">
            <Button className="ml-4" size="sm">
              View Harm Dashboard
            </Button>
          </Link>
        </Callout>
      )}

      {/* Key Metrics Grid */}
      <Grid numItems={1} numItemsLg={4} className="gap-6">
        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Total Users</Text>
              <Metric>{adminMetrics.totalUsers.toLocaleString()}</Metric>
              <BadgeDelta deltaType="increase" size="xs">
                +{adminMetrics.newUsersToday} today
              </BadgeDelta>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Active Cases</Text>
              <Metric>{adminMetrics.activeCases}</Metric>
              <Text className="text-xs text-slate-600">
                {adminMetrics.completedCases} completed
              </Text>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Monthly Revenue</Text>
              <Metric>{adminMetrics.monthlyRevenue.toLocaleString()} NOK</Metric>
              <Text className="text-xs text-slate-600">
                Commission: {adminMetrics.commissionEarned.toLocaleString()} NOK
              </Text>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>

        <Card className={adminMetrics.usersInDistress > 15 ? 'ring-2 ring-red-500' : ''}>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Users in Distress</Text>
              <Metric className={adminMetrics.usersInDistress > 15 ? 'text-red-600' : ''}>{adminMetrics.usersInDistress}</Metric>
              <Badge color={adminMetrics.usersInDistress > 15 ? 'red' : 'green'}>
                {adminMetrics.usersInDistress > 15 ? 'Requires Attention' : 'Normal'}
              </Badge>
            </div>
            <AlertTriangle className={`w-8 h-8 ${adminMetrics.usersInDistress > 15 ? 'text-red-600' : 'text-yellow-600'}`} />
          </Flex>
        </Card>
      </Grid>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Growth */}
        <Card>
          <Title>Platform Growth Metrics</Title>
          <Text className="mb-4">User acquisition and revenue trends</Text>
          <AreaChart
            className="h-72"
            data={platformMetrics}
            index="month"
            categories={["users", "cases"]}
            colors={["blue", "green"]}
            yAxisWidth={60}
          />
        </Card>

        {/* User Distribution */}
        <Card>
          <Title>User Subscription Distribution</Title>
          <Text className="mb-4">Breakdown by subscription tier</Text>
          <DonutChart
            className="h-72"
            data={userDistributionData}
            category="value"
            index="category"
            colors={["gray", "blue", "green"]}
            showLabel={true}
          />
        </Card>
      </div>

      {/* Recent Alerts and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <Title>Recent System Alerts</Title>
          <Text className="mb-4">Critical platform notifications</Text>
          <List>
            {recentAlerts.map((alert) => (
              <ListItem key={alert.id}>
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge color={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      {alert.user && (
                        <Text className="text-xs text-slate-500">
                          {alert.user}
                        </Text>
                      )}
                    </div>
                    <Text className="font-medium">{alert.message}</Text>
                    <Text className="text-xs text-slate-500">{alert.time}</Text>
                  </div>
                </div>
              </ListItem>
            ))}
          </List>
        </Card>

        {/* System Status */}
        <Card>
          <Title>System Health Status</Title>
          <Text className="mb-4">Microservices operational status</Text>
          <div className="space-y-3">
            {systemStatus.map((service) => (
              <div key={service.service} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    service.status === 'healthy' ? 'bg-green-500' :
                    service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <Text className="font-medium">{service.service}</Text>
                    <Text className="text-xs text-slate-600">
                      Uptime: {service.uptime} • Response: {service.responseTime}
                    </Text>
                  </div>
                </div>
                <Badge color={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <Title>Quick Admin Actions</Title>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Link href="/admin/users">
            <Button variant="secondary" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
              <Users className="w-5 h-5" />
              <span className="text-sm">Manage Users</span>
            </Button>
          </Link>

          <Link href="/admin/harm">
            <Button variant="secondary" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Harm Tracking</span>
            </Button>
          </Link>

          <Link href="/admin/cases">
            <Button variant="secondary" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
              <FileText className="w-5 h-5" />
              <span className="text-sm">Monitor Cases</span>
            </Button>
          </Link>

          <Link href="/admin/analytics">
            <Button variant="secondary" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">Analytics</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Performance Metrics */}
      <Grid numItems={1} numItemsLg={3} className="gap-6">
        <Card>
          <Flex alignItems="start">
            <div>
              <Text>System Health</Text>
              <Metric>{adminMetrics.systemHealth}%</Metric>
              <ProgressBar
                value={adminMetrics.systemHealth}
                color="green"
                className="mt-3"
              />
            </div>
            <Server className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Avg Response Time</Text>
              <Metric>{adminMetrics.responseTime}ms</Metric>
              <Text className="text-xs text-slate-600">Target: &lt;300ms</Text>
            </div>
            <Zap className="w-8 h-8 text-yellow-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Platform Uptime</Text>
              <Metric>{adminMetrics.uptime}%</Metric>
              <Text className="text-xs text-slate-600">99.9% SLA target</Text>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>
      </Grid>
    </div>
  )
}