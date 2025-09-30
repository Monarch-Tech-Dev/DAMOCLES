'use client'

import React from 'react';
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
  Callout,
  List,
  ListItem,
} from '@tremor/react';
import {
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FeatureLocked } from '@/components/subscription/premium-gate';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import styles from '@/app/dashboard.module.css';

// Mock data for the dashboard
const mockUserStats = {
  totalDebts: 3,
  activeDebts: 2,
  totalViolations: 7,
  completedSettlements: 1,
  totalSaved: 24500,
  tokenBalance: 150,
  pdiScore: 42,
  shieldTier: 'bronze',
};

const mockRecentActivity = [
  { id: 1, type: 'violation', description: 'High interest rate detected - Collector ABC', date: '2024-01-15', severity: 'high' },
  { id: 2, type: 'gdpr', description: 'GDPR request sent to Credit Agency XYZ', date: '2024-01-14', severity: 'medium' },
  { id: 3, type: 'settlement', description: 'Settlement reached with Debt Collector Inc', date: '2024-01-12', severity: 'low' },
  { id: 4, type: 'pdi', description: 'PDI score updated: 42 (Fair)', date: '2024-01-10', severity: 'medium' },
];

const mockDebtData = [
  { month: 'Jan', totalDebt: 850000, violations: 2 },
  { month: 'Feb', totalDebt: 820000, violations: 3 },
  { month: 'Mar', totalDebt: 795000, violations: 1 },
  { month: 'Apr', totalDebt: 780000, violations: 2 },
  { month: 'May', totalDebt: 760000, violations: 0 },
  { month: 'Jun', totalDebt: 735000, violations: 1 },
];

const mockProtectionStats = [
  { category: 'GDPR Requests', value: 8, color: 'blue' },
  { category: 'Violations Found', value: 7, color: 'red' },
  { category: 'Settlements', value: 3, color: 'green' },
  { category: 'Active Monitoring', value: 2, color: 'yellow' },
];

