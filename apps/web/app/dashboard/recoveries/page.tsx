'use client'

import React, { useState } from 'react'
import {
  Card,
  Title,
  Text,
  Metric,
  Flex,
  Grid,
  AreaChart,
  BarChart,
  DonutChart,
  Badge,
  ProgressBar,
  Callout,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '@tremor/react'
import {
  TrendingUp,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { PremiumGate, FeatureLocked } from '@/components/subscription/premium-gate'

// Mock recovery data
const mockRecoveries = [
  {
    id: 1,
    creditor: 'Bank ABC',
    type: 'Illegal fees',
    amount: 2450,
    commission: 612.50,
    status: 'completed',
    date: '2024-01-15',
    caseNumber: 'REC-2024-001'
  },
  {
    id: 2,
    creditor: 'Credit Corp',
    type: 'GDPR violation penalty',
    amount: 1200,
    commission: 300,
    status: 'in_progress',
    date: '2024-01-10',
    caseNumber: 'REC-2024-002'
  },
  {
    id: 3,
    creditor: 'Loan Company XYZ',
    type: 'Excessive interest',
    amount: 850,
    commission: 212.50,
    status: 'pending',
    date: '2024-01-05',
    caseNumber: 'REC-2024-003'
  }
]

const monthlyData = [
  { month: 'Oct', recoveries: 1800, commission: 450 },
  { month: 'Nov', recoveries: 2100, commission: 525 },
  { month: 'Dec', recoveries: 2800, commission: 700 },
  { month: 'Jan', recoveries: 3650, commission: 912.50 },
]

const recoveryTypes = [
  { type: 'Illegal fees', amount: 2450, color: 'blue' },
  { type: 'GDPR penalties', amount: 1200, color: 'green' },
  { type: 'Excessive interest', amount: 850, color: 'yellow' },
]

export default function RecoveriesPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('3m')

  const userTier = user?.subscriptionTier || 'free'

  const totalRecovered = mockRecoveries.reduce((sum, r) => sum + r.amount, 0)
  const totalCommission = mockRecoveries.reduce((sum, r) => sum + r.commission, 0)
  const completedRecoveries = mockRecoveries.filter(r => r.status === 'completed').length
  const activeRecoveries = mockRecoveries.filter(r => r.status === 'in_progress').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge color="green">Completed</Badge>
      case 'in_progress':
        return <Badge color="yellow">In Progress</Badge>
      case 'pending':
        return <Badge color="gray">Pending</Badge>
      default:
        return <Badge color="gray">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-gray-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Title>Recovery Dashboard</Title>
        <Text>Track your money recovery progress and commission earnings</Text>
      </div>

      {/* Key Metrics */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Total Recovered</Text>
              <Metric>{totalRecovered.toLocaleString()} NOK</Metric>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Commission Earned</Text>
              <Metric>{totalCommission.toLocaleString()} NOK</Metric>
              <Text className="text-xs text-gray-500">25% of recoveries</Text>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Completed Cases</Text>
              <Metric>{completedRecoveries}</Metric>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Active Cases</Text>
              <Metric>{activeRecoveries}</Metric>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </Flex>
        </Card>
      </Grid>

      {/* Success Rate Info */}
      <PremiumGate
        userTier={userTier}
        feature="recoveryCommission"
        title="Recovery Commission Service"
        description="Unlock automated recovery processes and earn 25% commission on successful recoveries."
      >
        <Callout
          title="95% Success Rate"
          icon={TrendingUp}
          color="green"
        >
          Our automated legal processes have a 95% success rate in recovering illegal fees and penalties.
          Average recovery time: 6-8 weeks.
        </Callout>
      </PremiumGate>

      {/* Charts */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        {/* Recovery Trend */}
        <Card>
          <Title>Recovery Trend</Title>
          <Text>Monthly recovery amounts and commission earnings</Text>
          <AreaChart
            className="h-72 mt-4"
            data={monthlyData}
            index="month"
            categories={["recoveries", "commission"]}
            colors={["blue", "green"]}
            yAxisWidth={80}
            valueFormatter={(value) => `${value.toLocaleString()} NOK`}
          />
        </Card>

        {/* Recovery Types */}
        <Card>
          <Title>Recovery Types</Title>
          <Text>Breakdown by violation category</Text>
          <DonutChart
            className="h-72 mt-6"
            data={recoveryTypes}
            category="amount"
            index="type"
            colors={["blue", "green", "yellow"]}
            valueFormatter={(value) => `${value.toLocaleString()} NOK`}
            showLabel={true}
          />
        </Card>
      </Grid>

      {/* Recent Recoveries */}
      <Card>
        <Title>Recent Recoveries</Title>
        <Table className="mt-6">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Case</TableHeaderCell>
              <TableHeaderCell>Creditor</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Commission</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockRecoveries.map((recovery) => (
              <TableRow key={recovery.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(recovery.status)}
                    <Text>{recovery.caseNumber}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Text>{recovery.creditor}</Text>
                </TableCell>
                <TableCell>
                  <Text>{recovery.type}</Text>
                </TableCell>
                <TableCell>
                  <Text className="font-medium">{recovery.amount.toLocaleString()} NOK</Text>
                </TableCell>
                <TableCell>
                  <Text className="font-medium text-green-600">
                    {recovery.commission.toLocaleString()} NOK
                  </Text>
                </TableCell>
                <TableCell>
                  {getStatusBadge(recovery.status)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="xs" variant="outline" icon={Eye}>
                      View
                    </Button>
                    <Button size="xs" variant="outline" icon={Download}>
                      Download
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Monthly Summary */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>This Month's Progress</Title>
          <div className="space-y-4 mt-4">
            <div>
              <Flex>
                <Text>Recovery Target</Text>
                <Text>5,000 NOK</Text>
              </Flex>
              <ProgressBar
                value={(totalRecovered / 5000) * 100}
                color="green"
                className="mt-2"
              />
              <Text className="text-xs text-gray-500 mt-1">
                {totalRecovered.toLocaleString()} / 5,000 NOK ({Math.round((totalRecovered / 5000) * 100)}%)
              </Text>
            </div>
            <div>
              <Flex>
                <Text>Commission Target</Text>
                <Text>1,250 NOK</Text>
              </Flex>
              <ProgressBar
                value={(totalCommission / 1250) * 100}
                color="blue"
                className="mt-2"
              />
              <Text className="text-xs text-gray-500 mt-1">
                {totalCommission.toLocaleString()} / 1,250 NOK ({Math.round((totalCommission / 1250) * 100)}%)
              </Text>
            </div>
          </div>
        </Card>

        <Card>
          <Title>Next Steps</Title>
          <div className="space-y-3 mt-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <Text className="font-medium">Review case REC-2024-002</Text>
                <Text className="text-xs text-gray-600">Additional documentation needed</Text>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <Text className="font-medium">Follow up on settlement</Text>
                <Text className="text-xs text-gray-600">Response expected by Jan 25</Text>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <Text className="font-medium">Payment received</Text>
                <Text className="text-xs text-gray-600">2,450 NOK deposited</Text>
              </div>
            </div>
          </div>
        </Card>
      </Grid>
    </div>
  )
}