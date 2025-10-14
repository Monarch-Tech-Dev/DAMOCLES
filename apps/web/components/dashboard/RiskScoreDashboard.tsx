'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  Badge,
  Grid,
  Col,
  Metric,
  ProgressBar,
  AreaChart,
  DonutChart,
  BarChart,
  BadgeDelta,
  Flex,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@tremor/react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from '@heroicons/react/24/outline';
import { useRiskScore, damoclesApi } from '@/lib/damocles-api';

interface RiskScoreData {
  collectorId: string;
  collectorName: string;
  overallRiskScore: number;
  violationScore: number;
  complianceScore: number;
  trustScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  breakdown: {
    gdprCompliance: number;
    settlementLogic: number;
    responsePatterns: number;
    violationFrequency: number;
    authorityRespect: number;
  };
  recommendations: string[];
  lastCalculated: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

interface RiskTrendData {
  date: string;
  riskScore: number;
  trustScore: number;
  violationScore: number;
}

interface RiskScoreDashboardProps {
  collectorId?: string;
  showComparison?: boolean;
  className?: string;
}

const riskLevelColors = {
  LOW: 'emerald',
  MEDIUM: 'yellow',
  HIGH: 'orange',
  CRITICAL: 'red',
} as const;

const riskLevelThresholds = {
  LOW: { min: 0, max: 39 },
  MEDIUM: { min: 40, max: 59 },
  HIGH: { min: 60, max: 79 },
  CRITICAL: { min: 80, max: 100 },
};

export function RiskScoreDashboard({
  collectorId,
  showComparison = false,
  className
}: RiskScoreDashboardProps) {
  const { data: riskData, loading, error, refetch } = useRiskScore(collectorId || '');
  const [trendData, setTrendData] = useState<RiskTrendData[]>([]);
  const [comparisonData, setComparisonData] = useState<RiskScoreData[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        // Fetch trend data if collectorId is available
        if (collectorId) {
          const trendResponse = await fetch(`http://localhost:3003/risk/trends/${collectorId}`);
          if (trendResponse.ok) {
            const trends = await trendResponse.json();
            setTrendData(trends);
          } else {
            // Generate mock data only on client side to avoid hydration mismatch
            setTrendData(generateMockTrendData());
          }
        } else {
          // Generate initial trend data on client side
          setTrendData(generateMockTrendData());
        }

        // Fetch comparison data if enabled
        if (showComparison) {
          try {
            const summary = await damoclesApi.getRiskSummary();
            setComparisonData(summary.collectors || []);
          } catch (err) {
            // Generate mock data only on client side
            setComparisonData(generateMockComparisonData());
          }
        }
      } catch (err) {
        console.error('Error fetching additional data:', err);
        // Generate mock data only on client side
        setTrendData(generateMockTrendData());
        setComparisonData(generateMockComparisonData());
      }
    };

