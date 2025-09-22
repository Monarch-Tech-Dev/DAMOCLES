import { PDIService } from './service';
import { PDIScore } from './types';

/**
 * Integration service for PDI and Trust Engine
 * Provides PDI context to Trust Engine for enhanced scoring
 */
export class PDITrustIntegrationService {
  private pdiService: PDIService;

  constructor(pdiService: PDIService) {
    this.pdiService = pdiService;
  }

  /**
   * Get PDI context for Trust Engine integration
   */
  async getPDIContextForTrustEngine(userId: string): Promise<PDITrustContext | null> {
    try {
      const profile = await this.pdiService.getPDIProfile(userId);

      if (!profile) {
        return null;
      }

      return {
        score: profile.currentScore,
        category: profile.scoreCategory as 'healthy' | 'caution' | 'risky' | 'critical',
        lastCalculated: profile.lastCalculated,
        vulnerabilityLevel: this.calculateVulnerabilityLevel(profile.currentScore),
        financialStressIndicators: await this.getFinancialStressIndicators(userId),
        priorityWeight: this.calculatePriorityWeight(profile.currentScore, profile.scoreCategory)
      };
    } catch (error) {
      console.error('Failed to get PDI context for Trust Engine:', error);
      return null;
    }
  }

  /**
   * Calculate vulnerability level for Trust Engine
   */
  private calculateVulnerabilityLevel(pdiScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (pdiScore < 30) return 'critical';
    if (pdiScore < 50) return 'high';
    if (pdiScore < 70) return 'medium';
    return 'low';
  }

  /**
   * Get financial stress indicators
   */
  private async getFinancialStressIndicators(userId: string): Promise<FinancialStressIndicator[]> {
    const indicators: FinancialStressIndicator[] = [];

    try {
      const profile = await this.pdiService.getPDIProfile(userId);
      const alerts = await this.pdiService.getAlerts(userId, false);

      if (!profile) return indicators;

      // Check for critical metrics
      if (profile.metrics && profile.metrics.length > 0) {
        const recentMetrics = profile.metrics[0]; // Most recent metrics

        // Parse metrics if stored as JSON string
        let metrics: any;
        try {
          metrics = typeof recentMetrics === 'string'
            ? JSON.parse(recentMetrics as any)
            : recentMetrics;
        } catch {
          return indicators;
        }

        // DSR indicator
        if (metrics.dsr?.value > 50) {
          indicators.push({
            type: 'high_debt_service_ratio',
            severity: 'critical',
            value: metrics.dsr.value,
            description: `Debt service ratio of ${metrics.dsr.value}% exceeds safe limits`
          });
        }

        // Credit utilization indicator
        if (metrics.creditUtilization?.value > 90) {
          indicators.push({
            type: 'maxed_credit_utilization',
            severity: 'high',
            value: metrics.creditUtilization.value,
            description: `Credit utilization at ${metrics.creditUtilization.value}%`
          });
        }

        // Debt growth indicator
        if (metrics.debtGrowth?.value > 10) {
          indicators.push({
            type: 'rapid_debt_growth',
            severity: 'high',
            value: metrics.debtGrowth.value,
            description: `Debt growing at ${metrics.debtGrowth.value}% rate`
          });
        }

        // Debt-to-assets indicator
        if (metrics.debtToAssets?.value > 100) {
          indicators.push({
            type: 'insolvency_risk',
            severity: 'critical',
            value: metrics.debtToAssets.value,
            description: `Debt exceeds assets by ${metrics.debtToAssets.value - 100}%`
          });
        }
      }

      // Check recent alerts
      const criticalAlerts = alerts.filter(alert =>
        alert.alertType === 'score_critical' ||
        alert.alertType === 'rapid_decline'
      );

      if (criticalAlerts.length > 0) {
        indicators.push({
          type: 'recent_critical_alerts',
          severity: 'high',
          value: criticalAlerts.length,
          description: `${criticalAlerts.length} critical PDI alerts in recent period`
        });
      }

    } catch (error) {
      console.error('Error getting financial stress indicators:', error);
    }

    return indicators;
  }

