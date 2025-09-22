import Fastify from 'fastify';
import { registerPDIRoutes } from '../routes';
import { PDIService } from '../service';
import { PDIInputs } from '../types';

// Mock PDI Service
jest.mock('../service');
jest.mock('../monitoring');

describe('PDI Routes', () => {
  let app: any;
  let mockPDIService: jest.Mocked<PDIService>;

  beforeEach(async () => {
    app = Fastify();

    // Create mock service
    mockPDIService = {
      calculateAndSavePDI: jest.fn(),
      getPDIProfile: jest.fn(),
      getPDIHistory: jest.fn(),
      getAlerts: jest.fn(),
      acknowledgeAlert: jest.fn(),
      getRegionalData: jest.fn(),
      getDashboardAnalytics: jest.fn(),
      calculateRewards: jest.fn(),
      healthCheck: jest.fn(),
      invalidateUserCache: jest.fn()
    } as any;

    registerPDIRoutes(app, mockPDIService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/pdi/calculate', () => {
    const validInput: PDIInputs = {
      monthlyIncome: 5000,
      totalDebt: 50000,
      monthlyDebtPayments: 1500,
      availableCredit: 10000,
      creditUsed: 3000,
      totalAssets: 80000,
      previousMonthDebt: 48000
    };

    const mockPDIResult = {
      score: 75,
      category: 'healthy' as const,
      metrics: {
        dti: { value: 83.33, score: 70, category: 'caution' as const },
        dsr: { value: 30, score: 75, category: 'caution' as const },
        creditUtilization: { value: 30, score: 85, category: 'healthy' as const },
        debtToAssets: { value: 62.5, score: 70, category: 'caution' as const },
        debtGrowth: { value: 4.17, score: 90, category: 'healthy' as const }
      },
      recommendations: [],
      damoclesActionRequired: false,
      calculatedAt: new Date()
    };

    it('should calculate PDI successfully', async () => {
      mockPDIService.calculateAndSavePDI.mockResolvedValue(mockPDIResult);

      const response = await app.inject({
        method: 'POST',
        url: '/api/pdi/calculate',
        payload: {
          userId: 'user-1',
          ...validInput
        }
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.score).toBe(75);
      expect(result.data.category).toBe('healthy');
      expect(mockPDIService.calculateAndSavePDI).toHaveBeenCalledWith('user-1', validInput);
    });

    it('should validate input data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdi/calculate',
        payload: {
          userId: 'user-1',
          monthlyIncome: -1000, // Invalid negative income
          totalDebt: 50000,
          monthlyDebtPayments: 1500,
          availableCredit: 10000,
          creditUsed: 3000,
          totalAssets: 80000,
          previousMonthDebt: 48000
        }
      });

      expect(response.statusCode).toBe(400);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });

    it('should require userId', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdi/calculate',
        payload: validInput
      });

      expect(response.statusCode).toBe(400);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });

    it('should handle service errors', async () => {
      mockPDIService.calculateAndSavePDI.mockRejectedValue(new Error('Database error'));

      const response = await app.inject({
        method: 'POST',
        url: '/api/pdi/calculate',
        payload: {
          userId: 'user-1',
          ...validInput
        }
      });

      expect(response.statusCode).toBe(500);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to calculate PDI');
    });
  });

  describe('GET /api/pdi/profile/:userId', () => {
    const mockProfile = {
      id: 'profile-1',
      userId: 'user-1',
      currentScore: 75,
      scoreCategory: 'healthy',
      lastCalculated: new Date(),
      metrics: [],
      alerts: []
    };

    it('should get user profile successfully', async () => {
      mockPDIService.getPDIProfile.mockResolvedValue(mockProfile);

      const response = await app.inject({
        method: 'GET',
        url: '/api/pdi/profile/user-1'
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.currentScore).toBe(75);
      expect(mockPDIService.getPDIProfile).toHaveBeenCalledWith('user-1');
    });

    it('should handle non-existent profile', async () => {
      mockPDIService.getPDIProfile.mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/pdi/profile/user-1'
      });

      expect(response.statusCode).toBe(404);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(false);
      expect(result.error).toBe('PDI profile not found');
    });
  });

  describe('GET /api/pdi/history/:userId', () => {
    const mockHistory = [
      {
        id: 'history-1',
        score: 75,
        scoreCategory: 'healthy',
        recordedAt: new Date(),
        metrics: '{}'
      },
      {
        id: 'history-2',
        score: 70,
        scoreCategory: 'caution',
        recordedAt: new Date(Date.now() - 86400000),
        metrics: '{}'
      }
    ];

    it('should get user history successfully', async () => {
      mockPDIService.getPDIHistory.mockResolvedValue(mockHistory);

      const response = await app.inject({
        method: 'GET',
        url: '/api/pdi/history/user-1'
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockPDIService.getPDIHistory).toHaveBeenCalledWith('user-1', 30, 0);
    });

    it('should handle pagination parameters', async () => {
      mockPDIService.getPDIHistory.mockResolvedValue([mockHistory[0]]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/pdi/history/user-1?limit=1&offset=1'
      });

      expect(response.statusCode).toBe(200);
      expect(mockPDIService.getPDIHistory).toHaveBeenCalledWith('user-1', 1, 1);
    });
  });

  describe('GET /api/pdi/alerts/:userId', () => {
    const mockAlerts = [
      {
        id: 'alert-1',
        alertType: 'score_critical',
        alertMessage: 'Critical PDI score',
        createdAt: new Date(),
        acknowledgedAt: null
      }
    ];

    it('should get user alerts successfully', async () => {
      mockPDIService.getAlerts.mockResolvedValue(mockAlerts);

      const response = await app.inject({
        method: 'GET',
        url: '/api/pdi/alerts/user-1'
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(mockPDIService.getAlerts).toHaveBeenCalledWith('user-1', false);
    });

    it('should handle includeAcknowledged parameter', async () => {
      mockPDIService.getAlerts.mockResolvedValue(mockAlerts);

      const response = await app.inject({
        method: 'GET',
        url: '/api/pdi/alerts/user-1?includeAcknowledged=true'
      });

      expect(response.statusCode).toBe(200);
      expect(mockPDIService.getAlerts).toHaveBeenCalledWith('user-1', true);
    });
  });

  describe('POST /api/pdi/alerts/:alertId/acknowledge', () => {
    it('should acknowledge alert successfully', async () => {
      mockPDIService.acknowledgeAlert.mockResolvedValue(true);

      const response = await app.inject({
        method: 'POST',
        url: '/api/pdi/alerts/alert-1/acknowledge'
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(mockPDIService.acknowledgeAlert).toHaveBeenCalledWith('alert-1');
    });

    it('should handle acknowledge failure', async () => {
      mockPDIService.acknowledgeAlert.mockResolvedValue(false);

      const response = await app.inject({
        method: 'POST',
        url: '/api/pdi/alerts/alert-1/acknowledge'
      });

      expect(response.statusCode).toBe(404);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Alert not found or already acknowledged');
    });
  });

  describe('GET /api/pdi/rewards/:userId', () => {
    it('should calculate rewards successfully', async () => {
      const mockProfile = { currentScore: 75 };
      mockPDIService.getPDIProfile.mockResolvedValue(mockProfile);
      mockPDIService.calculateRewards.mockResolvedValue(150);

      const response = await app.inject({
        method: 'GET',
        url: '/api/pdi/rewards/user-1'
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.rewards).toBe(150);
      expect(result.data.currentScore).toBe(75);
    });

    it('should handle user with no profile', async () => {
      mockPDIService.getPDIProfile.mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/pdi/rewards/user-1'
      });

      expect(response.statusCode).toBe(404);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(false);
      expect(result.error).toBe('PDI profile not found');
    });
  });

  describe('GET /api/pdi/regional', () => {
    const mockRegionalData = [
      {
        regionCode: 'NO-OSLO',
        regionName: 'Oslo',
        averagePDI: 72.5,
        totalProfiles: 1000,
        criticalPercentage: 12.5
      }
    ];

    it('should get regional data successfully', async () => {
      mockPDIService.getRegionalData.mockResolvedValue(mockRegionalData);

      const response = await app.inject({
        method: 'GET',
        url: '/api/pdi/regional'
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(mockPDIService.getRegionalData).toHaveBeenCalledWith(undefined);
    });

    it('should filter by region code', async () => {
      mockPDIService.getRegionalData.mockResolvedValue([mockRegionalData[0]]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/pdi/regional?regionCode=NO-OSLO'
      });

      expect(response.statusCode).toBe(200);
      expect(mockPDIService.getRegionalData).toHaveBeenCalledWith('NO-OSLO');
    });
  });

  describe('DELETE /api/pdi/cache/:userId', () => {
    it('should invalidate user cache successfully', async () => {
      mockPDIService.invalidateUserCache.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/pdi/cache/user-1'
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(mockPDIService.invalidateUserCache).toHaveBeenCalledWith('user-1');
    });
  });

  describe('GET /api/pdi/health', () => {
    it('should return health status', async () => {
      const mockHealth = {
        status: 'healthy',
        services: {
          database: 'connected',
          cache: 'connected'
        },
        timestamp: new Date().toISOString()
      };

      // Mock PDIMonitoringService
      const mockMonitoring = {
        getSystemHealth: jest.fn().mockResolvedValue(mockHealth)
      };

      jest.doMock('../monitoring', () => ({
        PDIMonitoringService: jest.fn().mockImplementation(() => mockMonitoring)
      }));

      const response = await app.inject({
        method: 'GET',
        url: '/api/pdi/health'
      });

      expect(response.statusCode).toBe(200);

      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.status).toBe('healthy');
    });
  });
});