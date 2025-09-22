import { PDICacheService } from '../cache';
import { PDIScore, PDIProfileData } from '../types';

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    setex: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    ping: jest.fn().mockResolvedValue('PONG'),
    info: jest.fn().mockResolvedValue('# Memory\nused_memory:1000000'),
    dbsize: jest.fn().mockResolvedValue(100),
    exists: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue('OK')
  }));
});

describe('PDICacheService', () => {
  let cacheService: PDICacheService;
  let mockRedis: any;

  beforeEach(() => {
    const Redis = require('ioredis');
    cacheService = new PDICacheService();
    mockRedis = (cacheService as any).redis;
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cacheService.disconnect();
  });

  describe('PDI Score Caching', () => {
    const mockPDIScore: PDIScore = {
      score: 75,
      category: 'healthy',
      metrics: {
        dti: { value: 50, score: 85, category: 'healthy' },
        dsr: { value: 20, score: 90, category: 'healthy' },
        creditUtilization: { value: 25, score: 85, category: 'healthy' },
        debtToAssets: { value: 30, score: 85, category: 'healthy' },
        debtGrowth: { value: 0, score: 100, category: 'healthy' }
      },
      recommendations: [],
      damoclesActionRequired: false,
      calculatedAt: new Date()
    };

    it('should cache PDI score successfully', async () => {
      await cacheService.cachePDIScore('user-1', mockPDIScore);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'pdi:score:user-1',
        3600, // TTL
        JSON.stringify(mockPDIScore)
      );
    });

    it('should retrieve cached PDI score', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockPDIScore));

      const result = await cacheService.getCachedPDIScore('user-1');

      expect(result).toEqual(mockPDIScore);
      expect(mockRedis.get).toHaveBeenCalledWith('pdi:score:user-1');
    });

    it('should return null when PDI score not cached', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.getCachedPDIScore('user-1');

      expect(result).toBeNull();
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockRedis.get.mockResolvedValue('invalid-json');

      const result = await cacheService.getCachedPDIScore('user-1');

      expect(result).toBeNull();
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(cacheService.cachePDIScore('user-1', mockPDIScore))
        .resolves.not.toThrow();
    });
  });

  describe('Profile Caching', () => {
    const mockProfile: PDIProfileData = {
      id: 'profile-1',
      userId: 'user-1',
      currentScore: 75,
      scoreCategory: 'healthy',
      lastCalculated: new Date(),
      calculationVersion: '1.0.0',
      metrics: [],
      alerts: []
    };

    it('should cache profile successfully', async () => {
      await cacheService.cachePDIProfile('user-1', mockProfile);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'pdi:profile:user-1',
        7200, // 2 hours TTL
        JSON.stringify(mockProfile)
      );
    });

    it('should retrieve cached profile', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockProfile));

      const result = await cacheService.getCachedPDIProfile('user-1');

      expect(result).toEqual(mockProfile);
      expect(mockRedis.get).toHaveBeenCalledWith('pdi:profile:user-1');
    });
  });

  describe('Regional Data Caching', () => {
    const mockRegionalData = [
      {
        regionCode: 'NO-OSLO',
        regionName: 'Oslo',
        averagePDI: 72.5,
        totalProfiles: 1000,
        criticalPercentage: 12.5
      }
    ];

    it('should cache regional data successfully', async () => {
      await cacheService.cacheRegionalData('NO-OSLO', mockRegionalData);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'pdi:regional:NO-OSLO',
        86400, // 24 hours TTL
        JSON.stringify(mockRegionalData)
      );
    });

    it('should retrieve cached regional data', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockRegionalData));

      const result = await cacheService.getCachedRegionalData('NO-OSLO');

      expect(result).toEqual(mockRegionalData);
    });
  });

  describe('Analytics Caching', () => {
    const mockAnalytics = {
      totalProfiles: 1000,
      criticalProfiles: 50,
      averageScore: 67.5,
      lastUpdated: new Date().toISOString()
    };

    it('should cache analytics successfully', async () => {
      await cacheService.cacheAnalytics(mockAnalytics);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'pdi:analytics:global',
        1800, // 30 minutes TTL
        JSON.stringify(mockAnalytics)
      );
    });

    it('should retrieve cached analytics', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockAnalytics));

      const result = await cacheService.getCachedAnalytics();

      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('Trust Context Caching', () => {
    const mockTrustContext = {
      score: 75,
      category: 'healthy',
      vulnerabilityLevel: 'low',
      priorityWeight: 1.0
    };

    it('should cache trust context successfully', async () => {
      await cacheService.cacheTrustContext('user-1', mockTrustContext);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'pdi:trust:user-1',
        3600, // 1 hour TTL
        JSON.stringify(mockTrustContext)
      );
    });

    it('should retrieve cached trust context', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockTrustContext));

      const result = await cacheService.getCachedTrustContext('user-1');

      expect(result).toEqual(mockTrustContext);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate user cache', async () => {
      await cacheService.invalidateUserCache('user-1');

      expect(mockRedis.del).toHaveBeenCalledWith(
        'pdi:score:user-1',
        'pdi:profile:user-1',
        'pdi:trust:user-1'
      );
    });

    it('should invalidate specific regional cache', async () => {
      await cacheService.invalidateRegionalCache('NO-OSLO');

      expect(mockRedis.del).toHaveBeenCalledWith('pdi:regional:NO-OSLO');
    });

    it('should invalidate all regional cache', async () => {
      const mockKeys = ['pdi:regional:NO-OSLO', 'pdi:regional:NO-BERGEN'];
      mockRedis.keys.mockResolvedValue(mockKeys);

      await cacheService.invalidateRegionalCache();

      expect(mockRedis.keys).toHaveBeenCalledWith('pdi:regional:*');
      expect(mockRedis.del).toHaveBeenCalledWith(...mockKeys);
    });

    it('should handle empty keys when invalidating regional cache', async () => {
      mockRedis.keys.mockResolvedValue([]);

      await cacheService.invalidateRegionalCache();

      expect(mockRedis.keys).toHaveBeenCalledWith('pdi:regional:*');
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should invalidate analytics cache', async () => {
      await cacheService.invalidateAnalyticsCache();

      expect(mockRedis.del).toHaveBeenCalledWith('pdi:analytics:global');
    });
  });

  describe('Utility Methods', () => {
    it('should set value with TTL', async () => {
      const testData = { test: 'data' };

      await cacheService.setWithTTL('test:key', testData, 1800);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test:key',
        1800,
        JSON.stringify(testData)
      );
    });

    it('should get value by key', async () => {
      const testData = { test: 'data' };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      const result = await cacheService.get('test:key');

      expect(result).toEqual(testData);
      expect(mockRedis.get).toHaveBeenCalledWith('test:key');
    });

    it('should check if key exists', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await cacheService.exists('test:key');

      expect(result).toBe(true);
      expect(mockRedis.exists).toHaveBeenCalledWith('test:key');
    });

    it('should return false when key does not exist', async () => {
      mockRedis.exists.mockResolvedValue(0);

      const result = await cacheService.exists('test:key');

      expect(result).toBe(false);
    });
  });

  describe('Health and Stats', () => {
    it('should get cache statistics', async () => {
      mockRedis.info.mockResolvedValue('# Memory\nused_memory:1000000');
      mockRedis.dbsize.mockResolvedValue(150);
      (mockRedis as any).status = 'ready';

      const result = await cacheService.getCacheStats();

      expect(result).toMatchObject({
        totalKeys: 150,
        memoryInfo: '# Memory\nused_memory:1000000',
        connected: true
      });
    });

    it('should handle stats errors', async () => {
      mockRedis.info.mockRejectedValue(new Error('Redis error'));
      mockRedis.dbsize.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.getCacheStats();

      expect(result).toMatchObject({
        totalKeys: 0,
        memoryInfo: '',
        connected: false
      });
    });

    it('should perform health check', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const result = await cacheService.healthCheck();

      expect(result).toBe(true);
      expect(mockRedis.ping).toHaveBeenCalled();
    });

    it('should fail health check on error', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));

      const result = await cacheService.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('Connection Management', () => {
    it('should disconnect gracefully', async () => {
      mockRedis.quit.mockResolvedValue('OK');

      await cacheService.disconnect();

      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });
});