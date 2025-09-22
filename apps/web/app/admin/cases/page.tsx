'use client'

import React, { useState } from 'react'
import {
  Card,
  Title,
  Text,
  Badge,
  Flex,
  Grid,
  Select,
  SelectItem,
  TextInput,
  ProgressBar,
  Metric,
} from '@tremor/react'
import {
  Shield,
  Search,
  Filter,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  DollarSign,
  Scale,
  Users,
  TrendingUp,
  Calendar,
  Phone,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DebtCase {
  id: string
  userId: string
  userName: string
  userEmail: string
  caseType: 'gdpr_request' | 'violation_complaint' | 'settlement_negotiation' | 'legal_action' | 'harassment_report'
  status: 'pending' | 'in_progress' | 'awaiting_response' | 'completed' | 'escalated' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  debtAmount: number
  creditorName: string
  violationType?: string
  createdAt: string
  lastUpdated: string
  assignedAgent?: string
  timeline: CaseEvent[]
  documents: number
  recoveredAmount?: number
  estimatedValue: number
  deadline?: string
}

interface CaseEvent {
  id: string
  type: 'created' | 'assigned' | 'document_generated' | 'response_received' | 'escalated' | 'resolved'
  description: string
  timestamp: string
  agent?: string
}

const mockCases: DebtCase[] = [
  {
    id: 'case_001',
    userId: 'usr_003',
    userName: 'Lars Berg',
    userEmail: 'lars.berg@example.no',
    caseType: 'violation_complaint',
    status: 'in_progress',
    priority: 'high',
    debtAmount: 85000,
    creditorName: 'Nordic Collection Agency',
    violationType: 'Excessive interest charges',
    createdAt: '2024-01-18T10:30:00Z',
    lastUpdated: '2024-01-20T14:22:00Z',
    assignedAgent: 'Agent Sarah Johnson',
    documents: 7,
    estimatedValue: 15000,
    deadline: '2024-01-25T23:59:59Z',
    timeline: [
      { id: 'evt_1', type: 'created', description: 'Case created from violation detection', timestamp: '2024-01-18T10:30:00Z' },
      { id: 'evt_2', type: 'assigned', description: 'Assigned to Agent Sarah Johnson', timestamp: '2024-01-18T11:15:00Z', agent: 'Sarah Johnson' },
      { id: 'evt_3', type: 'document_generated', description: 'Violation complaint letter generated', timestamp: '2024-01-18T15:30:00Z' },
      { id: 'evt_4', type: 'response_received', description: 'Creditor response received', timestamp: '2024-01-20T09:45:00Z' }
    ]
  },
  {
    id: 'case_002',
    userId: 'usr_004',
    userName: 'Anne Kristiansen',
    userEmail: 'anne.kristiansen@example.no',
    caseType: 'harassment_report',
    status: 'escalated',
    priority: 'critical',
    debtAmount: 120000,
    creditorName: 'Debt Recovery Solutions',
    violationType: 'Harassment and threatening behavior',
    createdAt: '2024-01-17T09:00:00Z',
    lastUpdated: '2024-01-20T16:30:00Z',
    assignedAgent: 'Legal Team',
    documents: 12,
    estimatedValue: 25000,
    deadline: '2024-01-22T17:00:00Z',
    timeline: [
      { id: 'evt_5', type: 'created', description: 'Harassment report filed by user', timestamp: '2024-01-17T09:00:00Z' },
      { id: 'evt_6', type: 'escalated', description: 'Escalated to legal team', timestamp: '2024-01-17T14:30:00Z' },
      { id: 'evt_7', type: 'document_generated', description: 'Legal demand letter prepared', timestamp: '2024-01-18T11:00:00Z' },
      { id: 'evt_8', type: 'response_received', description: 'Creditor provided written response', timestamp: '2024-01-20T16:30:00Z' }
    ]
  },
  {
    id: 'case_003',
    userId: 'usr_007',
    userName: 'Ola Nordahl',
    userEmail: 'ola.nordahl@example.no',
    caseType: 'settlement_negotiation',
    status: 'awaiting_response',
    priority: 'medium',
    debtAmount: 65000,
    creditorName: 'First Credit AB',
    createdAt: '2024-01-15T13:45:00Z',
    lastUpdated: '2024-01-19T10:15:00Z',
    assignedAgent: 'Agent Michael Chen',
    documents: 5,
    estimatedValue: 18000,
    recoveredAmount: 12000,
    timeline: [
      { id: 'evt_9', type: 'created', description: 'Settlement negotiation initiated', timestamp: '2024-01-15T13:45:00Z' },
      { id: 'evt_10', type: 'assigned', description: 'Assigned to Agent Michael Chen', timestamp: '2024-01-15T14:30:00Z', agent: 'Michael Chen' },
      { id: 'evt_11', type: 'document_generated', description: 'Settlement proposal sent', timestamp: '2024-01-16T11:20:00Z' }
    ]
  },
  {
    id: 'case_004',
    userId: 'usr_012',
    userName: 'Kari Solberg',
    userEmail: 'kari.solberg@example.no',
    caseType: 'gdpr_request',
    status: 'completed',
    priority: 'low',
    debtAmount: 45000,
    creditorName: 'Capital Recovery Ltd',
    createdAt: '2024-01-12T08:30:00Z',
    lastUpdated: '2024-01-18T17:45:00Z',
    assignedAgent: 'Automated System',
    documents: 3,
    estimatedValue: 5000,
    recoveredAmount: 8500,
    timeline: [
      { id: 'evt_12', type: 'created', description: 'GDPR data request submitted', timestamp: '2024-01-12T08:30:00Z' },
      { id: 'evt_13', type: 'document_generated', description: 'GDPR request letter sent', timestamp: '2024-01-12T09:15:00Z' },
      { id: 'evt_14', type: 'response_received', description: 'Full data package received', timestamp: '2024-01-18T14:20:00Z' },
      { id: 'evt_15', type: 'resolved', description: 'Case completed successfully', timestamp: '2024-01-18T17:45:00Z' }
    ]
  },
  {
    id: 'case_005',
    userId: 'usr_018',
    userName: 'Magnus Haugen',
    userEmail: 'magnus.haugen@example.no',
    caseType: 'legal_action',
    status: 'pending',
    priority: 'high',
    debtAmount: 195000,
    creditorName: 'Legal Enforcement Agency',
    violationType: 'Improper legal procedures',
    createdAt: '2024-01-20T11:30:00Z',
    lastUpdated: '2024-01-20T11:30:00Z',
    documents: 1,
    estimatedValue: 35000,
    deadline: '2024-01-27T12:00:00Z',
    timeline: [
      { id: 'evt_16', type: 'created', description: 'Legal action case opened', timestamp: '2024-01-20T11:30:00Z' }
    ]
  }
]

const caseStats = {
  totalCases: 1205,
  activeCases: 342,
  completedCases: 863,
  criticalCases: 23,
  pendingAssignment: 15,
  averageResolutionTime: 8.5, // days
  successRate: 87.3, // percentage
  totalRecovered: 2450000 // NOK
}

export default function CaseMonitoringPage() {
  const [cases, setCases] = useState<DebtCase[]>(mockCases)
  const [filteredCases, setFilteredCases] = useState<DebtCase[]>(mockCases)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedCase, setSelectedCase] = useState<DebtCase | null>(null)
  const [showModal, setShowModal] = useState(false)

  React.useEffect(() => {
    filterCases()
  }, [searchTerm, statusFilter, priorityFilter, typeFilter, cases])

  const filterCases = () => {
    let filtered = cases

    if (searchTerm) {
      filtered = filtered.filter(case_ =>
        case_.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.creditorName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.priority === priorityFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.caseType === typeFilter)
    }

    // Sort by priority and date
    filtered = filtered.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    })

    setFilteredCases(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge color="gray">Pending</Badge>
      case 'in_progress':
        return <Badge color="blue">In Progress</Badge>
      case 'awaiting_response':
        return <Badge color="yellow">Awaiting Response</Badge>
      case 'completed':
        return <Badge color="green">Completed</Badge>
      case 'escalated':
        return <Badge color="purple">Escalated</Badge>
      case 'failed':
        return <Badge color="red">Failed</Badge>
      default:
        return <Badge color="gray">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
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

  const getCaseTypeIcon = (type: string) => {
    switch (type) {
      case 'gdpr_request':
        return <Shield className="w-4 h-4" />
      case 'violation_complaint':
        return <AlertTriangle className="w-4 h-4" />
      case 'settlement_negotiation':
        return <DollarSign className="w-4 h-4" />
      case 'legal_action':
        return <Scale className="w-4 h-4" />
      case 'harassment_report':
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getCaseTypeName = (type: string) => {
    switch (type) {
      case 'gdpr_request':
        return 'GDPR Request'
      case 'violation_complaint':
        return 'Violation Complaint'
      case 'settlement_negotiation':
        return 'Settlement Negotiation'
      case 'legal_action':
        return 'Legal Action'
      case 'harassment_report':
        return 'Harassment Report'
      default:
        return 'Unknown'
    }
  }

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <Title className="text-2xl">Case Monitoring Dashboard</Title>
          <Text className="text-slate-600">
            Monitor and manage active debt protection cases
          </Text>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export Cases
          </Button>
          <Button size="sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Escalate Critical
          </Button>
        </div>
      </div>

      {/* Case Statistics */}
      <Grid numItems={1} numItemsLg={4} className="gap-6">
        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Total Cases</Text>
              <Metric>{caseStats.totalCases}</Metric>
              <Text className="text-xs text-slate-600">
                {caseStats.activeCases} active
              </Text>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </Flex>
        </Card>

        <Card className={caseStats.criticalCases > 20 ? 'ring-2 ring-red-500' : ''}>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Critical Cases</Text>
              <Metric className={caseStats.criticalCases > 20 ? 'text-red-600' : ''}>{caseStats.criticalCases}</Metric>
              <Text className="text-xs text-slate-600">
                {caseStats.pendingAssignment} unassigned
              </Text>
            </div>
            <AlertTriangle className={`w-8 h-8 ${caseStats.criticalCases > 20 ? 'text-red-600' : 'text-orange-600'}`} />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Success Rate</Text>
              <Metric>{caseStats.successRate}%</Metric>
              <ProgressBar
                value={caseStats.successRate}
                color="green"
                className="mt-3"
              />
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="w-full">
              <Text>Total Recovered</Text>
              <Metric>{(caseStats.totalRecovered / 1000000).toFixed(1)}M NOK</Metric>
              <Text className="text-xs text-slate-600">
                Avg: {caseStats.averageResolutionTime} days
              </Text>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>
      </Grid>

      {/* Filters */}
      <Card>
        <Title className="mb-4">Search & Filter Cases</Title>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Text className="mb-2">Search Cases</Text>
            <TextInput
              placeholder="Search by user, case ID, or creditor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>

          <div>
            <Text className="mb-2">Status Filter</Text>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="awaiting_response">Awaiting Response</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </Select>
          </div>

          <div>
            <Text className="mb-2">Priority Filter</Text>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </Select>
          </div>

          <div>
            <Text className="mb-2">Case Type</Text>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="gdpr_request">GDPR Request</SelectItem>
              <SelectItem value="violation_complaint">Violation Complaint</SelectItem>
              <SelectItem value="settlement_negotiation">Settlement Negotiation</SelectItem>
              <SelectItem value="legal_action">Legal Action</SelectItem>
              <SelectItem value="harassment_report">Harassment Report</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* Cases Table */}
      <Card>
        <Title className="mb-4">
          Active Cases ({filteredCases.length} of {cases.length})
        </Title>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr className="text-left">
                <th className="pb-3 font-medium text-slate-700">Case</th>
                <th className="pb-3 font-medium text-slate-700">User</th>
                <th className="pb-3 font-medium text-slate-700">Type</th>
                <th className="pb-3 font-medium text-slate-700">Priority</th>
                <th className="pb-3 font-medium text-slate-700">Status</th>
                <th className="pb-3 font-medium text-slate-700">Debt Amount</th>
                <th className="pb-3 font-medium text-slate-700">Estimated Value</th>
                <th className="pb-3 font-medium text-slate-700">Assigned</th>
                <th className="pb-3 font-medium text-slate-700">Deadline</th>
                <th className="pb-3 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((case_) => (
                <tr key={case_.id} className="hover:bg-slate-50">
                  <td className="py-4">
                    <div>
                      <div className="font-medium text-slate-900">{case_.id}</div>
                      <div className="text-xs text-slate-500">{case_.creditorName}</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div>
                      <div className="font-medium">{case_.userName}</div>
                      <div className="text-xs text-slate-600">{case_.userEmail}</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      {getCaseTypeIcon(case_.caseType)}
                      <span className="text-sm">{getCaseTypeName(case_.caseType)}</span>
                    </div>
                  </td>
                  <td className="py-4">{getPriorityBadge(case_.priority)}</td>
                  <td className="py-4">{getStatusBadge(case_.status)}</td>
                  <td className="py-4">
                    <div className="font-medium">{case_.debtAmount.toLocaleString()} NOK</div>
                  </td>
                  <td className="py-4">
                    <div className="font-medium text-green-600">{case_.estimatedValue.toLocaleString()} NOK</div>
                    {case_.recoveredAmount && (
                      <div className="text-xs text-green-700">
                        Recovered: {case_.recoveredAmount.toLocaleString()} NOK
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="text-sm">{case_.assignedAgent || 'Unassigned'}</div>
                  </td>
                  <td className="py-4">
                    {case_.deadline && (
                      <div className={`text-sm ${isOverdue(case_.deadline) ? 'text-red-600 font-medium' : ''}`}>
                        {new Date(case_.deadline).toLocaleDateString()}
                        {isOverdue(case_.deadline) && (
                          <div className="text-xs text-red-600">OVERDUE</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCase(case_)
                          setShowModal(true)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Case Detail Modal */}
      {showModal && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <Title>Case Details: {selectedCase.id}</Title>
                  <Text className="text-slate-600">{selectedCase.userName} vs {selectedCase.creditorName}</Text>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Title className="mb-3">Case Information</Title>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      {getCaseTypeIcon(selectedCase.caseType)}
                      <span>{getCaseTypeName(selectedCase.caseType)}</span>
                      {getPriorityBadge(selectedCase.priority)}
                    </div>
                    <div>
                      <Text className="text-sm text-slate-600">Status:</Text>
                      {getStatusBadge(selectedCase.status)}
                    </div>
                    <div>
                      <Text className="text-sm text-slate-600">Debt Amount:</Text>
                      <Text className="font-medium">{selectedCase.debtAmount.toLocaleString()} NOK</Text>
                    </div>
                    <div>
                      <Text className="text-sm text-slate-600">Estimated Recovery:</Text>
                      <Text className="font-medium text-green-600">{selectedCase.estimatedValue.toLocaleString()} NOK</Text>
                    </div>
                    {selectedCase.recoveredAmount && (
                      <div>
                        <Text className="text-sm text-slate-600">Actual Recovery:</Text>
                        <Text className="font-medium text-green-700">{selectedCase.recoveredAmount.toLocaleString()} NOK</Text>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Title className="mb-3">Assignment & Timeline</Title>
                  <div className="space-y-3">
                    <div>
                      <Text className="text-sm text-slate-600">Assigned Agent:</Text>
                      <Text className="font-medium">{selectedCase.assignedAgent || 'Unassigned'}</Text>
                    </div>
                    <div>
                      <Text className="text-sm text-slate-600">Created:</Text>
                      <Text>{new Date(selectedCase.createdAt).toLocaleString()}</Text>
                    </div>
                    <div>
                      <Text className="text-sm text-slate-600">Last Updated:</Text>
                      <Text>{new Date(selectedCase.lastUpdated).toLocaleString()}</Text>
                    </div>
                    {selectedCase.deadline && (
                      <div>
                        <Text className="text-sm text-slate-600">Deadline:</Text>
                        <Text className={isOverdue(selectedCase.deadline) ? 'text-red-600 font-medium' : ''}>
                          {new Date(selectedCase.deadline).toLocaleString()}
                          {isOverdue(selectedCase.deadline) && ' (OVERDUE)'}
                        </Text>
                      </div>
                    )}
                    <div>
                      <Text className="text-sm text-slate-600">Documents:</Text>
                      <Text>{selectedCase.documents} files</Text>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Title className="mb-3">Case Timeline</Title>
                <div className="space-y-3">
                  {selectedCase.timeline.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Text className="font-medium">{event.description}</Text>
                          <Text className="text-xs text-slate-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </Text>
                        </div>
                        {event.agent && (
                          <Text className="text-xs text-slate-600">by {event.agent}</Text>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <div className="flex space-x-3">
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact User
                  </Button>
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Creditor
                  </Button>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Case
                  </Button>
                  <Button>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Escalate
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