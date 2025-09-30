import axios from 'axios';

export interface CollectorRiskData {
  collectorId: string;
  riskScore: number;
  totalViolations: number;
  violationScore: number;
  complianceRating: string;
  lastUpdated: Date;
}

export interface ViolationPatternData {
  id: string;
  collectorId: string;
  article: string;
  violationType: string;
  occurrenceCount: number;
  severity: string;
  confidence: number;
  lastOccurrence: Date;
}

export interface ResponsePatternData {
  id: string;
  creditorId: string;
  triggerPhrase: string;
  successRate: number;
  admissionType: string;
  complianceIndicators: string[];
  lastUpdated: Date;
}

export interface RiskCalculationInput {
  collectorId: string;
  violationPatterns?: ViolationPatternData[];
  responsePatterns?: ResponsePatternData[];
  gdprResponseData?: any;
  settlementPatterns?: any;
  authorityWeights?: Record<string, number>;
}

export interface RiskCalculationResult {
  collectorId: string;
  overallRiskScore: number;
  violationScore: number;
  complianceScore: number;
  trustScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  breakdown: {
    gdprCompliance: number;
    settlementLogic: number;
    responsePatterns: number;
    violationFrequency: number;
    authorityRespect: number;
  };
  recommendations: string[];
  lastCalculated: Date;
}

export class CollectorRiskCalculator {
  private userServiceUrl: string;

  constructor(userServiceUrl: string = 'http://localhost:3001') {
    this.userServiceUrl = userServiceUrl;
  }

  /**
   * Calculate comprehensive risk score for a collector
   */
  async calculateRiskScore(input: RiskCalculationInput): Promise<RiskCalculationResult> {
    const violationScore = this.calculateViolationScore(input.violationPatterns || []);
    const complianceScore = this.calculateComplianceScore(input.responsePatterns || []);
    const settlementLogicScore = this.calculateSettlementLogicScore(input.settlementPatterns);
    const authorityRespectScore = this.calculateAuthorityRespectScore(input.violationPatterns || [], input.authorityWeights || {});
    const responsePatternScore = this.calculateResponsePatternScore(input.responsePatterns || []);

    const breakdown = {
      gdprCompliance: complianceScore,
      settlementLogic: settlementLogicScore,
      responsePatterns: responsePatternScore,
      violationFrequency: violationScore,
      authorityRespect: authorityRespectScore
    };

    // Weighted overall risk calculation
    const overallRiskScore = this.calculateWeightedRiskScore(breakdown);
    const trustScore = Math.max(0, 100 - overallRiskScore);
    const riskLevel = this.determineRiskLevel(overallRiskScore);
    const recommendations = this.generateRecommendations(breakdown, riskLevel);

    const result: RiskCalculationResult = {
      collectorId: input.collectorId,
      overallRiskScore,
      violationScore,
      complianceScore,
      trustScore,
      riskLevel,
      breakdown,
      recommendations,
      lastCalculated: new Date()
    };

    // Store the calculated risk score
    await this.storeRiskScore(result);

    return result;
  }

  /**
   * Calculate violation-based risk score
   */
  private calculateViolationScore(violationPatterns: ViolationPatternData[]): number {
    if (violationPatterns.length === 0) return 0;

    let totalScore = 0;
    const severityWeights = {
      'LOW': 1,
      'MEDIUM': 3,
      'HIGH': 7,
      'CRITICAL': 15
    };

    for (const pattern of violationPatterns) {
      const severityWeight = severityWeights[pattern.severity as keyof typeof severityWeights] || 1;
      const frequencyMultiplier = Math.min(pattern.occurrenceCount / 10, 2); // Cap at 2x
      const confidenceMultiplier = pattern.confidence;

      totalScore += severityWeight * frequencyMultiplier * confidenceMultiplier;
    }

    // Normalize to 0-100 scale
    return Math.min(totalScore, 100);
  }

