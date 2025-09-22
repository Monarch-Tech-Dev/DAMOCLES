'use client'

import React, { useState, useEffect } from 'react';
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
  TextInput,
  NumberInput,
  Select,
  SelectItem,
  Callout,
} from '@tremor/react';
import {
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalculatorIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface PDIMetrics {
  score: number;
  category: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  metrics: {
    debtToIncome: number;
    debtServiceRatio: number;
    creditUtilization: number;
    debtToAssets: number;
    debtGrowthRate: number;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface FinancialInputs {
  monthlyIncome: number;
  totalDebt: number;
  monthlyDebtPayments: number;
  creditUsed: number;
  totalCreditLimit: number;
  totalAssets: number;
  previousMonthDebt?: number;
}

const mockHistoryData = [
  { month: 'Jan', score: 45, category: 'fair' },
  { month: 'Feb', score: 42, category: 'poor' },
  { month: 'Mar', score: 38, category: 'poor' },
  { month: 'Apr', score: 41, category: 'poor' },
  { month: 'May', score: 44, category: 'fair' },
  { month: 'Jun', score: 47, category: 'fair' },
];

const riskFactors = [
  { factor: 'High Credit Utilization', impact: 85, color: 'red' },
  { factor: 'Rising Debt Levels', impact: 72, color: 'orange' },
  { factor: 'Low Income Ratio', impact: 45, color: 'yellow' },
  { factor: 'Payment History', impact: 20, color: 'green' },
];

export function TremorPDIDashboard() {
  const [pdiScore, setPdiScore] = useState<PDIMetrics | null>(null);
  const [inputs, setInputs] = useState<FinancialInputs>({
    monthlyIncome: 50000,
    totalDebt: 800000,
    monthlyDebtPayments: 15000,
    creditUsed: 80000,
    totalCreditLimit: 150000,
    totalAssets: 1200000,
  });
  const [loading, setLoading] = useState(false);

  const calculatePDI = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const debtToIncome = (inputs.totalDebt / (inputs.monthlyIncome * 12)) * 100;
      const debtServiceRatio = (inputs.monthlyDebtPayments / inputs.monthlyIncome) * 100;
      const creditUtilization = (inputs.creditUsed / inputs.totalCreditLimit) * 100;
      const debtToAssets = (inputs.totalDebt / inputs.totalAssets) * 100;

      // Calculate overall score (simplified algorithm)
      let score = 100;
      if (debtToIncome > 40) score -= 30;
      else if (debtToIncome > 30) score -= 20;
      else if (debtToIncome > 20) score -= 10;

      if (debtServiceRatio > 40) score -= 25;
      else if (debtServiceRatio > 30) score -= 15;
      else if (debtServiceRatio > 20) score -= 5;

      if (creditUtilization > 80) score -= 20;
      else if (creditUtilization > 50) score -= 10;
      else if (creditUtilization > 30) score -= 5;

      score = Math.max(0, Math.min(100, score));

      let category: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';

      if (score >= 80) {
        category = 'excellent';
        riskLevel = 'low';
      } else if (score >= 65) {
        category = 'good';
        riskLevel = 'low';
      } else if (score >= 50) {
        category = 'fair';
        riskLevel = 'medium';
      } else if (score >= 30) {
        category = 'poor';
        riskLevel = 'high';
      } else {
        category = 'critical';
        riskLevel = 'critical';
      }

      const recommendations = [];
      if (debtToIncome > 30) recommendations.push('Consider debt consolidation to reduce total debt burden');
      if (debtServiceRatio > 30) recommendations.push('Review monthly payment structure to improve cash flow');
      if (creditUtilization > 50) recommendations.push('Pay down credit card balances to improve utilization ratio');
      if (score < 50) recommendations.push('DAMOCLES protection recommended - GDPR requests may help identify violations');

      setPdiScore({
        score: Math.round(score),
        category,
        metrics: {
          debtToIncome: Math.round(debtToIncome * 10) / 10,
          debtServiceRatio: Math.round(debtServiceRatio * 10) / 10,
          creditUtilization: Math.round(creditUtilization * 10) / 10,
          debtToAssets: Math.round(debtToAssets * 10) / 10,
          debtGrowthRate: 2.3, // Mock value
        },
        recommendations,
        riskLevel,
      });

      setLoading(false);
    }, 1500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'emerald';
    if (score >= 65) return 'green';
    if (score >= 50) return 'yellow';
    if (score >= 30) return 'orange';
    return 'red';
  };

  const getCategoryDelta = (category: string) => {
    const deltas = {
      excellent: { value: '+5', type: 'increase' as const },
      good: { value: '+2', type: 'increase' as const },
      fair: { value: '-1', type: 'decrease' as const },
      poor: { value: '-8', type: 'decrease' as const },
      critical: { value: '-15', type: 'decrease' as const },
    };
    return deltas[category as keyof typeof deltas] || deltas.fair;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Title>Personal Debt Index (PDI)</Title>
        <Text>Comprehensive financial health assessment and debt protection analysis</Text>
      </div>

      {/* Main Score Card */}
      {pdiScore && (
        <Card>
          <Flex alignItems="start" className="space-x-6">
            <div className="space-y-1">
              <Text>PDI Score</Text>
              <Metric>{pdiScore.score}</Metric>
              <BadgeDelta
                deltaType={getCategoryDelta(pdiScore.category).type}
                size="xs"
              >
                {getCategoryDelta(pdiScore.category).value} vs last month
              </BadgeDelta>
            </div>
            <div className="flex-1">
              <Text className="mb-2">Risk Level: {pdiScore.category.toUpperCase()}</Text>
              <ProgressBar
                value={pdiScore.score}
                color={getScoreColor(pdiScore.score)}
                className="h-3"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Critical</span>
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>
          </Flex>
        </Card>
      )}

      {/* DAMOCLES Protection Alert */}
      {pdiScore && pdiScore.riskLevel === 'critical' && (
        <Callout
          className="mt-4"
          title="DAMOCLES Protection Recommended"
          color="red"
        >
          Your financial situation indicates high risk. Our automated system can help identify
          potential violations and generate GDPR requests to protect your rights.
        </Callout>
      )}

      {/* Metrics Grid */}
      {pdiScore && (
        <Grid numItems={1} numItemsSm={2} numItemsLg={5} className="gap-6">
          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Debt-to-Income</Text>
                <Metric>{pdiScore.metrics.debtToIncome}%</Metric>
              </div>
            </Flex>
            <ProgressBar
              value={pdiScore.metrics.debtToIncome}
              color={pdiScore.metrics.debtToIncome > 40 ? 'red' : pdiScore.metrics.debtToIncome > 30 ? 'yellow' : 'green'}
              className="mt-3"
            />
          </Card>

          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Debt Service Ratio</Text>
                <Metric>{pdiScore.metrics.debtServiceRatio}%</Metric>
              </div>
            </Flex>
            <ProgressBar
              value={pdiScore.metrics.debtServiceRatio}
              color={pdiScore.metrics.debtServiceRatio > 40 ? 'red' : pdiScore.metrics.debtServiceRatio > 30 ? 'yellow' : 'green'}
              className="mt-3"
            />
          </Card>

          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Credit Utilization</Text>
                <Metric>{pdiScore.metrics.creditUtilization}%</Metric>
              </div>
            </Flex>
            <ProgressBar
              value={pdiScore.metrics.creditUtilization}
              color={pdiScore.metrics.creditUtilization > 80 ? 'red' : pdiScore.metrics.creditUtilization > 50 ? 'yellow' : 'green'}
              className="mt-3"
            />
          </Card>

          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Debt-to-Assets</Text>
                <Metric>{pdiScore.metrics.debtToAssets}%</Metric>
              </div>
            </Flex>
            <ProgressBar
              value={pdiScore.metrics.debtToAssets}
              color={pdiScore.metrics.debtToAssets > 60 ? 'red' : pdiScore.metrics.debtToAssets > 40 ? 'yellow' : 'green'}
              className="mt-3"
            />
          </Card>

          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Debt Growth Rate</Text>
                <Metric>{pdiScore.metrics.debtGrowthRate}%</Metric>
              </div>
            </Flex>
            <ProgressBar
              value={pdiScore.metrics.debtGrowthRate * 10}
              color={pdiScore.metrics.debtGrowthRate > 5 ? 'red' : pdiScore.metrics.debtGrowthRate > 2 ? 'yellow' : 'green'}
              className="mt-3"
            />
          </Card>
        </Grid>
      )}

      {/* Charts Section */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        {/* PDI Trend */}
        <Card>
          <Title>PDI Score Trend</Title>
          <AreaChart
            className="h-72 mt-4"
            data={mockHistoryData}
            index="month"
            categories={["score"]}
            colors={["blue"]}
            yAxisWidth={30}
            showLegend={false}
          />
        </Card>

        {/* Risk Factors */}
        <Card>
          <Title>Risk Factor Analysis</Title>
          <Text className="mt-2">Factors affecting your debt health score</Text>
          <div className="mt-6 space-y-4">
            {riskFactors.map((factor, index) => (
              <div key={index}>
                <Flex>
                  <Text>{factor.factor}</Text>
                  <Text>{factor.impact}%</Text>
                </Flex>
                <CategoryBar
                  values={[factor.impact]}
                  colors={[factor.color as any]}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </Card>
      </Grid>

      {/* Recommendations */}
      {pdiScore && pdiScore.recommendations.length > 0 && (
        <Card>
          <Title>Personalized Recommendations</Title>
          <div className="mt-4 space-y-3">
            {pdiScore.recommendations.map((rec, index) => (
              <Callout
                key={index}
                title={`Recommendation ${index + 1}`}
                icon={InformationCircleIcon}
                color="blue"
              >
                {rec}
              </Callout>
            ))}
          </div>
        </Card>
      )}

      {/* Input Form */}
      <Card>
        <Title>Calculate Your PDI</Title>
        <Text className="mt-2">Enter your financial information for personalized analysis</Text>

        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mt-6">
          <div>
            <Text className="mb-2">Monthly Income (NOK)</Text>
            <NumberInput
              value={inputs.monthlyIncome}
              onValueChange={(value) => setInputs({...inputs, monthlyIncome: value || 0})}
              placeholder="50,000"
            />
          </div>

          <div>
            <Text className="mb-2">Total Debt (NOK)</Text>
            <NumberInput
              value={inputs.totalDebt}
              onValueChange={(value) => setInputs({...inputs, totalDebt: value || 0})}
              placeholder="800,000"
            />
          </div>

          <div>
            <Text className="mb-2">Monthly Debt Payments (NOK)</Text>
            <NumberInput
              value={inputs.monthlyDebtPayments}
              onValueChange={(value) => setInputs({...inputs, monthlyDebtPayments: value || 0})}
              placeholder="15,000"
            />
          </div>

          <div>
            <Text className="mb-2">Credit Used (NOK)</Text>
            <NumberInput
              value={inputs.creditUsed}
              onValueChange={(value) => setInputs({...inputs, creditUsed: value || 0})}
              placeholder="80,000"
            />
          </div>

          <div>
            <Text className="mb-2">Total Credit Limit (NOK)</Text>
            <NumberInput
              value={inputs.totalCreditLimit}
              onValueChange={(value) => setInputs({...inputs, totalCreditLimit: value || 0})}
              placeholder="150,000"
            />
          </div>

          <div>
            <Text className="mb-2">Total Assets (NOK)</Text>
            <NumberInput
              value={inputs.totalAssets}
              onValueChange={(value) => setInputs({...inputs, totalAssets: value || 0})}
              placeholder="1,200,000"
            />
          </div>
        </Grid>

        <Button
          className="w-full mt-6 flex items-center justify-center space-x-2"
          onClick={calculatePDI}
          disabled={loading}
        >
          <CalculatorIcon className="h-5 w-5" />
          <span>{loading ? 'Calculating PDI Score...' : 'Calculate My PDI Score'}</span>
        </Button>
      </Card>
    </div>
  );
}