    fetchAdditionalData();
  }, [collectorId, showComparison]);

  const getRiskLevelBadge = (riskLevel: string, score: number) => {
    const color = riskLevelColors[riskLevel as keyof typeof riskLevelColors];
    return (
      <Badge color={color} size="lg">
        {riskLevel} ({score})
      </Badge>
    );
  };

  const getTrendIcon = (trend?: { direction: string; percentage: number }) => {
    if (!trend) return null;

    switch (trend.direction) {
      case 'up':
        return <TrendingUpIcon className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDownIcon className="h-4 w-4 text-green-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const formatBreakdownData = (breakdown: RiskScoreData['breakdown']) => {
    return [
      { name: 'GDPR Compliance', value: breakdown.gdprCompliance },
      { name: 'Settlement Logic', value: breakdown.settlementLogic },
      { name: 'Response Patterns', value: breakdown.responsePatterns },
      { name: 'Violation Frequency', value: breakdown.violationFrequency },
      { name: 'Authority Respect', value: breakdown.authorityRespect },
    ];
  };

  const formatTrendChart = (data: RiskTrendData[]) => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('no-NO', { month: 'short', day: 'numeric' }),
      'Risk Score': item.riskScore,
      'Trust Score': item.trustScore,
      'Violations': item.violationScore,
    }));
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <Text className="text-red-600">{error.message}</Text>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <TabGroup selectedIndex={selectedTab} onIndexChange={setSelectedTab}>
        <TabList className="mb-4 sm:mb-6 grid grid-cols-3 sm:flex sm:space-x-1">
          <Tab className="text-sm sm:text-base">Overview</Tab>
          <Tab className="text-sm sm:text-base">Analysis</Tab>
          <Tab className="text-sm sm:text-base">Trends</Tab>
          {showComparison && <Tab className="text-sm sm:text-base col-span-3 sm:col-span-1 mt-2 sm:mt-0">Compare</Tab>}
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            {(() => {
              const displayData = riskData || generateMockRiskData();
              return (
                <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4 sm:gap-6">
                  {/* Overall Risk Score */}
                  <Col numColSpan={1} numColSpanLg={2}>
                    <Card>
                      <Flex alignItems="start" className="flex-col sm:flex-row sm:justify-between">
                        <div className="mb-2 sm:mb-0">
                          <Text>Overall Risk Score</Text>
                          <Metric className="text-2xl sm:text-3xl">{displayData.overallRiskScore}</Metric>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {getTrendIcon(displayData.trend)}
                          {displayData.trend && (
                            <BadgeDelta
                              deltaType={displayData.trend.direction === 'up' ? 'increase' : 'decrease'}
                            >
                              {displayData.trend.percentage}%
                            </BadgeDelta>
                          )}
                        </div>
                      </Flex>
                      <div className="mt-3 sm:mt-4">
                        {getRiskLevelBadge(displayData.riskLevel, displayData.overallRiskScore)}
                      </div>
                      <ProgressBar
                        value={displayData.overallRiskScore}
                        color={riskLevelColors[displayData.riskLevel]}
                        className="mt-3 sm:mt-4"
                      />
                  </Card>
                </Col>

                {/* Trust Score */}
                <Card>
                    <Flex alignItems="start" className="justify-between">
                      <div>
                        <Text className="text-sm">Trust Score</Text>
                        <Metric className="text-xl sm:text-2xl">{displayData.trustScore}</Metric>
                      </div>
                      <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                    </Flex>
                    <ProgressBar
                      value={displayData.trustScore}
                      color="emerald"
                      className="mt-2 sm:mt-3"
                    />
                  </Card>

                  {/* Violation Score */}
                <Card>
                    <Flex alignItems="start" className="justify-between">
                      <div>
                        <Text className="text-sm">Violation Score</Text>
                        <Metric className="text-xl sm:text-2xl">{displayData.violationScore}</Metric>
                      </div>
                      <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0" />
                    </Flex>
                    <ProgressBar
                      value={displayData.violationScore}
                      color="red"
                      className="mt-2 sm:mt-3"
                    />
                  </Card>

                  {/* Risk Breakdown Donut Chart */}
                  <Col numColSpan={1} numColSpanSm={2} numColSpanLg={2}>
                    <Card>
                      <Title className="text-base sm:text-lg">Risk Breakdown</Title>
                      <DonutChart
                        className="mt-4 sm:mt-6 h-48 sm:h-auto"
                        data={formatBreakdownData(displayData.breakdown)}
                        category="value"
                        index="name"
                        colors={["slate", "violet", "indigo", "rose", "cyan"]}
                        showAnimation={true}
                        showTooltip={true}
                      />
                    </Card>
                  </Col>

                  {/* Recommendations */}
                  <Col numColSpan={1} numColSpanSm={2} numColSpanLg={2}>
                    <Card>
                      <Title className="text-base sm:text-lg">Recommendations</Title>
                      <div className="mt-3 sm:mt-4 space-y-2">
                        {displayData.recommendations.slice(0, 3).map((rec, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                            <Text className="text-xs sm:text-sm leading-relaxed">{rec}</Text>
                          </div>
                        ))}
                        {displayData.recommendations.length > 3 && (
                          <div className="text-xs text-gray-500 text-center pt-2">
                            +{displayData.recommendations.length - 3} more recommendations
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                </Grid>
              );
            })()}
          </TabPanel>

          {/* Risk Analysis Tab */}
          <TabPanel>
            {riskData && (
              <Grid numItems={1} numItemsSm={1} numItemsLg={2} className="gap-4 sm:gap-6">
                <Card>
                  <Title className="text-base sm:text-lg">Risk Factor Analysis</Title>
                  <BarChart
                    className="mt-4 sm:mt-6 h-64 sm:h-auto"
                    data={formatBreakdownData(riskData.breakdown)}
                    index="name"
                    categories={["value"]}
                    colors={["blue"]}
                    yAxisWidth={80}
                    showAnimation={true}
                  />
                </Card>

                <Card>
                  <Title className="text-base sm:text-lg">Compliance Metrics</Title>
                  <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                    <div>
                      <Flex className="mb-1 sm:mb-2">
                        <Text className="text-sm">GDPR Compliance</Text>
                        <Text className="text-sm font-medium">{riskData.breakdown.gdprCompliance}%</Text>
                      </Flex>
                      <ProgressBar
                        value={riskData.breakdown.gdprCompliance}
                        color="blue"
                        className="mt-1 sm:mt-2"
                      />
                    </div>
                    <div>
                      <Flex className="mb-1 sm:mb-2">
                        <Text className="text-sm">Settlement Logic</Text>
                        <Text className="text-sm font-medium">{riskData.breakdown.settlementLogic}%</Text>
                      </Flex>
                      <ProgressBar
                        value={riskData.breakdown.settlementLogic}
                        color="indigo"
                        className="mt-1 sm:mt-2"
                      />
                    </div>
                    <div>
                      <Flex className="mb-1 sm:mb-2">
                        <Text className="text-sm">Authority Respect</Text>
                        <Text className="text-sm font-medium">{riskData.breakdown.authorityRespect}%</Text>
                      </Flex>
                      <ProgressBar
                        value={riskData.breakdown.authorityRespect}
                        color="purple"
                        className="mt-1 sm:mt-2"
                      />
                    </div>
                  </div>
                </Card>
              </Grid>
            )}
          </TabPanel>

          {/* Trends Tab */}
          <TabPanel>
            <Card>
              <Title className="text-base sm:text-lg">Risk Score Trends</Title>
              <Text className="text-sm">30-day historical risk analysis</Text>
              {trendData.length > 0 ? (
                <AreaChart
                  className="h-64 sm:h-72 mt-4 sm:mt-6"
                  data={formatTrendChart(trendData)}
                  index="date"
                  categories={["Risk Score", "Trust Score", "Violations"]}
                  colors={["red", "green", "orange"]}
                  showAnimation={true}
                  showTooltip={true}
                />
              ) : (
                <div className="h-64 sm:h-72 mt-4 sm:mt-6 flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              )}
            </Card>
          </TabPanel>

          {/* Comparison Tab */}
          {showComparison && (
            <TabPanel>
              <Card>
                <Title className="text-base sm:text-lg">Collector Risk Comparison</Title>
                <Text className="text-sm">Compare risk scores across different collectors</Text>
                <BarChart
                  className="h-64 sm:h-72 mt-4 sm:mt-6"
                  data={comparisonData.map(item => ({
                    name: item.collectorName.length > 15 ?
                      item.collectorName.substring(0, 12) + '...' :
                      item.collectorName,
                    'Risk Score': item.overallRiskScore,
                    'Trust Score': item.trustScore,
                  }))}
                  index="name"
                  categories={["Risk Score", "Trust Score"]}
                  colors={["red", "green"]}
                  yAxisWidth={40}
                  showAnimation={true}
                  showTooltip={true}
                />
              </Card>
            </TabPanel>
          )}
        </TabPanels>
      </TabGroup>
    </div>
  );
}

// Mock data for development
function generateMockRiskData(): RiskScoreData {
  return {
    collectorId: 'abc123',
    collectorName: 'ABC Inkasso AS',
    overallRiskScore: 75,
    violationScore: 68,
    complianceScore: 45,
    trustScore: 25,
    riskLevel: 'HIGH',
    breakdown: {
      gdprCompliance: 35,
      settlementLogic: 25,
      responsePatterns: 45,
      violationFrequency: 80,
      authorityRespect: 30,
    },
    recommendations: [
      '⚠️ GDPR compliance concerns detected. Review data processing practices.',
      '🔍 Settlement logic contradictions found. Document inconsistencies for legal use.',
      '🚨 High violation frequency. Consider collective action or regulatory complaint.',
      '⚖️ Authority hierarchy violations detected. Strong legal precedent available.',
      '🟠 HIGH RISK: Enhanced protection measures recommended.',
    ],
    lastCalculated: new Date().toISOString(),
    trend: {
      direction: 'up',
      percentage: 12,
    },
  };
}

function generateMockTrendData(): RiskTrendData[] {
  const data: RiskTrendData[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString(),
      riskScore: 60 + Math.random() * 30 + (29 - i) * 0.5, // Gradual increase
      trustScore: 40 - Math.random() * 20 - (29 - i) * 0.3, // Gradual decrease
      violationScore: 50 + Math.random() * 40 + (29 - i) * 0.4,
    });
  }

  return data;
}