  /**
   * Calculate GDPR compliance score
   */
  private calculateComplianceScore(responsePatterns: ResponsePatternData[]): number {
    if (responsePatterns.length === 0) return 50; // Neutral score

    let totalComplianceScore = 0;
    let weightedPatterns = 0;

    for (const pattern of responsePatterns) {
      const complianceIndicators = pattern.complianceIndicators || [];
      let patternScore = 0;

      // Positive compliance indicators
      if (complianceIndicators.includes('GDPR_COMPLIANT')) patternScore += 20;
      if (complianceIndicators.includes('TRANSPARENT_RESPONSE')) patternScore += 15;
      if (complianceIndicators.includes('TIMELY_RESPONSE')) patternScore += 10;
      if (complianceIndicators.includes('COMPLETE_DATA')) patternScore += 15;
      if (complianceIndicators.includes('CLEAR_LANGUAGE')) patternScore += 10;

      // Negative compliance indicators
      if (complianceIndicators.includes('GDPR_VIOLATION')) patternScore -= 30;
      if (complianceIndicators.includes('EVASIVE_RESPONSE')) patternScore -= 20;
      if (complianceIndicators.includes('DELAYED_RESPONSE')) patternScore -= 15;
      if (complianceIndicators.includes('INCOMPLETE_DATA')) patternScore -= 25;

      totalComplianceScore += patternScore * pattern.successRate;
      weightedPatterns += pattern.successRate;
    }

    return weightedPatterns > 0 ? Math.max(0, Math.min(100, totalComplianceScore / weightedPatterns + 50)) : 50;
  }

  /**
   * Calculate settlement logic consistency score
   */
  private calculateSettlementLogicScore(settlementPatterns: any): number {
    if (!settlementPatterns) return 50; // Neutral score

    let logicScore = 100; // Start with perfect logic

    // Check for settlement logic contradictions
    if (settlementPatterns.deniesLiabilityButOffersSettlement) {
      logicScore -= 40; // Major logical contradiction
    }

    if (settlementPatterns.inconsistentSettlementOffers) {
      logicScore -= 20;
    }

    if (settlementPatterns.contradictoryStatements) {
      logicScore -= 30;
    }

    if (settlementPatterns.hasPattern && settlementPatterns.consistencyScore) {
      logicScore = Math.min(logicScore, settlementPatterns.consistencyScore);
    }

    return Math.max(0, logicScore);
  }

  /**
   * Calculate authority respect score
   */
  private calculateAuthorityRespectScore(violationPatterns: ViolationPatternData[], authorityWeights: Record<string, number>): number {
    if (violationPatterns.length === 0) return 100; // Perfect score if no violations

    let authorityScore = 100;
    let maxAuthorityViolation = 0;

    for (const pattern of violationPatterns) {
      // Check if violation contradicts high-authority sources
      const authorityWeight = authorityWeights[pattern.article] || 0.5;

      if (authorityWeight > 0.8) { // High authority source
        maxAuthorityViolation = Math.max(maxAuthorityViolation, pattern.occurrenceCount * 20);
      } else if (authorityWeight > 0.6) { // Medium authority
        maxAuthorityViolation = Math.max(maxAuthorityViolation, pattern.occurrenceCount * 10);
      } else { // Low authority
        maxAuthorityViolation = Math.max(maxAuthorityViolation, pattern.occurrenceCount * 5);
      }
    }

    return Math.max(0, authorityScore - maxAuthorityViolation);
  }

  /**
   * Calculate response pattern score
   */
  private calculateResponsePatternScore(responsePatterns: ResponsePatternData[]): number {
    if (responsePatterns.length === 0) return 50; // Neutral score

    let totalScore = 0;
    let totalWeight = 0;

    for (const pattern of responsePatterns) {
      let patternScore = pattern.successRate * 100;

      // Adjust based on admission type
      switch (pattern.admissionType) {
        case 'FULL_ADMISSION':
          patternScore += 20;
          break;
        case 'PARTIAL_ADMISSION':
          patternScore += 10;
          break;
        case 'NO_ADMISSION':
          patternScore -= 10;
          break;
        case 'DENIAL':
          patternScore -= 20;
          break;
      }

      totalScore += patternScore;
      totalWeight += 1;
    }

    return totalWeight > 0 ? Math.max(0, Math.min(100, totalScore / totalWeight)) : 50;
  }

