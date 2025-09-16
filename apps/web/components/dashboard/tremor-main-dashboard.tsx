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
  Grid,
  AreaChart,
  BarChart,
  DonutChart,
  CategoryBar,
  Badge,
  Button,
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
import { useAuth } from '@/lib/auth-context';
import { FeatureLocked } from '@/components/subscription/premium-gate';

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
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <Title>Velkommen til DAMOCLES</Title>
        <Text>Your comprehensive debt protection and financial health dashboard</Text>
      </div>

      {/* Quick Stats Grid */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card>
          <Flex alignItems="start">
            <div>
              <Text>PDI Score</Text>
              <Metric>{mockUserStats.pdiScore}</Metric>
              <BadgeDelta deltaType="decrease" size="xs">
                -3 vs last month
              </BadgeDelta>
            </div>
          </Flex>
          <ProgressBar
            value={mockUserStats.pdiScore}
            color={getScoreColor(mockUserStats.pdiScore)}
            className="mt-3"
          />
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>SWORD Tokens</Text>
              <Metric>{mockUserStats.tokenBalance.toLocaleString()}</Metric>
              <BadgeDelta deltaType="increase" size="xs">
                +25 this month
              </BadgeDelta>
            </div>
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Total Saved</Text>
              <Metric>{mockUserStats.totalSaved.toLocaleString()} NOK</Metric>
              <BadgeDelta deltaType="increase" size="xs">
                +5,200 this month
              </BadgeDelta>
            </div>
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Active Protections</Text>
              <Metric>{mockUserStats.activeDebts}</Metric>
              <Text className="text-xs text-gray-500">
                {mockUserStats.totalViolations} violations detected
              </Text>
            </div>
          </Flex>
        </Card>
      </Grid>

      {/* Protection Status Alert */}
      {mockUserStats.pdiScore < 50 && (
        <Callout
          className="mt-4"
          title="Enhanced Protection Recommended"
          color="orange"
        >
          Your PDI score indicates potential financial stress. DAMOCLES protection is actively
          monitoring your debt portfolio for violations and preparing legal responses.
        </Callout>
      )}

      {/* Charts Section */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        {/* Debt Reduction Trend */}
        <Card>
          <Title>Debt Portfolio Overview</Title>
          <Text>Monthly debt levels and violation detection</Text>
          <AreaChart
            className="h-72 mt-4"
            data={mockDebtData}
            index="month"
            categories={["totalDebt"]}
            colors={["blue"]}
            yAxisWidth={80}
            valueFormatter={(value) => `${(value / 1000).toFixed(0)}k NOK`}
          />
        </Card>

        {/* Protection Activity */}
        <FeatureLocked
          userTier={userTier}
          feature="realtimeMonitoring"
          fallback={
            <Card>
              <Title>Protection Activity</Title>
              <Text>Upgrade to Premium for advanced monitoring and violation detection</Text>
              <div className="h-72 mt-6 flex items-center justify-center bg-slate-50 rounded-lg">
                <div className="text-center space-y-2">
                  <ShieldCheckIcon className="w-12 h-12 text-slate-400 mx-auto" />
                  <Text className="text-slate-500">Premium Feature</Text>
                  <Link href="/dashboard/subscription">
                    <Button size="sm">Upgrade Now</Button>
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
      </Grid>

      {/* Recent Activity and Quick Actions */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        {/* Recent Activity */}
        <Card>
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
        <Card>
          <Title>Quick Actions</Title>
          <Text className="mb-4">Manage your debt protection</Text>
          <div className="space-y-3">
            <Link href="/dashboard/pdi">
              <Button
                size="lg"
                variant="secondary"
                className="w-full justify-start"
                icon={ChartBarIcon}
              >
                Update PDI Assessment
              </Button>
            </Link>

            <Link href="/dashboard/debts/add">
              <Button
                size="lg"
                variant="secondary"
                className="w-full justify-start"
                icon={PlusIcon}
              >
                Add New Debt
              </Button>
            </Link>

            <Link href="/dashboard/debts">
              <Button
                size="lg"
                variant="secondary"
                className="w-full justify-start"
                icon={EyeIcon}
              >
                Review Debt Portfolio
              </Button>
            </Link>

            <Link href="/dashboard/recoveries">
              <Button
                size="lg"
                variant="secondary"
                className="w-full justify-start"
                icon={CurrencyDollarIcon}
              >
                Recovery Dashboard
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
      </Grid>

      {/* Metrics Overview */}
      <Card>
        <Title>Financial Health Metrics</Title>
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mt-6">
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
        </Grid>
      </Card>
    </div>
  );
}