import { PDIService } from './service';
import { DamoclesTriggerService } from './damocles-trigger';

export interface PDIMetrics {
  // User metrics
  totalUsers: number;
  activeUsers: number;
  newUsers: number;

  // Score distribution
  scoreDistribution: {
    healthy: number;
    caution: number;
    risky: number;
    critical: number;
  };

  // Financial health trends
  averageScore: number;
  medianScore: number;
  scoreImprovement: number;
  scoreDecline: number;

  // Alert metrics
  totalAlerts: number;
  criticalAlerts: number;
  alertsResolved: number;
  averageResolutionTime: number;

  // DAMOCLES integration
  protectionTriggers: number;
  gdprRequestsGenerated: number;
  usersSaved: number;

  // Performance metrics
  calculationTime: number;
  cacheHitRate: number;
  errorRate: number;

  timestamp: Date;
}

export interface AlertMetrics {
  totalAlerts: number;
  alertsByType: { [key: string]: number };
  alertsBySeverity: { [key: string]: number };
  unacknowledgedAlerts: number;
  averageResponseTime: number;
  escalatedAlerts: number;
}

export interface RegionalMetrics {
  regionCode: string;
  regionName: string;
  totalUsers: number;
  averageScore: number;
  criticalPercentage: number;
  improvementRate: number;
  comparisonToNational: number;
}

export class PDIMonitoringService {
  private pdiService: PDIService;
  private damoclesService: DamoclesTriggerService;
  private metricsCache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(pdiService: PDIService) {
    this.pdiService = pdiService;
    this.damoclesService = new DamoclesTriggerService();
  }

  /**
   * Get comprehensive PDI metrics
   */
  async getPDIMetrics(): Promise<PDIMetrics> {
    const cacheKey = 'pdi_metrics';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const startTime = Date.now();

    try {
      const [
        basicAnalytics,
        userMetrics,
        alertMetrics,
        triggerMetrics,
        performanceMetrics
      ] = await Promise.all([
        this.pdiService.getDashboardAnalytics(),
        this.getUserMetrics(),
        this.getAlertMetrics(),
        this.damoclesService.getTriggerAnalytics(),
        this.getPerformanceMetrics()
      ]);

      const metrics: PDIMetrics = {
        // User metrics
        totalUsers: basicAnalytics.totalProfiles,
        activeUsers: userMetrics.activeUsers,
        newUsers: userMetrics.newUsers,

        // Score distribution
        scoreDistribution: {
          healthy: basicAnalytics.healthyProfiles,
          caution: basicAnalytics.cautionProfiles,
          risky: basicAnalytics.riskyProfiles,
          critical: basicAnalytics.criticalProfiles
        },

        // Financial health trends
        averageScore: basicAnalytics.averageScore,
        medianScore: await this.getMedianScore(),
        scoreImprovement: await this.getScoreImprovementCount(),
        scoreDecline: await this.getScoreDeclineCount(),

        // Alert metrics
        totalAlerts: alertMetrics.totalAlerts,
        criticalAlerts: alertMetrics.criticalAlerts,
        alertsResolved: alertMetrics.alertsResolved,
        averageResolutionTime: alertMetrics.averageResolutionTime,

        // DAMOCLES integration
        protectionTriggers: triggerMetrics.totalTriggers,
        gdprRequestsGenerated: triggerMetrics.totalTriggers, // 1:1 mapping for now
        usersSaved: await this.getUsersSavedCount(),

        // Performance metrics
        calculationTime: Date.now() - startTime,
        cacheHitRate: performanceMetrics.cacheHitRate,
        errorRate: performanceMetrics.errorRate,

        timestamp: new Date()
      };

      this.setCache(cacheKey, metrics);
      return metrics;

    } catch (error) {
      console.error('Failed to get PDI metrics:', error);
      throw error;
    }
  }

  /**
   * Get alert-specific metrics
   */
  async getAlertMetrics(): Promise<AlertMetrics> {
    const cacheKey = 'alert_metrics';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // This would query the database for alert statistics
    // For now, return mock data
    const metrics: AlertMetrics = {
      totalAlerts: 156,
      alertsByType: {
        'score_critical': 45,
        'rapid_decline': 32,
        'metric_warning': 67,
        'improvement': 12
      },
      alertsBySeverity: {
        'low': 23,
        'medium': 89,
        'high': 34,
        'critical': 10
      },
      unacknowledgedAlerts: 23,
      averageResponseTime: 4.2, // hours
      escalatedAlerts: 8
    };

    this.setCache(cacheKey, metrics);
    return metrics;
  }

  /**
   * Get regional breakdown metrics
   */
  async getRegionalMetrics(): Promise<RegionalMetrics[]> {
    const cacheKey = 'regional_metrics';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const regionalData = await this.pdiService.getRegionalData();
    const nationalAverage = await this.getNationalAverage();

    const metrics: RegionalMetrics[] = regionalData.map(region => ({
      regionCode: region.regionCode,
      regionName: region.regionName,
      totalUsers: region.totalProfiles,
      averageScore: region.averagePDI || 0,
      criticalPercentage: region.criticalPercentage || 0,
      improvementRate: 0, // Would calculate from historical data
      comparisonToNational: ((region.averagePDI || 0) - nationalAverage) / nationalAverage * 100
    }));

    this.setCache(cacheKey, metrics);
    return metrics;
  }

