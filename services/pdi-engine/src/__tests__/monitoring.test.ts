import { PDIMonitoringService } from '../monitoring';
import { PDIService } from '../service';
import { DamoclesTriggerService } from '../damocles-trigger';

// Mock dependencies
jest.mock('../service');
jest.mock('../damocles-trigger');

describe('PDIMonitoringService', () => {
  let monitoringService: PDIMonitoringService;
  let mockPDIService: jest.Mocked<PDIService>;
  let mockDamoclesService: jest.Mocked<DamoclesTriggerService>;

  beforeEach(() => {
    mockPDIService = {
      getDashboardAnalytics: jest.fn(),
      getRegionalData: jest.fn(),
      healthCheck: jest.fn()
    } as any;

    mockDamoclesService = {
      getTriggerAnalytics: jest.fn()
    } as any;

    monitoringService = new PDIMonitoringService(mockPDIService);

    // Replace the internal DamoclesTriggerService with our mock
    (monitoringService as any).damoclesService = mockDamoclesService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPDIMetrics', () => {
    const mockBasicAnalytics = {
      totalProfiles: 1000,
      healthyProfiles: 400,
      cautionProfiles: 350,
      riskyProfiles: 200,
      criticalProfiles: 50,
      averageScore: 67.5,
      criticalPercentage: 5.0
    };

    const mockTriggerAnalytics = {
      totalTriggers: 25,
      criticalTriggers: 15,
      avgResponseTime: 1.2
    };

    beforeEach(() => {
      mockPDIService.getDashboardAnalytics.mockResolvedValue(mockBasicAnalytics);
      mockDamoclesService.getTriggerAnalytics.mockResolvedValue(mockTriggerAnalytics);

      // Mock the private methods
      jest.spyOn(monitoringService as any, 'getUserMetrics')
        .mockResolvedValue({ activeUsers: 89, newUsers: 12 });
      jest.spyOn(monitoringService as any, 'getAlertMetrics')
        .mockResolvedValue({
          totalAlerts: 156,
          criticalAlerts: 23,
          alertsResolved: 89,
          averageResolutionTime: 4.2
        });
      jest.spyOn(monitoringService as any, 'getPerformanceMetrics')
        .mockResolvedValue({
          averageResponseTime: 245,
          errorRate: 0.02,
          cacheHitRate: 0.78,
          throughput: 150
        });
      jest.spyOn(monitoringService as any, 'getMedianScore')
        .mockResolvedValue(67.5);
      jest.spyOn(monitoringService as any, 'getScoreImprovementCount')
        .mockResolvedValue(34);
      jest.spyOn(monitoringService as any, 'getScoreDeclineCount')
        .mockResolvedValue(18);
      jest.spyOn(monitoringService as any, 'getUsersSavedCount')
        .mockResolvedValue(23);
    });

    it('should return comprehensive PDI metrics', async () => {
      const result = await monitoringService.getPDIMetrics();

      expect(result).toMatchObject({
        totalUsers: 1000,
        activeUsers: 89,
        newUsers: 12,
        scoreDistribution: {
          healthy: 400,
          caution: 350,
          risky: 200,
          critical: 50
        },
        averageScore: 67.5,
        medianScore: 67.5,
        scoreImprovement: 34,
        scoreDecline: 18,
        totalAlerts: 156,
        criticalAlerts: 23,
        alertsResolved: 89,
        averageResolutionTime: 4.2,
        protectionTriggers: 25,
        gdprRequestsGenerated: 25,
        usersSaved: 23
      });

      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.calculationTime).toBeGreaterThan(0);
      expect(result.cacheHitRate).toBe(0.78);
      expect(result.errorRate).toBe(0.02);
    });

    it('should cache results', async () => {
      // First call
      await monitoringService.getPDIMetrics();

      // Second call should use cache (won't call service methods again)
      const result2 = await monitoringService.getPDIMetrics();

      expect(mockPDIService.getDashboardAnalytics).toHaveBeenCalledTimes(1);
      expect(result2).toBeDefined();
    });

    it('should handle service errors', async () => {
      mockPDIService.getDashboardAnalytics.mockRejectedValue(new Error('Service error'));

      await expect(monitoringService.getPDIMetrics()).rejects.toThrow('Service error');
    });
  });

  describe('getAlertMetrics', () => {
    it('should return alert metrics', async () => {
      const result = await monitoringService.getAlertMetrics();

      expect(result).toMatchObject({
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
        averageResponseTime: 4.2,
        escalatedAlerts: 8
      });
    });

    it('should cache alert metrics', async () => {
      // First call
      const result1 = await monitoringService.getAlertMetrics();

      // Second call should return cached result
      const result2 = await monitoringService.getAlertMetrics();

      expect(result1).toEqual(result2);
    });
  });

  describe('getRegionalMetrics', () => {
    const mockRegionalData = [
      {
        regionCode: 'NO-OSLO',
        regionName: 'Oslo',
        totalProfiles: 500,
        averagePDI: 72.5,
        criticalPercentage: 8.0
      },
      {
        regionCode: 'NO-BERGEN',
        regionName: 'Bergen',
        totalProfiles: 300,
        averagePDI: 68.2,
        criticalPercentage: 12.3
      }
    ];

    beforeEach(() => {
      mockPDIService.getRegionalData.mockResolvedValue(mockRegionalData);
      jest.spyOn(monitoringService as any, 'getNationalAverage')
        .mockResolvedValue(70.0);
    });

    it('should return regional metrics with comparisons', async () => {
      const result = await monitoringService.getRegionalMetrics();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        regionCode: 'NO-OSLO',
        regionName: 'Oslo',
        totalUsers: 500,
        averageScore: 72.5,
        criticalPercentage: 8.0,
        comparisonToNational: expect.closeTo(3.57, 1) // (72.5 - 70) / 70 * 100
      });
    });

    it('should cache regional metrics', async () => {
      // First call
      await monitoringService.getRegionalMetrics();

      // Second call should use cache
      await monitoringService.getRegionalMetrics();

      expect(mockPDIService.getRegionalData).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRealTimeDashboard', () => {
    beforeEach(() => {
      // Mock all the methods that getRealTimeDashboard calls
      jest.spyOn(monitoringService, 'getPDIMetrics').mockResolvedValue({
        totalUsers: 1000,
        averageScore: 67.5,
        scoreDistribution: { healthy: 400, caution: 350, risky: 200, critical: 50 },
        protectionTriggers: 25
      } as any);

      jest.spyOn(monitoringService, 'getAlertMetrics').mockResolvedValue({
        totalAlerts: 156,
        unacknowledgedAlerts: 23,
        criticalAlerts: 15
      } as any);

      jest.spyOn(monitoringService, 'getRegionalMetrics').mockResolvedValue([
        { regionName: 'Oslo', averageScore: 72.5 },
        { regionName: 'Bergen', averageScore: 68.2 }
      ] as any);

      jest.spyOn(monitoringService as any, 'getTrendData').mockResolvedValue({
        scoreTrend: [65, 67, 69, 68, 70, 72, 71],
        userGrowth: [100, 120, 145, 178, 203, 234, 267],
        criticalUsers: [15, 18, 22, 19, 17, 14, 12]
      });
    });

    it('should return real-time dashboard data', async () => {
      const result = await monitoringService.getRealTimeDashboard();

      expect(result).toMatchObject({
        summary: {
          totalUsers: 1000,
          averageScore: 67.5,
          criticalUsers: 50,
          protectionTriggers: 25
        },
        scoreDistribution: {
          healthy: 400,
          caution: 350,
          risky: 200,
          critical: 50
        },
        alerts: {
          total: 156,
          unacknowledged: 23,
          critical: 15
        },
        regional: expect.arrayContaining([
          expect.objectContaining({ regionName: 'Oslo' })
        ]),
        trends: expect.any(Object)
      });

      expect(result.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('getSystemHealth', () => {
    const mockHealthCheck = {
      status: 'healthy',
      services: {
        database: 'connected',
        cache: 'connected'
      },
      cache: {
        totalKeys: 150,
        connected: true
      }
    };

    const mockPerformanceMetrics = {
      averageResponseTime: 245,
      errorRate: 0.02,
      throughput: 150
    };

    beforeEach(() => {
      mockPDIService.healthCheck.mockResolvedValue(mockHealthCheck);
      jest.spyOn(monitoringService as any, 'getPerformanceMetrics')
        .mockResolvedValue(mockPerformanceMetrics);
      jest.spyOn(monitoringService as any, 'getSystemAlerts')
        .mockResolvedValue([
          {
            type: 'warning',
            message: 'Cache hit rate below optimal (78%)',
            timestamp: new Date()
          }
        ]);
    });

    it('should return system health metrics', async () => {
      const result = await monitoringService.getSystemHealth();

      expect(result).toMatchObject({
        status: 'healthy',
        services: {
          database: 'connected',
          cache: 'connected'
        },
        performance: {
          averageResponseTime: 245,
          errorRate: 0.02,
          throughput: 150
        },
        cache: {
          totalKeys: 150,
          connected: true
        },
        alerts: expect.arrayContaining([
          expect.objectContaining({
            type: 'warning',
            message: expect.stringContaining('Cache hit rate')
          })
        ])
      });

      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('generateUsageReport', () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-01-31');

    beforeEach(() => {
      // Mock all the private methods used in generateUsageReport
      jest.spyOn(monitoringService as any, 'getCalculationsInPeriod')
        .mockResolvedValue(1247);
      jest.spyOn(monitoringService as any, 'getUniqueUsersInPeriod')
        .mockResolvedValue(156);
      jest.spyOn(monitoringService as any, 'getAverageDailyActive')
        .mockResolvedValue(34);
      jest.spyOn(monitoringService as any, 'getScoresImprovedInPeriod')
        .mockResolvedValue(67);
      jest.spyOn(monitoringService as any, 'getScoresDeclinedInPeriod')
        .mockResolvedValue(23);
      jest.spyOn(monitoringService as any, 'getDamoclesTriggersInPeriod')
        .mockResolvedValue(12);
      jest.spyOn(monitoringService as any, 'getTopPerformingRegions')
        .mockResolvedValue([
          { regionName: 'Oslo', improvementRate: 15.2 },
          { regionName: 'Bergen', improvementRate: 12.8 }
        ]);
    });

    it('should generate usage report for given period', async () => {
      const result = await monitoringService.generateUsageReport(startDate, endDate);

      expect(result).toMatchObject({
        period: {
          start: startDate,
          end: endDate,
          days: 31
        },
        usage: {
          totalCalculations: 1247,
          uniqueUsers: 156,
          averageDailyActive: 34
        },
        outcomes: {
          scoresImproved: 67,
          scoresDeclined: 23,
          damoclesTriggered: 12
        },
        topPerformingRegions: [
          { regionName: 'Oslo', improvementRate: 15.2 },
          { regionName: 'Bergen', improvementRate: 12.8 }
        ]
      });

      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    it('should calculate period days correctly', async () => {
      const start = new Date('2023-01-01');
      const end = new Date('2023-01-08'); // 7 days later

      const result = await monitoringService.generateUsageReport(start, end);

      expect(result.period.days).toBe(7);
    });
  });
});