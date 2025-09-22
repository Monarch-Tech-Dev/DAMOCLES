'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, Target,
  ChevronDown, ChevronRight, Info, Eye, EyeOff, Plus, Minus
} from 'lucide-react'

interface FinancialMetrics {
  // Core 6 fields (always visible)
  monthlyIncome: number
  totalDebt: number
  monthlyDebtPayments: number
  fixedExpenses: number
  variableExpenses: number
  emergencyFund: number

  // Advanced fields (progressive disclosure)
  mortgageBalance?: number
  creditCardBalances?: number
  studentLoanBalance?: number
  otherDebtBalances?: number
  debtGrowthRate?: number
  missedPayments?: number
}

interface PDIResult {
  overallScore: number
  category: string
  metrics: any
  recommendations: string[]
  riskFactors: string[]
  protectionLevel: string
  automationTriggered: boolean
  swordAwarded: number
}

interface IssueDetection {
  type: 'warning' | 'critical' | 'info'
  title: string
  description: string
  suggestedFields?: string[]
}

export default function PDIPage() {
  const [inputs, setInputs] = useState<FinancialMetrics>({
    monthlyIncome: 0,
    totalDebt: 0,
    monthlyDebtPayments: 0,
    fixedExpenses: 0,
    variableExpenses: 0,
    emergencyFund: 0,
    mortgageBalance: 0,
    creditCardBalances: 0,
    studentLoanBalance: 0,
    otherDebtBalances: 0,
    debtGrowthRate: 0,
    missedPayments: 0
  })

  const [result, setResult] = useState<PDIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [detectedIssues, setDetectedIssues] = useState<IssueDetection[]>([])
  const [history, setHistory] = useState<Array<{date: string, score: number}>>([])

  useEffect(() => {
    loadPDIHistory()
  }, [])

  // Auto-detect issues and suggest additional fields
  useEffect(() => {
    const issues: IssueDetection[] = []

    // High debt service ratio
    if (inputs.monthlyIncome > 0 && inputs.monthlyDebtPayments > 0) {
      const dsr = (inputs.monthlyDebtPayments / inputs.monthlyIncome) * 100
      if (dsr > 40) {
        issues.push({
          type: 'critical',
          title: 'High Debt Service Ratio',
          description: `${dsr.toFixed(1)}% of income goes to debt payments. This is very high.`,
          suggestedFields: ['mortgageBalance', 'creditCardBalances']
        })
      } else if (dsr > 30) {
        issues.push({
          type: 'warning',
          title: 'Elevated Debt Service Ratio',
          description: `${dsr.toFixed(1)}% of income goes to debt payments. Consider breakdown.`,
          suggestedFields: ['debtGrowthRate']
        })
      }
    }

    // Low emergency fund
    if (inputs.fixedExpenses > 0 && inputs.emergencyFund > 0) {
      const monthsCovered = inputs.emergencyFund / inputs.fixedExpenses
      if (monthsCovered < 1) {
        issues.push({
          type: 'critical',
          title: 'Emergency Fund Critical',
          description: `Only ${monthsCovered.toFixed(1)} months of expenses covered. Very risky.`
        })
      } else if (monthsCovered < 3) {
        issues.push({
          type: 'warning',
          title: 'Low Emergency Fund',
          description: `Only ${monthsCovered.toFixed(1)} months of expenses covered. Recommended: 3-6 months.`
        })
      }
    }

    // Debt-to-income too high
    if (inputs.monthlyIncome > 0 && inputs.totalDebt > 0) {
      const dti = inputs.totalDebt / (inputs.monthlyIncome * 12)
      if (dti > 3) {
        issues.push({
          type: 'critical',
          title: 'Debt-to-Income Very High',
          description: `Total debt is ${dti.toFixed(1)}x annual income. This suggests serious financial stress.`,
          suggestedFields: ['missedPayments', 'debtGrowthRate']
        })
      }
    }

    setDetectedIssues(issues)

    // Auto-expand advanced if critical issues detected
    if (issues.some(issue => issue.type === 'critical')) {
      setShowAdvanced(true)
    }
  }, [inputs.monthlyIncome, inputs.monthlyDebtPayments, inputs.totalDebt, inputs.fixedExpenses, inputs.emergencyFund])

  const loadPDIHistory = async () => {
    try {
      setHistory([
        { date: '2025-09-17', score: 45 },
        { date: '2025-08-17', score: 42 },
        { date: '2025-07-17', score: 38 },
      ])
    } catch (error) {
      console.error('Failed to load PDI history:', error)
    }
  }

  const calculatePDI = async () => {
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8011/api/pdi/test-calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      })

      if (!response.ok) throw new Error('PDI calculation failed')

      const data = await response.json()

      const pdiResult: PDIResult = {
        overallScore: Math.round(data.result?.overallScore || 0),
        category: data.result?.category || 'critical',
        metrics: data.result?.metrics || {},
        recommendations: data.result?.recommendations || [],
        riskFactors: data.result?.riskFactors || [],
        protectionLevel: data.result?.protectionLevel || 'monitoring',
        automationTriggered: data.result?.overallScore < 40,
        swordAwarded: data.result?.overallScore < 40 ? 1000 : data.result?.overallScore < 60 ? 500 : 200
      }

      setResult(pdiResult)

      const newEntry = {
        date: new Date().toISOString().split('T')[0],
        score: pdiResult.overallScore
      }
      setHistory(prev => [newEntry, ...prev.slice(0, 5)])

    } catch (error) {
      console.error('PDI calculation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryInfo = (category: string, score: number) => {
    switch (category) {
      case 'critical':
        return {
          color: 'text-red-500 bg-red-50',
          icon: AlertTriangle,
          title: '💀 Critical (Drowning)',
          description: 'DAMOCLES protection activated automatically',
          bgColor: 'bg-red-500'
        }
      case 'risky':
        return {
          color: 'text-orange-500 bg-orange-50',
          icon: AlertTriangle,
          title: '⚠️ Risky (Struggling)',
          description: 'Enhanced monitoring enabled',
          bgColor: 'bg-orange-500'
        }
      case 'caution':
        return {
          color: 'text-yellow-500 bg-yellow-50',
          icon: Target,
          title: '🟡 Caution (Managing)',
          description: 'Regular check-ins recommended',
          bgColor: 'bg-yellow-500'
        }
      default:
        return {
          color: 'text-green-500 bg-green-50',
          icon: CheckCircle,
          title: '✅ Healthy (Thriving)',
          description: 'Great job! Keep it up',
          bgColor: 'bg-green-500'
        }
    }
  }

  const isFormValid = Object.values(inputs).slice(0, 6).every(value => value >= 0) && inputs.monthlyIncome > 0

  const suggestBankIDFill = () => {
    // Demo values for BankID auto-fill
    setInputs({
      monthlyIncome: 45000,
      totalDebt: 850000,
      monthlyDebtPayments: 15000,
      fixedExpenses: 20000,
      variableExpenses: 8000,
      emergencyFund: 30000,
      mortgageBalance: 800000,
      creditCardBalances: 25000,
      studentLoanBalance: 0,
      otherDebtBalances: 25000,
      debtGrowthRate: 2.5,
      missedPayments: 0
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Personal Debt Index (PDI)</h1>
        <p className="text-xl text-gray-600">
          Like a credit score, but for YOUR benefit, not the bank's
        </p>
        <div className="flex justify-center items-center space-x-4">
          <span className="text-lg font-medium">🚀 Quick Start: Just 6 numbers</span>
          <span className="text-gray-400">→</span>
          <span className="text-lg font-medium">🎯 Smart expansion if needed</span>
          <span className="text-gray-400">→</span>
          <span className="text-lg font-medium">🛡️ Auto-protection</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Calculate Your PDI</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={suggestBankIDFill}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              🏦 Demo BankID Fill
            </Button>
          </div>

          <div className="space-y-6">
            {/* Core 6 Fields - Always Visible */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-800">6 Key Numbers</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Like a tax form - simple</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyIncome">Monthly Income</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    placeholder="45,000"
                    value={inputs.monthlyIncome || ''}
                    onChange={(e) => setInputs(prev => ({...prev, monthlyIncome: Number(e.target.value)}))}
                  />
                  <span className="text-xs text-gray-500">After tax, NOK</span>
                </div>

                <div>
                  <Label htmlFor="monthlyDebtPayments">Monthly Debt Payments</Label>
                  <Input
                    id="monthlyDebtPayments"
                    type="number"
                    placeholder="15,000"
                    value={inputs.monthlyDebtPayments || ''}
                    onChange={(e) => setInputs(prev => ({...prev, monthlyDebtPayments: Number(e.target.value)}))}
                  />
                  <span className="text-xs text-gray-500">All minimum payments</span>
                </div>

                <div>
                  <Label htmlFor="totalDebt">Total Debt</Label>
                  <Input
                    id="totalDebt"
                    type="number"
                    placeholder="850,000"
                    value={inputs.totalDebt || ''}
                    onChange={(e) => setInputs(prev => ({...prev, totalDebt: Number(e.target.value)}))}
                  />
                  <span className="text-xs text-gray-500">All loans, cards, etc.</span>
                </div>

                <div>
                  <Label htmlFor="fixedExpenses">Fixed Expenses</Label>
                  <Input
                    id="fixedExpenses"
                    type="number"
                    placeholder="20,000"
                    value={inputs.fixedExpenses || ''}
                    onChange={(e) => setInputs(prev => ({...prev, fixedExpenses: Number(e.target.value)}))}
                  />
                  <span className="text-xs text-gray-500">Rent, utilities, etc.</span>
                </div>

                <div>
                  <Label htmlFor="variableExpenses">Variable Expenses</Label>
                  <Input
                    id="variableExpenses"
                    type="number"
                    placeholder="8,000"
                    value={inputs.variableExpenses || ''}
                    onChange={(e) => setInputs(prev => ({...prev, variableExpenses: Number(e.target.value)}))}
                  />
                  <span className="text-xs text-gray-500">Food, transport, etc.</span>
                </div>

                <div>
                  <Label htmlFor="emergencyFund">Emergency Savings</Label>
                  <Input
                    id="emergencyFund"
                    type="number"
                    placeholder="30,000"
                    value={inputs.emergencyFund || ''}
                    onChange={(e) => setInputs(prev => ({...prev, emergencyFund: Number(e.target.value)}))}
                  />
                  <span className="text-xs text-gray-500">Available cash</span>
                </div>
              </div>
            </div>

            {/* Auto-detected Issues */}
            {detectedIssues.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  Smart Detection
                </h3>
                {detectedIssues.map((issue, index) => (
                  <Alert key={index} className={`border-l-4 ${
                    issue.type === 'critical' ? 'border-red-500 bg-red-50' :
                    issue.type === 'warning' ? 'border-orange-500 bg-orange-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className={issue.type === 'critical' ? 'text-red-700' : issue.type === 'warning' ? 'text-orange-700' : 'text-blue-700'}>
                            {issue.title}
                          </strong>
                          <p className="text-sm mt-1">{issue.description}</p>
                        </div>
                        {issue.suggestedFields && !showAdvanced && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAdvanced(true)}
                            className="ml-4"
                          >
                            Add Details
                          </Button>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Progressive Disclosure Toggle */}
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Details</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {showAdvanced ? 'For experts' : 'For accuracy'}
                </span>
              </Button>
            </div>

            {/* Advanced Fields - Progressive Disclosure */}
            {showAdvanced && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Target className="h-5 w-5 text-blue-500 mr-2" />
                  Detailed Breakdown
                  <span className="text-sm font-normal text-gray-500 ml-2">- For better accuracy</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mortgageBalance">Mortgage Balance</Label>
                    <Input
                      id="mortgageBalance"
                      type="number"
                      placeholder="2,500,000"
                      value={inputs.mortgageBalance || ''}
                      onChange={(e) => setInputs(prev => ({...prev, mortgageBalance: Number(e.target.value)}))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="creditCardBalances">Credit Card Debt</Label>
                    <Input
                      id="creditCardBalances"
                      type="number"
                      placeholder="25,000"
                      value={inputs.creditCardBalances || ''}
                      onChange={(e) => setInputs(prev => ({...prev, creditCardBalances: Number(e.target.value)}))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="studentLoanBalance">Student Loans</Label>
                    <Input
                      id="studentLoanBalance"
                      type="number"
                      placeholder="150,000"
                      value={inputs.studentLoanBalance || ''}
                      onChange={(e) => setInputs(prev => ({...prev, studentLoanBalance: Number(e.target.value)}))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="otherDebtBalances">Other Debt</Label>
                    <Input
                      id="otherDebtBalances"
                      type="number"
                      placeholder="75,000"
                      value={inputs.otherDebtBalances || ''}
                      onChange={(e) => setInputs(prev => ({...prev, otherDebtBalances: Number(e.target.value)}))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="debtGrowthRate">Debt Growth Rate (%)</Label>
                    <Input
                      id="debtGrowthRate"
                      type="number"
                      placeholder="2.5"
                      value={inputs.debtGrowthRate || ''}
                      onChange={(e) => setInputs(prev => ({...prev, debtGrowthRate: Number(e.target.value)}))}
                    />
                    <span className="text-xs text-gray-500">6-month change</span>
                  </div>

                  <div>
                    <Label htmlFor="missedPayments">Missed Payments</Label>
                    <Input
                      id="missedPayments"
                      type="number"
                      placeholder="0"
                      value={inputs.missedPayments || ''}
                      onChange={(e) => setInputs(prev => ({...prev, missedPayments: Number(e.target.value)}))}
                    />
                    <span className="text-xs text-gray-500">Last 12 months</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={calculatePDI}
              disabled={!isFormValid || loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Calculating PDI...' : 'Calculate My Personal Debt Index'}
            </Button>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {result && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Your PDI Score</h2>

              {/* Score Display */}
              <div className="text-center mb-6">
                <div className="text-6xl font-bold mb-2">
                  {result.overallScore}
                  <span className="text-2xl text-gray-500">/100</span>
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-lg ${getCategoryInfo(result.category, result.overallScore).color}`}>
                  {(() => {
                    const IconComponent = getCategoryInfo(result.category, result.overallScore).icon
                    return <IconComponent className="h-5 w-5 mr-2" />
                  })()}
                  <span className="font-semibold">
                    {getCategoryInfo(result.category, result.overallScore).title}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">
                  {getCategoryInfo(result.category, result.overallScore).description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Critical</span>
                  <span>Risky</span>
                  <span>Caution</span>
                  <span>Healthy</span>
                </div>
                <Progress value={result.overallScore} className="h-3" />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                  <span>100</span>
                </div>
              </div>

              {/* Automation Status */}
              {result.automationTriggered && (
                <Alert className="mb-4 border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>DAMOCLES Protection Activated!</strong>
                    <br />
                    We're automatically generating GDPR requests and prioritizing your case.
                    No action needed from you.
                  </AlertDescription>
                </Alert>
              )}

              {/* SWORD Rewards */}
              {result.swordAwarded > 0 && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>You earned {result.swordAwarded} SWORD tokens!</strong>
                    <br />
                    Reward for participating in the debt health system.
                  </AlertDescription>
                </Alert>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recommendations:</h3>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          {/* PDI History */}
          {history.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Your PDI Progress</h3>
              <div className="space-y-3">
                {history.map((entry, index) => {
                  const trend = index < history.length - 1
                    ? entry.score - history[index + 1].score
                    : 0

                  return (
                    <div key={entry.date} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <span className="text-sm text-gray-600">{entry.date}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{entry.score}</span>
                        {trend !== 0 && (
                          <div className={`flex items-center ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            <span className="text-xs ml-1">{Math.abs(trend)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Info Card */}
          <Card className="p-6 bg-blue-50">
            <h3 className="text-lg font-bold mb-2 flex items-center">
              <Info className="h-5 w-5 text-blue-500 mr-2" />
              Why PDI Works
            </h3>
            <div className="text-sm space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Credit Score:</strong></p>
                  <p className="text-gray-600">Banks judge if you're profitable</p>
                </div>
                <div>
                  <p><strong>PDI Score:</strong></p>
                  <p className="text-gray-600">YOU judge if you're healthy</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-500">
                <p className="font-medium text-blue-800">Network Effects:</p>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>• 10 users: Individual help</div>
                  <div>• 1,000 users: Pattern detection</div>
                  <div>• 100,000 users: Media attention</div>
                  <div>• 1,000,000 users: Systemic change</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}