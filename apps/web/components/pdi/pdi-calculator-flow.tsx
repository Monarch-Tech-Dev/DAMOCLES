'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Calculator,
  Users,
  MapPin,
  Clock,
  ChevronRight,
  Info,
  Target,
  AlertCircle
} from 'lucide-react';

interface PDIInputs {
  monthlyIncome: number;
  monthlyDebtPayments: number;
  totalDebt: number;
  availableCredit: number;
  creditUsed: number;
  totalAssets: number;
  previousMonthDebt?: number;
}

interface PDIResult {
  score: number;
  category: 'healthy' | 'caution' | 'risky' | 'critical';
  breakdown: {
    debtToIncome: { value: number; status: string; icon: string };
    creditUtilization: { value: number; status: string; icon: string };
    debtServiceRatio: { value: number; status: string; icon: string };
    debtToAssets: { value: number; status: string; icon: string };
    trend: { value: number; status: string; icon: string };
  };
  insights: string[];
  priorityAction: string;
  damoclesFlags?: string[];
}

interface ComparisonData {
  ageGroup: { average: number; percentile: number };
  incomeGroup: { average: number; percentile: number };
  region: { average: number; percentile: number };
  trend: 'improving' | 'stable' | 'declining';
}

interface PredictiveScenario {
  description: string;
  monthlyExtra: number;
  futureScore: number;
  timeToHealthy: number;
  interestSaved: number;
}

