import { PDIService } from '../service';
import { PDICalculator } from '../calculator';
import { PDIInputs } from '../types';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    pDIProfile: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn()
    },
    pDIInput: {
      create: jest.fn()
    },
    pDIMetric: {
      createMany: jest.fn()
    },
    pDIHistory: {
      create: jest.fn(),
      findMany: jest.fn()
    },
    pDIAlert: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    pDIRegionalData: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn()
    }
  }))
}));

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    setex: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    ping: jest.fn().mockResolvedValue('PONG'),
    info: jest.fn().mockResolvedValue('memory info'),
    dbsize: jest.fn().mockResolvedValue(100),
    on: jest.fn(),
    quit: jest.fn()
  }));
});

describe('PDIService', () => {
  let pdiService: PDIService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    pdiService = new PDIService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('calculateAndSavePDI', () => {
    const validInputs: PDIInputs = {
      monthlyIncome: 5000,
      totalDebt: 50000,
      monthlyDebtPayments: 1500,
      availableCredit: 10000,
      creditUsed: 3000,
      totalAssets: 80000,
      previousMonthDebt: 48000
    };

    const mockProfile = {
      id: 'profile-1',
      userId: 'user-1',
      currentScore: 75,
      scoreCategory: 'healthy',
      lastCalculated: new Date(),
      calculationVersion: '1.0.0'
    };

    beforeEach(() => {
      mockPrisma.pDIProfile.findUnique.mockResolvedValue(null);
      mockPrisma.pDIProfile.upsert.mockResolvedValue(mockProfile);
      mockPrisma.pDIInput.create.mockResolvedValue({});
      mockPrisma.pDIMetric.createMany.mockResolvedValue({});
      mockPrisma.pDIHistory.create.mockResolvedValue({});
      mockPrisma.pDIAlert.createMany.mockResolvedValue({});
      mockPrisma.pDIRegionalData.findFirst.mockResolvedValue(null);
      mockPrisma.pDIRegionalData.create.mockResolvedValue({});
    });

    it('should calculate and save PDI successfully', async () => {
      const result = await pdiService.calculateAndSavePDI('user-1', validInputs);

      expect(result.score).toBeGreaterThan(0);
      expect(result.category).toMatch(/healthy|caution|risky|critical/);
      expect(mockPrisma.pDIProfile.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        update: expect.any(Object),
        create: expect.any(Object)
      });
      expect(mockPrisma.pDIInput.create).toHaveBeenCalled();
      expect(mockPrisma.pDIHistory.create).toHaveBeenCalled();
    });

    it('should create alerts for critical scores', async () => {
      const criticalInputs: PDIInputs = {
        monthlyIncome: 2000,
        totalDebt: 80000,
        monthlyDebtPayments: 1800,
        availableCredit: 2000,
        creditUsed: 1900,
        totalAssets: 15000,
        previousMonthDebt: 75000
      };

      await pdiService.calculateAndSavePDI('user-1', criticalInputs);

      expect(mockPrisma.pDIAlert.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            alertType: 'score_critical'
          })
        ])
      });
    });

    it('should create rapid decline alert when score drops significantly', async () => {
      const existingProfile = {
        id: 'profile-1',
        userId: 'user-1',
        currentScore: 85,
        history: [{ score: 85, recordedAt: new Date() }]
      };

      mockPrisma.pDIProfile.findUnique.mockResolvedValue(existingProfile);

      const decliningInputs: PDIInputs = {
        monthlyIncome: 3000,
        totalDebt: 70000,
        monthlyDebtPayments: 2200,
        availableCredit: 5000,
        creditUsed: 4500,
        totalAssets: 40000,
        previousMonthDebt: 50000
      };

      await pdiService.calculateAndSavePDI('user-1', decliningInputs);

      expect(mockPrisma.pDIAlert.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            alertType: 'rapid_decline'
          })
        ])
      });
    });

    it('should update regional data', async () => {
      await pdiService.calculateAndSavePDI('user-1', validInputs);

      expect(mockPrisma.pDIRegionalData.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          regionCode: 'NO-DEFAULT',
          regionName: 'Norway',
          countryCode: 'NO'
        })
      });
    });
  });

  describe('getPDIProfile', () => {
    it('should return cached profile if available', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        currentScore: 75,
        metrics: [],
        alerts: []
      };

      // Mock cache hit
      jest.spyOn(pdiService.getCacheService(), 'getCachedPDIProfile')
        .mockResolvedValue(mockProfile);

      const result = await pdiService.getPDIProfile('user-1');

      expect(result).toEqual(mockProfile);
      expect(mockPrisma.pDIProfile.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache when not cached', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        currentScore: 75,
        metrics: [],
        alerts: []
      };

      // Mock cache miss
      jest.spyOn(pdiService.getCacheService(), 'getCachedPDIProfile')
        .mockResolvedValue(null);

      mockPrisma.pDIProfile.findUnique.mockResolvedValue(mockProfile);

      const result = await pdiService.getPDIProfile('user-1');

      expect(result).toEqual(mockProfile);
      expect(mockPrisma.pDIProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: expect.any(Object)
      });
    });
  });

  describe('getDashboardAnalytics', () => {
    it('should return cached analytics if available', async () => {
      const mockAnalytics = {
        totalProfiles: 100,
        criticalProfiles: 10,
        averageScore: 65.5
      };

      jest.spyOn(pdiService.getCacheService(), 'getCachedAnalytics')
        .mockResolvedValue(mockAnalytics);

      const result = await pdiService.getDashboardAnalytics();

      expect(result).toEqual(mockAnalytics);
      expect(mockPrisma.pDIProfile.count).not.toHaveBeenCalled();
    });

    it('should calculate analytics from database when not cached', async () => {
      jest.spyOn(pdiService.getCacheService(), 'getCachedAnalytics')
        .mockResolvedValue(null);

      mockPrisma.pDIProfile.count
        .mockResolvedValueOnce(100) // totalProfiles
        .mockResolvedValueOnce(15)  // criticalProfiles
        .mockResolvedValueOnce(25)  // healthyProfiles
        .mockResolvedValueOnce(35)  // cautionProfiles
        .mockResolvedValueOnce(25); // riskyProfiles

      mockPrisma.pDIProfile.aggregate.mockResolvedValue({
        _avg: { currentScore: 67.5 }
      });

      const result = await pdiService.getDashboardAnalytics();

      expect(result).toMatchObject({
        totalProfiles: 100,
        criticalProfiles: 15,
        averageScore: 67.5,
        healthyProfiles: 25,
        cautionProfiles: 35,
        riskyProfiles: 25
      });
    });
  });

  describe('getAlerts', () => {
    it('should return alerts for user', async () => {
      const mockProfile = { id: 'profile-1' };
      const mockAlerts = [
        {
          id: 'alert-1',
          alertType: 'score_critical',
          alertMessage: 'Critical score alert',
          createdAt: new Date()
        }
      ];

      mockPrisma.pDIProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.pDIAlert.findMany.mockResolvedValue(mockAlerts);

      const result = await pdiService.getAlerts('user-1');

      expect(result).toEqual(mockAlerts);
      expect(mockPrisma.pDIAlert.findMany).toHaveBeenCalledWith({
        where: {
          profileId: 'profile-1',
          acknowledgedAt: null
        },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should return empty array if user has no profile', async () => {
      mockPrisma.pDIProfile.findUnique.mockResolvedValue(null);

      const result = await pdiService.getAlerts('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge alert successfully', async () => {
      mockPrisma.pDIAlert.update.mockResolvedValue({});

      const result = await pdiService.acknowledgeAlert('alert-1');

      expect(result).toBe(true);
      expect(mockPrisma.pDIAlert.update).toHaveBeenCalledWith({
        where: { id: 'alert-1' },
        data: { acknowledgedAt: expect.any(Date) }
      });
    });

    it('should return false on error', async () => {
      mockPrisma.pDIAlert.update.mockRejectedValue(new Error('Database error'));

      const result = await pdiService.acknowledgeAlert('alert-1');

      expect(result).toBe(false);
    });
  });

  describe('calculateRewards', () => {
    it('should calculate base rewards for tracking PDI', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        history: []
      };

      mockPrisma.pDIProfile.findUnique.mockResolvedValue(mockProfile);

      const rewards = await pdiService.calculateRewards('user-1', 75);

      expect(rewards).toBe(10); // Base reward
    });

    it('should calculate improvement rewards', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        history: [
          { score: 85, recordedAt: new Date() }, // Current (most recent)
          { score: 75, recordedAt: new Date(Date.now() - 86400000) } // Previous
        ]
      };

      mockPrisma.pDIProfile.findUnique.mockResolvedValue(mockProfile);

      const rewards = await pdiService.calculateRewards('user-1', 85);

      // Base (10) + improvement (10 * 10) = 110
      expect(rewards).toBe(110);
    });

    it('should calculate bonus for escaping critical category', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        history: [
          { score: 45, recordedAt: new Date() }, // Current
          { score: 35, recordedAt: new Date(Date.now() - 86400000) } // Previous (critical)
        ]
      };

      mockPrisma.pDIProfile.findUnique.mockResolvedValue(mockProfile);

      const rewards = await pdiService.calculateRewards('user-1', 45);

      // Base (10) + improvement (10 * 10) + escape critical bonus (1000) = 1110
      expect(rewards).toBe(1110);
    });

    it('should apply multiplier for critical users', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        history: []
      };

      mockPrisma.pDIProfile.findUnique.mockResolvedValue(mockProfile);

      const rewards = await pdiService.calculateRewards('user-1', 35);

      // Base (10) * critical multiplier (2) = 20
      expect(rewards).toBe(20);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      jest.spyOn(pdiService.getCacheService(), 'healthCheck')
        .mockResolvedValue(true);
      jest.spyOn(pdiService.getCacheService(), 'getCacheStats')
        .mockResolvedValue({ totalKeys: 50, connected: true });

      const result = await pdiService.healthCheck();

      expect(result).toMatchObject({
        status: 'healthy',
        services: {
          database: 'connected',
          cache: 'connected'
        }
      });
    });

    it('should handle cache disconnection', async () => {
      jest.spyOn(pdiService.getCacheService(), 'healthCheck')
        .mockResolvedValue(false);
      jest.spyOn(pdiService.getCacheService(), 'getCacheStats')
        .mockResolvedValue({ totalKeys: 0, connected: false });

      const result = await pdiService.healthCheck();

      expect(result.services.cache).toBe('disconnected');
    });
  });
});