  /**
   * Calculate priority weight for Trust Engine
   */
  private calculatePriorityWeight(score: number, category: string): number {
    // Higher weight = higher priority in Trust Engine
    if (category === 'critical' || score < 30) return 2.0;
    if (category === 'risky' || score < 50) return 1.5;
    if (category === 'caution' || score < 70) return 1.2;
    return 1.0;
  }

  /**
   * Update Trust Engine when PDI changes significantly
   */
  async notifyTrustEngineOfPDIChange(
    userId: string,
    previousScore: number,
    currentScore: number,
    category: string
  ): Promise<void> {
    const scoreDifference = Math.abs(currentScore - previousScore);

    // Only notify on significant changes
    if (scoreDifference < 10 && category !== 'critical') {
      return;
    }

    const notification: PDIChangeNotification = {
      userId,
      previousScore,
      currentScore,
      category,
      scoreDifference,
      changeType: currentScore > previousScore ? 'improvement' : 'decline',
      timestamp: new Date(),
      urgency: this.calculateChangeUrgency(scoreDifference, category)
    };

    // In a real implementation, this would send to Trust Engine service
    console.log('PDI Change Notification for Trust Engine:', notification);

    // Update any cached trust scores that might be affected
    await this.invalidateTrustCacheForUser(userId);
  }

  /**
   * Calculate urgency of PDI change for Trust Engine
   */
  private calculateChangeUrgency(scoreDifference: number, category: string): 'low' | 'medium' | 'high' | 'critical' {
    if (category === 'critical') return 'critical';
    if (scoreDifference > 20) return 'high';
    if (scoreDifference > 10) return 'medium';
    return 'low';
  }

  /**
   * Invalidate trust cache when PDI changes
   */
  private async invalidateTrustCacheForUser(userId: string): Promise<void> {
    // In a real implementation, this would invalidate Redis cache
    console.log(`Invalidating trust cache for user ${userId} due to PDI change`);
  }

  /**
   * Get violation severity multiplier based on PDI
   */
  getViolationSeverityMultiplier(pdiScore: number, pdiCategory: string): number {
    if (pdiCategory === 'critical') return 2.0;
    if (pdiCategory === 'risky') return 1.5;
    if (pdiCategory === 'caution') return 1.25;
    return 1.0;
  }

  /**
   * Determine if user should get expedited DAMOCLES processing
   */
  shouldExpediteDAMOCLESProcessing(pdiScore: number, pdiCategory: string): boolean {
    return pdiCategory === 'critical' || pdiScore < 35;
  }

  /**
   * Get recommended trust score boost for vulnerable users
   */
  getVulnerabilityTrustBoost(pdiScore: number, pdiCategory: string): number {
    if (pdiCategory === 'critical') return 15; // +15 points
    if (pdiCategory === 'risky') return 8;     // +8 points
    if (pdiCategory === 'caution') return 3;   // +3 points
    return 0;
  }
}

// Type definitions for integration
export interface PDITrustContext {
  score: number;
  category: 'healthy' | 'caution' | 'risky' | 'critical';
  lastCalculated: Date;
  vulnerabilityLevel: 'low' | 'medium' | 'high' | 'critical';
  financialStressIndicators: FinancialStressIndicator[];
  priorityWeight: number;
}

export interface FinancialStressIndicator {
  type: 'high_debt_service_ratio' | 'maxed_credit_utilization' | 'rapid_debt_growth' | 'insolvency_risk' | 'recent_critical_alerts';
  severity: 'low' | 'medium' | 'high' | 'critical';
  value: number;
  description: string;
}

export interface PDIChangeNotification {
  userId: string;
  previousScore: number;
  currentScore: number;
  category: string;
  scoreDifference: number;
  changeType: 'improvement' | 'decline';
  timestamp: Date;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export default PDITrustIntegrationService;