export function PDICalculatorFlow() {
  const [step, setStep] = useState<'input' | 'calculating' | 'results'>('input');
  const [inputs, setInputs] = useState<PDIInputs>({
    monthlyIncome: 0,
    monthlyDebtPayments: 0,
    totalDebt: 0,
    availableCredit: 0,
    creditUsed: 0,
    totalAssets: 0
  });
  const [result, setResult] = useState<PDIResult | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [scenarios, setScenarios] = useState<PredictiveScenario[]>([]);
  const [selectedTier, setSelectedTier] = useState<'free' | 'premium' | 'pro'>('free');
  const [userIsVulnerable, setUserIsVulnerable] = useState(false);

  // Calculate PDI score
  const calculatePDI = async () => {
    setStep('calculating');

    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calculate metrics
    const debtToIncome = (inputs.totalDebt / (inputs.monthlyIncome * 12)) * 100;
    const creditUtilization = inputs.availableCredit > 0
      ? (inputs.creditUsed / inputs.availableCredit) * 100
      : 0;
    const debtServiceRatio = (inputs.monthlyDebtPayments / inputs.monthlyIncome) * 100;
    const debtToAssets = inputs.totalAssets > 0
      ? (inputs.totalDebt / inputs.totalAssets) * 100
      : 100;

    // Calculate score (simplified for demo)
    let score = 100;
    score -= Math.min(25, debtToIncome * 0.5);
    score -= Math.min(20, creditUtilization * 0.3);
    score -= Math.min(25, debtServiceRatio * 0.6);
    score -= Math.min(20, Math.max(0, (debtToAssets - 50) * 0.2));
    score = Math.max(0, Math.round(score));

    // Determine category
    let category: PDIResult['category'];
    if (score >= 80) category = 'healthy';
    else if (score >= 60) category = 'caution';
    else if (score >= 40) category = 'risky';
    else category = 'critical';

    // Check if user is vulnerable (for ethical guardrails)
    setUserIsVulnerable(score < 40 || debtServiceRatio > 50);

    // Generate insights
    const insights = [];
    if (creditUtilization > 70) {
      insights.push('Your credit utilization is dangerously high - this is your top priority');
    }
    if (debtServiceRatio > 40) {
      insights.push('You\'re spending too much income on debt payments');
    }
    if (debtToAssets > 200) {
      insights.push('Your debts significantly exceed your assets - consider professional help');
    }

    // Generate priority action
    let priorityAction = '';
    if (creditUtilization > 70) {
      priorityAction = `Pay down ${Math.round(inputs.creditUsed * 0.3)} NOK on credit cards first`;
    } else if (debtServiceRatio > 40) {
      priorityAction = 'Focus on reducing monthly payment obligations';
    } else {
      priorityAction = 'Maintain current payment strategy and avoid new debt';
    }

    // Check for DAMOCLES triggers
    const damoclesFlags = [];
    if (score < 40) {
      damoclesFlags.push('Automatic GDPR violation scanning triggered');
    }
    if (inputs.monthlyDebtPayments > inputs.monthlyIncome * 0.5) {
      damoclesFlags.push('Potential illegal fee detection enabled');
    }

    const result: PDIResult = {
      score,
      category,
      breakdown: {
        debtToIncome: {
          value: Math.round(debtToIncome),
          status: debtToIncome < 35 ? 'good' : debtToIncome < 50 ? 'warning' : 'danger',
          icon: debtToIncome < 35 ? '✅' : debtToIncome < 50 ? '⚠️' : '🔴'
        },
        creditUtilization: {
          value: Math.round(creditUtilization),
          status: creditUtilization < 30 ? 'good' : creditUtilization < 60 ? 'warning' : 'danger',
          icon: creditUtilization < 30 ? '✅' : creditUtilization < 60 ? '⚠️' : '🔴'
        },
        debtServiceRatio: {
          value: Math.round(debtServiceRatio),
          status: debtServiceRatio < 30 ? 'good' : debtServiceRatio < 40 ? 'warning' : 'danger',
          icon: debtServiceRatio < 30 ? '✅' : debtServiceRatio < 40 ? '⚠️' : '🔴'
        },
        debtToAssets: {
          value: Math.round(debtToAssets),
          status: debtToAssets < 50 ? 'good' : debtToAssets < 100 ? 'warning' : 'danger',
          icon: debtToAssets < 50 ? '✅' : debtToAssets < 100 ? '⚠️' : '🔴'
        },
        trend: {
          value: 0,
          status: 'stable',
          icon: '⚠️'
        }
      },
      insights,
      priorityAction,
      damoclesFlags: damoclesFlags.length > 0 ? damoclesFlags : undefined
    };

    setResult(result);

    // Generate comparison data (mock)
    setComparison({
      ageGroup: { average: 61, percentile: score > 61 ? 65 : 35 },
      incomeGroup: { average: 58, percentile: score > 58 ? 60 : 40 },
      region: { average: 54, percentile: score > 54 ? 55 : 45 },
      trend: score < 40 ? 'declining' : score < 60 ? 'stable' : 'improving'
    });

    // Generate predictive scenarios
    setScenarios([
      {
        description: 'Minimum payments only',
        monthlyExtra: 0,
        futureScore: Math.max(0, score - 8),
        timeToHealthy: score < 80 ? 24 : 0,
        interestSaved: 0
      },
      {
        description: 'Pay 500 NOK extra',
        monthlyExtra: 500,
        futureScore: Math.min(100, score + 10),
        timeToHealthy: score < 80 ? 18 : 0,
        interestSaved: 2400
      },
      {
        description: 'Pay 1000 NOK extra',
        monthlyExtra: 1000,
        futureScore: Math.min(100, score + 18),
        timeToHealthy: score < 80 ? 12 : 0,
        interestSaved: 5600
      },
      {
        description: 'Use DAMOCLES recovery',
        monthlyExtra: 0,
        futureScore: Math.min(100, score + 22),
        timeToHealthy: score < 80 ? 10 : 0,
        interestSaved: 8900
      }
    ]);

    setStep('results');
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'healthy': return 'text-green-600';
      case 'caution': return 'text-yellow-600';
      case 'risky': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      caution: 'bg-yellow-100 text-yellow-800',
      risky: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[category as keyof typeof colors] || colors.caution;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Ethical Guardrail: Warning for vulnerable users */}
      {userIsVulnerable && (
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>You qualify for priority support</strong>
            <br />
            Based on your financial situation, we've activated enhanced protection features.
            No investment products will be shown, and you'll receive priority access to debt relief tools.
          </AlertDescription>
        </Alert>
      )}

      {step === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle>Calculate Your Personal Debt Index</CardTitle>
            <CardDescription>
              Takes only 2 minutes • Completely anonymous • No credit check
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="monthlyIncome">Monthly Income (NOK)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="35000"
                  value={inputs.monthlyIncome || ''}
                  onChange={(e) => setInputs({...inputs, monthlyIncome: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="monthlyDebtPayments">Monthly Debt Payments (NOK)</Label>
                <Input
                  id="monthlyDebtPayments"
                  type="number"
                  placeholder="12000"
                  value={inputs.monthlyDebtPayments || ''}
                  onChange={(e) => setInputs({...inputs, monthlyDebtPayments: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="totalDebt">Total Debt (NOK)</Label>
                <Input
                  id="totalDebt"
                  type="number"
                  placeholder="450000"
                  value={inputs.totalDebt || ''}
                  onChange={(e) => setInputs({...inputs, totalDebt: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="totalAssets">Total Assets (NOK)</Label>
                <Input
                  id="totalAssets"
                  type="number"
                  placeholder="200000"
                  value={inputs.totalAssets || ''}
                  onChange={(e) => setInputs({...inputs, totalAssets: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="availableCredit">Available Credit (NOK)</Label>
                <Input
                  id="availableCredit"
                  type="number"
                  placeholder="50000"
                  value={inputs.availableCredit || ''}
                  onChange={(e) => setInputs({...inputs, availableCredit: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="creditUsed">Credit Used (NOK)</Label>
                <Input
                  id="creditUsed"
                  type="number"
                  placeholder="35000"
                  value={inputs.creditUsed || ''}
                  onChange={(e) => setInputs({...inputs, creditUsed: Number(e.target.value)})}
                />
              </div>
            </div>
            <Button
              onClick={calculatePDI}
              className="w-full mt-6"
              disabled={!inputs.monthlyIncome || !inputs.totalDebt}
            >
              Calculate My PDI Score
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'calculating' && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calculator className="h-12 w-12 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Calculating your PDI score...</h3>
            <p className="text-gray-600">Analyzing your financial health metrics</p>
          </CardContent>
        </Card>
      )}

      {step === 'results' && result && (
        <>
          {/* Main Score Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your PDI Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <div className={`text-7xl font-bold ${getCategoryColor(result.category)}`}>
                  {result.score}
                </div>
                <Badge className={`mt-2 ${getCategoryBadge(result.category)}`}>
                  {result.category.toUpperCase()}
                </Badge>
                <div className="mt-4">
                  <Progress value={result.score} className="h-3" />
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-gray-600">Debt-to-Income</div>
                  <div className="text-xl font-semibold">
                    {result.breakdown.debtToIncome.value}% {result.breakdown.debtToIncome.icon}
                  </div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-gray-600">Credit Utilization</div>
                  <div className="text-xl font-semibold">
                    {result.breakdown.creditUtilization.value}% {result.breakdown.creditUtilization.icon}
                  </div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-gray-600">Debt Service Ratio</div>
                  <div className="text-xl font-semibold">
                    {result.breakdown.debtServiceRatio.value}% {result.breakdown.debtServiceRatio.icon}
                  </div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-gray-600">Debt-to-Assets</div>
                  <div className="text-xl font-semibold">
                    {result.breakdown.debtToAssets.value}% {result.breakdown.debtToAssets.icon}
                  </div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-gray-600">Trend</div>
                  <div className="text-xl font-semibold">
                    {result.breakdown.trend.status} {result.breakdown.trend.icon}
                  </div>
                </div>
              </div>

              {/* Priority Action */}
              <Alert className="mb-4">
                <Target className="h-4 w-4" />
                <AlertDescription>
                  <strong>Priority Action:</strong> {result.priorityAction}
                </AlertDescription>
              </Alert>

              {/* Insights */}
              {result.insights.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-sm">Key Insights</h4>
                  {result.insights.map((insight, idx) => (
                    <Alert key={idx} className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{insight}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* DAMOCLES Integration */}
              {result.damoclesFlags && result.damoclesFlags.length > 0 && !userIsVulnerable && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>DAMOCLES Protection Activated:</strong>
                    <ul className="mt-2 space-y-1">
                      {result.damoclesFlags.map((flag, idx) => (
                        <li key={idx}>• {flag}</li>
                      ))}
                    </ul>
                    <Button variant="link" className="mt-2 p-0">
                      Check for Illegal Fees <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Advanced Features Tabs */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="comparison" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="comparison">Compare</TabsTrigger>
                  <TabsTrigger value="scenarios">Predict</TabsTrigger>
                  <TabsTrigger value="regional">Regional</TabsTrigger>
                </TabsList>

                {/* Anonymous Comparison */}
                <TabsContent value="comparison">
                  {comparison && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">How You Compare (Anonymous)</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>People your age (25-35)</span>
                            <span>Avg: {comparison.ageGroup.average}</span>
                          </div>
                          <Progress value={comparison.ageGroup.percentile} className="h-2" />
                          <div className="text-xs text-gray-600 mt-1">
                            You're in the {comparison.ageGroup.percentile}th percentile
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Your income bracket</span>
                            <span>Avg: {comparison.incomeGroup.average}</span>
                          </div>
                          <Progress value={comparison.incomeGroup.percentile} className="h-2" />
                          <div className="text-xs text-gray-600 mt-1">
                            You're in the {comparison.incomeGroup.percentile}th percentile
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Your city (Oslo)</span>
                            <span>Avg: {comparison.region.average}</span>
                          </div>
                          <Progress value={comparison.region.percentile} className="h-2" />
                          <div className="text-xs text-gray-600 mt-1">
                            You're in the {comparison.region.percentile}th percentile
                          </div>
                        </div>
                      </div>
                      {result.score < comparison.region.average && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Your PDI is below average for your region. Take action to improve your financial health.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Predictive Scenarios */}
                <TabsContent value="scenarios">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Future Scenarios (6 months)</h3>
                    <div className="space-y-3">
                      {scenarios.map((scenario, idx) => (
                        <Card key={idx} className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{scenario.description}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                PDI: {result.score} → {scenario.futureScore}
                                {scenario.interestSaved > 0 && (
                                  <span className="text-green-600 ml-2">
                                    Save {scenario.interestSaved} NOK
                                  </span>
                                )}
                              </div>
                            </div>
                            {scenario.futureScore > result.score ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Regional Intelligence */}
                <TabsContent value="regional">
                  <div className="space-y-4">
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Oslo Debt Crisis Alert</strong>
                        <br />
                        Average PDI dropped 8 points in 3 months
                        <br />
                        Main cause: Rent increases + energy costs
                        <br />
                        34% of users now in "Risky" category
                      </AlertDescription>
                    </Alert>
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Join Collective Action (1,247 participants)
                    </Button>
                    <div className="text-sm text-gray-600">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Regional data updated daily from anonymous user submissions
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Pricing Tiers - Never shown to vulnerable users */}
          {!userIsVulnerable && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
                <CardDescription>
                  Get more insights and protection with premium features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className={selectedTier === 'free' ? 'border-blue-500' : ''}>
                    <CardHeader>
                      <CardTitle className="text-lg">Free</CardTitle>
                      <div className="text-2xl font-bold">0 NOK</div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>✓ Basic PDI calculation</li>
                        <li>✓ Monthly updates</li>
                        <li>✓ Generic advice</li>
                      </ul>
                      <Button
                        variant={selectedTier === 'free' ? 'default' : 'outline'}
                        className="w-full mt-4"
                        onClick={() => setSelectedTier('free')}
                      >
                        Current Plan
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className={selectedTier === 'premium' ? 'border-blue-500' : ''}>
                    <CardHeader>
                      <CardTitle className="text-lg">Premium</CardTitle>
                      <div className="text-2xl font-bold">49 NOK<span className="text-sm">/mo</span></div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>✓ Weekly monitoring</li>
                        <li>✓ Predictive scenarios</li>
                        <li>✓ Peer comparisons</li>
                        <li>✓ Action plans</li>
                        <li>✓ DAMOCLES basic</li>
                      </ul>
                      <Button
                        variant={selectedTier === 'premium' ? 'default' : 'outline'}
                        className="w-full mt-4"
                        onClick={() => setSelectedTier('premium')}
                      >
                        Upgrade
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className={selectedTier === 'pro' ? 'border-blue-500' : ''}>
                    <CardHeader>
                      <CardTitle className="text-lg">Pro</CardTitle>
                      <div className="text-2xl font-bold">199 NOK<span className="text-sm">/mo</span></div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>✓ Daily monitoring</li>
                        <li>✓ Full DAMOCLES</li>
                        <li>✓ Legal documents</li>
                        <li>✓ Settlement support</li>
                        <li>✓ Priority support</li>
                      </ul>
                      <Button
                        variant={selectedTier === 'pro' ? 'default' : 'outline'}
                        className="w-full mt-4"
                        onClick={() => setSelectedTier('pro')}
                      >
                        Go Pro
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Track Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Next milestone: PDI 60</span>
                  <Badge>18 points to go</Badge>
                </div>
                <Progress value={(result.score / 60) * 100} className="h-2" />
                <div className="text-sm text-gray-600">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Estimated time: 6-8 months with recommended actions
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}