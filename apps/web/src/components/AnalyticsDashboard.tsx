// Sacred Architecture Analytics Dashboard ⚔️
// Comprehensive reporting and insights for the DAMOCLES platform

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalDebtsAnalyzed: number;
    totalViolationsDetected: number;
    totalGDPRRequests: number;
    totalTokensDistributed: number;
    averageTrustScore: number;
    collectiveActionParticipants: number;
  };
  trustScoreDistribution: {
    ranges: string[];
    counts: number[];
  };
  violationTypes: {
    labels: string[];
    data: number[];
  };
  gdprActivity: {
    dates: string[];
    sent: number[];
    responses: number[];
    violations: number[];
  };
  kindnessMetrics: {
    userWellbeing: number;
    systemSustainability: number;
    communityHealth: number;
    longTermViability: number;
    consciousnessAlignment: number;
  };
  tokenomics: {
    circulating: number;
    staked: number;
    rewards: number;
    burned: number;
  };
  userGrowth: {
    dates: string[];
    newUsers: number[];
    activeUsers: number[];
  };
  creditorAnalysis: {
    names: string[];
    violations: number[];
    trustScores: number[];
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'trust' | 'violations' | 'gdpr' | 'kindness' | 'tokens' | 'growth' | 'creditors'>('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - replace with actual API call
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 12847,
          activeUsers: 3421,
          totalDebtsAnalyzed: 8934,
          totalViolationsDetected: 2156,
          totalGDPRRequests: 5623,
          totalTokensDistributed: 15234567,
          averageTrustScore: 42.7,
          collectiveActionParticipants: 892
        },
        trustScoreDistribution: {
          ranges: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
          counts: [1234, 2345, 3456, 1890, 1009]
        },
        violationTypes: {
          labels: ['Illegal Fees', 'GDPR Violations', 'Settlement Logic', 'Missing Documentation', 'Temporal Contradictions', 'Authority Misrepresentation'],
          data: [567, 432, 389, 298, 234, 236]
        },
        gdprActivity: {
          dates: generateDateLabels(30),
          sent: generateRandomData(30, 50, 150),
          responses: generateRandomData(30, 20, 80),
          violations: generateRandomData(30, 5, 30)
        },
        kindnessMetrics: {
          userWellbeing: 87,
          systemSustainability: 92,
          communityHealth: 78,
          longTermViability: 85,
          consciousnessAlignment: 94
        },
        tokenomics: {
          circulating: 450000000,
          staked: 180000000,
          rewards: 25000000,
          burned: 5000000
        },
        userGrowth: {
          dates: generateDateLabels(30),
          newUsers: generateRandomData(30, 20, 100),
          activeUsers: generateRandomData(30, 200, 500)
        },
        creditorAnalysis: {
          names: ['Inkasso Norge', 'Lindorff', 'Kredinor', 'Intrum', 'Sergel'],
          violations: [234, 189, 156, 145, 132],
          trustScores: [25, 31, 28, 35, 29]
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Sacred Architecture Analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span>📊</span> Sacred Architecture Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Mathematical insights serving consciousness and accountability
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 'week'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 'month'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 'year'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Year
          </button>
        </div>
        
        <button
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>🔄</span> Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={analyticsData.overview.totalUsers.toLocaleString()}
          icon="👥"
          change="+12.5%"
          positive={true}
        />
        <StatCard
          title="Debts Analyzed"
          value={analyticsData.overview.totalDebtsAnalyzed.toLocaleString()}
          icon="🧮"
          change="+8.3%"
          positive={true}
        />
        <StatCard
          title="Violations Detected"
          value={analyticsData.overview.totalViolationsDetected.toLocaleString()}
          icon="🚨"
          change="+23.7%"
          positive={true}
        />
        <StatCard
          title="Average Trust Score"
          value={`${analyticsData.overview.averageTrustScore}%`}
          icon="⚖️"
          change="-2.1%"
          positive={false}
        />
        <StatCard
          title="GDPR Requests"
          value={analyticsData.overview.totalGDPRRequests.toLocaleString()}
          icon="📜"
          change="+15.2%"
          positive={true}
        />
        <StatCard
          title="Tokens Distributed"
          value={formatTokenAmount(analyticsData.overview.totalTokensDistributed)}
          icon="💎"
          change="+18.9%"
          positive={true}
        />
        <StatCard
          title="Active Users"
          value={analyticsData.overview.activeUsers.toLocaleString()}
          icon="✨"
          change="+5.7%"
          positive={true}
        />
        <StatCard
          title="Collective Actions"
          value={analyticsData.overview.collectiveActionParticipants.toLocaleString()}
          icon="🤝"
          change="+31.2%"
          positive={true}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trust Score Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> Trust Score Distribution
          </h3>
          <Bar
            data={{
              labels: analyticsData.trustScoreDistribution.ranges,
              datasets: [{
                label: 'Number of Debts',
                data: analyticsData.trustScoreDistribution.counts,
                backgroundColor: 'rgba(102, 126, 234, 0.5)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>

        {/* Violation Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>⚠️</span> Violation Types Detected
          </h3>
          <Doughnut
            data={{
              labels: analyticsData.violationTypes.labels,
              datasets: [{
                data: analyticsData.violationTypes.data,
                backgroundColor: [
                  'rgba(239, 68, 68, 0.7)',
                  'rgba(245, 158, 11, 0.7)',
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(139, 92, 246, 0.7)',
                  'rgba(236, 72, 153, 0.7)'
                ],
                borderWidth: 0
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'right',
                  labels: { font: { size: 11 } }
                }
              }
            }}
          />
        </div>

        {/* GDPR Activity Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📈</span> GDPR Activity Timeline
          </h3>
          <Line
            data={{
              labels: analyticsData.gdprActivity.dates,
              datasets: [
                {
                  label: 'Requests Sent',
                  data: analyticsData.gdprActivity.sent,
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4
                },
                {
                  label: 'Responses',
                  data: analyticsData.gdprActivity.responses,
                  borderColor: 'rgb(16, 185, 129)',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4
                },
                {
                  label: 'Violations',
                  data: analyticsData.gdprActivity.violations,
                  borderColor: 'rgb(239, 68, 68)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  tension: 0.4
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>

        {/* Sacred Architecture Kindness Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>💝</span> Sacred Architecture Kindness Metrics
          </h3>
          <Radar
            data={{
              labels: [
                'User Wellbeing',
                'System Sustainability',
                'Community Health',
                'Long-term Viability',
                'Consciousness Alignment'
              ],
              datasets: [{
                label: 'Kindness Score',
                data: [
                  analyticsData.kindnessMetrics.userWellbeing,
                  analyticsData.kindnessMetrics.systemSustainability,
                  analyticsData.kindnessMetrics.communityHealth,
                  analyticsData.kindnessMetrics.longTermViability,
                  analyticsData.kindnessMetrics.consciousnessAlignment
                ],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(102, 126, 234, 1)',
                pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
              }]
            }}
            options={{
              responsive: true,
              scales: {
                r: {
                  beginAtZero: true,
                  max: 100,
                  ticks: { stepSize: 20 }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Tokenomics Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>💎</span> SWORD Token Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <TokenStat
            label="Circulating Supply"
            value={formatTokenAmount(analyticsData.tokenomics.circulating)}
            percentage={45}
            color="blue"
          />
          <TokenStat
            label="Staked Tokens"
            value={formatTokenAmount(analyticsData.tokenomics.staked)}
            percentage={18}
            color="green"
          />
          <TokenStat
            label="Rewards Pool"
            value={formatTokenAmount(analyticsData.tokenomics.rewards)}
            percentage={2.5}
            color="purple"
          />
          <TokenStat
            label="Burned Tokens"
            value={formatTokenAmount(analyticsData.tokenomics.burned)}
            percentage={0.5}
            color="red"
          />
        </div>
      </div>

      {/* Creditor Analysis */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🏛️</span> Top Violating Creditors
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creditor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Violations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Trust Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.creditorAnalysis.names.map((name, index) => (
                <tr key={name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-red-600 font-semibold">
                      {analyticsData.creditorAnalysis.violations[index]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className={`font-semibold ${
                        analyticsData.creditorAnalysis.trustScores[index] < 30 
                          ? 'text-red-600' 
                          : 'text-yellow-600'
                      }`}>
                        {analyticsData.creditorAnalysis.trustScores[index]}%
                      </span>
                      <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            analyticsData.creditorAnalysis.trustScores[index] < 30
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${analyticsData.creditorAnalysis.trustScores[index]}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Under Investigation
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sacred Architecture Footer */}
      <div className="text-center py-8 text-gray-600">
        <p className="text-sm">
          ⚔️ Sacred Architecture Analytics - Where data serves consciousness
        </p>
        <p className="text-xs mt-2">
          Every metric tracked, every insight gained, brings us closer to economic justice
        </p>
      </div>
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: string;
  change: string;
  positive: boolean;
}> = ({ title, value, icon, change, positive }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
      <span className={`text-sm font-semibold ${
        positive ? 'text-green-600' : 'text-red-600'
      }`}>
        {change}
      </span>
    </div>
    <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const TokenStat: React.FC<{
  label: string;
  value: string;
  percentage: number;
  color: string;
}> = ({ label, value, percentage, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold mb-2">{value}</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">{percentage}% of total</p>
    </div>
  );
};

// Helper Functions
function generateDateLabels(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(format(subDays(new Date(), i), 'MM/dd'));
  }
  return dates;
}

function generateRandomData(count: number, min: number, max: number): number[] {
  return Array.from({ length: count }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}

function formatTokenAmount(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toLocaleString();
}

export default AnalyticsDashboard;