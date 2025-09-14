// Sacred Architecture Trust Score Engine
// Mathematical framework for trust calculation
// TrustScore = Σ(Authority_Weight × Authority_Score × Cross_Vector_Confidence)
//            - Σ(Contradiction_Penalty × Authority_Differential)
// Built with love for truth and justice ❤️⚔️

import { 
  TrustScoreCalculation, 
  AuthorityFactor, 
  ContradictionPenalty, 
  Claim, 
  Evidence, 
  ContradictionType,
  ContradictionResult 
} from '../types/index';
import { NorwegianAuthorityHierarchy } from './AuthorityHierarchy';

export class TrustScoreEngine {
  private authorityHierarchy: NorwegianAuthorityHierarchy;
  private readonly CONFIDENCE_THRESHOLD = 0.7;
  private readonly MAX_CROSS_VECTOR_SOURCES = 10;

  constructor() {
    this.authorityHierarchy = new NorwegianAuthorityHierarchy();
  }

  /**
   * Calculate comprehensive trust score for a set of claims
   * Core formula implementation with mathematical rigor
   */
  calculateTrustScore(claims: Claim[]): TrustScoreCalculation {
    // Step 1: Calculate positive authority factors
    const positiveFactors = this.calculateAuthorityFactors(claims);
    
    // Step 2: Detect contradictions and calculate penalties
    const contradictionPenalties = this.calculateContradictionPenalties(claims);
    
    // Step 3: Apply the mathematical formula
    const positiveScore = this.sumPositiveFactors(positiveFactors);
    const penaltyScore = this.sumContradictionPenalties(contradictionPenalties);
    
    // Step 4: Calculate final score (0-100 scale)
    const rawScore = positiveScore - penaltyScore;
    const finalScore = Math.max(0, Math.min(100, rawScore * 100));
    
    // Step 5: Calculate confidence in our calculation
    const confidence = this.calculateCalculationConfidence(positiveFactors, contradictionPenalties);

    return {
      positiveFactors,
      contradictionPenalties,
      finalScore,
      confidence
    };
  }

  /**
   * Step 1: Calculate Authority_Weight × Authority_Score × Cross_Vector_Confidence
   */
  private calculateAuthorityFactors(claims: Claim[]): AuthorityFactor[] {
    return claims.map(claim => {
      const authorityWeight = this.authorityHierarchy.getAuthorityWeight(claim.source);
      const authorityScore = this.calculateAuthorityScore(claim.source, claim.evidence || []);
      const crossVectorConfidence = this.calculateCrossVectorConfidence(claim, claims);

      return {
        source: claim.source,
        authority_weight: authorityWeight,
        authority_score: authorityScore,
        cross_vector_confidence: crossVectorConfidence,
        claim: claim.content,
        evidence: claim.evidence?.map(e => e.content) || []
      };
    });
  }

  /**
   * Calculate authority score based on source reputation and evidence quality
   */
  private calculateAuthorityScore(source: string, evidence: Evidence[]): number {
    const authorityInfo = this.authorityHierarchy.getAuthorityInfo(source);
    let baseScore = authorityInfo.weight;

    // Boost score based on evidence quality
    const evidenceBoost = this.calculateEvidenceQuality(evidence);
    const temporalReliability = this.calculateTemporalReliability(evidence);
    
    // Apply evidence multiplier (can boost up to 25%)
    const evidenceMultiplier = 1 + (evidenceBoost * temporalReliability * 0.25);
    
    return Math.min(1.0, baseScore * evidenceMultiplier);
  }

  /**
   * Calculate cross-vector confidence (corroboration from independent sources)
   */
  private calculateCrossVectorConfidence(targetClaim: Claim, allClaims: Claim[]): number {
    const independentSources = this.findIndependentSources(targetClaim, allClaims);
    const corroboratingClaims = this.findCorroboratingClaims(targetClaim, independentSources);
    
    if (corroboratingClaims.length === 0) return 0.1; // Minimum confidence for standalone claims
    
    // Calculate confidence based on number and quality of corroborating sources
    let confidence = 0;
    const maxSources = Math.min(this.MAX_CROSS_VECTOR_SOURCES, corroboratingClaims.length);
    
    for (let i = 0; i < maxSources; i++) {
      const claim = corroboratingClaims[i];
      const sourceWeight = this.authorityHierarchy.getAuthorityWeight(claim.source);
      const agreementStrength = this.calculateAgreementStrength(targetClaim.content, claim.content);
      
      // Diminishing returns for additional sources
      const sourceContribution = sourceWeight * agreementStrength * Math.pow(0.8, i);
      confidence += sourceContribution;
    }
    
    return Math.min(1.0, confidence);
  }

