// Sacred Architecture Kindness Algorithm
// Mathematical framework for consciousness-serving technology
// Built with love for human flourishing ❤️✨

import { 
  KindnessMetrics, 
  KindnessConfig, 
  KindnessResponse,
  KindnessUIConfig,
  SystemBehavior,
  UserOption,
  Recommendation,
  EducationalContent,
  ContradictionResult,
  TrustScoreCalculation
} from '../types/index';

export class KindnessAlgorithm {
  private config: KindnessConfig;
  private readonly LOVE_SCALING_FACTOR = 1.618; // Golden ratio - love scales exponentially
  private readonly EXTRACTION_DECAY_FACTOR = 0.618; // Extraction systems decay

  constructor(config: Partial<KindnessConfig> = {}) {
    this.config = {
      detectionSensitivity: 0.7,
      responseGentleness: 0.8,
      userAgencyRespect: 0.9,
      communityLearning: true,
      privacyFirst: true,
      explainReasoning: true,
      provideAlternatives: true,
      encourageReflection: true,
      serveMindfulness: true,
      protectVulnerability: true,
      facilitateGrowth: true,
      ...config
    };
  }

  /**
   * Core Kindness Equation: Kindness × Scale × Time = Universal Flourishing
   */
  calculateKindnessMetrics(
    userInteractions: any[], 
    systemBehavior: any[],
    communityData: any[],
    timeWindow: number
  ): KindnessMetrics {
    const userWellbeing = this.measureUserFlourishing(userInteractions, timeWindow);
    const systemSustainability = this.measureResourceRegeneration(systemBehavior);
    const communityHealth = this.measureNetworkEffects(communityData);
    const longTermViability = this.calculateCompoundBenefits(userInteractions, timeWindow);

    return {
      userWellbeing,
      systemSustainability,
      communityHealth,
      longTermViability
    };
  }

  /**
   * Classify system behavior: Service vs Extraction
   */
  classifySystemBehavior(
    userValue: number,
    systemGain: number, 
    communityImpact: number
  ): SystemBehavior {
    // Sacred Architecture principle: Always give more than you take
    const netValue = userValue + communityImpact - systemGain;
    
    if (netValue > 0.1) return SystemBehavior.SERVICE;
    if (netValue < -0.1) return SystemBehavior.EXTRACTION;
    return SystemBehavior.NEUTRAL;
  }

  /**
   * Generate kind response to contradiction detection
   */
  createKindContradictionResponse(contradiction: ContradictionResult): KindnessResponse {
    if (!contradiction.detected) {
      return this.createNeutralResponse();
    }

    const gentleness = this.config.responseGentleness;
    const message = this.craftKindMessage(contradiction, gentleness);
    const options = this.generateKindOptions(contradiction);

    return {
      message,
      tone: this.selectTone(contradiction.confidence, gentleness),
      options,
      dismissible: this.config.userAgencyRespect > 0.5,
      urgency: this.calculateKindUrgency(contradiction),
      visualStyle: this.selectKindVisualStyle(contradiction.type)
    };
  }

