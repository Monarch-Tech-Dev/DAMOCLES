'use client';

/**
 * Progressive Metric Cards
 *
 * Metric cards that adapt their complexity based on dashboard mode:
 * - Simple: Just value and icon (beginner)
 * - Standard: Value, trend, and description (intermediate)
 * - Detailed: Full breakdown with sparkline, comparison, and drill-down (advanced)
 */

import { TrendingUp, TrendingDown, Minus, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

export type MetricTrend = 'up' | 'down' | 'neutral';
export type MetricVariant = 'simple' | 'standard' | 'detailed';

interface BaseMetricData {
  id: string;
  label: string;
  value: number | string;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  unit?: string;
  formatValue?: (value: number | string) => string;
}

interface StandardMetricData extends BaseMetricData {
  trend?: MetricTrend;
  trendValue?: string;
  trendLabel?: string;
  description?: string;
  detailUrl?: string;
}

interface DetailedMetricData extends StandardMetricData {
  breakdown?: Array<{
    label: string;
    value: number;
    percentage?: number;
    color?: string;
  }>;
  comparison?: {
    label: string;
    value: number;
    type: 'previous_period' | 'target' | 'average';
  };
  sparklineData?: number[];
  actionUrl?: string;
  actionLabel?: string;
}

interface ProgressiveMetricCardProps {
  data: DetailedMetricData;
  variant?: MetricVariant;
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    gradient: 'from-green-500 to-green-600',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    gradient: 'from-red-500 to-red-600',
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
    gradient: 'from-yellow-500 to-yellow-600',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    gradient: 'from-purple-500 to-purple-600',
  },
  gray: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
    gradient: 'from-gray-500 to-gray-600',
  },
};

export function ProgressiveMetricCard({
  data,
  variant = 'standard',
  className = '',
}: ProgressiveMetricCardProps) {
  if (variant === 'simple') {
    return <SimpleMetricCard data={data} className={className} />;
  }

  if (variant === 'detailed') {
    return <DetailedMetricCard data={data} className={className} />;
  }

  return <StandardMetricCard data={data} className={className} />;
}

/**
 * Simple variant - minimal information for beginners
 */
function SimpleMetricCard({ data, className }: { data: BaseMetricData; className: string }) {
  const colors = colorClasses[data.color || 'blue'];
  const displayValue = data.formatValue
    ? data.formatValue(data.value)
    : typeof data.value === 'number'
    ? data.value.toLocaleString()
    : data.value;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">{data.label}</h3>
        {data.icon && <div className="text-2xl">{data.icon}</div>}
      </div>
      <p className={`text-3xl font-bold ${colors.text}`}>
        {displayValue}
        {data.unit && <span className="text-xl ml-1">{data.unit}</span>}
      </p>
    </div>
  );
}

/**
 * Standard variant - balanced view with trend
 */
