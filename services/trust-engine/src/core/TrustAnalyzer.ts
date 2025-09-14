// Sacred Architecture Trust Analyzer
// Integration point between TrustScore Engine and Kindness Algorithm
// Built with love for consumer protection ❤️⚔️

import { 
  TrustAnalysisRequest,
  TrustAnalysisResponse,
  TrustScoreCalculation,
  ContradictionResult,
  KindnessMetrics,
  Recommendation,
  EducationalContent,
  SystemBehavior,
  AnalysisContext,
  SWORDTriggerAnalysis
} from '../types/index';
import { TrustScoreEngine } from './TrustScoreEngine';
import { KindnessAlgorithm } from './KindnessAlgorithm';
import { NorwegianAuthorityHierarchy } from './AuthorityHierarchy';

export class TrustAnalyzer {
  private trustScoreEngine: TrustScoreEngine;
  private kindnessAlgorithm: KindnessAlgorithm;
  private authorityHierarchy: NorwegianAuthorityHierarchy;

  constructor() {
    this.trustScoreEngine = new TrustScoreEngine();
    this.kindnessAlgorithm = new KindnessAlgorithm();
    this.authorityHierarchy = new NorwegianAuthorityHierarchy();
  }

  /**
   * Main analysis method - combines trust scoring with kindness principles
   */
  async analyzeTrust(request: TrustAnalysisRequest): Promise<TrustAnalysisResponse> {
    // Step 1: Calculate mathematical trust score
    const trustScore = this.trustScoreEngine.calculateTrustScore(request.claims);
    
    // Step 2: Extract contradictions for detailed analysis
    const contradictions = this.extractContradictions(trustScore);
    
    // Step 3: Apply kindness algorithm for user-centered response
    const kindnessConfig = request.kindnessConfig || {};
    this.kindnessAlgorithm = new KindnessAlgorithm(kindnessConfig);
    
    // Step 4: Generate kind educational recommendations
    const recommendations = this.kindnessAlgorithm.createEducationalRecommendations(
      trustScore, 
      contradictions
    );
    
    // Step 5: Create educational content
    const educationalContent = this.kindnessAlgorithm.createEducationalContent(contradictions);
    
    // Step 6: Determine system behavior classification
    const systemBehavior = this.analyzeSystemBehavior(request, trustScore);
    
    // Step 7: Calculate kindness metrics for the interaction
    const kindnessMetrics = this.calculateKindnessMetrics(request, trustScore);

    return {
      trustScore,
      kindnessMetrics,
      contradictions,
      recommendations,
      educationalContent,
      systemBehavior
    };
  }

  /**
   * DAMOCLES-specific analysis for debt collection claims
   */
  async analyzeDebtCollection(
    creditorClaims: string[],
    userEvidence: string[],
    context: AnalysisContext
  ): Promise<TrustAnalysisResponse & { damoclesSpecific: any }> {
    // Convert to standard claim format
    const claims = [
      ...creditorClaims.map((content, idx) => ({
        id: `creditor_${idx}`,
        content,
        source: this.inferCreditorSource(content, context),
        timestamp: new Date(),
        metadata: { type: 'creditor_claim', context }
      })),
      ...userEvidence.map((content, idx) => ({
        id: `user_evidence_${idx}`,
        content,
        source: 'verifisert_bruker',
        timestamp: new Date(),
        metadata: { type: 'user_evidence', context }
      }))
    ];

    // Perform standard trust analysis
    const standardAnalysis = await this.analyzeTrust({
      claims,
      context,
      kindnessConfig: {
        protectVulnerability: true,  // Extra care for debt situations
        explainReasoning: true,      // Help users understand their rights
        facilitateGrowth: true       // Empower users with knowledge
      }
    });

    // Add DAMOCLES-specific insights
    const damoclesSpecific = {
      violationDetection: this.detectNorwegianDebtViolations(creditorClaims),
      gdprCompliance: this.analyzeGDPRCompliance(creditorClaims, userEvidence),
      legalRights: this.identifyUserRights(context),
      swordEligibility: this.assessSWORDProtocolEligibility(standardAnalysis.trustScore)
    };

    return {
      ...standardAnalysis,
      damoclesSpecific
    };
  }

  /**
   * Real-time analysis for GDPR responses
   */
  async analyzeGDPRResponse(
    gdprResponse: string,
    originalRequest: string,
    creditorInfo: any
  ): Promise<TrustAnalysisResponse> {
    const claims = [
      {
        id: 'gdpr_response',
        content: gdprResponse,
        source: creditorInfo.type || 'inkassoselskap',
        timestamp: new Date(),
        metadata: { type: 'gdpr_response' }
      },
      {
        id: 'gdpr_requirement',
        content: 'GDPR Article 15 requires complete disclosure of all personal data processing',
        source: 'datatilsynet',
        timestamp: new Date(),
        metadata: { type: 'legal_requirement' }
      }
    ];

    const analysis = await this.analyzeTrust({
      claims,
      context: {
        domain: 'gdpr',
        jurisdiction: 'norway',
        urgencyLevel: 'high'
      },
      kindnessConfig: {
        protectVulnerability: true,
        explainReasoning: true
      }
    });

    // Add GDPR-specific violation analysis
    const gdprViolations = this.detectGDPRViolations(gdprResponse, originalRequest);
    analysis.contradictions.push(...gdprViolations);

    return analysis;
  }

