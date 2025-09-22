'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Activity,
  Clock,
  Database,
  Zap
} from 'lucide-react';

interface PDIMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  scoreDistribution: {
    healthy: number;
    caution: number;
    risky: number;
    critical: number;
  };
  averageScore: number;
  medianScore: number;
  scoreImprovement: number;
  scoreDecline: number;
  totalAlerts: number;
  criticalAlerts: number;
  alertsResolved: number;
  averageResolutionTime: number;
  protectionTriggers: number;
  gdprRequestsGenerated: number;
  usersSaved: number;
  calculationTime: number;
  cacheHitRate: number;
  errorRate: number;
  timestamp: string;
}

interface SystemHealth {
  status: string;
  services: {
    database: string;
    cache: string;
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  alerts: any[];
  timestamp: string;
}

export function PDIMonitoringDashboard() {
  const [metrics, setMetrics] = useState<PDIMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      const [metricsRes, healthRes] = await Promise.all([
        fetch('/api/pdi/analytics'),
        fetch('/api/pdi/health')
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.pdi);
      }

      if (healthRes.ok) {
        const data = await healthRes.json();
        setSystemHealth(data);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': case 'connected': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      connected: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      disconnected: 'bg-red-100 text-red-800'
    };
    return colors[status.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PDI Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights into PDI system performance and user financial health
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Last update: {lastUpdate?.toLocaleTimeString('no-NO')}
          </div>
          <Badge className={systemHealth ? getStatusBadge(systemHealth.status) : 'bg-gray-100'}>
            {systemHealth?.status || 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics?.totalUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics?.newUsers || 0} new this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average PDI Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.averageScore?.toFixed(1) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Median: {metrics?.medianScore?.toFixed(1) || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protection Triggers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.protectionTriggers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.usersSaved || 0} users saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.performance.averageResponseTime || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {((systemHealth?.performance.errorRate || 0) * 100).toFixed(2)}% error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>PDI Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-sm">Healthy (80-100)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{metrics?.scoreDistribution.healthy || 0}</span>
                <div className="w-24">
                  <Progress
                    value={((metrics?.scoreDistribution.healthy || 0) / (metrics?.totalUsers || 1)) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span className="text-sm">Caution (60-79)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{metrics?.scoreDistribution.caution || 0}</span>
                <div className="w-24">
                  <Progress
                    value={((metrics?.scoreDistribution.caution || 0) / (metrics?.totalUsers || 1)) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-sm">Risky (40-59)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{metrics?.scoreDistribution.risky || 0}</span>
                <div className="w-24">
                  <Progress
                    value={((metrics?.scoreDistribution.risky || 0) / (metrics?.totalUsers || 1)) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-sm">Critical (0-39)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{metrics?.scoreDistribution.critical || 0}</span>
                <div className="w-24">
                  <Progress
                    value={((metrics?.scoreDistribution.critical || 0) / (metrics?.totalUsers || 1)) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge className={getStatusBadge(systemHealth?.services.database || 'unknown')}>
                  {systemHealth?.services.database || 'Unknown'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Cache</span>
                <Badge className={getStatusBadge(systemHealth?.services.cache || 'unknown')}>
                  {systemHealth?.services.cache || 'Unknown'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Cache Hit Rate</span>
                <span className="text-sm font-medium">
                  {((metrics?.cacheHitRate || 0) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Throughput</span>
                <span className="text-sm font-medium">
                  {systemHealth?.performance.throughput || 0} req/min
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alerts & Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Alerts</span>
                <span className="text-sm font-medium">{metrics?.totalAlerts || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Critical Alerts</span>
                <span className="text-sm font-medium text-red-600">
                  {metrics?.criticalAlerts || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Resolved Alerts</span>
                <span className="text-sm font-medium text-green-600">
                  {metrics?.alertsResolved || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Resolution Time</span>
                <span className="text-sm font-medium">
                  {metrics?.averageResolutionTime?.toFixed(1) || 0}h
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Score Improvements</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {metrics?.scoreImprovement || 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Score Declines</span>
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">
                    {metrics?.scoreDecline || 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-blue-600">
                {metrics?.calculationTime || 0}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Calculation Time</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-600">
                {((metrics?.cacheHitRate || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-purple-600">
                {((metrics?.errorRate || 0) * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      {systemHealth?.alerts && systemHealth.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealth.alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{alert.type}</Badge>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString('no-NO')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}