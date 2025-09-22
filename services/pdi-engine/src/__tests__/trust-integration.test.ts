import { PDITrustIntegrationService } from '../trust-integration';
import { PDIService } from '../service';

// Mock PDI Service
jest.mock('../service');

describe('PDITrustIntegrationService', () => {
  let trustIntegration: PDITrustIntegrationService;
  let mockPDIService: jest.Mocked<PDIService>;

  beforeEach(() => {
    mockPDIService = {
      getPDIProfile: jest.fn(),
      getAlerts: jest.fn()
    } as any;

    trustIntegration = new PDITrustIntegrationService(mockPDIService);
    jest.clearAllMocks();
  });

  describe('getPDIContextForTrustEngine', () => {
    const mockProfile = {
      id: 'profile-1',
      userId: 'user-1',
      currentScore: 75,
      scoreCategory: 'healthy',
      lastCalculated: new Date(),
      metrics: [
        {
          metricType: 'dsr',
          metricValue: 35,
          metricScore: 75
        }
      ]
    };

    const mockAlerts = [
      {
        id: 'alert-1',
        alertType: 'score_critical',
        createdAt: new Date()
      }
    ];

    beforeEach(() => {
      mockPDIService.getPDIProfile.mockResolvedValue(mockProfile);
      mockPDIService.getAlerts.mockResolvedValue(mockAlerts);
    });

    it('should return PDI context for Trust Engine', async () => {
      const result = await trustIntegration.getPDIContextForTrustEngine('user-1');

      expect(result).toMatchObject({
        score: 75,
        category: 'healthy',
        lastCalculated: expect.any(Date),
        vulnerabilityLevel: 'low',
        priorityWeight: 1.0
      });

      expect(result?.financialStressIndicators).toBeInstanceOf(Array);
    });

    it('should return null when profile not found', async () => {
      mockPDIService.getPDIProfile.mockResolvedValue(null);

      const result = await trustIntegration.getPDIContextForTrustEngine('user-1');

      expect(result).toBeNull();
    });

    it('should handle service errors gracefully', async () => {
      mockPDIService.getPDIProfile.mockRejectedValue(new Error('Service error'));

      const result = await trustIntegration.getPDIContextForTrustEngine('user-1');

      expect(result).toBeNull();
    });
  });

  describe('calculateVulnerabilityLevel', () => {
    it('should return critical for very low scores', () => {
      const result = (trustIntegration as any).calculateVulnerabilityLevel(25);
      expect(result).toBe('critical');
    });

    it('should return high for low scores', () => {
      const result = (trustIntegration as any).calculateVulnerabilityLevel(45);
      expect(result).toBe('high');
    });

    it('should return medium for moderate scores', () => {
      const result = (trustIntegration as any).calculateVulnerabilityLevel(65);
      expect(result).toBe('medium');
    });

    it('should return low for high scores', () => {
      const result = (trustIntegration as any).calculateVulnerabilityLevel(85);
      expect(result).toBe('low');
    });
  });

  describe('getFinancialStressIndicators', () => {
    const mockProfile = {
      id: 'profile-1',
      userId: 'user-1',
      currentScore: 45,
      scoreCategory: 'risky',
      metrics: [
        JSON.stringify({
          dsr: { value: 55 },
          creditUtilization: { value: 95 },
          debtGrowth: { value: 15 },
          debtToAssets: { value: 120 }
        })
      ]
    };

    const mockCriticalAlerts = [
      { alertType: 'score_critical' },
      { alertType: 'rapid_decline' }
    ];

    beforeEach(() => {
      mockPDIService.getPDIProfile.mockResolvedValue(mockProfile);
      mockPDIService.getAlerts.mockResolvedValue(mockCriticalAlerts);
    });

    it('should identify high debt service ratio indicator', async () => {
      const result = await (trustIntegration as any).getFinancialStressIndicators('user-1');

      const dsrIndicator = result.find((i: any) => i.type === 'high_debt_service_ratio');
      expect(dsrIndicator).toBeDefined();
      expect(dsrIndicator.severity).toBe('critical');
      expect(dsrIndicator.value).toBe(55);
    });

    it('should identify maxed credit utilization indicator', async () => {
      const result = await (trustIntegration as any).getFinancialStressIndicators('user-1');

      const creditIndicator = result.find((i: any) => i.type === 'maxed_credit_utilization');
      expect(creditIndicator).toBeDefined();
      expect(creditIndicator.severity).toBe('high');
      expect(creditIndicator.value).toBe(95);
    });

    it('should identify rapid debt growth indicator', async () => {
      const result = await (trustIntegration as any).getFinancialStressIndicators('user-1');

      const debtGrowthIndicator = result.find((i: any) => i.type === 'rapid_debt_growth');
      expect(debtGrowthIndicator).toBeDefined();
      expect(debtGrowthIndicator.severity).toBe('high');
      expect(debtGrowthIndicator.value).toBe(15);
    });

    it('should identify insolvency risk indicator', async () => {
      const result = await (trustIntegration as any).getFinancialStressIndicators('user-1');

      const insolvencyIndicator = result.find((i: any) => i.type === 'insolvency_risk');
      expect(insolvencyIndicator).toBeDefined();
      expect(insolvencyIndicator.severity).toBe('critical');
      expect(insolvencyIndicator.value).toBe(120);
    });

    it('should identify recent critical alerts indicator', async () => {
      const result = await (trustIntegration as any).getFinancialStressIndicators('user-1');

      const alertsIndicator = result.find((i: any) => i.type === 'recent_critical_alerts');
      expect(alertsIndicator).toBeDefined();
      expect(alertsIndicator.severity).toBe('high');
      expect(alertsIndicator.value).toBe(2);
    });

    it('should return empty array when no profile found', async () => {
      mockPDIService.getPDIProfile.mockResolvedValue(null);

      const result = await (trustIntegration as any).getFinancialStressIndicators('user-1');

      expect(result).toEqual([]);
    });

    it('should handle invalid metrics JSON gracefully', async () => {
      const profileWithInvalidMetrics = {
        ...mockProfile,
        metrics: ['invalid-json']
      };
      mockPDIService.getPDIProfile.mockResolvedValue(profileWithInvalidMetrics);

      const result = await (trustIntegration as any).getFinancialStressIndicators('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('calculatePriorityWeight', () => {
    it('should return highest weight for critical scores', () => {
      const weight = (trustIntegration as any).calculatePriorityWeight(25, 'critical');
      expect(weight).toBe(2.0);
    });

    it('should return high weight for risky scores', () => {
      const weight = (trustIntegration as any).calculatePriorityWeight(45, 'risky');
      expect(weight).toBe(1.5);
    });

    it('should return medium weight for caution scores', () => {
      const weight = (trustIntegration as any).calculatePriorityWeight(65, 'caution');
      expect(weight).toBe(1.2);
    });

    it('should return base weight for healthy scores', () => {
      const weight = (trustIntegration as any).calculatePriorityWeight(85, 'healthy');
      expect(weight).toBe(1.0);
    });

    it('should prioritize by score over category', () => {
      const weight = (trustIntegration as any).calculatePriorityWeight(25, 'healthy');
      expect(weight).toBe(2.0); // Should be 2.0 because score < 30
    });
  });

  describe('notifyTrustEngineOfPDIChange', () => {
    beforeEach(() => {
      // Mock console.log to capture notifications
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(trustIntegration as any, 'invalidateTrustCacheForUser')
        .mockResolvedValue(undefined);
    });

    it('should notify on significant score improvement', async () => {
      await trustIntegration.notifyTrustEngineOfPDIChange('user-1', 60, 75, 'healthy');

      expect(console.log).toHaveBeenCalledWith(
        'PDI Change Notification for Trust Engine:',
        expect.objectContaining({
          userId: 'user-1',
          previousScore: 60,
          currentScore: 75,
          scoreDifference: 15,
          changeType: 'improvement',
          urgency: 'medium'
        })
      );
    });

    it('should notify on significant score decline', async () => {
      await trustIntegration.notifyTrustEngineOfPDIChange('user-1', 75, 50, 'risky');

      expect(console.log).toHaveBeenCalledWith(
        'PDI Change Notification for Trust Engine:',
        expect.objectContaining({
          changeType: 'decline',
          urgency: 'high'
        })
      );
    });

    it('should always notify for critical category', async () => {
      await trustIntegration.notifyTrustEngineOfPDIChange('user-1', 40, 35, 'critical');

      expect(console.log).toHaveBeenCalledWith(
        'PDI Change Notification for Trust Engine:',
        expect.objectContaining({
          category: 'critical',
          urgency: 'critical'
        })
      );
    });

    it('should not notify on minor changes', async () => {
      await trustIntegration.notifyTrustEngineOfPDIChange('user-1', 75, 80, 'healthy');

      expect(console.log).not.toHaveBeenCalled();
    });

    it('should invalidate trust cache on notification', async () => {
      const invalidateSpy = jest.spyOn(trustIntegration as any, 'invalidateTrustCacheForUser');

      await trustIntegration.notifyTrustEngineOfPDIChange('user-1', 60, 75, 'healthy');

      expect(invalidateSpy).toHaveBeenCalledWith('user-1');
    });
  });

  describe('calculateChangeUrgency', () => {
    it('should return critical urgency for critical category', () => {
      const urgency = (trustIntegration as any).calculateChangeUrgency(5, 'critical');
      expect(urgency).toBe('critical');
    });

    it('should return high urgency for large score differences', () => {
      const urgency = (trustIntegration as any).calculateChangeUrgency(25, 'risky');
      expect(urgency).toBe('high');
    });

    it('should return medium urgency for moderate score differences', () => {
      const urgency = (trustIntegration as any).calculateChangeUrgency(15, 'caution');
      expect(urgency).toBe('medium');
    });

    it('should return low urgency for small score differences', () => {
      const urgency = (trustIntegration as any).calculateChangeUrgency(8, 'healthy');
      expect(urgency).toBe('low');
    });
  });

  describe('getViolationSeverityMultiplier', () => {
    it('should return highest multiplier for critical PDI', () => {
      const multiplier = trustIntegration.getViolationSeverityMultiplier(30, 'critical');
      expect(multiplier).toBe(2.0);
    });

    it('should return high multiplier for risky PDI', () => {
      const multiplier = trustIntegration.getViolationSeverityMultiplier(50, 'risky');
      expect(multiplier).toBe(1.5);
    });

    it('should return medium multiplier for caution PDI', () => {
      const multiplier = trustIntegration.getViolationSeverityMultiplier(65, 'caution');
      expect(multiplier).toBe(1.25);
    });

    it('should return base multiplier for healthy PDI', () => {
      const multiplier = trustIntegration.getViolationSeverityMultiplier(85, 'healthy');
      expect(multiplier).toBe(1.0);
    });
  });

  describe('shouldExpediteDAMOCLESProcessing', () => {
    it('should expedite for critical category', () => {
      const shouldExpedite = trustIntegration.shouldExpediteDAMOCLESProcessing(40, 'critical');
      expect(shouldExpedite).toBe(true);
    });

    it('should expedite for very low scores', () => {
      const shouldExpedite = trustIntegration.shouldExpediteDAMOCLESProcessing(30, 'risky');
      expect(shouldExpedite).toBe(true);
    });

    it('should not expedite for healthy scores', () => {
      const shouldExpedite = trustIntegration.shouldExpediteDAMOCLESProcessing(75, 'healthy');
      expect(shouldExpedite).toBe(false);
    });
  });

  describe('getVulnerabilityTrustBoost', () => {
    it('should provide highest boost for critical users', () => {
      const boost = trustIntegration.getVulnerabilityTrustBoost(30, 'critical');
      expect(boost).toBe(15);
    });

    it('should provide high boost for risky users', () => {
      const boost = trustIntegration.getVulnerabilityTrustBoost(50, 'risky');
      expect(boost).toBe(8);
    });

    it('should provide small boost for caution users', () => {
      const boost = trustIntegration.getVulnerabilityTrustBoost(65, 'caution');
      expect(boost).toBe(3);
    });

    it('should provide no boost for healthy users', () => {
      const boost = trustIntegration.getVulnerabilityTrustBoost(85, 'healthy');
      expect(boost).toBe(0);
    });
  });
});