  /**
   * Step 2: Calculate Contradiction_Penalty × Authority_Differential
   */
  private calculateContradictionPenalties(claims: Claim[]): ContradictionPenalty[] {
    const penalties: ContradictionPenalty[] = [];
    
    // Check each claim against all others for contradictions
    for (let i = 0; i < claims.length; i++) {
      for (let j = i + 1; j < claims.length; j++) {
        const contradiction = this.detectContradiction(claims[i], claims[j]);
        
        if (contradiction.detected && contradiction.confidence > this.CONFIDENCE_THRESHOLD) {
          const penalty = this.calculateContradictionPenalty(claims[i], claims[j], contradiction);
          if (penalty) {
            penalties.push(penalty);
          }
        }
      }
    }
    
    // Check for self-contradictions within single claims
    claims.forEach(claim => {
      const selfContradiction = this.detectSelfContradiction(claim);
      if (selfContradiction.detected) {
        penalties.push({
          contradictionType: selfContradiction.type,
          contradiction_penalty: selfContradiction.confidence,
          authority_differential: 1.0, // Maximum penalty for self-contradiction
          explanation: selfContradiction.explanation,
          sources: [claim.source]
        });
      }
    });
    
    return penalties;
  }

  /**
   * Detect contradictions between two claims using multiple methods
   */
  private detectContradiction(claim1: Claim, claim2: Claim): ContradictionResult {
    // Method 1: Settlement logic detection (DNB pattern)
    const settlementLogic = this.detectSettlementLogic(claim1, claim2);
    if (settlementLogic.detected) return settlementLogic;
    
    // Method 2: Data contradiction detection
    const dataContradiction = this.detectDataContradiction(claim1, claim2);
    if (dataContradiction.detected) return dataContradiction;
    
    // Method 3: Authority hierarchy violations
    const hierarchyViolation = this.detectAuthorityViolation(claim1, claim2);
    if (hierarchyViolation.detected) return hierarchyViolation;
    
    // Method 4: Temporal inconsistencies
    const temporalInconsistency = this.detectTemporalInconsistency(claim1, claim2);
    if (temporalInconsistency.detected) return temporalInconsistency;
    
    // Method 5: Logical impossibilities
    const logicalImpossibility = this.detectLogicalImpossibility(claim1, claim2);
    if (logicalImpossibility.detected) return logicalImpossibility;
    
    return {
      detected: false,
      confidence: 0,
      type: ContradictionType.LOGICAL_IMPOSSIBILITY,
      explanation: '',
      kindnessMessage: '',
      evidence: [],
      recommendation: ''
    };
  }

  /**
   * DNB-style settlement logic detection
   * Pattern: "No liability/wrongdoing" + Settlement offer
   */
  private detectSettlementLogic(claim1: Claim, claim2: Claim): ContradictionResult {
    const denialsPatterns = [
      'no liability', 'deny wrongdoing', 'no discrimination', 'not responsible',
      'no violation', 'compliant', 'følger regelverket', 'ingen ansvar'
    ];
    
    const settlementPatterns = [
      'settlement', 'offer', 'reduction', 'forlik', 'tilbud', 'reduksjon',
      'compensation', 'payment', 'kompensasjon', 'betaling'
    ];
    
    const claim1Lower = claim1.content.toLowerCase();
    const claim2Lower = claim2.content.toLowerCase();
    
    const claim1HasDenial = denialsPatterns.some(pattern => claim1Lower.includes(pattern));
    const claim1HasSettlement = settlementPatterns.some(pattern => claim1Lower.includes(pattern));
    const claim2HasDenial = denialsPatterns.some(pattern => claim2Lower.includes(pattern));
    const claim2HasSettlement = settlementPatterns.some(pattern => claim2Lower.includes(pattern));
    
    if ((claim1HasDenial && claim2HasSettlement) || 
        (claim2HasDenial && claim1HasSettlement) ||
        (claim1HasDenial && claim1HasSettlement) ||
        (claim2HasDenial && claim2HasSettlement)) {
      
      return {
        detected: true,
        confidence: 0.94, // High confidence in this pattern
        type: ContradictionType.SETTLEMENT_LOGIC,
        explanation: 'Settlement offer implies acknowledgment of responsibility despite verbal denial of liability',
        kindnessMessage: 'We noticed a pattern where responsibility is denied but compensation is offered. This suggests the situation might benefit from clarification.',
        evidence: [
          { type: 'statement', source: claim1.source, authority_weight: 0, content: claim1.content, verified: true },
          { type: 'statement', source: claim2.source, authority_weight: 0, content: claim2.content, verified: true }
        ],
        recommendation: 'Consider using this logical inconsistency as negotiation leverage',
        legalBasis: ['Contract Law: Actions speak louder than words', 'Evidence: Conduct contradicts statements']
      };
    }
    
    return { detected: false, confidence: 0, type: ContradictionType.SETTLEMENT_LOGIC, explanation: '', kindnessMessage: '', evidence: [], recommendation: '' };
  }