  /**
   * Calculate weighted overall risk score
   */
  private calculateWeightedRiskScore(breakdown: any): number {
    const weights = {
      gdprCompliance: 0.25,
      settlementLogic: 0.20,
      responsePatterns: 0.20,
      violationFrequency: 0.20,
      authorityRespect: 0.15
    };

    // Convert compliance scores to risk scores (invert)
    const riskBreakdown = {
      gdprCompliance: 100 - breakdown.gdprCompliance,
      settlementLogic: 100 - breakdown.settlementLogic,
      responsePatterns: 100 - breakdown.responsePatterns,
      violationFrequency: breakdown.violationFrequency,
      authorityRespect: 100 - breakdown.authorityRespect
    };

    let weightedScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
      weightedScore += riskBreakdown[key as keyof typeof riskBreakdown] * weight;
    }

    return Math.min(100, Math.max(0, weightedScore));
  }

  /**
   * Determine risk level based on overall score
   */
  private determineRiskLevel(overallRiskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (overallRiskScore >= 80) return 'CRITICAL';
    if (overallRiskScore >= 60) return 'HIGH';
    if (overallRiskScore >= 40) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate recommendations based on risk analysis
   */
  private generateRecommendations(breakdown: any, riskLevel: string): string[] {
    const recommendations: string[] = [];

    if (breakdown.gdprCompliance < 60) {
      recommendations.push('⚠️ GDPR compliance concerns detected. Review data processing practices.');
    }

    if (breakdown.settlementLogic < 50) {
      recommendations.push('🔍 Settlement logic contradictions found. Document inconsistencies for legal use.');
    }

    if (breakdown.violationFrequency > 70) {
      recommendations.push('🚨 High violation frequency. Consider collective action or regulatory complaint.');
    }

    if (breakdown.authorityRespect < 40) {
      recommendations.push('⚖️ Authority hierarchy violations detected. Strong legal precedent available.');
    }

    if (breakdown.responsePatterns < 50) {
      recommendations.push('📋 Poor response patterns. Escalation to regulatory authorities recommended.');
    }

    if (riskLevel === 'CRITICAL') {
      recommendations.push('🔴 CRITICAL RISK: Immediate legal consultation recommended.');
      recommendations.push('🛡️ Consider SWORD Protocol collective action eligibility.');
    } else if (riskLevel === 'HIGH') {
      recommendations.push('🟠 HIGH RISK: Enhanced protection measures recommended.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Collector shows acceptable risk levels. Continue monitoring.');
    }

    return recommendations;
  }

  /**
   * Store calculated risk score in database
   */
  private async storeRiskScore(result: RiskCalculationResult): Promise<void> {
    try {
      const payload = {
        collectorId: result.collectorId,
        riskScore: result.overallRiskScore,
        totalViolations: result.breakdown.violationFrequency,
        violationScore: result.violationScore,
        complianceRating: result.riskLevel,
        lastUpdated: result.lastCalculated
      };

      await axios.post(`${this.userServiceUrl}/api/risk-scores`, payload);
    } catch (error) {
      console.error('Failed to store risk score:', error);
      // Don't throw - calculation should succeed even if storage fails
    }
  }

  /**
   * Get stored risk score for a collector
   */
  async getStoredRiskScore(collectorId: string): Promise<CollectorRiskData | null> {
    try {
      const response = await axios.get(`${this.userServiceUrl}/api/risk-scores/${collectorId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to retrieve stored risk score:', error);
      return null;
    }
  }

  /**
   * Get violation patterns for a collector
   */
  async getViolationPatterns(collectorId: string): Promise<ViolationPatternData[]> {
    try {
      const response = await axios.get(`${this.userServiceUrl}/api/violation-patterns/${collectorId}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to retrieve violation patterns:', error);
      return [];
    }
  }

  /**
   * Get response patterns for a collector
   */
  async getResponsePatterns(collectorId: string): Promise<ResponsePatternData[]> {
    try {
      const response = await axios.get(`${this.userServiceUrl}/api/response-patterns/${collectorId}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to retrieve response patterns:', error);
      return [];
    }
  }

  /**
   * Comprehensive risk assessment with data fetching
   */
  async assessCollectorRisk(collectorId: string, additionalData?: Partial<RiskCalculationInput>): Promise<RiskCalculationResult> {
    // Fetch existing patterns and data
    const [violationPatterns, responsePatterns] = await Promise.all([
      this.getViolationPatterns(collectorId),
      this.getResponsePatterns(collectorId)
    ]);

    const input: RiskCalculationInput = {
      collectorId,
      violationPatterns,
      responsePatterns,
      ...additionalData
    };

    return this.calculateRiskScore(input);
  }
}