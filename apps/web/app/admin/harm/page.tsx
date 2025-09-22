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
  Badge,
  Callout,
  List,
  ListItem,
  Grid,
  Select,
  SelectItem,
} from '@tremor/react'
import {
  AlertTriangle,
  Heart,
  Phone,
  Mail,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  DollarSign,
  FileText,
  Eye,
  MessageCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HarmIndicator {
  id: string
  userId: string
  userName: string
  userEmail: string
  indicatorType: 'financial_distress' | 'mental_health' | 'urgent_debt' | 'harassment' | 'legal_threat'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detectedAt: string
  status: 'new' | 'reviewing' | 'intervened' | 'resolved' | 'escalated'
  assignedTo?: string
  pdiScore: number
  totalDebt: number
  recentActivity: string[]
  interventionNotes?: string
}

const mockHarmIndicators: HarmIndicator[] = [
  {
    id: 'harm_001',
    userId: 'usr_003',
    userName: 'Lars Berg',
    userEmail: 'lars.berg@example.no',
    indicatorType: 'financial_distress',
    severity: 'critical',
    description: 'PDI score dropped 15 points in 2 weeks, multiple late payment notifications',
    detectedAt: '2024-01-20T09:30:00Z',
    status: 'new',
    pdiScore: 23,
    totalDebt: 250000,
    recentActivity: [
      'Added 3 new debts totaling 45,000 NOK',
      'PDI score decreased from 38 to 23',
      'Multiple failed payment attempts',
      'Increased GDPR requests (5 in last week)'
    ]
  },
  {
    id: 'harm_002',
    userId: 'usr_004',
    userName: 'Anne Kristiansen',
    userEmail: 'anne.kristiansen@example.no',
    indicatorType: 'harassment',
    severity: 'high',
    description: 'User reported aggressive debt collector behavior, multiple daily contact attempts',
    detectedAt: '2024-01-19T14:22:00Z',
    status: 'reviewing',
    assignedTo: 'support_agent_1',
    pdiScore: 38,
    totalDebt: 180000,
    recentActivity: [
      'Filed harassment complaint',
      'Requested immediate GDPR data deletion',
      'Contacted platform 8 times in 24 hours',
      'Mentioned legal action against collector'
    ]
  },
  {
    id: 'harm_003',
    userId: 'usr_007',
    userName: 'Ola Nordahl',
    userEmail: 'ola.nordahl@example.no',
    indicatorType: 'mental_health',
    severity: 'high',
    description: 'Support messages indicate severe stress, mentioned self-harm in communication',
    detectedAt: '2024-01-18T16:45:00Z',
    status: 'escalated',
    assignedTo: 'crisis_team',
    pdiScore: 31,
    totalDebt: 195000,
    recentActivity: [
      'Support ticket: "I can\'t take this anymore"',
      'Multiple panic-related keywords in messages',
      'Attempted to delete account',
      'Requested all data deletion urgently'
    ]
  },
  {
    id: 'harm_004',
    userId: 'usr_012',
    userName: 'Kari Solberg',
    userEmail: 'kari.solberg@example.no',
    indicatorType: 'urgent_debt',
    severity: 'medium',
    description: 'Debt increased 40% in one month, multiple collection agencies involved',
    detectedAt: '2024-01-17T11:15:00Z',
    status: 'intervened',
    assignedTo: 'debt_specialist',
    pdiScore: 45,
    totalDebt: 165000,
    recentActivity: [
      'Debt portfolio increased from 120k to 165k NOK',
      'New collection agencies added',
      'Started premium subscription',
      'Requesting expedited GDPR processes'
    ],
    interventionNotes: 'Connected with debt counselor, provided emergency contact information'
  },
  {
    id: 'harm_005',
    userId: 'usr_018',
    userName: 'Magnus Haugen',
    userEmail: 'magnus.haugen@example.no',
    indicatorType: 'legal_threat',
    severity: 'high',
    description: 'User received court summons, facing immediate asset seizure',
    detectedAt: '2024-01-16T08:30:00Z',
    status: 'reviewing',
    assignedTo: 'legal_team',
    pdiScore: 28,
    totalDebt: 280000,
    recentActivity: [
      'Uploaded court documents',
      'Requested emergency legal assistance',
      'Multiple collectors threatening asset seizure',
      'Seeking immediate settlement negotiations'
    ]
  }
]

const harmStats = {
  totalIndicators: 47,
  newIndicators: 12,
  criticalCases: 8,
  resolvedThisWeek: 15,
  averageResponseTime: 2.4, // hours
  escalationRate: 18, // percentage
  interventionSuccessRate: 73 // percentage
}

const harmTrends = [
  { month: 'Jan', financial: 12, mental: 8, harassment: 15, legal: 6, urgent: 10 },
  { month: 'Feb', financial: 15, mental: 12, harassment: 18, legal: 8, urgent: 14 },
  { month: 'Mar', financial: 18, mental: 10, harassment: 12, legal: 12, urgent: 16 },
  { month: 'Apr', financial: 14, mental: 15, harassment: 10, legal: 10, urgent: 12 },
  { month: 'May', financial: 20, mental: 18, harassment: 8, legal: 15, urgent: 18 },
  { month: 'Jun', financial: 22, mental: 14, harassment: 12, legal: 18, urgent: 20 },
]

export default function HarmTrackingPage() {
  const [indicators, setIndicators] = useState<HarmIndicator[]>(mockHarmIndicators)
  const [filteredIndicators, setFilteredIndicators] = useState<HarmIndicator[]>(mockHarmIndicators)
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedIndicator, setSelectedIndicator] = useState<HarmIndicator | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    filterIndicators()
  }, [severityFilter, statusFilter, typeFilter, indicators])

  const filterIndicators = () => {
    let filtered = indicators

    if (severityFilter !== 'all') {
      filtered = filtered.filter(indicator => indicator.severity === severityFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(indicator => indicator.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(indicator => indicator.indicatorType === typeFilter)
    }

    // Sort by severity and date
    filtered = filtered.sort((a, b) => {
      const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity]
      }
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    })

    setFilteredIndicators(filtered)
  }

  const handleStatusChange = (indicatorId: string, newStatus: string) => {
    setIndicators(indicators.map(indicator =>
      indicator.id === indicatorId
        ? { ...indicator, status: newStatus as any }
        : indicator
    ))
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge color="red">Critical</Badge>
      case 'high':
        return <Badge color="orange">High</Badge>
      case 'medium':
        return <Badge color="yellow">Medium</Badge>
      case 'low':
        return <Badge color="green">Low</Badge>
      default:
        return <Badge color="gray">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge color="red">New</Badge>
      case 'reviewing':
        return <Badge color="yellow">Reviewing</Badge>
      case 'intervened':
        return <Badge color="blue">Intervened</Badge>
      case 'resolved':
        return <Badge color="green">Resolved</Badge>
      case 'escalated':
        return <Badge color="purple">Escalated</Badge>
      default:
        return <Badge color="gray">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial_distress':
        return <DollarSign className="w-4 h-4" />
      case 'mental_health':
        return <Heart className="w-4 h-4" />
      case 'harassment':
        return <Shield className="w-4 h-4" />
      case 'legal_threat':
        return <FileText className="w-4 h-4" />
      case 'urgent_debt':
        return <Clock className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'financial_distress':
        return 'Financial Distress'
      case 'mental_health':
        return 'Mental Health'
      case 'harassment':
        return 'Harassment'
      case 'legal_threat':
        return 'Legal Threat'
      case 'urgent_debt':
        return 'Urgent Debt'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <Title className="text-2xl">Harm Tracking Dashboard</Title>
          <Text className="text-slate-600">
            Monitor and respond to user vulnerability indicators
          </Text>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Crisis Protocols
          </Button>
        </div>
      </div>

      {/* Critical Alert */}
      <Callout
        className="mt-4"
        title="🚨 Critical Harm Indicators Detected"
        color="red"
      >
        {harmStats.criticalCases} users are showing critical distress indicators requiring immediate attention.
        <div className="mt-2 flex space-x-3">
          <Button size="sm">
            <Phone className="w-4 h-4 mr-2" />
            Emergency Contacts
          </Button>
          <Button size="sm" variant="outline">
            <Heart className="w-4 h-4 mr-2" />
            Crisis Resources
          </Button>
        </div>
      </Callout>

      {/* Key Metrics */}
      <Grid numItems={1} numItemsLg={4} className="gap-6">
        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Total Indicators</Text>
              <Metric>{harmStats.totalIndicators}</Metric>
              <BadgeDelta deltaType="increase" size="xs">
                +{harmStats.newIndicators} new
              </BadgeDelta>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </Flex>
        </Card>

        <Card className="ring-2 ring-red-500">
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Critical Cases</Text>
              <Metric className="text-red-600">{harmStats.criticalCases}</Metric>
              <Text className="text-xs text-red-600">Immediate attention required</Text>
            </div>
            <Heart className="w-8 h-8 text-red-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Response Time</Text>
              <Metric>{harmStats.averageResponseTime}h</Metric>
              <Text className="text-xs text-slate-600">Average first response</Text>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Success Rate</Text>
              <Metric>{harmStats.interventionSuccessRate}%</Metric>
              <ProgressBar
                value={harmStats.interventionSuccessRate}
                color="green"
                className="mt-3"
              />
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>
      </Grid>

      {/* Harm Trends Chart */}
      <Card>
        <Title>Harm Indicator Trends</Title>
        <Text className="mb-4">Monthly breakdown by indicator type</Text>
        <AreaChart
          className="h-72"
          data={harmTrends}
          index="month"
          categories={["financial", "mental", "harassment", "legal", "urgent"]}
          colors={["red", "purple", "orange", "blue", "yellow"]}
          yAxisWidth={40}
        />
      </Card>

      {/* Filters */}
      <Card>
        <Title className="mb-4">Filter Harm Indicators</Title>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Text className="mb-2">Severity Level</Text>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </Select>
          </div>

          <div>
            <Text className="mb-2">Status</Text>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="intervened">Intervened</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </Select>
          </div>

          <div>
            <Text className="mb-2">Indicator Type</Text>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="financial_distress">Financial Distress</SelectItem>
              <SelectItem value="mental_health">Mental Health</SelectItem>
              <SelectItem value="harassment">Harassment</SelectItem>
              <SelectItem value="legal_threat">Legal Threat</SelectItem>
              <SelectItem value="urgent_debt">Urgent Debt</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* Harm Indicators List */}
      <Card>
        <Title className="mb-4">
          Active Harm Indicators ({filteredIndicators.length})
        </Title>
        <div className="space-y-4">
          {filteredIndicators.map((indicator) => (
            <div
              key={indicator.id}
              className={`p-4 border rounded-lg cursor-pointer hover:bg-slate-50 ${
                indicator.severity === 'critical' ? 'border-red-300 bg-red-50' :
                indicator.severity === 'high' ? 'border-orange-300 bg-orange-50' :
                'border-slate-200'
              }`}
              onClick={() => {
                setSelectedIndicator(indicator)
                setShowModal(true)
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(indicator.indicatorType)}
                      <Text className="font-medium">{getTypeName(indicator.indicatorType)}</Text>
                    </div>
                    {getSeverityBadge(indicator.severity)}
                    {getStatusBadge(indicator.status)}
                  </div>

                  <div className="mb-2">
                    <Text className="font-medium">{indicator.userName}</Text>
                    <Text className="text-sm text-slate-600">{indicator.userEmail}</Text>
                  </div>

                  <Text className="text-sm mb-3">{indicator.description}</Text>

                  <div className="flex items-center space-x-6 text-xs text-slate-500">
                    <span>PDI: {indicator.pdiScore}</span>
                    <span>Debt: {indicator.totalDebt.toLocaleString()} NOK</span>
                    <span>Detected: {new Date(indicator.detectedAt).toLocaleString()}</span>
                    {indicator.assignedTo && <span>Assigned: {indicator.assignedTo}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedIndicator(indicator)
                      setShowModal(true)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  {indicator.status === 'new' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusChange(indicator.id, 'reviewing')
                      }}
                    >
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Modal */}
      {showModal && selectedIndicator && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <Title>Harm Indicator Details</Title>
                  <Text className="text-slate-600">{selectedIndicator.userName}</Text>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Title className="mb-3">Indicator Information</Title>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(selectedIndicator.indicatorType)}
                      <span>{getTypeName(selectedIndicator.indicatorType)}</span>
                      {getSeverityBadge(selectedIndicator.severity)}
                    </div>
                    <div>
                      <Text className="text-sm text-slate-600">Description:</Text>
                      <Text>{selectedIndicator.description}</Text>
                    </div>
                    <div>
                      <Text className="text-sm text-slate-600">Detected:</Text>
                      <Text>{new Date(selectedIndicator.detectedAt).toLocaleString()}</Text>
                    </div>
                    <div>
                      <Text className="text-sm text-slate-600">Status:</Text>
                      {getStatusBadge(selectedIndicator.status)}
                    </div>
                    {selectedIndicator.assignedTo && (
                      <div>
                        <Text className="text-sm text-slate-600">Assigned to:</Text>
                        <Text>{selectedIndicator.assignedTo}</Text>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Title className="mb-3">User Context</Title>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">User:</span>
                      <span>{selectedIndicator.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Email:</span>
                      <span>{selectedIndicator.userEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">PDI Score:</span>
                      <span className={selectedIndicator.pdiScore < 30 ? 'text-red-600 font-medium' : ''}>
                        {selectedIndicator.pdiScore}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Debt:</span>
                      <span>{selectedIndicator.totalDebt.toLocaleString()} NOK</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Title className="mb-3">Recent Activity</Title>
                <List>
                  {selectedIndicator.recentActivity.map((activity, index) => (
                    <ListItem key={index}>
                      <Text className="text-sm">{activity}</Text>
                    </ListItem>
                  ))}
                </List>
              </div>

              {selectedIndicator.interventionNotes && (
                <div>
                  <Title className="mb-3">Intervention Notes</Title>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Text className="text-sm">{selectedIndicator.interventionNotes}</Text>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <div className="flex space-x-3">
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact User
                  </Button>
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency Call
                  </Button>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(selectedIndicator.id, 'escalated')}
                  >
                    Escalate
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(selectedIndicator.id, 'resolved')}
                  >
                    Mark Resolved
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}