  /**
   * GDPR data contradiction detection
   * Pattern: "We have no personal data" + Debt collection activities
   */
  private detectDataContradiction(claim1: Claim, claim2: Claim): ContradictionResult {
    const noDataPatterns = [
      'no personal data', 'no data', 'ingen personopplysninger',
      'not processing', 'no record', 'ingen registrering'
    ];
    
    const dataProcessingPatterns = [
      'debt record', 'customer information', 'payment history',
      'gjeld', 'kunde', 'betaling', 'inkasso', 'collection'
    ];
    
    const claim1Lower = claim1.content.toLowerCase();
    const claim2Lower = claim2.content.toLowerCase();
    
    const hasNoDataClaim = noDataPatterns.some(pattern => 
      claim1Lower.includes(pattern) || claim2Lower.includes(pattern)
    );
    
    const hasDataProcessing = dataProcessingPatterns.some(pattern =>
      claim1Lower.includes(pattern) || claim2Lower.includes(pattern)
    );
    
    if (hasNoDataClaim && hasDataProcessing) {
      return {
        detected: true,
        confidence: 0.98,
        type: ContradictionType.DATA_CONTRADICTION,
        explanation: 'Claims no personal data while maintaining debt records and collection activities',
        kindnessMessage: 'There seems to be an inconsistency regarding data processing. Debt collection inherently involves processing personal data.',
        evidence: [
          { type: 'statement', source: claim1.source, authority_weight: 0, content: claim1.content, verified: true },
          { type: 'statement', source: claim2.source, authority_weight: 0, content: claim2.content, verified: true }
        ],
        recommendation: 'File GDPR Article 15 request to clarify data processing activities',
        legalBasis: ['GDPR Article 4: Definition of personal data', 'GDPR Article 6: Lawful basis for processing']
      };
    }
    
    return { detected: false, confidence: 0, type: ContradictionType.DATA_CONTRADICTION, explanation: '', kindnessMessage: '', evidence: [], recommendation: '' };
  }

  /**
   * Authority hierarchy violation detection
   */
  private detectAuthorityViolation(claim1: Claim, claim2: Claim): ContradictionResult {
    const auth1Weight = this.authorityHierarchy.getAuthorityWeight(claim1.source);
    const auth2Weight = this.authorityHierarchy.getAuthorityWeight(claim2.source);
    
    // Check if lower authority contradicts higher authority
    if (Math.abs(auth1Weight - auth2Weight) > 0.2) { // Significant authority difference
      const higherClaim = auth1Weight > auth2Weight ? claim1 : claim2;
      const lowerClaim = auth1Weight > auth2Weight ? claim2 : claim1;
      
      const contradiction = this.checkContentContradiction(lowerClaim.content, higherClaim.content);
      
      if (contradiction > 0.7) {
        return {
          detected: true,
          confidence: contradiction,
          type: ContradictionType.AUTHORITY_HIERARCHY,
          explanation: `Lower authority (${lowerClaim.source}) contradicts higher authority (${higherClaim.source})`,
          kindnessMessage: `We found different information from sources with different authority levels. Higher authorities generally provide more reliable guidance.`,
          evidence: [
            { type: 'statement', source: lowerClaim.source, authority_weight: Math.min(auth1Weight, auth2Weight), content: lowerClaim.content, verified: true },
            { type: 'statement', source: higherClaim.source, authority_weight: Math.max(auth1Weight, auth2Weight), content: higherClaim.content, verified: true }
          ],
          recommendation: `Consider following guidance from ${higherClaim.source} as it supersedes ${lowerClaim.source}`,
          legalBasis: ['Legal hierarchy principle: Higher authorities supersede lower authorities']
        };
      }
    }
    
    return { detected: false, confidence: 0, type: ContradictionType.AUTHORITY_HIERARCHY, explanation: '', kindnessMessage: '', evidence: [], recommendation: '' };
  }