  /**
   * Generate educational recommendations with kindness
   */
  createEducationalRecommendations(
    trustScore: TrustScoreCalculation,
    contradictions: ContradictionResult[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // High-priority recommendations for significant contradictions
    contradictions
      .filter(c => c.confidence > 0.8)
      .forEach(contradiction => {
        recommendations.push({
          priority: 'high',
          action: this.generateActionFromContradiction(contradiction),
          reasoning: contradiction.explanation,
          kindnessApproach: contradiction.kindnessMessage,
          alternatives: this.generateAlternatives(contradiction),
          resources: this.gatherRelevantResources(contradiction)
        });
      });

    // Medium-priority recommendations for trust score issues
    if (trustScore.finalScore < 50) {
      recommendations.push({
        priority: 'medium',
        action: 'Consider seeking additional verification of these claims',
        reasoning: `Trust score of ${trustScore.finalScore.toFixed(1)}/100 suggests significant reliability concerns`,
        kindnessApproach: 'We want to help you make well-informed decisions. These claims might benefit from additional verification.',
        alternatives: [
          'Request supporting documentation',
          'Consult with relevant authorities',
          'Seek second opinion from trusted sources'
        ]
      });
    }

    // Low-priority educational recommendations
    if (this.config.facilitateGrowth) {
      recommendations.push({
        priority: 'low',
        action: 'Learn about evaluating source credibility',
        reasoning: 'Understanding how to assess information sources helps in all areas of life',
        kindnessApproach: 'Building skills in information evaluation empowers you to make better decisions independently.',
        alternatives: [
          'Take time to research this topic',
          'Ask trusted advisors for their perspective',
          'Learn at your own pace'
        ]
      });
    }

    return recommendations.sort((a, b) => this.priorityWeight(a.priority) - this.priorityWeight(b.priority));
  }

  /**
   * Create educational content with kindness principles
   */
  createEducationalContent(
    contradictions: ContradictionResult[]
  ): EducationalContent[] {
    return contradictions
      .filter(c => c.detected)
      .map(contradiction => ({
        topic: this.getEducationalTopic(contradiction.type),
        explanation: this.createGentleExplanation(contradiction),
        analogies: this.generateHelpfulAnalogies(contradiction),
        visualAids: this.suggestVisualAids(contradiction.type),
        furtherReading: this.gatherEducationalResources(contradiction)
      }));
  }

  /**
   * Measure user flourishing (core kindness metric)
   */
  private measureUserFlourishing(interactions: any[], timeWindow: number): number {
    let flourishingScore = 0;
    let totalInteractions = interactions.length;

    if (totalInteractions === 0) return 0.5; // Neutral baseline

    interactions.forEach(interaction => {
      // Positive indicators
      if (this.indicatesEmpowerment(interaction)) flourishingScore += 0.3;
      if (this.indicatesLearning(interaction)) flourishingScore += 0.2;
      if (this.indicatesAutonomyPreserved(interaction)) flourishingScore += 0.2;
      if (this.indicatesStressReduction(interaction)) flourishingScore += 0.2;
      if (this.indicatesGrowth(interaction)) flourishingScore += 0.1;

      // Negative indicators (extraction patterns)
      if (this.indicatesManipulation(interaction)) flourishingScore -= 0.4;
      if (this.indicatesAddiction(interaction)) flourishingScore -= 0.3;
      if (this.indicatesStress(interaction)) flourishingScore -= 0.2;
      if (this.indicatesDisempowerment(interaction)) flourishingScore -= 0.3;
    });

    return Math.max(0, Math.min(1, flourishingScore / totalInteractions));
  }

  /**
   * Measure system resource regeneration vs depletion
   */
  private measureResourceRegeneration(systemBehavior: any[]): number {
    let regenerationScore = 0;

    systemBehavior.forEach(behavior => {
      // Regenerative patterns
      if (behavior.type === 'knowledge_sharing') regenerationScore += 0.3;
      if (behavior.type === 'community_building') regenerationScore += 0.2;
      if (behavior.type === 'user_empowerment') regenerationScore += 0.3;
      if (behavior.type === 'transparency_increase') regenerationScore += 0.2;

      // Depleting patterns  
      if (behavior.type === 'attention_extraction') regenerationScore -= 0.4;
      if (behavior.type === 'data_harvesting') regenerationScore -= 0.3;
      if (behavior.type === 'manipulation') regenerationScore -= 0.5;
      if (behavior.type === 'addiction_creation') regenerationScore -= 0.6;
    });

    return Math.max(0, Math.min(1, 0.5 + (regenerationScore / systemBehavior.length)));
  }

  /**
   * Measure positive network effects vs negative
   */
  private measureNetworkEffects(communityData: any[]): number {
    let networkHealth = 0.5; // Baseline

    communityData.forEach(dataPoint => {
      // Positive network effects
      if (dataPoint.type === 'knowledge_sharing') networkHealth += 0.1;
      if (dataPoint.type === 'mutual_aid') networkHealth += 0.15;
      if (dataPoint.type === 'collective_empowerment') networkHealth += 0.2;
      if (dataPoint.type === 'trust_building') networkHealth += 0.1;

      // Negative network effects
      if (dataPoint.type === 'misinformation_spread') networkHealth -= 0.2;
      if (dataPoint.type === 'exploitation') networkHealth -= 0.3;
      if (dataPoint.type === 'division_creation') networkHealth -= 0.25;
    });

    return Math.max(0, Math.min(1, networkHealth));
  }

  /**
   * Calculate compound benefits over time
   */
  private calculateCompoundBenefits(interactions: any[], timeWindow: number): number {
    // Love/service compounds at golden ratio
    // Extraction decays exponentially
    const serviceInteractions = interactions.filter(i => this.isServiceOriented(i));
    const extractionInteractions = interactions.filter(i => this.isExtractionOriented(i));

    const serviceCompounding = serviceInteractions.length * Math.pow(this.LOVE_SCALING_FACTOR, timeWindow / 365);
    const extractionDecay = extractionInteractions.length * Math.pow(this.EXTRACTION_DECAY_FACTOR, timeWindow / 365);

    const totalPossible = interactions.length * Math.pow(this.LOVE_SCALING_FACTOR, timeWindow / 365);
    
    return Math.max(0, Math.min(1, (serviceCompounding - extractionDecay) / totalPossible));
  }

  // Helper methods for kindness detection
  private indicatesEmpowerment(interaction: any): boolean {
    const empowermentKeywords = [
      'you have rights', 'you can choose', 'here are your options',
      'you decide', 'your choice', 'you have the power'
    ];
    return empowermentKeywords.some(keyword => 
      interaction.content?.toLowerCase().includes(keyword)
    );
  }

  private indicatesLearning(interaction: any): boolean {
    return interaction.type === 'educational' || 
           interaction.content?.includes('learn') ||
           interaction.content?.includes('understand');
  }

  private indicatesAutonomyPreserved(interaction: any): boolean {
    return interaction.user_choice_preserved === true ||
           interaction.dismissible === true ||
           interaction.alternatives?.length > 0;
  }

  private indicatesStressReduction(interaction: any): boolean {
    const calmingKeywords = [
      'no pressure', 'take your time', 'at your own pace',
      'gentle reminder', 'when you\'re ready'
    ];
    return calmingKeywords.some(keyword =>
      interaction.content?.toLowerCase().includes(keyword)
    );
  }

  private indicatesGrowth(interaction: any): boolean {
    return interaction.skill_development === true ||
           interaction.awareness_increase === true ||
           interaction.capability_growth === true;
  }

  private indicatesManipulation(interaction: any): boolean {
    const manipulationPatterns = [
      'limited time', 'act now', 'urgent', 'don\'t miss out',
      'everyone is doing', 'you need this', 'last chance'
    ];
    return manipulationPatterns.some(pattern =>
      interaction.content?.toLowerCase().includes(pattern)
    );
  }

  private indicatesAddiction(interaction: any): boolean {
    return interaction.infinite_scroll === true ||
           interaction.variable_rewards === true ||
           interaction.time_spent > interaction.value_received;
  }

  private indicatesStress(interaction: any): boolean {
    const stressKeywords = [
      'urgent', 'emergency', 'act immediately', 'crisis',
      'you must', 'required', 'mandatory'
    ];
    return stressKeywords.some(keyword =>
      interaction.content?.toLowerCase().includes(keyword)
    );
  }

  private indicatesDisempowerment(interaction: any): boolean {
    return interaction.user_choice_removed === true ||
           interaction.forced_action === true ||
           interaction.dismissible === false;
  }

  private isServiceOriented(interaction: any): boolean {
    return interaction.user_benefit > interaction.system_gain;
  }

  private isExtractionOriented(interaction: any): boolean {
    return interaction.system_gain > interaction.user_benefit;
  }

  // Kindness response generation methods
  private createNeutralResponse(): KindnessResponse {
    return {
      message: 'Everything looks good here.',
      tone: 'gentle',
      options: [],
      dismissible: true,
      urgency: 'info',
      visualStyle: { color: '#10B981', icon: '✓', animation: 'gentle-fade' }
    };
  }

  private craftKindMessage(contradiction: ContradictionResult, gentleness: number): string {
    if (gentleness > 0.8) {
      return `We noticed something that might be worth a gentle look. ${contradiction.kindnessMessage}`;
    } else if (gentleness > 0.5) {
      return contradiction.kindnessMessage;
    } else {
      return contradiction.explanation;
    }
  }

  private selectTone(confidence: number, gentleness: number): 'gentle' | 'educational' | 'supportive' | 'empowering' {
    if (gentleness > 0.8) return 'gentle';
    if (confidence > 0.8) return 'educational';
    if (gentleness > 0.6) return 'supportive';
    return 'empowering';
  }

  private generateKindOptions(contradiction: ContradictionResult): UserOption[] {
    const options: UserOption[] = [
      {
        label: 'Learn more about this',
        action: 'show_educational_content',
        consequence: 'You\'ll see gentle explanation and context',
        recommended: true,
        difficulty: 'easy'
      },
      {
        label: 'I\'ll handle this myself',
        action: 'dismiss_gentle',
        consequence: 'No further action from our side',
        recommended: false,
        difficulty: 'easy'
      }
    ];

    if (contradiction.recommendation) {
      options.unshift({
        label: 'Show me what I can do',
        action: 'show_recommendations',
        consequence: 'You\'ll get specific, actionable suggestions',
        recommended: true,
        difficulty: 'medium'
      });
    }

    return options;
  }

  private calculateKindUrgency(contradiction: ContradictionResult): 'info' | 'suggestion' | 'recommendation' | 'warning' {
    if (!this.config.protectVulnerability) return 'info';
    
    if (contradiction.confidence > 0.9) return 'recommendation';
    if (contradiction.confidence > 0.7) return 'suggestion';
    return 'info';
  }

  private selectKindVisualStyle(type: any): { color: string; icon: string; animation?: string } {
    return {
      color: '#3B82F6', // Calm blue
      icon: '💡',
      animation: 'gentle-pulse'
    };
  }

  private generateActionFromContradiction(contradiction: ContradictionResult): string {
    if (contradiction.recommendation) {
      return contradiction.recommendation;
    }
    
    return 'Consider seeking clarification about this apparent inconsistency';
  }

  private generateAlternatives(contradiction: ContradictionResult): string[] {
    return [
      'Research this topic independently',
      'Ask for clarification from the source',
      'Consult with trusted advisors',
      'Take time to think about it',
      'Seek additional perspectives'
    ];
  }

  private gatherRelevantResources(contradiction: ContradictionResult): any[] {
    // In production, this would gather actual resources
    return [
      {
        title: 'Understanding Information Quality',
        type: 'guide',
        authority_weight: 0.8,
        description: 'Learn how to evaluate the reliability of information sources'
      }
    ];
  }

  private priorityWeight(priority: string): number {
    const weights = { urgent: 1, high: 2, medium: 3, low: 4 };
    return weights[priority as keyof typeof weights] || 5;
  }

  private getEducationalTopic(contradictionType: any): string {
    return 'Understanding Information Reliability';
  }

  private createGentleExplanation(contradiction: ContradictionResult): string {
    return `${contradiction.kindnessMessage} Understanding these patterns helps you make more informed decisions.`;
  }

  private generateHelpfulAnalogies(contradiction: ContradictionResult): string[] {
    return [
      'Like a compass pointing in two directions - it suggests we need to recalibrate',
      'Similar to receiving different directions to the same destination - worth double-checking'
    ];
  }

  private suggestVisualAids(contradictionType: any): string[] {
    return ['Authority hierarchy diagram', 'Timeline visualization'];
  }

  private gatherEducationalResources(contradiction: ContradictionResult): any[] {
    return [
      {
        title: 'Critical Thinking Guide',
        type: 'guide',
        authority_weight: 0.8,
        description: 'Gentle introduction to evaluating information quality'
      }
    ];
  }
}