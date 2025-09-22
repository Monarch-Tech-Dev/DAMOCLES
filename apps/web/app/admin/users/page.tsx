'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Title,
  Text,
  Badge,
  Flex,
  Grid,
  TextInput,
  Select,
  SelectItem,
} from '@tremor/react'
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  email: string
  name: string
  phone?: string
  subscriptionTier: 'free' | 'premium' | 'pro'
  status: 'active' | 'suspended' | 'banned' | 'pending'
  pdiScore: number
  totalDebt: number
  activeCases: number
  joinDate: string
  lastActive: string
  riskLevel: 'low' | 'medium' | 'high'
  gdprRequests: number
  recoveredAmount: number
  distressIndicators: number
}

// Mock user data
const mockUsers: User[] = [
  {
    id: 'usr_001',
    email: 'erik.hansen@example.no',
    name: 'Erik Hansen',
    phone: '+47 123 45 678',
    subscriptionTier: 'premium',
    status: 'active',
    pdiScore: 42,
    totalDebt: 125000,
    activeCases: 3,
    joinDate: '2024-01-15',
    lastActive: '2024-01-20',
    riskLevel: 'medium',
    gdprRequests: 5,
    recoveredAmount: 15000,
    distressIndicators: 2
  },
  {
    id: 'usr_002',
    email: 'maria.olsen@example.no',
    name: 'Maria Olsen',
    phone: '+47 987 65 432',
    subscriptionTier: 'free',
    status: 'active',
    pdiScore: 67,
    totalDebt: 85000,
    activeCases: 1,
    joinDate: '2024-01-10',
    lastActive: '2024-01-19',
    riskLevel: 'low',
    gdprRequests: 2,
    recoveredAmount: 8500,
    distressIndicators: 0
  },
  {
    id: 'usr_003',
    email: 'lars.berg@example.no',
    name: 'Lars Berg',
    phone: '+47 555 44 333',
    subscriptionTier: 'pro',
    status: 'active',
    pdiScore: 23,
    totalDebt: 250000,
    activeCases: 7,
    joinDate: '2023-12-05',
    lastActive: '2024-01-20',
    riskLevel: 'high',
    gdprRequests: 12,
    recoveredAmount: 45000,
    distressIndicators: 5
  },
  {
    id: 'usr_004',
    email: 'anne.kristiansen@example.no',
    name: 'Anne Kristiansen',
    subscriptionTier: 'premium',
    status: 'suspended',
    pdiScore: 38,
    totalDebt: 180000,
    activeCases: 4,
    joinDate: '2024-01-08',
    lastActive: '2024-01-18',
    riskLevel: 'high',
    gdprRequests: 8,
    recoveredAmount: 22000,
    distressIndicators: 4
  },
  {
    id: 'usr_005',
    email: 'kristian.torp@example.no',
    name: 'Kristian Torp',
    phone: '+47 777 88 999',
    subscriptionTier: 'free',
    status: 'pending',
    pdiScore: 55,
    totalDebt: 95000,
    activeCases: 2,
    joinDate: '2024-01-18',
    lastActive: '2024-01-20',
    riskLevel: 'medium',
    gdprRequests: 1,
    recoveredAmount: 0,
    distressIndicators: 1
  }
]

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    filterUsers()
  }, [searchTerm, statusFilter, tierFilter, riskFilter, users])

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    if (tierFilter !== 'all') {
      filtered = filtered.filter(user => user.subscriptionTier === tierFilter)
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(user => user.riskLevel === riskFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'ban' | 'edit') => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setUsers(users.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'suspend':
              return { ...user, status: 'suspended' as const }
            case 'activate':
              return { ...user, status: 'active' as const }
            case 'ban':
              return { ...user, status: 'banned' as const }
            default:
              return user
          }
        }
        return user
      }))
      setLoading(false)
    }, 1000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge color="green">Active</Badge>
      case 'suspended':
        return <Badge color="yellow">Suspended</Badge>
      case 'banned':
        return <Badge color="red">Banned</Badge>
      case 'pending':
        return <Badge color="gray">Pending</Badge>
      default:
        return <Badge color="gray">Unknown</Badge>
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Badge color="gray">Free</Badge>
      case 'premium':
        return <Badge color="blue">Premium</Badge>
      case 'pro':
        return <Badge color="green">Pro</Badge>
      default:
        return <Badge color="gray">Unknown</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge color="green">Low Risk</Badge>
      case 'medium':
        return <Badge color="yellow">Medium Risk</Badge>
      case 'high':
        return <Badge color="red">High Risk</Badge>
      default:
        return <Badge color="gray">Unknown</Badge>
    }
  }

  const exportUsers = () => {
    // Create CSV content
    const headers = ['ID', 'Email', 'Name', 'Subscription', 'Status', 'PDI Score', 'Total Debt', 'Risk Level']
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        user.email,
        user.name,
        user.subscriptionTier,
        user.status,
        user.pdiScore,
        user.totalDebt,
        user.riskLevel
      ].join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `damocles-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <Title className="text-2xl">User Management</Title>
          <Text className="text-slate-600">
            Manage and monitor {users.length.toLocaleString()} platform users
          </Text>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={exportUsers}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => filterUsers()}
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <Grid numItems={1} numItemsLg={4} className="gap-6">
        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Total Users</Text>
              <Text className="text-2xl font-bold">{users.length}</Text>
              <Text className="text-xs text-slate-600">
                {users.filter(u => u.status === 'active').length} active
              </Text>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>High Risk Users</Text>
              <Text className="text-2xl font-bold text-red-600">
                {users.filter(u => u.riskLevel === 'high').length}
              </Text>
              <Text className="text-xs text-slate-600">Require monitoring</Text>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Premium Users</Text>
              <Text className="text-2xl font-bold text-green-600">
                {users.filter(u => u.subscriptionTier !== 'free').length}
              </Text>
              <Text className="text-xs text-slate-600">
                {Math.round((users.filter(u => u.subscriptionTier !== 'free').length / users.length) * 100)}% conversion
              </Text>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Avg PDI Score</Text>
              <Text className="text-2xl font-bold">
                {Math.round(users.reduce((sum, u) => sum + u.pdiScore, 0) / users.length)}
              </Text>
              <Text className="text-xs text-slate-600">Platform average</Text>
            </div>
            <Shield className="w-8 h-8 text-yellow-600" />
          </Flex>
        </Card>
      </Grid>

      {/* Filters */}
      <Card>
        <Title className="mb-4">Search & Filter Users</Title>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Text className="mb-2">Search Users</Text>
            <TextInput
              placeholder="Search by email, name, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>

          <div>
            <Text className="mb-2">Status Filter</Text>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </Select>
          </div>

          <div>
            <Text className="mb-2">Subscription Tier</Text>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </Select>
          </div>

          <div>
            <Text className="mb-2">Risk Level</Text>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <Title className="mb-4">
          Users ({filteredUsers.length} of {users.length})
        </Title>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr className="text-left">
                <th className="pb-3 font-medium text-slate-700">User</th>
                <th className="pb-3 font-medium text-slate-700">Subscription</th>
                <th className="pb-3 font-medium text-slate-700">Status</th>
                <th className="pb-3 font-medium text-slate-700">PDI Score</th>
                <th className="pb-3 font-medium text-slate-700">Risk Level</th>
                <th className="pb-3 font-medium text-slate-700">Debt</th>
                <th className="pb-3 font-medium text-slate-700">Cases</th>
                <th className="pb-3 font-medium text-slate-700">Last Active</th>
                <th className="pb-3 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="py-4">
                    <div>
                      <div className="font-medium text-slate-900">{user.name}</div>
                      <div className="text-slate-600">{user.email}</div>
                      <div className="text-xs text-slate-500">{user.id}</div>
                    </div>
                  </td>
                  <td className="py-4">{getTierBadge(user.subscriptionTier)}</td>
                  <td className="py-4">{getStatusBadge(user.status)}</td>
                  <td className="py-4">
                    <div className="font-medium">{user.pdiScore}</div>
                  </td>
                  <td className="py-4">{getRiskBadge(user.riskLevel)}</td>
                  <td className="py-4">
                    <div className="font-medium">{user.totalDebt.toLocaleString()} NOK</div>
                  </td>
                  <td className="py-4">
                    <div className="font-medium">{user.activeCases}</div>
                    {user.distressIndicators > 0 && (
                      <div className="text-xs text-red-600">
                        {user.distressIndicators} distress signals
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="text-sm">{new Date(user.lastActive).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUserModal(true)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {user.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          disabled={loading}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserAction(user.id, 'activate')}
                          disabled={loading}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <Title>{selectedUser.name}</Title>
                  <Text className="text-slate-600">{selectedUser.email}</Text>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowUserModal(false)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <Grid numItems={1} numItemsLg={3} className="gap-4">
                <Card>
                  <Text>PDI Score</Text>
                  <Text className="text-2xl font-bold">{selectedUser.pdiScore}</Text>
                  {getRiskBadge(selectedUser.riskLevel)}
                </Card>
                <Card>
                  <Text>Total Debt</Text>
                  <Text className="text-2xl font-bold">{selectedUser.totalDebt.toLocaleString()} NOK</Text>
                  <Text className="text-xs text-slate-600">{selectedUser.activeCases} active cases</Text>
                </Card>
                <Card>
                  <Text>Recovered Amount</Text>
                  <Text className="text-2xl font-bold text-green-600">{selectedUser.recoveredAmount.toLocaleString()} NOK</Text>
                  <Text className="text-xs text-slate-600">{selectedUser.gdprRequests} GDPR requests</Text>
                </Card>
              </Grid>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Title className="mb-3">Account Information</Title>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">User ID:</span>
                      <span>{selectedUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phone:</span>
                      <span>{selectedUser.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subscription:</span>
                      <span>{getTierBadge(selectedUser.subscriptionTier)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span>{getStatusBadge(selectedUser.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Join Date:</span>
                      <span>{new Date(selectedUser.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Last Active:</span>
                      <span>{new Date(selectedUser.lastActive).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Title className="mb-3">Risk Assessment</Title>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Distress Indicators:</span>
                      <Badge color={selectedUser.distressIndicators > 3 ? 'red' : selectedUser.distressIndicators > 1 ? 'yellow' : 'green'}>
                        {selectedUser.distressIndicators}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Risk Level:</span>
                      {getRiskBadge(selectedUser.riskLevel)}
                    </div>
                    {selectedUser.distressIndicators > 2 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <Text className="text-sm text-red-800">
                          ⚠️ This user shows high distress indicators and may require intervention.
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowUserModal(false)}>
                  Close
                </Button>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}