export function TremorMainDashboard() {
  const { user } = useAuth()
  const userTier = user?.subscriptionTier || 'free'

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'God morgen'
    if (hour < 18) return 'God ettermiddag'
    return 'God kveld'
  }

  const getWelcomeMessage = () => {
    if (!user?.name) return 'Velkommen til DAMOCLES'
    
    // Extract first name (everything before first space)
    const firstName = user.name.split(' ')[0]
    const greeting = getTimeBasedGreeting()
    
    return `${greeting}, ${firstName}!`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'emerald';
    if (score >= 65) return 'green';
    if (score >= 50) return 'yellow';
    if (score >= 30) return 'orange';
    return 'red';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'violation': return ShieldCheckIcon;
      case 'gdpr': return ShieldCheckIcon;
      case 'settlement': return CurrencyDollarIcon;
      case 'pdi': return ChartBarIcon;
      default: return DocumentTextIcon;
    }
  };

  const getActivityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className={cn(styles.mainContent, "dashboard-content")}>
      {/* Welcome Header */}
      <div className="space-y-2 mb-8">
        <Title className={styles.title}>
          {getWelcomeMessage()}
        </Title>
        <Text className={styles.subtitle}>
          {user?.name 
            ? 'Here\'s your comprehensive debt protection and financial health overview'
            : 'Your comprehensive debt protection and financial health dashboard'
          }
        </Text>
      </div>

      {/* Quick Stats Grid */}
      <div className={`${styles.metricGrid} mb-8`}>
        <Card className={styles.metricCard}>
          <Flex alignItems="start">
            <div className="w-full">
              <Text className={styles.metricLabel}>PDI Score</Text>
              <Metric className={styles.metricValue}>{mockUserStats.pdiScore}</Metric>
              <BadgeDelta deltaType="decrease" size="xs" className={styles.metricChange}>
                -3 vs last month
              </BadgeDelta>
              <ProgressBar
                value={mockUserStats.pdiScore}
                color={getScoreColor(mockUserStats.pdiScore)}
                className="mt-3"
              />
            </div>
          </Flex>
        </Card>

        <Card className={styles.metricCard}>
          <Flex alignItems="start">
            <div className="w-full">
              <Text className={styles.metricLabel}>SWORD Tokens</Text>
              <Metric className={styles.metricValue}>{mockUserStats.tokenBalance.toLocaleString()}</Metric>
              <BadgeDelta deltaType="increase" size="xs" className={styles.metricChange}>
                +25 this month
              </BadgeDelta>
            </div>
          </Flex>
        </Card>

        <Card className={styles.metricCard}>
          <Flex alignItems="start">
            <div className="w-full">
              <Text className={styles.metricLabel}>Total Saved</Text>
              <Metric className={styles.metricValue}>{mockUserStats.totalSaved.toLocaleString()} NOK</Metric>
              <BadgeDelta deltaType="increase" size="xs" className={styles.metricChange}>
                +5,200 this month
              </BadgeDelta>
            </div>
          </Flex>
        </Card>

        <Card className={styles.metricCard}>
          <Flex alignItems="start">
            <div className="w-full">
              <Text className={styles.metricLabel}>Active Protections</Text>
              <Metric className={styles.metricValue}>{mockUserStats.activeDebts}</Metric>
              <Text className={`${styles.metricLabel} text-xs`}>
                {mockUserStats.totalViolations} violations detected
              </Text>
            </div>
          </Flex>
        </Card>
      </div>

      {/* Protection Status Alert */}
      {mockUserStats.pdiScore < 50 && (
        <Callout
          className="mb-8 pl-1"
          title="Enhanced Protection Recommended"
          color="orange"
        >
          Your PDI score indicates potential financial stress. DAMOCLES protection is actively
          monitoring your debt portfolio for violations and preparing legal responses.
        </Callout>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Debt Reduction Trend */}
        <Card className={styles.chartContainer}>
          <Title className={styles.title}>Debt Portfolio Overview</Title>
          <Text className={styles.subtitle}>Monthly debt levels and violation detection</Text>
          <AreaChart
            className="h-72 mt-4"
            data={mockDebtData}
            index="month"
            categories={["totalDebt"]}
            colors={["blue"]}
            // yAxisWidth={40}
            valueFormatter={(value) => `${(value / 1000).toFixed(0)}k NOK`}
          />
        </Card>

        {/* Protection Activity */}
        <FeatureLocked
          userTier={userTier}
          feature="realtimeMonitoring"
          fallback={
            <Card className={styles.metricCard}>
              <Title>Protection Activity</Title>
              <Text>Upgrade to Premium for advanced monitoring and violation detection</Text>
              <div className="h-72 mt-6 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <ShieldCheckIcon className="w-12 h-12 mx-auto" />
                  <Text>Premium Feature</Text>
                  <Link href="/dashboard/subscription">
                    <Button className="text-sm">Upgrade Now</Button>
                  </Link>
                </div>
              </div>
            </Card>
          }
        >
          <Card>
            <Title>Protection Activity</Title>
            <Text>DAMOCLES automated protection actions</Text>
            <DonutChart
              className="h-72 mt-6"
              data={mockProtectionStats}
              category="value"
              index="category"
              colors={["blue", "red", "green", "yellow"]}
              showLabel={true}
            />
          </Card>
        </FeatureLocked>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <Card className={styles.metricCard}>
          <Title>Recent Activity</Title>
          <Text className="mb-4">Latest protection actions and alerts</Text>
          <List>
            {mockRecentActivity.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <ListItem key={activity.id}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-${getActivityColor(activity.severity)}-100`}>
                      <IconComponent className={`h-4 w-4 text-${getActivityColor(activity.severity)}-600`} />
                    </div>
                    <div className="flex-1">
                      <Text className="font-medium">{activity.description}</Text>
                      <Text className="text-xs text-gray-500">{activity.date}</Text>
                    </div>
                  </div>
                </ListItem>
              );
            })}
          </List>
        </Card>

        {/* Quick Actions */}
        <Card className={styles.metricCard}>
          <Title>Quick Actions</Title>
          <Text className="mb-4">Manage your debt protection</Text>
          <div className="space-y-3">
            <Link href="/dashboard/pdi">
              <Button
                variant="secondary"
                className="w-full justify-start flex items-center space-x-2 p-4"
              >
                <ChartBarIcon className="h-5 w-5" />
                <span>Update PDI Assessment</span>
              </Button>
            </Link>

            <Link href="/dashboard/debts/add">
              <Button
                variant="secondary"
                className="w-full justify-start flex items-center space-x-2 p-4"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add New Debt</span>
              </Button>
            </Link>

            <Link href="/dashboard/debts">
              <Button
                variant="secondary"
                className="w-full justify-start flex items-center space-x-2 p-4"
              >
                <EyeIcon className="h-5 w-5" />
                <span>Review Debt Portfolio</span>
              </Button>
            </Link>

            <Link href="/dashboard/recoveries">
              <Button
                variant="secondary"
                className="w-full justify-start flex items-center space-x-2 p-4"
              >
                <CurrencyDollarIcon className="h-5 w-5" />
                <span>Recovery Dashboard</span>
              </Button>
            </Link>
          </div>

          {/* Protection Status */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Flex>
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                <Text className="font-medium text-blue-900">DAMOCLES Protection Active</Text>
              </div>
              <Badge color="blue">
                {mockUserStats.shieldTier.toUpperCase()} SHIELD
              </Badge>
            </Flex>
            <Text className="text-blue-700 text-sm mt-2">
              Monitoring {mockUserStats.activeDebts} active debts,
              {mockUserStats.totalViolations} violations detected this quarter.
            </Text>
          </div>
        </Card>
      </div>

      {/* Metrics Overview */}
      <Card className={styles.chartContainer}>
        <Title className={styles.title}>Financial Health Metrics</Title>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div>
            <Text>Debt Reduction Progress</Text>
            <Metric>15.2%</Metric>
            <CategoryBar
              values={[15.2]}
              colors={["green"]}
              className="mt-2"
            />
            <Text className="text-xs text-gray-500 mt-1">vs. 6 months ago</Text>
          </div>

          <div>
            <Text>Violation Detection Rate</Text>
            <Metric>23%</Metric>
            <CategoryBar
              values={[23]}
              colors={["red"]}
              className="mt-2"
            />
            <Text className="text-xs text-gray-500 mt-1">of debt portfolio</Text>
          </div>

          <div>
            <Text>Settlement Success Rate</Text>
            <Metric>85%</Metric>
            <CategoryBar
              values={[85]}
              colors={["green"]}
              className="mt-2"
            />
            <Text className="text-xs text-gray-500 mt-1">historical average</Text>
          </div>

          <div>
            <Text>Protection Coverage</Text>
            <Metric>100%</Metric>
            <CategoryBar
              values={[100]}
              colors={["blue"]}
              className="mt-2"
            />
            <Text className="text-xs text-gray-500 mt-1">of registered debts</Text>
          </div>
        </div>
      </Card>
    </div>
  );
}