function generateMockComparisonData(): RiskScoreData[] {
  return [
    {
      collectorId: 'abc123',
      collectorName: 'ABC Inkasso',
      overallRiskScore: 75,
      trustScore: 25,
      violationScore: 68,
      complianceScore: 45,
      riskLevel: 'HIGH',
      breakdown: { gdprCompliance: 35, settlementLogic: 25, responsePatterns: 45, violationFrequency: 80, authorityRespect: 30 },
      recommendations: [],
      lastCalculated: new Date().toISOString(),
    },
    {
      collectorId: 'def456',
      collectorName: 'XYZ Debt Solutions',
      overallRiskScore: 45,
      trustScore: 55,
      violationScore: 30,
      complianceScore: 70,
      riskLevel: 'MEDIUM',
      breakdown: { gdprCompliance: 65, settlementLogic: 70, responsePatterns: 60, violationFrequency: 40, authorityRespect: 75 },
      recommendations: [],
      lastCalculated: new Date().toISOString(),
    },
    {
      collectorId: 'ghi789',
      collectorName: 'Nordic Collection',
      overallRiskScore: 25,
      trustScore: 75,
      violationScore: 15,
      complianceScore: 85,
      riskLevel: 'LOW',
      breakdown: { gdprCompliance: 90, settlementLogic: 85, responsePatterns: 80, violationFrequency: 20, authorityRespect: 95 },
      recommendations: [],
      lastCalculated: new Date().toISOString(),
    },
  ];
}

export default RiskScoreDashboard;