  /**
   * Settlement logic analysis (DNB pattern detection)
   */
  async analyzeSettlementLogic(
    denialStatements: string[],
    settlementOffers: string[],
    context: AnalysisContext
  ): Promise<TrustAnalysisResponse> {
    const claims = [
      ...denialStatements.map((content, idx) => ({
        id: `denial_${idx}`,
        content,
        source: context.domain === 'banking' ? 'storbank' : 'inkassoselskap',
        timestamp: new Date(),
        metadata: { type: 'denial_statement' }
      })),
      ...settlementOffers.map((content, idx) => ({
        id: `settlement_${idx}`,
        content,
        source: context.domain === 'banking' ? 'storbank' : 'inkassoselskap',
        timestamp: new Date(),
        metadata: { type: 'settlement_offer' }
      }))
    ];

    return await this.analyzeTrust({
      claims,
      context: {
        ...context,
        urgencyLevel: 'high' // Settlement contradictions are high priority
      },
      kindnessConfig: {
        explainReasoning: true,
        facilitateGrowth: true,
        protectVulnerability: true
      }
    });
  }

  /**
   * SWORD Protocol eligibility analysis
   */
  analyzeSWORDEligibility(
    creditorId: string,
    aggregatedTrustScore: number,
    affectedUsers: number,
    violationCount: number
  ): SWORDTriggerAnalysis {
    const collectivePower = this.calculateCollectivePower(affectedUsers, violationCount, aggregatedTrustScore);
    const legalStrength = this.calculateLegalStrength(aggregatedTrustScore, violationCount);
    
    let recommendedAction: 'monitor' | 'investigate' | 'initiate_sword' | 'emergency_action' = 'monitor';
    
    if (aggregatedTrustScore < 20 && affectedUsers > 50) {
      recommendedAction = 'emergency_action';
    } else if (aggregatedTrustScore < 30 && affectedUsers > 20) {
      recommendedAction = 'initiate_sword';
    } else if (aggregatedTrustScore < 50) {
      recommendedAction = 'investigate';
    }

    return {
      creditorId,
      aggregatedTrustScore,
      affectedUsers,
      totalViolations: violationCount,
      recommendedAction,
      collectivePower,
      expectedOutcome: this.predictSWORDOutcome(collectivePower, legalStrength),
      legalStrength
    };
  }

  // Private helper methods

  private extractContradictions(trustScore: TrustScoreCalculation): ContradictionResult[] {
    return trustScore.contradictionPenalties.map(penalty => ({
      detected: true,
      confidence: penalty.contradiction_penalty,
      type: penalty.contradictionType,
      explanation: penalty.explanation,
      kindnessMessage: this.generateKindnessMessage(penalty),
      evidence: [],
      recommendation: this.generateRecommendation(penalty)
    }));
  }

  private generateKindnessMessage(penalty: any): string {
    return `We noticed something that might need gentle attention. ${penalty.explanation}`;
  }

  private generateRecommendation(penalty: any): string {
    switch (penalty.contradictionType) {
      case 'settlement_logic':
        return 'Consider highlighting this logical inconsistency in negotiations';
      case 'data_contradiction':
        return 'Request clarification about data processing activities';
      case 'authority_hierarchy':
        return 'Prioritize guidance from the higher authority source';
      default:
        return 'Consider seeking additional clarification';
    }
  }

  private analyzeSystemBehavior(
    request: TrustAnalysisRequest, 
    trustScore: TrustScoreCalculation
  ): SystemBehavior {
    // Analyze if the system/claims serve or extract from user
    const userValue = this.calculateUserValue(request);
    const systemGain = this.calculateSystemGain(request);
    const communityImpact = this.calculateCommunityImpact(trustScore);

    return this.kindnessAlgorithm.classifySystemBehavior(userValue, systemGain, communityImpact);
  }

  private calculateKindnessMetrics(
    request: TrustAnalysisRequest,
    trustScore: TrustScoreCalculation
  ): KindnessMetrics {
    // Mock data - in production, this would analyze real interaction patterns
    const userInteractions = [{ type: 'trust_analysis', benefit: trustScore.finalScore / 100 }];
    const systemBehavior = [{ type: 'transparency_increase', impact: 0.8 }];
    const communityData = [{ type: 'knowledge_sharing', effect: 0.7 }];

    return this.kindnessAlgorithm.calculateKindnessMetrics(
      userInteractions,
      systemBehavior,
      communityData,
      1 // 1 day time window
    );
  }

  private calculateUserValue(request: TrustAnalysisRequest): number {
    // How much value does this analysis provide to the user?
    const hasHighConfidenceContradictions = request.claims.length > 1 ? 0.3 : 0;
    const hasEducationalValue = 0.4; // Always educational
    const hasEmpowermentValue = 0.3;  // Always empowering
    
    return hasHighConfidenceContradictions + hasEducationalValue + hasEmpowermentValue;
  }

