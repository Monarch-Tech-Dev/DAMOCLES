import { TrustScoreEngine } from './TrustScoreEngine';
import {
  TrustScoreCalculation,
  Claim,
  Evidence,
  ViolationAnalysis,
  TrustScoreInput
} from '../types/index';

interface PDIEnhancedInput extends TrustScoreInput {
  pdiScore?: number;
  pdiCategory?: 'healthy' | 'caution' | 'risky' | 'critical';
  userFinancialVulnerability?: number; // 0-1 scale
}

interface PDIWeightedResult extends TrustScoreCalculation {
  pdiInfluence: number;
  vulnerabilityMultiplier: number;
  adjustedScore: number;
}

/**
 * Enhanced Trust Engine with PDI (Personal Debt Index) Integration
 * Provides higher trust scores for financially vulnerable users
 * ensuring they get prioritized protection from DAMOCLES
 */
export class EnhancedTrustEngine extends TrustScoreEngine {
  private static readonly PDI_WEIGHT = 0.25; // 25% influence on final score
  private static readonly VULNERABILITY_MULTIPLIER_MAX = 2.0; // 2x max boost

  /**
   * Calculate trust score with PDI enhancement
   * Financially vulnerable users get higher trust scores for equal claims
   */
  calculateEnhancedTrustScore(
    claims: Claim[],
    pdiData?: {
      score: number;
      category: 'healthy' | 'caution' | 'risky' | 'critical';
    }
  ): PDIWeightedResult {
    // Calculate base trust score using parent engine
    const baseTrustScore = super.calculateTrustScore(claims);

    if (!pdiData) {
      return {
        ...baseTrustScore,
        pdiInfluence: 0,
        vulnerabilityMultiplier: 1.0,
        adjustedScore: baseTrustScore.finalScore
      };
    }

    // Calculate vulnerability multiplier based on PDI score
    const vulnerabilityMultiplier = this.calculateVulnerabilityMultiplier(
      pdiData.score,
      pdiData.category
    );

    // Calculate PDI influence on trust score
    const pdiInfluence = this.calculatePDIInfluence(pdiData.score, pdiData.category);

    // Apply enhancement to final score
    const adjustedScore = Math.min(100,
      baseTrustScore.finalScore * vulnerabilityMultiplier + pdiInfluence
    );

    return {
      ...baseTrustScore,
      pdiInfluence,
      vulnerabilityMultiplier,
      adjustedScore,
      finalScore: adjustedScore
    };
  }

  /**
   * Calculate violation score with PDI context
   * Critical PDI users get escalated priority for violations
   */
  calculateViolationScoreWithPDI(
    violationData: any,
    pdiScore?: number,
    pdiCategory?: string
  ): ViolationAnalysis {
    // Base violation analysis
    const baseAnalysis = this.analyzeViolation(violationData);

    if (!pdiScore || !pdiCategory) {
      return baseAnalysis;
    }

    // Apply PDI-based severity multiplier
    const pdiMultiplier = this.getPDISeverityMultiplier(pdiScore, pdiCategory);

    const enhancedAnalysis: ViolationAnalysis = {
      ...baseAnalysis,
      severityScore: Math.min(100, baseAnalysis.severityScore * pdiMultiplier),
      urgencyLevel: this.calculateEnhancedUrgency(baseAnalysis.urgencyLevel, pdiCategory),
      recommendedActions: this.enhanceRecommendations(
        baseAnalysis.recommendedActions,
        pdiCategory
      ),
      metadata: {
        ...baseAnalysis.metadata,
        pdiEnhanced: true,
        pdiMultiplier,
        originalSeverity: baseAnalysis.severityScore
      }
    };

    return enhancedAnalysis;
  }

  /**
   * Calculate how much PDI should influence trust score
   */
  private calculatePDIInfluence(score: number, category: string): number {
    // Critical users get maximum influence
    if (category === 'critical' || score < 40) {
      return 15; // +15 points to trust score
    }

    // Risky users get moderate influence
    if (category === 'risky' || score < 60) {
      return 8; // +8 points to trust score
    }

    // Caution users get minor influence
    if (category === 'caution' || score < 80) {
      return 3; // +3 points to trust score
    }

    // Healthy users get no boost
    return 0;
  }

  /**
   * Calculate vulnerability multiplier based on PDI
   */
  private calculateVulnerabilityMultiplier(score: number, category: string): number {
    // Critical financial situation = maximum protection
    if (category === 'critical' || score < 30) {
      return 1.8; // 80% boost
    }

    if (category === 'risky' || score < 50) {
      return 1.5; // 50% boost
    }

    if (category === 'caution' || score < 70) {
      return 1.2; // 20% boost
    }

    // Healthy users get standard scoring
    return 1.0;
  }

