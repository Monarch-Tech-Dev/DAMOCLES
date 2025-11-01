'use client';

/**
 * Advanced Dashboard
 *
 * Comprehensive dashboard for experienced users showing all metrics,
 * charts, and advanced features with consistent design language.
 */

import { TrendingDown, TrendingUp, Shield, Coins, AlertTriangle, CheckCircle, Calendar, FileText, Activity } from 'lucide-react';
import { UserProgressState } from '@/lib/user-progress';
import Link from 'next/link';

interface AdvancedDashboardProps {
  user: {
    name: string;
    swordTokenBalance: number;
    shieldTier: string;
  };
  metrics: {
    totalDebts: number;
    activeGdprRequests: number;
    violationsDetected: number;
    totalRecoveryAmount: number;
    pdiScore?: number;
  };
  recentCases: Array<{
    id: string;
    creditorName: string;
    status: string;
    debtAmount: number;
    createdAt: Date;
  }>;
  progressState: UserProgressState;
}

export function AdvancedDashboard({ user, metrics, recentCases, progressState }: AdvancedDashboardProps) {
  const pdiScore = metrics.pdiScore || 42; // Mock for now
  const pdiChange = -3; // Mock
  const totalSaved = 24500; // Mock
  const totalSavedChange = 5200; // Mock

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">God morgen, {user.name}!</h2>
        <p className="text-indigo-100 text-lg">
          Here's your comprehensive debt protection and financial health overview
        </p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* PDI Score */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">PDI Score</span>
            <Activity className="text-indigo-600" size={20} />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold text-gray-900">{pdiScore}</span>
            <span className={`text-sm font-medium flex items-center gap-1 ${pdiChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {pdiChange < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
              {Math.abs(pdiChange)} vs last month
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${pdiScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* SWORD Tokens */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">SWORD Tokens</span>
            <Coins className="text-yellow-600" size={20} />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold text-gray-900">{user.swordTokenBalance}</span>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <TrendingUp size={16} />
              +25 this month
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {user.shieldTier} tier
          </p>
        </div>

        {/* Total Saved */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Saved</span>
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold text-gray-900">{totalSaved.toLocaleString()}</span>
            <span className="text-sm font-medium text-gray-600">NOK</span>
          </div>
          <p className="text-xs text-green-600 mt-2">
            +{totalSavedChange.toLocaleString()} this month
          </p>
        </div>

        {/* Active Protections */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Active Protections</span>
            <Shield className="text-blue-600" size={20} />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold text-gray-900">{metrics.totalDebts}</span>
            <span className="text-sm font-medium text-gray-600">debts</span>
          </div>
          <p className="text-xs text-orange-600 mt-2">
            {metrics.violationsDetected} violations detected
          </p>
        </div>
      </div>

      {/* PDI Alert (if score is low) */}
      {pdiScore < 50 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-orange-900 mb-1">Enhanced Protection Recommended</h3>
              <p className="text-sm text-orange-800 mb-3">
                Your PDI score indicates potential financial stress. DAMOCLES protection is actively monitoring your debt portfolio for violations and preparing legal responses.
              </p>
              <Link
                href="/pdi-health-check"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
              >
                View PDI Assessment
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Debt Portfolio Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Debt Portfolio Overview</h3>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
                <option>Last 6 months</option>
                <option>Last year</option>
                <option>All time</option>
              </select>
            </div>

            {/* Simple bar chart representation */}
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Monthly debt levels and violation detection</p>
              <div className="flex items-end justify-between h-48 gap-2">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                  const height = Math.random() * 100;
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: `${height}%`, minHeight: '20px' }}>
                        <div className="absolute bottom-0 w-full bg-indigo-600 rounded-t-lg" style={{ height: '100%' }} />
                      </div>
                      <span className="text-xs text-gray-600">{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Financial Health Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Financial Health Metrics</h3>
            <div className="grid grid-cols-2 gap-6">
              <MetricCard
                label="Debt Reduction Progress"
                value="15.2%"
                change="+2.3%"
                trend="up"
                comparison="vs. 6 months ago"
              />
              <MetricCard
                label="Violation Detection Rate"
                value="23%"
                change="-5%"
                trend="down"
                comparison="of debt portfolio"
              />
              <MetricCard
                label="Settlement Success Rate"
                value="85%"
                change="+10%"
                trend="up"
                comparison="historical average"
              />
              <MetricCard
                label="Protection Coverage"
                value="100%"
                change="0%"
                trend="neutral"
                comparison="of registered debts"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
            <p className="text-sm text-gray-600 mb-4">Latest protection actions and alerts</p>
            <div className="space-y-3">
              {[
                { text: 'High interest rate detected - Collector ABC', date: '2024-01-15', type: 'alert' },
                { text: 'GDPR request sent to Credit Agency XYZ', date: '2024-01-14', type: 'action' },
                { text: 'Settlement reached with Debt Collector Inc', date: '2024-01-12', type: 'success' },
                { text: `PDI score updated: ${pdiScore} (Fair)`, date: '2024-01-10', type: 'info' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    activity.type === 'alert' ? 'bg-red-500' :
                    activity.type === 'action' ? 'bg-blue-500' :
                    activity.type === 'success' ? 'bg-green-500' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Status */}
        <div className="space-y-6">
          {/* Protection Status */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-blue-200" size={32} />
              <div>
                <h3 className="font-bold text-lg">DAMOCLES Protection Active</h3>
                <p className="text-sm text-blue-200 uppercase tracking-wide">{user.shieldTier}</p>
              </div>
            </div>
            <p className="text-sm text-blue-100 mb-4">
              Monitoring {metrics.totalDebts} active debts, {metrics.violationsDetected} violations detected this quarter.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-200">
              <CheckCircle size={14} />
              <span>All systems operational</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <p className="text-sm text-gray-600 mb-4">Manage your debt protection</p>
            <div className="space-y-3">
              <QuickActionButton
                href="/pdi-health-check"
                icon={<Activity size={18} />}
                label="Update PDI Assessment"
              />
              <QuickActionButton
                href="/debts?action=add"
                icon={<FileText size={18} />}
                label="Add New Debt"
              />
              <QuickActionButton
                href="/debts"
                icon={<Shield size={18} />}
                label="Review Debt Portfolio"
              />
              <QuickActionButton
                href="/recoveries"
                icon={<Coins size={18} />}
                label="Recovery Dashboard"
              />
            </div>
          </div>

          {/* Active Cases Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Active Cases</h3>
            <div className="space-y-3">
              {recentCases.slice(0, 3).map((debt) => (
                <Link
                  key={debt.id}
                  href={`/debts/${debt.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm">{debt.creditorName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      debt.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {debt.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-indigo-600">{debt.debtAmount.toLocaleString()} NOK</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Added {debt.createdAt.toLocaleDateString('no-NO')}
                  </p>
                </Link>
              ))}
              {recentCases.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No active cases</p>
              )}
            </div>
            {recentCases.length > 3 && (
              <Link
                href="/debts"
                className="block mt-4 text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all {recentCases.length} cases →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, trend, comparison }: {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  comparison: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {trend !== 'neutral' && (
          <span className={`text-sm font-medium flex items-center gap-1 ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {change}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500">{comparison}</p>
    </div>
  );
}

function QuickActionButton({ href, icon, label }: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
    >
      <div className="text-gray-600 group-hover:text-indigo-600 transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-900">
        {label}
      </span>
    </Link>
  );
}
