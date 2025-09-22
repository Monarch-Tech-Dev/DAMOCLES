'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, TrendingUp, Shield, Calculator, Award } from 'lucide-react';

interface MetricResult {
  value: number;
  score: number;
  category: 'healthy' | 'caution' | 'risky' | 'critical';
}

interface PDIScore {
  score: number;
  category: 'healthy' | 'caution' | 'risky' | 'critical';
  metrics: {
    dti: MetricResult;
    dsr: MetricResult;
    creditUtilization: MetricResult;
    debtToAssets: MetricResult;
    debtGrowth: MetricResult;
  };
  recommendations: string[];
  damoclesActionTriggered: boolean;
  swordRewards?: {
    totalReward: number;
    breakdown: string[];
    explanation: string;
  };
}

interface PDIHistory {
  score: number;
  scoreCategory: string;
  recordedAt: string;
}

export function PDIDashboard() {
  const [pdiScore, setPdiScore] = useState<PDIScore | null>(null);
  const [history, setHistory] = useState<PDIHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    monthlyIncome: '',
    totalDebt: '',
    monthlyDebtPayments: '',
    creditUsed: '',
    availableCredit: '',
    totalAssets: '',
    previousMonthDebt: ''
  });

  const calculatePDI = async () => {
    setLoading(true);
    try {
      const numericInputs = {
        monthlyIncome: parseFloat(inputs.monthlyIncome) || 0,
        totalDebt: parseFloat(inputs.totalDebt) || 0,
        monthlyDebtPayments: parseFloat(inputs.monthlyDebtPayments) || 0,
        creditUsed: parseFloat(inputs.creditUsed) || 0,
        availableCredit: parseFloat(inputs.availableCredit) || 0,
        totalAssets: parseFloat(inputs.totalAssets) || 0,
        ...(inputs.previousMonthDebt && {
          previousMonthDebt: parseFloat(inputs.previousMonthDebt)
        })
      };

      const response = await fetch('/api/pdi/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(numericInputs),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate PDI');
      }

      const data = await response.json();
      setPdiScore(data);
      await fetchHistory();
    } catch (error) {
      console.error('Failed to calculate PDI:', error);
      // In a real app, you'd show a toast/notification here
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/pdi/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCategoryBadgeClass = (category: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800 border-green-200',
      caution: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      risky: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[category as keyof typeof colors] || colors.caution;
  };

  const formatMetricName = (key: string): string => {
    const names: { [key: string]: string } = {
      dti: 'Debt-to-Income',
      dsr: 'Debt Service Ratio',
      creditUtilization: 'Credit Utilization',
      debtToAssets: 'Debt-to-Assets',
      debtGrowth: 'Debt Growth'
    };
    return names[key] || key;
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    if (score >= 40) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Personal Debt Index</h1>
          <p className="text-slate-600 mt-1">
            Monitor your financial health and get automated protection
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
          <Calculator className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-slate-700">PDI v1.0</span>
        </div>
      </div>

      {/* PDI Score Card */}
      {pdiScore && (
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <span className="text-slate-900">Your PDI Score</span>
              <div className="flex items-center space-x-2">
                {pdiScore.damoclesActionTriggered && (
                  <Shield className="h-5 w-5 text-blue-600 animate-pulse" />
                )}
                {pdiScore.swordRewards && pdiScore.swordRewards.totalReward > 0 && (
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">
                      +{pdiScore.swordRewards.totalReward} SWORD
                    </span>
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-8">
              <div className={`text-5xl sm:text-6xl font-bold mb-4 ${getScoreColor(pdiScore.score)}`}>
                {pdiScore.score}
              </div>
              <Badge className={`${getCategoryBadgeClass(pdiScore.category)} text-sm px-4 py-2`}>
                {pdiScore.category.toUpperCase()}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-slate-600 mb-3">
                <span>Critical</span>
                <span>Healthy</span>
              </div>
              <div className="relative">
                <div className="w-full bg-slate-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${getScoreProgressColor(pdiScore.score)}`}
                    style={{ width: `${pdiScore.score}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>0</span>
                <span>40</span>
                <span>60</span>
                <span>80</span>
                <span>100</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {Object.entries(pdiScore.metrics).map(([key, metric]) => (
                <div key={key} className="text-center p-4 rounded-xl bg-slate-50/80 border border-slate-200/50">
                  <div className="text-xs text-slate-600 mb-2 font-medium">
                    {formatMetricName(key)}
                  </div>
                  <div className={`text-lg font-bold ${getScoreColor(metric.score * 5)}`}>
                    {metric.value.toFixed(1)}%
                  </div>
                  <Badge
                    className={`text-xs mt-2 ${getCategoryBadgeClass(metric.category)}`}
                    variant="outline"
                  >
                    {metric.category}
                  </Badge>
                </div>
              ))}
            </div>

            {/* DAMOCLES Alert */}
            {pdiScore.damoclesActionTriggered && (
              <Alert className="mb-6 border-blue-300 bg-blue-50/80 backdrop-blur-sm">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>DAMOCLES Protection Activated</strong>
                  <br />
                  Your financial situation triggered our automated consumer protection system.
                  GDPR requests are being prepared for your creditors to ensure fair treatment.
                </AlertDescription>
              </Alert>
            )}

            {/* SWORD Rewards */}
            {pdiScore.swordRewards && pdiScore.swordRewards.totalReward > 0 && (
              <Alert className="mb-6 border-yellow-300 bg-yellow-50/80 backdrop-blur-sm">
                <Award className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900">
                  <strong>🎉 {pdiScore.swordRewards.totalReward} SWORD Tokens Earned!</strong>
                  <div className="mt-2 text-sm">
                    {pdiScore.swordRewards.breakdown.map((reason, idx) => (
                      <div key={idx}>• {reason}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Recommendations */}
            {pdiScore.recommendations.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Recommendations
                </h4>
                <div className="space-y-3">
                  {pdiScore.recommendations.map((rec, idx) => (
                    <Alert key={idx} className="py-3 bg-orange-50/80 border-orange-200">
                      <AlertDescription className="text-sm text-orange-900">{rec}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Input Form */}
      <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-slate-900">Calculate Your PDI</CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Enter your financial information to calculate your Personal Debt Index
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthlyIncome">Monthly Income (NOK)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="50000"
                value={inputs.monthlyIncome}
                onChange={(e) => setInputs({ ...inputs, monthlyIncome: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="totalDebt">Total Debt (NOK)</Label>
              <Input
                id="totalDebt"
                type="number"
                placeholder="500000"
                value={inputs.totalDebt}
                onChange={(e) => setInputs({ ...inputs, totalDebt: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="monthlyDebtPayments">Monthly Debt Payments (NOK)</Label>
              <Input
                id="monthlyDebtPayments"
                type="number"
                placeholder="15000"
                value={inputs.monthlyDebtPayments}
                onChange={(e) => setInputs({ ...inputs, monthlyDebtPayments: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="creditUsed">Credit Used (NOK)</Label>
              <Input
                id="creditUsed"
                type="number"
                placeholder="30000"
                value={inputs.creditUsed}
                onChange={(e) => setInputs({ ...inputs, creditUsed: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="availableCredit">Available Credit (NOK)</Label>
              <Input
                id="availableCredit"
                type="number"
                placeholder="100000"
                value={inputs.availableCredit}
                onChange={(e) => setInputs({ ...inputs, availableCredit: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="totalAssets">Total Assets (NOK)</Label>
              <Input
                id="totalAssets"
                type="number"
                placeholder="750000"
                value={inputs.totalAssets}
                onChange={(e) => setInputs({ ...inputs, totalAssets: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="previousMonthDebt">Previous Month Debt (NOK) - Optional</Label>
            <Input
              id="previousMonthDebt"
              type="number"
              placeholder="480000"
              value={inputs.previousMonthDebt}
              onChange={(e) => setInputs({ ...inputs, previousMonthDebt: e.target.value })}
            />
          </div>
          <Button
            onClick={calculatePDI}
            disabled={loading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            size="lg"
          >
            {loading ? 'Calculating...' : 'Calculate PDI Score'}
          </Button>
        </CardContent>
      </Card>

      {/* History Chart Placeholder */}
      {history.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              PDI History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 5).map((record, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 border border-slate-200/50">
                  <div>
                    <div className="font-medium text-slate-900">Score: {record.score}</div>
                    <div className="text-sm text-slate-600">
                      {new Date(record.recordedAt).toLocaleDateString('no-NO')}
                    </div>
                  </div>
                  <Badge className={getCategoryBadgeClass(record.scoreCategory)}>
                    {record.scoreCategory}
                  </Badge>
                </div>
              ))}
            </div>
            {history.length > 5 && (
              <div className="text-center mt-6">
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  View Full History
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}