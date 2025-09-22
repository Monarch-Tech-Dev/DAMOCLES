import { PrismaClient } from '@prisma/client';
import { PDICalculator } from './calculator';
import { PDIInputs, PDIScore, PDIAlert, RegionalData } from './types';
import { PDITrustIntegrationService } from './trust-integration';
import { PDICacheService } from './cache';
import { ethicalGuardrails } from './ethical-guardrails';

export class PDIService {
  private prisma: PrismaClient;
  private calculator: PDICalculator;
  private trustIntegration: PDITrustIntegrationService;
  private cache: PDICacheService;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
    this.calculator = new PDICalculator();
    this.cache = new PDICacheService();
    this.trustIntegration = new PDITrustIntegrationService(this);
  }

  /**
   * Calculate PDI and save to database
   */
  async calculateAndSavePDI(userId: string, inputs: PDIInputs): Promise<PDIScore> {
    const pdiScore = this.calculator.calculate(inputs);

    // Assess vulnerability and apply ethical guardrails
    const vulnerability = ethicalGuardrails.assessVulnerability(pdiScore);

    // Add vulnerability assessment to score
    (pdiScore as any).vulnerability = vulnerability;

    // Check for emergency intervention
    if (ethicalGuardrails.requiresEmergencyIntervention(pdiScore)) {
      await this.triggerEmergencySupport(userId, pdiScore);
    }

    // Get previous score for comparison
    const previousProfile = await this.prisma.pDIProfile.findUnique({
      where: { userId },
      include: { history: { take: 1, orderBy: { recordedAt: 'desc' } } }
    });

    const previousScore = previousProfile?.currentScore;

    // Save or update PDI profile
    const profile = await this.prisma.pDIProfile.upsert({
      where: { userId },
      update: {
        currentScore: pdiScore.score,
        scoreCategory: pdiScore.category,
        lastCalculated: pdiScore.calculatedAt,
        calculationVersion: PDICalculator.getVersion()
      },
      create: {
        userId,
        currentScore: pdiScore.score,
        scoreCategory: pdiScore.category,
        lastCalculated: pdiScore.calculatedAt,
        calculationVersion: PDICalculator.getVersion()
      }
    });

    // Save inputs
    await this.prisma.pDIInput.create({
      data: {
        profileId: profile.id,
        monthlyIncome: inputs.monthlyIncome,
        totalDebt: inputs.totalDebt,
        monthlyDebtPayments: inputs.monthlyDebtPayments,
        availableCredit: inputs.availableCredit,
        creditUsed: inputs.creditUsed,
        totalAssets: inputs.totalAssets,
        previousMonthDebt: inputs.previousMonthDebt
      }
    });

    // Save metrics
    await this.saveMetrics(profile.id, pdiScore.metrics);

    // Save to history
    await this.prisma.pDIHistory.create({
      data: {
        profileId: profile.id,
        score: pdiScore.score,
        scoreCategory: pdiScore.category,
        metrics: JSON.stringify(pdiScore.metrics)
      }
    });

    // Check for alerts
    await this.checkAndCreateAlerts(profile.id, pdiScore, previousScore);

    // Update regional data
    await this.updateRegionalData(userId, pdiScore.score);

    // Cache the new PDI score and invalidate related caches
    await this.cache.cachePDIScore(userId, pdiScore);
    await this.cache.invalidateUserCache(userId); // Clear stale profile cache
    await this.cache.invalidateAnalyticsCache(); // Analytics will need updating

    // Notify Trust Engine of significant PDI changes
    if (previousScore !== undefined) {
      await this.trustIntegration.notifyTrustEngineOfPDIChange(
        userId,
        previousScore,
        pdiScore.score,
        pdiScore.category
      );
    }

    return pdiScore;
  }

  private async saveMetrics(profileId: string, metrics: any): Promise<void> {
    const metricEntries = Object.entries(metrics).map(([metricType, metric]: [string, any]) => ({
      profileId,
      metricType,
      metricValue: metric.value,
      metricScore: metric.score
    }));

    await this.prisma.pDIMetric.createMany({
      data: metricEntries
    });
  }

  private async checkAndCreateAlerts(
    profileId: string,
    pdiScore: PDIScore,
    previousScore?: number
  ): Promise<void> {
    const alerts: any[] = [];

    // Critical score alert
    if (pdiScore.score < 40) {
      alerts.push({
        profileId,
        alertType: 'score_critical',
        alertMessage: `PDI score is critically low at ${pdiScore.score}. Immediate action required.`,
        triggerValue: pdiScore.score,
        damoclesActionTriggered: pdiScore.damoclesActionRequired
      });
    }

    // Rapid decline alert
    if (previousScore && (previousScore - pdiScore.score) > 15) {
      alerts.push({
        profileId,
        alertType: 'rapid_decline',
        alertMessage: `PDI score dropped ${previousScore - pdiScore.score} points rapidly. Review your financial situation.`,
        triggerValue: previousScore - pdiScore.score
      });
    }

    // Improvement alert
    if (previousScore && (pdiScore.score - previousScore) > 10) {
      alerts.push({
        profileId,
        alertType: 'improvement',
        alertMessage: `Great progress! Your PDI score improved by ${pdiScore.score - previousScore} points.`,
        triggerValue: pdiScore.score - previousScore
      });
    }

    // Metric warnings
    Object.entries(pdiScore.metrics).forEach(([metricName, metric]: [string, any]) => {
      if (metric.category === 'critical') {
        alerts.push({
          profileId,
          alertType: 'metric_warning',
          alertMessage: `${metricName.toUpperCase()} is in critical condition (${metric.value}%). Immediate attention needed.`,
          triggerValue: metric.value
        });
      }
    });

    if (alerts.length > 0) {
      await this.prisma.pDIAlert.createMany({ data: alerts });
    }
  }

  private async updateRegionalData(userId: string, score: number): Promise<void> {
    // For now, use a default region. In production, this would be based on user location
    const regionCode = 'NO-DEFAULT';
    const regionName = 'Norway';
    const countryCode = 'NO';

    const existingRegion = await this.prisma.pDIRegionalData.findFirst({
      where: { regionCode, countryCode }
    });

    if (existingRegion) {
      // Update existing regional data
      const totalProfiles = existingRegion.totalProfiles + 1;
      const currentSum = (existingRegion.averagePDI || 0) * existingRegion.totalProfiles;
      const newAverage = (currentSum + score) / totalProfiles;

      // Calculate critical percentage (assuming we can query all profiles for this region)
      const criticalCount = await this.prisma.pDIProfile.count({
        where: {
          currentScore: { lt: 40 },
          user: { /* add location filter when available */ }
        }
      });
      const criticalPercentage = (criticalCount / totalProfiles) * 100;

      await this.prisma.pDIRegionalData.update({
        where: { id: existingRegion.id },
        data: {
          averagePDI: newAverage,
          totalProfiles,
          criticalPercentage,
          lastUpdated: new Date()
        }
      });
    } else {
      // Create new regional data
      await this.prisma.pDIRegionalData.create({
        data: {
          regionCode,
          regionName,
          countryCode,
          averagePDI: score,
          totalProfiles: 1,
          criticalPercentage: score < 40 ? 100 : 0
        }
      });
    }
  }

  /**
   * Get PDI profile for a user
   */
  async getPDIProfile(userId: string): Promise<any> {
    // Check cache first
    const cached = await this.cache.getCachedPDIProfile(userId);
    if (cached) {
      return cached;
    }

    // Get from database
    const profile = await this.prisma.pDIProfile.findUnique({
      where: { userId },
      include: {
        metrics: { orderBy: { calculatedAt: 'desc' }, take: 5 },
        alerts: { where: { acknowledgedAt: null }, orderBy: { createdAt: 'desc' } }
      }
    });

    // Cache the result if found
    if (profile) {
      await this.cache.cachePDIProfile(userId, profile);
    }

    return profile;
  }

  /**
   * Get PDI history for a user
   */
  async getPDIHistory(userId: string, limit: number = 30, offset: number = 0): Promise<any[]> {
    const profile = await this.prisma.pDIProfile.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!profile) return [];

    return this.prisma.pDIHistory.findMany({
      where: { profileId: profile.id },
      orderBy: { recordedAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Get alerts for a user
   */
  async getAlerts(userId: string, includeAcknowledged: boolean = false): Promise<PDIAlert[]> {
    const profile = await this.prisma.pDIProfile.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!profile) return [];

    return this.prisma.pDIAlert.findMany({
      where: {
        profileId: profile.id,
        ...(includeAcknowledged ? {} : { acknowledgedAt: null })
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<boolean> {
    try {
      await this.prisma.pDIAlert.update({
        where: { id: alertId },
        data: { acknowledgedAt: new Date() }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get regional PDI data
   */
  async getRegionalData(regionCode?: string): Promise<RegionalData[]> {
    const cacheKey = regionCode || 'all';

    // Check cache first
    const cached = await this.cache.getCachedRegionalData(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const data = await this.prisma.pDIRegionalData.findMany({
      where: regionCode ? { regionCode } : {},
      orderBy: { averagePDI: 'desc' }
    });

    // Cache the result
    await this.cache.cacheRegionalData(cacheKey, data);

    return data;
  }

  /**
   * Calculate rewards for PDI tracking
   */
  async calculateRewards(userId: string, currentScore: number): Promise<number> {
    const profile = await this.prisma.pDIProfile.findUnique({
      where: { userId },
      include: {
        history: {
          take: 2,
          orderBy: { recordedAt: 'desc' }
        }
      }
    });

    let rewards = 10; // Base reward for tracking PDI

    if (profile && profile.history.length >= 2) {
      const previousScore = profile.history[1].score;
      const improvement = currentScore - previousScore;

      // Reward improvements
      if (improvement > 0) {
        rewards += improvement * 10; // 10 SWORD per point improvement
      }

      // Bonus for escaping critical category
      if (previousScore < 40 && currentScore >= 40) {
        rewards += 1000; // Major achievement bonus
      }
    }

    // Multiplier for critical users (incentive to track)
    if (currentScore < 40) {
      rewards *= 2;
    }

    return Math.floor(rewards);
  }

  /**
   * Get Trust Engine integration context for a user
   */
  async getTrustEngineContext(userId: string) {
    return this.trustIntegration.getPDIContextForTrustEngine(userId);
  }

  /**
   * Get Trust Engine integration service
   */
  getTrustIntegrationService(): PDITrustIntegrationService {
    return this.trustIntegration;
  }

  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(): Promise<any> {
    // Check cache first
    const cached = await this.cache.getCachedAnalytics();
    if (cached) {
      return cached;
    }

    // Calculate analytics from database
    const totalProfiles = await this.prisma.pDIProfile.count();
    const criticalProfiles = await this.prisma.pDIProfile.count({
      where: { currentScore: { lt: 40 } }
    });
    const averageScore = await this.prisma.pDIProfile.aggregate({
      _avg: { currentScore: true }
    });

    const analytics = {
      totalProfiles,
      criticalProfiles,
      criticalPercentage: totalProfiles > 0 ? (criticalProfiles / totalProfiles) * 100 : 0,
      averageScore: averageScore._avg.currentScore || 0,
      healthyProfiles: await this.prisma.pDIProfile.count({
        where: { currentScore: { gte: 80 } }
      }),
      cautionProfiles: await this.prisma.pDIProfile.count({
        where: { currentScore: { gte: 60, lt: 80 } }
      }),
      riskyProfiles: await this.prisma.pDIProfile.count({
        where: { currentScore: { gte: 40, lt: 60 } }
      }),
      lastUpdated: new Date().toISOString()
    };

    // Cache the result
    await this.cache.cacheAnalytics(analytics);

    return analytics;
  }

  /**
   * Get cache service for external use
   */
  getCacheService(): PDICacheService {
    return this.cache;
  }

  /**
   * Invalidate all cache for a user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.cache.invalidateUserCache(userId);
  }

  /**
   * Health check including cache status
   */
  async healthCheck(): Promise<any> {
    const cacheHealthy = await this.cache.healthCheck();
    const cacheStats = await this.cache.getCacheStats();

    return {
      status: 'healthy',
      services: {
        database: 'connected', // Assume connected if we reach here
        cache: cacheHealthy ? 'connected' : 'disconnected'
      },
      cache: cacheStats,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Trigger emergency support for users in critical financial distress
   */
  private async triggerEmergencySupport(userId: string, pdiScore: PDIScore): Promise<void> {
    // Create high-priority alert
    const profile = await this.prisma.pDIProfile.findUnique({ where: { userId } });
    if (!profile) return;

    await this.prisma.pDIAlert.create({
      data: {
        profileId: profile.id,
        alertType: 'emergency_intervention',
        alertMessage: 'Emergency intervention triggered due to extreme financial distress. Immediate support activated.',
        triggerValue: pdiScore.score,
        damoclesActionTriggered: true
      }
    });

    // TODO: Integrate with external emergency support services
    // - Automatically generate priority GDPR requests
    // - Notify human support team
    // - Send emergency debt freeze letters
    // - Connect to national debt helpline

    console.log(`Emergency support triggered for user ${userId} with PDI score ${pdiScore.score}`);
  }

  /**
   * Check if user should see investment/token content based on ethical guardrails
   */
  async canUserSeeInvestmentContent(userId: string): Promise<boolean> {
    const profile = await this.prisma.pDIProfile.findUnique({ where: { userId } });
    if (!profile) return true; // No PDI profile = allow

    // Never show to users who can't afford necessities or are in critical state
    if (profile.currentScore < 40) return false;

    // Get latest metrics to check DSR
    const latestInputs = await this.prisma.pDIInput.findFirst({
      where: { profileId: profile.id },
      orderBy: { inputDate: 'desc' }
    });

    if (latestInputs) {
      const dsr = (latestInputs.monthlyDebtPayments / latestInputs.monthlyIncome) * 100;
      if (dsr > 50) return false; // Can't afford necessities
    }

    return true;
  }

  /**
   * Get supportive messaging for vulnerable users
   */
  async getSupportiveMessaging(userId: string): Promise<string[]> {
    const profile = await this.prisma.pDIProfile.findUnique({ where: { userId } });
    if (!profile) return [];

    // Create a mock PDI score for vulnerability assessment
    const mockPdiScore = {
      score: profile.currentScore,
      category: profile.scoreCategory as any,
      metrics: {
        dsr: { value: 35, score: 15, category: 'caution' },
        dti: { value: 40, score: 18, category: 'caution' },
        creditUtilization: { value: 60, score: 12, category: 'risky' },
        debtToAssets: { value: 120, score: 8, category: 'risky' },
        debtGrowth: { value: 2, score: 18, category: 'healthy' }
      }
    } as any;

    const vulnerability = ethicalGuardrails.assessVulnerability(mockPdiScore);
    return ethicalGuardrails.generateSupportiveMessaging(vulnerability);
  }
}