  private detectTemporalInconsistency(claim1: Claim, claim2: Claim): ContradictionResult {
    // Check if newer claim contradicts older claim from same source
    if (claim1.source === claim2.source) {
      const timeDiff = Math.abs(claim1.timestamp.getTime() - claim2.timestamp.getTime());
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 1) { // More than 1 day apart
        const contradiction = this.checkContentContradiction(claim1.content, claim2.content);
        
        if (contradiction > 0.6) {
          const newerClaim = claim1.timestamp > claim2.timestamp ? claim1 : claim2;
          const olderClaim = claim1.timestamp > claim2.timestamp ? claim2 : claim1;
          
          return {
            detected: true,
            confidence: contradiction,
            type: ContradictionType.TEMPORAL_INCONSISTENCY,
            explanation: `Source ${claim1.source} contradicted their earlier statement`,
            kindnessMessage: 'We noticed this source has provided different information at different times. This might indicate evolving understanding or changing circumstances.',
            evidence: [
              { type: 'statement', source: olderClaim.source, authority_weight: 0, content: olderClaim.content, timestamp: olderClaim.timestamp, verified: true },
              { type: 'statement', source: newerClaim.source, authority_weight: 0, content: newerClaim.content, timestamp: newerClaim.timestamp, verified: true }
            ],
            recommendation: 'Consider asking for clarification about the change in position',
            legalBasis: ['Temporal consistency in legal arguments']
          };
        }
      }
    }
    