function StandardMetricCard({ data, className }: { data: StandardMetricData; className: string }) {
  const colors = colorClasses[data.color || 'blue'];
  const displayValue = data.formatValue
    ? data.formatValue(data.value)
    : typeof data.value === 'number'
    ? data.value.toLocaleString()
    : data.value;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{data.label}</h3>
        {data.icon && <div className={`text-2xl ${colors.text}`}>{data.icon}</div>}
      </div>

      <div className="mb-2">
        <p className={`text-3xl font-bold ${colors.text}`}>
          {displayValue}
          {data.unit && <span className="text-xl ml-1">{data.unit}</span>}
        </p>
      </div>

      {/* Trend Indicator */}
      {data.trend && data.trendValue && (
        <div className="flex items-center gap-2 mb-2">
          {data.trend === 'up' && <TrendingUp className="text-green-500" size={16} />}
          {data.trend === 'down' && <TrendingDown className="text-red-500" size={16} />}
          {data.trend === 'neutral' && <Minus className="text-gray-400" size={16} />}
          <span
            className={`text-sm font-medium ${
              data.trend === 'up'
                ? 'text-green-600'
                : data.trend === 'down'
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            {data.trendValue}
          </span>
          {data.trendLabel && <span className="text-sm text-gray-500">{data.trendLabel}</span>}
        </div>
      )}

      {/* Description */}
      {data.description && <p className="text-sm text-gray-600 mb-3">{data.description}</p>}

      {/* Detail Link */}
      {data.detailUrl && (
        <Link
          href={data.detailUrl}
          className={`text-sm ${colors.text} hover:underline font-medium inline-flex items-center gap-1`}
        >
          Se detaljer
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

/**
 * Detailed variant - comprehensive view with breakdown
 */
function DetailedMetricCard({ data, className }: { data: DetailedMetricData; className: string }) {
  const colors = colorClasses[data.color || 'blue'];
  const displayValue = data.formatValue
    ? data.formatValue(data.value)
    : typeof data.value === 'number'
    ? data.value.toLocaleString()
    : data.value;

  return (
    <div className={`bg-white rounded-lg border-2 ${colors.border} p-6 hover:shadow-lg transition-all ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900">{data.label}</h3>
            {data.description && (
              <div className="group relative">
                <Info className="text-gray-400 cursor-help" size={14} />
                <div className="absolute left-0 top-6 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-2 w-48 z-10">
                  {data.description}
                </div>
              </div>
            )}
          </div>
        </div>
        {data.icon && (
          <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center text-2xl`}>
            {data.icon}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <p className={`text-4xl font-bold ${colors.text}`}>
          {displayValue}
          {data.unit && <span className="text-2xl ml-1">{data.unit}</span>}
        </p>

        {/* Trend */}
        {data.trend && data.trendValue && (
          <div className="flex items-center gap-2 mt-2">
            {data.trend === 'up' && <TrendingUp className="text-green-500" size={18} />}
            {data.trend === 'down' && <TrendingDown className="text-red-500" size={18} />}
            {data.trend === 'neutral' && <Minus className="text-gray-400" size={18} />}
            <span
              className={`text-sm font-semibold ${
                data.trend === 'up'
                  ? 'text-green-600'
                  : data.trend === 'down'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {data.trendValue}
            </span>
            {data.trendLabel && <span className="text-sm text-gray-500">{data.trendLabel}</span>}
          </div>
        )}
      </div>

      {/* Sparkline (if data available) */}
      {data.sparklineData && data.sparklineData.length > 0 && (
        <div className="mb-4">
          <MiniSparkline data={data.sparklineData} color={data.color || 'blue'} />
        </div>
      )}

      {/* Breakdown */}
      {data.breakdown && data.breakdown.length > 0 && (
        <div className="mb-4 space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Oversikt</h4>
          {data.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {item.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <span className="text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{item.value.toLocaleString()}</span>
                {item.percentage !== undefined && (
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison */}
      {data.comparison && (
        <div className={`${colors.bg} rounded-lg p-3 mb-4`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {data.comparison.type === 'previous_period'
                ? 'Forrige periode'
                : data.comparison.type === 'target'
                ? 'Mål'
                : 'Gjennomsnitt'}
            </span>
            <span className={`text-sm font-semibold ${colors.text}`}>
              {data.comparison.value.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {data.detailUrl && (
          <Link
            href={data.detailUrl}
            className={`flex-1 text-center px-4 py-2 border-2 ${colors.border} ${colors.text} rounded-lg hover:${colors.bg} transition-colors text-sm font-medium`}
          >
            Se detaljer
          </Link>
        )}
        {data.actionUrl && (
          <Link
            href={data.actionUrl}
            className={`flex-1 text-center px-4 py-2 bg-gradient-to-r ${colors.gradient} text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium`}
          >
            {data.actionLabel || 'Handling'}
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Mini sparkline chart component
 */
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = range === 0 ? 50 : 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const colors = colorClasses[color as keyof typeof colorClasses];
  const strokeColor = colors.text.replace('text-', '');

  return (
    <div className="w-full h-12 relative">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={`currentColor`}
          strokeWidth="2"
          className={colors.text}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/**
 * Grid layout for metric cards
 */
export function MetricCardGrid({
  children,
  columns = 4,
  className = '',
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={`grid ${gridClasses[columns]} gap-4 ${className}`}>{children}</div>;
}