  /**
   * Get PDI-based severity multiplier for violations
   */
  private getPDISeverityMultiplier(score: number, category: string): number {
    // Financially vulnerable users have violations treated more seriously
    if (category === 'critical') {
      return 2.0; // Double severity
    }

    if (category === 'risky') {
      return 1.5; // 50% more severe
    }

    if (category === 'caution') {
      return 1.25; // 25% more severe
    }

    return 1.0; // Standard severity
  }

  /**
   * Calculate enhanced urgency level
   */
  private calculateEnhancedUrgency(
    baseUrgency: 'low' | 'medium' | 'high' | 'critical',
    pdiCategory: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Critical PDI users get escalated urgency
    if (pdiCategory === 'critical') {
      if (baseUrgency === 'low') return 'medium';
      if (baseUrgency === 'medium') return 'high';
      if (baseUrgency === 'high') return 'critical';
    }

    // Risky PDI users get moderate escalation
    if (pdiCategory === 'risky') {
      if (baseUrgency === 'low') return 'medium';
      if (baseUrgency === 'medium') return 'high';
    }

    return baseUrgency;
  }

  /**
   * Enhance recommendations based on PDI category
   */
  private enhanceRecommendations(
    baseRecommendations: string[],
    pdiCategory: string
  ): string[] {
    const enhanced = [...baseRecommendations];

    if (pdiCategory === 'critical') {
      enhanced.unshift('PRIORITY: User in critical financial situation - expedite all actions');
      enhanced.push('Consider emergency financial counseling referral');
      enhanced.push('Trigger maximum DAMOCLES protection protocols');
    } else if (pdiCategory === 'risky') {
      enhanced.push('Monitor for signs of financial distress escalation');
      enhanced.push('Provide additional consumer education resources');
    }

    return enhanced;
  }

  /**
   * Analyze violation with full PDI context
   */
  private analyzeViolation(violationData: any): ViolationAnalysis {
    // This would integrate with the existing violation analysis logic
    // For now, return a mock analysis
    return {
      violationId: violationData.id || 'unknown',
      severityScore: violationData.severity || 50,
      urgencyLevel: 'medium',
      recommendedActions: ['Review violation', 'Generate GDPR request'],
      confidence: 0.85,
      metadata: {
        analysisTimestamp: new Date().toISOString(),
        engineVersion: '2.0.0-pdi'
      }
    };
  }

  /**
   * Get recommended DAMOCLES action priority based on combined scoring
   */
  getDamoclesActionPriority(
    trustScore: number,
    violationScore: number,
    pdiScore: number,
    pdiCategory: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Calculate composite priority score
    const compositeScore = (trustScore * 0.4) + (violationScore * 0.4) +
                          (this.getPDIPriorityBoost(pdiScore, pdiCategory) * 0.2);

    if (pdiCategory === 'critical' && compositeScore > 60) {
      return 'critical';
    }

    if (compositeScore > 80) return 'high';
    if (compositeScore > 60) return 'medium';
    return 'low';
  }

  /**
   * Get PDI priority boost for action priority calculation
   */
  private getPDIPriorityBoost(score: number, category: string): number {
    if (category === 'critical') return 100;
    if (category === 'risky') return 75;
    if (category === 'caution') return 50;
    return 25;
  }

  /**
   * Generate enhanced trust report including PDI analysis
   */
  generateEnhancedTrustReport(
    claims: Claim[],
    pdiData?: { score: number; category: 'healthy' | 'caution' | 'risky' | 'critical' }
  ): any {
    const enhancedResult = this.calculateEnhancedTrustScore(claims, pdiData);

    return {
      trustAnalysis: enhancedResult,
      pdiIntegration: {
        enabled: !!pdiData,
        pdiScore: pdiData?.score,
        pdiCategory: pdiData?.category,
        vulnerabilityMultiplier: enhancedResult.vulnerabilityMultiplier,
        pdiInfluence: enhancedResult.pdiInfluence
      },
      recommendations: this.generateContextualRecommendations(enhancedResult, pdiData),
      actionPriority: pdiData ? this.getDamoclesActionPriority(
        enhancedResult.finalScore,
        enhancedResult.finalScore, // Using trust score as violation score for now
        pdiData.score,
        pdiData.category
      ) : 'medium'
    };
  }

  /**
   * Generate contextual recommendations
   */
  private generateContextualRecommendations(result: PDIWeightedResult, pdiData?: any): string[] {
    const recommendations = [];

    if (result.adjustedScore > 80) {
      recommendations.push('High trust score - prioritize for DAMOCLES protection');
    }

    if (pdiData?.category === 'critical') {
      recommendations.push('Critical PDI - implement emergency financial protection measures');
      recommendations.push('Consider immediate creditor contact and negotiation');
    }

    if (result.vulnerabilityMultiplier > 1.5) {
      recommendations.push('High vulnerability detected - escalate to priority queue');
    }

    return recommendations;
  }
}