  /**
   * Get real-time dashboard data
   */
  async getRealTimeDashboard(): Promise<any> {
    const [
      pdiMetrics,
      alertMetrics,
      regionalMetrics,
      trends
    ] = await Promise.all([
      this.getPDIMetrics(),
      this.getAlertMetrics(),
      this.getRegionalMetrics(),
      this.getTrendData()
    ]);

    return {
      summary: {
        totalUsers: pdiMetrics.totalUsers,
        averageScore: pdiMetrics.averageScore,
        criticalUsers: pdiMetrics.scoreDistribution.critical,
        protectionTriggers: pdiMetrics.protectionTriggers
      },
      scoreDistribution: pdiMetrics.scoreDistribution,
      alerts: {
        total: alertMetrics.totalAlerts,
        unacknowledged: alertMetrics.unacknowledgedAlerts,
        critical: alertMetrics.criticalAlerts
      },
      regional: regionalMetrics.slice(0, 5), // Top 5 regions
      trends: trends,
      lastUpdated: new Date()
    };
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<any> {
    const healthCheck = await this.pdiService.healthCheck();
    const performanceMetrics = await this.getPerformanceMetrics();

    return {
      status: healthCheck.status,
      services: healthCheck.services,
      performance: {
        averageResponseTime: performanceMetrics.averageResponseTime,
        errorRate: performanceMetrics.errorRate,
        throughput: performanceMetrics.throughput
      },
      cache: healthCheck.cache,
      alerts: await this.getSystemAlerts(),
      timestamp: new Date()
    };
  }

  /**
   * Generate usage report
   */
  async generateUsageReport(startDate: Date, endDate: Date): Promise<any> {
    return {
      period: {
        start: startDate,
        end: endDate,
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      usage: {
        totalCalculations: await this.getCalculationsInPeriod(startDate, endDate),
        uniqueUsers: await this.getUniqueUsersInPeriod(startDate, endDate),
        averageDailyActive: await this.getAverageDailyActive(startDate, endDate)
      },
      outcomes: {
        scoresImproved: await this.getScoresImprovedInPeriod(startDate, endDate),
        scoresDeclined: await this.getScoresDeclinedInPeriod(startDate, endDate),
        damoclesTriggered: await this.getDamoclesTriggersInPeriod(startDate, endDate)
      },
      topPerformingRegions: await this.getTopPerformingRegions(startDate, endDate),
      generatedAt: new Date()
    };
  }

  // Helper methods for metrics calculation
  private async getUserMetrics(): Promise<any> {
    // Mock implementation - would query actual database
    return {
      activeUsers: 89,
      newUsers: 12
    };
  }

  private async getMedianScore(): Promise<number> {
    // Mock implementation - would calculate from database
    return 67.5;
  }

  private async getScoreImprovementCount(): Promise<number> {
    // Mock implementation - would compare historical scores
    return 34;
  }

  private async getScoreDeclineCount(): Promise<number> {
    // Mock implementation - would compare historical scores
    return 18;
  }

  private async getUsersSavedCount(): Promise<number> {
    // Mock implementation - would count users with successful DAMOCLES interventions
    return 23;
  }

  private async getPerformanceMetrics(): Promise<any> {
    return {
      averageResponseTime: 245, // ms
      errorRate: 0.02, // 2%
      cacheHitRate: 0.78, // 78%
      throughput: 150 // requests per minute
    };
  }

  private async getNationalAverage(): Promise<number> {
    const analytics = await this.pdiService.getDashboardAnalytics();
    return analytics.averageScore;
  }

  private async getTrendData(): Promise<any> {
    // Mock trend data - would calculate from historical records
    return {
      scoreTrend: [65, 67, 69, 68, 70, 72, 71],
      userGrowth: [100, 120, 145, 178, 203, 234, 267],
      criticalUsers: [15, 18, 22, 19, 17, 14, 12]
    };
  }

  private async getSystemAlerts(): Promise<any[]> {
    return [
      {
        type: 'warning',
        message: 'Cache hit rate below optimal (78%)',
        timestamp: new Date()
      }
    ];
  }

  private async getCalculationsInPeriod(start: Date, end: Date): Promise<number> {
    // Mock implementation
    return 1247;
  }

  private async getUniqueUsersInPeriod(start: Date, end: Date): Promise<number> {
    // Mock implementation
    return 156;
  }

  private async getAverageDailyActive(start: Date, end: Date): Promise<number> {
    // Mock implementation
    return 34;
  }

  private async getScoresImprovedInPeriod(start: Date, end: Date): Promise<number> {
    // Mock implementation
    return 67;
  }

  private async getScoresDeclinedInPeriod(start: Date, end: Date): Promise<number> {
    // Mock implementation
    return 23;
  }

  private async getDamoclesTriggersInPeriod(start: Date, end: Date): Promise<number> {
    // Mock implementation
    return 12;
  }

  private async getTopPerformingRegions(start: Date, end: Date): Promise<any[]> {
    // Mock implementation
    return [
      { regionName: 'Oslo', improvementRate: 15.2 },
      { regionName: 'Bergen', improvementRate: 12.8 },
      { regionName: 'Trondheim', improvementRate: 11.5 }
    ];
  }

  // Cache management
  private getFromCache(key: string): any | null {
    const cached = this.metricsCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.metricsCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export default PDIMonitoringService;