  private calculateSystemGain(request: TrustAnalysisRequest): number {
    // What does the system gain? (Should be minimal in Sacred Architecture)
    return 0.1; // Minimal data collection for improvement
  }

  private calculateCommunityImpact(trustScore: TrustScoreCalculation): number {
    // How does this analysis benefit the broader community?
    if (trustScore.finalScore < 30) return 0.5; // Helps identify bad actors
    if (trustScore.contradictionPenalties.length > 0) return 0.3; // Educational value
    return 0.1; // Baseline community benefit
  }

  private inferCreditorSource(content: string, context: AnalysisContext): string {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('dnb') || contentLower.includes('nordea')) return 'storbank';
    if (contentLower.includes('klarna') || contentLower.includes('vipps')) return 'bnpl_selskap';
    if (contentLower.includes('inkasso') || contentLower.includes('collection')) return 'inkassoselskap';
    if (context.domain === 'banking') return 'storbank';
    
    return 'ukjent_kilde';
  }

  private detectNorwegianDebtViolations(creditorClaims: string[]): any[] {
    const violations: any[] = [];
    
    creditorClaims.forEach(claim => {
      const claimLower = claim.toLowerCase();
      
      // Check for excessive interest rates
      const interestMatch = claim.match(/(\d+(?:\.\d+)?)%/);
      if (interestMatch && parseFloat(interestMatch[1]) > 23.5) {
        violations.push({
          type: 'excessive_interest',
          details: `Interest rate ${interestMatch[1]}% exceeds Norwegian maximum of 23.5%`,
          severity: 'high',
          legalBasis: 'Finansavtaleloven § 50'
        });
      }
      
      // Check for excessive fees
      if (claimLower.includes('gebyr') || claimLower.includes('fee')) {
        violations.push({
          type: 'potential_excessive_fees',
          details: 'Fees mentioned - verify against Norwegian regulations',
          severity: 'medium',
          legalBasis: 'Inkassoregelverk § 3'
        });
      }
    });
    
    return violations;
  }

  private analyzeGDPRCompliance(creditorClaims: string[], userEvidence: string[]): any {
    return {
      completeness: this.assessGDPRCompleteness(creditorClaims),
      timeliness: this.assessGDPRTimeliness(creditorClaims),
      accuracy: this.assessGDPRAccuracy(creditorClaims, userEvidence)
    };
  }

  private identifyUserRights(context: AnalysisContext): string[] {
    const rights = [
      'Right to accurate information (GDPR Article 5)',
      'Right to data portability (GDPR Article 20)',
      'Right to erasure (GDPR Article 17)',
      'Right to fair debt collection (Inkassoregelverk)'
    ];

    if (context.domain === 'debt_collection') {
      rights.push(
        'Right to challenge excessive fees',
        'Right to payment plan negotiations',
        'Protection against harassment'
      );
    }

    return rights;
  }

  private assessSWORDProtocolEligibility(trustScore: TrustScoreCalculation): any {
    return {
      eligible: trustScore.finalScore < 40,
      confidence: trustScore.confidence,
      violationCount: trustScore.contradictionPenalties.length,
      recommendation: trustScore.finalScore < 20 ? 'Initiate SWORD Protocol' : 'Continue monitoring'
    };
  }

  private detectGDPRViolations(gdprResponse: string, originalRequest: string): ContradictionResult[] {
    // Implement GDPR-specific violation detection
    return [];
  }

  private calculateCollectivePower(affectedUsers: number, violationCount: number, trustScore: number): number {
    const userFactor = Math.min(1, affectedUsers / 100); // Optimal around 100 users
    const violationFactor = Math.min(1, violationCount / 50); // Optimal around 50 violations
    const trustFactor = Math.max(0, (100 - trustScore) / 100); // Lower trust = higher power
    
    return (userFactor + violationFactor + trustFactor) / 3;
  }

  private calculateLegalStrength(trustScore: number, violationCount: number): number {
    const trustFactor = Math.max(0, (100 - trustScore) / 100);
    const evidenceFactor = Math.min(1, violationCount / 20);
    
    return (trustFactor + evidenceFactor) / 2;
  }

  private predictSWORDOutcome(collectivePower: number, legalStrength: number): string {
    const overallStrength = (collectivePower + legalStrength) / 2;
    
    if (overallStrength > 0.8) return 'Very high likelihood of successful settlement (70-80% debt reduction)';
    if (overallStrength > 0.6) return 'High likelihood of successful settlement (50-70% debt reduction)';
    if (overallStrength > 0.4) return 'Moderate likelihood of settlement (30-50% debt reduction)';
    return 'Monitoring recommended, limited settlement potential';
  }

  private assessGDPRCompleteness(claims: string[]): number {
    // Mock implementation
    return 0.7;
  }

  private assessGDPRTimeliness(claims: string[]): number {
    // Mock implementation
    return 0.8;
  }

  private assessGDPRAccuracy(creditorClaims: string[], userEvidence: string[]): number {
    // Mock implementation
    return 0.6;
  }
}