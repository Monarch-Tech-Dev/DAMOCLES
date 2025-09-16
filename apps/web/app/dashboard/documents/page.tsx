'use client'

import React, { useState } from 'react'
import {
  Card,
  Title,
  Text,
  Button,
  Badge,
  Flex,
  Grid,
  Callout,
  Select,
  SelectItem,
  TextInput,
} from '@tremor/react'
import {
  FileText,
  Download,
  Shield,
  Scale,
  Clock,
  CheckCircle,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { PremiumGate, FeatureLocked } from '@/components/subscription/premium-gate'

interface DocumentTemplate {
  id: string
  name: string
  description: string
  price: number
  category: string
  estimatedTime: string
  complexity: 'simple' | 'medium' | 'complex'
  features: string[]
}

const documentTemplates: DocumentTemplate[] = [
  {
    id: 'gdpr-request',
    name: 'GDPR Data Request',
    description: 'Automated GDPR data portability and deletion requests',
    price: 0, // Free for Premium users
    category: 'GDPR',
    estimatedTime: '5 minutes',
    complexity: 'simple',
    features: ['Automated creditor lookup', 'Legal compliance check', 'Multi-language support']
  },
  {
    id: 'violation-complaint',
    name: 'Violation Complaint Letter',
    description: 'Formal complaint for debt collection violations',
    price: 25,
    category: 'Legal',
    estimatedTime: '15 minutes',
    complexity: 'medium',
    features: ['Evidence attachment', 'Legal precedent references', 'Court-ready format']
  },
  {
    id: 'settlement-proposal',
    name: 'Settlement Proposal',
    description: 'Professional settlement negotiation document',
    price: 50,
    category: 'Settlement',
    estimatedTime: '30 minutes',
    complexity: 'medium',
    features: ['Payment plan options', 'Legal protection clauses', 'Notarization ready']
  },
  {
    id: 'court-filing',
    name: 'Court Filing Package',
    description: 'Complete court filing documentation with evidence',
    price: 200,
    category: 'Legal',
    estimatedTime: '2 hours',
    complexity: 'complex',
    features: ['Full evidence compilation', 'Legal argumentation', 'Court fee calculation', 'Filing assistance']
  },
  {
    id: 'evidence-package',
    name: 'Certified Evidence Package',
    description: 'Legally certified evidence compilation for court proceedings',
    price: 50,
    category: 'Evidence',
    estimatedTime: '1 hour',
    complexity: 'medium',
    features: ['Digital signatures', 'Timestamp certification', 'Chain of custody', 'Court admissible']
  }
]

const recentDocuments = [
  {
    id: 1,
    name: 'GDPR Request - Bank ABC',
    type: 'GDPR',
    status: 'completed',
    date: '2024-01-15',
    price: 0
  },
  {
    id: 2,
    name: 'Violation Complaint - Credit Corp',
    type: 'Legal',
    status: 'in_progress',
    date: '2024-01-14',
    price: 25
  },
  {
    id: 3,
    name: 'Settlement Proposal - Loan Co',
    type: 'Settlement',
    status: 'completed',
    date: '2024-01-10',
    price: 50
  }
]

export default function DocumentsPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const userTier = user?.subscriptionTier || 'free'

  const categories = ['All', 'GDPR', 'Legal', 'Settlement', 'Evidence']

  const filteredTemplates = selectedCategory === 'All'
    ? documentTemplates
    : documentTemplates.filter(doc => doc.category === selectedCategory)

  const handleGenerateDocument = async (templateId: string) => {
    setGenerating(true)
    setSelectedDocument(templateId)

    // Simulate document generation
    setTimeout(() => {
      setGenerating(false)
      setSelectedDocument(null)
    }, 3000)
  }

  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return <Badge color="green">Simple</Badge>
      case 'medium':
        return <Badge color="yellow">Medium</Badge>
      case 'complex':
        return <Badge color="red">Complex</Badge>
      default:
        return <Badge color="gray">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge color="green">Completed</Badge>
      case 'in_progress':
        return <Badge color="yellow">In Progress</Badge>
      default:
        return <Badge color="gray">Unknown</Badge>
    }
  }

  function DocumentCard({ template, generating, selectedDocument, handleGenerateDocument, getComplexityBadge }: {
    template: DocumentTemplate
    generating: boolean
    selectedDocument: string | null
    handleGenerateDocument: (id: string) => void
    getComplexityBadge: (complexity: string) => React.ReactNode
  }) {
    return (
      <Card className="relative">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <Title className="text-lg">{template.name}</Title>
                {getComplexityBadge(template.complexity)}
              </div>
              <Text className="text-sm text-slate-600 mb-3">{template.description}</Text>
            </div>
            <div className="text-right">
              <Text className="text-2xl font-bold">
                {template.price === 0 ? 'Free' : `€${template.price}`}
              </Text>
              {template.price === 0 && (
                <Text className="text-xs text-green-600">Premium users</Text>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <Text>{template.estimatedTime}</Text>
            </div>
            <div className="flex items-center space-x-1">
              <Badge color="blue">{template.category}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Text className="font-medium text-sm">Features:</Text>
            <ul className="space-y-1">
              {template.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <Text className="text-sm">{feature}</Text>
                </li>
              ))}
            </ul>
          </div>

          <Button
            className="w-full"
            onClick={() => handleGenerateDocument(template.id)}
            loading={generating && selectedDocument === template.id}
            disabled={generating}
          >
            {generating && selectedDocument === template.id
              ? 'Generating...'
              : `Generate Document ${template.price > 0 ? `(€${template.price})` : ''}`
            }
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Title>Document Generation</Title>
        <Text>Generate professional legal documents for your debt protection cases</Text>
      </div>

      {/* Revenue Info */}
      <Callout
        title="Document Service Revenue"
        icon={DollarSign}
        color="blue"
      >
        Professional document generation services ranging from €25-€200 per document.
        Free GDPR requests for Premium subscribers.
      </Callout>

      {/* Filter */}
      <Card>
        <Flex className="space-x-4">
          <div className="flex-1">
            <Text className="mb-2">Filter by Category</Text>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </Select>
          </div>
        </Flex>
      </Card>

      {/* Document Templates */}
      <div className="space-y-4">
        <Title className="text-lg">Available Document Templates</Title>
        <Grid numItems={1} numItemsLg={2} className="gap-6">
          {filteredTemplates.map((template) => {
            // GDPR requests are free for Premium users, but require Premium for automation
            const requiresPremium = template.id === 'gdpr-request' && template.price === 0
            // Advanced documents require Pro tier
            const requiresPro = template.complexity === 'complex' || template.price > 50

            if (requiresPro) {
              return (
                <PremiumGate
                  key={template.id}
                  userTier={userTier}
                  feature="legalAutomation"
                  title="Pro Feature Required"
                  description={`${template.name} requires Pro subscription for full legal automation capabilities.`}
                  requiredTier="pro"
                >
                  <DocumentCard template={template} generating={generating} selectedDocument={selectedDocument} handleGenerateDocument={handleGenerateDocument} getComplexityBadge={getComplexityBadge} />
                </PremiumGate>
              )
            }

            if (requiresPremium) {
              return (
                <FeatureLocked
                  key={template.id}
                  userTier={userTier}
                  feature="documentGeneration"
                  fallback={
                    <Card className="relative opacity-75">
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <Title className="text-lg">{template.name}</Title>
                              <Badge color="blue">Premium Required</Badge>
                            </div>
                            <Text className="text-sm text-slate-600 mb-3">{template.description}</Text>
                          </div>
                          <div className="text-right">
                            <Text className="text-2xl font-bold text-slate-400">Premium</Text>
                          </div>
                        </div>
                        <Text className="text-sm text-slate-500">
                          Upgrade to Premium for automated document generation
                        </Text>
                      </div>
                    </Card>
                  }
                >
                  <DocumentCard template={template} generating={generating} selectedDocument={selectedDocument} handleGenerateDocument={handleGenerateDocument} getComplexityBadge={getComplexityBadge} />
                </FeatureLocked>
              )
            }

            return (
              <DocumentCard
                key={template.id}
                template={template}
                generating={generating}
                selectedDocument={selectedDocument}
                handleGenerateDocument={handleGenerateDocument}
                getComplexityBadge={getComplexityBadge}
              />
            )
          })}
        </Grid>
      </div>

      {/* Recent Documents */}
      <Card>
        <Title>Recent Documents</Title>
        <div className="space-y-3 mt-4">
          {recentDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <Text className="font-medium">{doc.name}</Text>
                  <Text className="text-sm text-slate-600">{doc.date}</Text>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(doc.status)}
                <Text className="font-medium">
                  {doc.price === 0 ? 'Free' : `€${doc.price}`}
                </Text>
                <Button size="sm" variant="outline" icon={Download}>
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Document Statistics */}
      <Grid numItems={1} numItemsLg={3} className="gap-6">
        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Documents Generated</Text>
              <Text className="text-2xl font-bold">23</Text>
              <Text className="text-xs text-slate-600">This month</Text>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Revenue Generated</Text>
              <Text className="text-2xl font-bold">€475</Text>
              <Text className="text-xs text-slate-600">From document services</Text>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div>
              <Text>Success Rate</Text>
              <Text className="text-2xl font-bold">94%</Text>
              <Text className="text-xs text-slate-600">Document effectiveness</Text>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </Flex>
        </Card>
      </Grid>
    </div>
  )
}