    return { detected: false, confidence: 0, type: ContradictionType.TEMPORAL_INCONSISTENCY, explanation: '', kindnessMessage: '', evidence: [], recommendation: '' };
  }

  private detectLogicalImpossibility(claim1: Claim, claim2: Claim): ContradictionResult {
    // Mathematical impossibilities, logical contradictions
    const impossibilityPatterns = [
      { claim: 'never', contradiction: 'always' },
      { claim: '100%', contradiction: '0%' },
      { claim: 'impossible', contradiction: 'certain' },
      { claim: 'none', contradiction: 'all' },
      { claim: 'legal', contradiction: 'illegal' }
    ];
    
    const claim1Lower = claim1.content.toLowerCase();
    const claim2Lower = claim2.content.toLowerCase();
    
    for (const pattern of impossibilityPatterns) {
      if ((claim1Lower.includes(pattern.claim) && claim2Lower.includes(pattern.contradiction)) ||
          (claim1Lower.includes(pattern.contradiction) && claim2Lower.includes(pattern.claim))) {
        
        return {
          detected: true,
          confidence: 0.95,
          type: ContradictionType.LOGICAL_IMPOSSIBILITY,
          explanation: `Logical impossibility: "${pattern.claim}" cannot coexist with "${pattern.contradiction}"`,
          kindnessMessage: 'We found statements that appear to be logically impossible when considered together. This suggests there might be a misunderstanding or error.',
          evidence: [
            { type: 'statement', source: claim1.source, authority_weight: 0, content: claim1.content, verified: true },
            { type: 'statement', source: claim2.source, authority_weight: 0, content: claim2.content, verified: true }
          ],
          recommendation: 'Seek clarification to resolve the logical inconsistency',
          legalBasis: ['Logic and reason in legal arguments']
        };
      }
    }
    
    return { detected: false, confidence: 0, type: ContradictionType.LOGICAL_IMPOSSIBILITY, explanation: '', kindnessMessage: '', evidence: [], recommendation: '' };
  }

  private detectSelfContradiction(claim: Claim): ContradictionResult {
    // Split claim into sentences and check for internal contradictions
    const sentences = claim.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (let i = 0; i < sentences.length; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        const contradiction = this.checkContentContradiction(sentences[i], sentences[j]);
        
        if (contradiction > 0.8) {
          return {
            detected: true,
            confidence: contradiction,
            type: ContradictionType.LOGICAL_IMPOSSIBILITY,
            explanation: 'Self-contradiction within single statement',
            kindnessMessage: 'This statement appears to contradict itself internally. This might indicate complexity that needs clarification.',
            evidence: [
              { type: 'statement', source: claim.source, authority_weight: 0, content: claim.content, verified: true }
            ],
            recommendation: 'Request clarification of the apparently contradictory elements'
          };
        }
      }
    }
    
    return { detected: false, confidence: 0, type: ContradictionType.LOGICAL_IMPOSSIBILITY, explanation: '', kindnessMessage: '', evidence: [], recommendation: '' };
  }

  // Helper methods
  private calculateContradictionPenalty(claim1: Claim, claim2: Claim, contradiction: ContradictionResult): ContradictionPenalty | null {
    const auth1Weight = this.authorityHierarchy.getAuthorityWeight(claim1.source);
    const auth2Weight = this.authorityHierarchy.getAuthorityWeight(claim2.source);
    const authorityDifferential = Math.abs(auth1Weight - auth2Weight);
    
    return {
      contradictionType: contradiction.type,
      contradiction_penalty: contradiction.confidence,
      authority_differential: authorityDifferential,
      explanation: contradiction.explanation,
      sources: [claim1.source, claim2.source]
    };
  }

  private sumPositiveFactors(factors: AuthorityFactor[]): number {
    return factors.reduce((sum, factor) => 
      sum + (factor.authority_weight * factor.authority_score * factor.cross_vector_confidence), 0
    );
  }

  private sumContradictionPenalties(penalties: ContradictionPenalty[]): number {
    return penalties.reduce((sum, penalty) => 
      sum + (penalty.contradiction_penalty * penalty.authority_differential), 0
    );
  }

  private calculateCalculationConfidence(
    positiveFactors: AuthorityFactor[], 
    contradictionPenalties: ContradictionPenalty[]
  ): number {
    const totalEvidence = positiveFactors.length;
    const totalContradictions = contradictionPenalties.length;
    
    // Higher confidence with more evidence and fewer contradictions
    const evidenceConfidence = Math.min(1.0, totalEvidence / 5); // Optimal around 5 pieces of evidence
    const contradictionPenalty = Math.max(0, 1 - (totalContradictions / totalEvidence));
    
    return evidenceConfidence * contradictionPenalty;
  }

  // Additional helper methods
  private findIndependentSources(targetClaim: Claim, allClaims: Claim[]): Claim[] {
    return allClaims.filter(claim => 
      claim.source !== targetClaim.source && 
      !this.areSourcesConnected(claim.source, targetClaim.source)
    );
  }

  private areSourcesConnected(source1: string, source2: string): boolean {
    // Simple implementation - in production, this would check for corporate relationships
    const connections = {
      'dnb': ['dnb_bank', 'dnb_markets', 'dnb_asset_management'],
      'nordea': ['nordea_bank', 'nordea_markets', 'nordea_asset_management']
    };
    
    return Object.values(connections).some(group => 
      group.includes(source1) && group.includes(source2)
    );
  }

  private findCorroboratingClaims(targetClaim: Claim, independentSources: Claim[]): Claim[] {
    return independentSources.filter(claim => 
      this.calculateAgreementStrength(targetClaim.content, claim.content) > 0.6
    );
  }

  private calculateAgreementStrength(content1: string, content2: string): number {
    // Simple similarity calculation - in production, use NLP/embedding similarity
    const words1 = new Set(content1.toLowerCase().split(/\W+/).filter(w => w.length > 2));
    const words2 = new Set(content2.toLowerCase().split(/\W+/).filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  private checkContentContradiction(content1: string, content2: string): number {
    // Enhanced contradiction detection
    const contradictoryPairs = [
      ['no', 'yes'], ['never', 'always'], ['none', 'all'], ['legal', 'illegal'],
      ['compliant', 'violation'], ['authorized', 'unauthorized'], ['valid', 'invalid'],
      ['responsible', 'not responsible'], ['liable', 'not liable']
    ];
    
    const content1Lower = content1.toLowerCase();
    const content2Lower = content2.toLowerCase();
    
    let contradictionScore = 0;
    let totalPairs = contradictoryPairs.length;
    
    contradictoryPairs.forEach(pair => {
      if ((content1Lower.includes(pair[0]) && content2Lower.includes(pair[1])) ||
          (content1Lower.includes(pair[1]) && content2Lower.includes(pair[0]))) {
        contradictionScore++;
      }
    });
    
    return contradictionScore / totalPairs;
  }

  private calculateEvidenceQuality(evidence: Evidence[]): number {
    if (evidence.length === 0) return 0.1;
    
    return evidence.reduce((sum, e) => sum + e.authority_weight, 0) / evidence.length;
  }

  private calculateTemporalReliability(evidence: Evidence[]): number {
    if (evidence.length === 0) return 1.0;
    
    const now = new Date();
    const averageAge = evidence.reduce((sum, e) => {
      const age = e.timestamp ? (now.getTime() - e.timestamp.getTime()) / (1000 * 60 * 60 * 24) : 0;
      return sum + age;
    }, 0) / evidence.length;
    
    // Recent evidence is more reliable (exponential decay)
    return Math.exp(-averageAge / 365); // Half-life of 1 year
  }
}