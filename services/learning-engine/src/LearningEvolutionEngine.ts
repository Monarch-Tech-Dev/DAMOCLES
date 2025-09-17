import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';

export interface LearningEvent {
  id: string;
  eventType: 'gdpr_sent' | 'response_received' | 'admission_found' | 'settlement_reached';
  userId: string;
  creditorId: string;
  strategy: string;
  success: boolean;
  admissionText?: string;
  pdiImpact?: number;
  recoveryAmount?: number;
  responseTimeHours?: number;
  violationType?: string;
  metadata: any;
  timestamp: Date;
}

export interface ResponsePattern {
  id: string;
  creditorId: string;
  triggerPhrase: string;
  successRate: number;
  admissionType: string;
  sampleCount: number;
  averageResponseTime: number;
  lastUpdated: Date;
}

export interface CollectiveIntelligence {
  creditorId: string;
  violationPattern: string;
  affectedUsers: number;
  totalHarm: number;
  evidenceStrength: 'weak' | 'moderate' | 'strong' | 'conclusive';
  classActionEligible: boolean;
  winningStrategies: string[];
  averagePdiImpact: number;
}

export class LearningEvolutionEngine extends EventEmitter {
  private prisma: PrismaClient;
  private learningThresholds = {
    patternRecognition: 10,
    strategyOptimization: 100,
    classActionTrigger: 1000
  };

  constructor(prismaClient?: PrismaClient) {
    super();
    this.prisma = prismaClient || new PrismaClient();
  }

  /**
   * Record a learning event from user interaction
   */
  async recordLearningEvent(event: Omit<LearningEvent, 'id' | 'timestamp'>): Promise<void> {
    const learningEvent: LearningEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    };

    // Store in learning events table
    await this.prisma.learningEvent.create({
      data: {
        id: learningEvent.id,
        eventType: learningEvent.eventType,
        userId: learningEvent.userId,
        creditorId: learningEvent.creditorId,
        strategy: learningEvent.strategy,
        success: learningEvent.success,
        admissionText: learningEvent.admissionText,
        pdiImpact: learningEvent.pdiImpact,
        recoveryAmount: learningEvent.recoveryAmount,
        responseTimeHours: learningEvent.responseTimeHours,
        violationType: learningEvent.violationType,
        metadata: JSON.stringify(learningEvent.metadata),
        timestamp: learningEvent.timestamp
      }
    });

    // Trigger pattern analysis if thresholds met
    await this.analyzeAndUpdatePatterns(learningEvent);

    // Check for collective intelligence updates
    await this.updateCollectiveIntelligence(learningEvent);

    // Emit event for real-time listeners
    this.emit('learning-event', learningEvent);

    console.log(`📚 Recorded learning event: ${event.eventType} for creditor ${event.creditorId}`);
  }

  /**
   * Analyze patterns and update strategy recommendations
   */
  private async analyzeAndUpdatePatterns(event: LearningEvent): Promise<void> {
    const creditorEvents = await this.getCreditorEvents(event.creditorId);

    if (creditorEvents.length < this.learningThresholds.patternRecognition) {
      return; // Not enough data for pattern analysis
    }

    // Analyze successful strategies
    const successfulEvents = creditorEvents.filter(e => e.success);
    const strategySuccessRates = this.calculateStrategySuccessRates(creditorEvents);

    // Update or create response patterns
    for (const [strategy, stats] of Object.entries(strategySuccessRates)) {
      await this.upsertResponsePattern({
        creditorId: event.creditorId,
        triggerPhrase: strategy,
        successRate: stats.successRate,
        admissionType: stats.primaryAdmissionType,
        sampleCount: stats.sampleCount,
        averageResponseTime: stats.averageResponseTime
      });
    }

    // Trigger strategy optimization if threshold met
    if (creditorEvents.length >= this.learningThresholds.strategyOptimization) {
      await this.optimizeStrategies(event.creditorId);
      this.emit('strategy-optimized', { creditorId: event.creditorId });
    }
  }

  /**
   * Update collective intelligence and check class action thresholds
   */
  private async updateCollectiveIntelligence(event: LearningEvent): Promise<void> {
    // Get all events for this creditor
    const creditorEvents = await this.getCreditorEvents(event.creditorId);

    // Calculate collective metrics
    const affectedUsers = new Set(creditorEvents.map(e => e.userId)).size;
    const totalHarm = creditorEvents.reduce((sum, e) => sum + (e.recoveryAmount || 0), 0);
    const avgPdiImpact = creditorEvents
      .filter(e => e.pdiImpact)
      .reduce((sum, e, _, arr) => sum + (e.pdiImpact! / arr.length), 0);

    // Determine evidence strength
    const evidenceStrength = this.calculateEvidenceStrength(creditorEvents);
    const classActionEligible = this.assessClassActionEligibility(creditorEvents, affectedUsers, totalHarm);

    // Extract winning strategies
    const winningStrategies = this.extractWinningStrategies(creditorEvents);

    // Update collective intelligence record
    await this.upsertCollectiveIntelligence({
      creditorId: event.creditorId,
      violationPattern: this.identifyViolationPattern(creditorEvents),
      affectedUsers,
      totalHarm,
      evidenceStrength,
      classActionEligible,
      winningStrategies,
      averagePdiImpact: avgPdiImpact
    });

    // Trigger class action if thresholds met
    if (classActionEligible && affectedUsers >= this.learningThresholds.classActionTrigger) {
      await this.triggerClassActionProtocol(event.creditorId, creditorEvents);
    }
  }

  /**
   * Get optimal strategy for creditor based on learning
   */
  async getOptimalStrategy(creditorId: string, context: any): Promise<{
    strategy: string;
    expectedSuccessRate: number;
    triggerPhrases: string[];
    estimatedResponseTime: number;
  }> {
    const patterns = await this.getCreditorPatterns(creditorId);

    if (patterns.length === 0) {
      // Return default strategy if no learning data
      return {
        strategy: 'generic_gdpr_request',
        expectedSuccessRate: 0.2,
        triggerPhrases: ['Please provide information according to GDPR Article 15'],
        estimatedResponseTime: 720 // 30 days in hours
      };
    }

    // Find highest success rate pattern
    const optimalPattern = patterns.reduce((best, current) =>
      current.successRate > best.successRate ? current : best
    );

    return {
      strategy: optimalPattern.triggerPhrase,
      expectedSuccessRate: optimalPattern.successRate,
      triggerPhrases: this.generateOptimizedPhrases(patterns),
      estimatedResponseTime: optimalPattern.averageResponseTime
    };
  }

  /**
   * Get collective intelligence summary for creditor
   */
  async getCollectiveIntelligence(creditorId: string): Promise<CollectiveIntelligence | null> {
    try {
      const intelligence = await this.prisma.collectiveIntelligence.findUnique({
        where: { creditorId }
      });

      if (!intelligence) return null;

      return {
        creditorId: intelligence.creditorId,
        violationPattern: intelligence.violationPattern,
        affectedUsers: intelligence.affectedUsers,
        totalHarm: Number(intelligence.totalHarm),
        evidenceStrength: intelligence.evidenceStrength as any,
        classActionEligible: intelligence.classActionEligible,
        winningStrategies: JSON.parse(intelligence.winningStrategies || '[]'),
        averagePdiImpact: intelligence.averagePdiImpact
      };
    } catch (error) {
      console.error(`Failed to get collective intelligence for ${creditorId}:`, error);
      return null;
    }
  }

  /**
   * Get learning analytics dashboard data
   */
  async getLearningAnalytics(): Promise<{
    totalEvents: number;
    successRateEvolution: any[];
    topPerformingStrategies: any[];
    classActionReadyCreditors: any[];
    systemEfficiency: number;
  }> {
    const totalEvents = await this.prisma.learningEvent.count();

    const successRateEvolution = await this.calculateSuccessRateEvolution();
    const topPerformingStrategies = await this.getTopPerformingStrategies();
    const classActionReadyCreditors = await this.getClassActionReadyCreditors();
    const systemEfficiency = await this.calculateSystemEfficiency();

    return {
      totalEvents,
      successRateEvolution,
      topPerformingStrategies,
      classActionReadyCreditors,
      systemEfficiency
    };
  }

  // Private helper methods
  private async getCreditorEvents(creditorId: string): Promise<LearningEvent[]> {
    const events = await this.prisma.learningEvent.findMany({
      where: { creditorId },
      orderBy: { timestamp: 'desc' }
    });

    return events.map(e => ({
      ...e,
      metadata: JSON.parse(e.metadata || '{}'),
      recoveryAmount: e.recoveryAmount ? Number(e.recoveryAmount) : undefined,
      pdiImpact: e.pdiImpact ? Number(e.pdiImpact) : undefined
    }));
  }

  private calculateStrategySuccessRates(events: LearningEvent[]): Record<string, any> {
    const strategyStats: Record<string, any> = {};

    for (const event of events) {
      if (!strategyStats[event.strategy]) {
        strategyStats[event.strategy] = {
          total: 0,
          successful: 0,
          responseTimeSum: 0,
          admissionTypes: []
        };
      }

      const stats = strategyStats[event.strategy];
      stats.total++;
      if (event.success) {
        stats.successful++;
        if (event.admissionText) {
          stats.admissionTypes.push(event.admissionText);
        }
      }
      if (event.responseTimeHours) {
        stats.responseTimeSum += event.responseTimeHours;
      }
    }

    // Calculate final metrics
    for (const [strategy, stats] of Object.entries(strategyStats)) {
      (stats as any).successRate = stats.successful / stats.total;
      (stats as any).averageResponseTime = stats.responseTimeSum / stats.total;
      (stats as any).sampleCount = stats.total;
      (stats as any).primaryAdmissionType = this.getMostCommonAdmission(stats.admissionTypes);
    }

    return strategyStats;
  }

  private async upsertResponsePattern(pattern: Omit<ResponsePattern, 'id' | 'lastUpdated'>): Promise<void> {
    await this.prisma.responsePattern.upsert({
      where: {
        creditorId_triggerPhrase: {
          creditorId: pattern.creditorId,
          triggerPhrase: pattern.triggerPhrase
        }
      },
      create: {
        id: this.generatePatternId(),
        ...pattern,
        lastUpdated: new Date()
      },
      update: {
        successRate: pattern.successRate,
        sampleCount: pattern.sampleCount,
        averageResponseTime: pattern.averageResponseTime,
        lastUpdated: new Date()
      }
    });
  }

  private async upsertCollectiveIntelligence(intelligence: CollectiveIntelligence): Promise<void> {
    await this.prisma.collectiveIntelligence.upsert({
      where: { creditorId: intelligence.creditorId },
      create: {
        creditorId: intelligence.creditorId,
        violationPattern: intelligence.violationPattern,
        affectedUsers: intelligence.affectedUsers,
        totalHarm: intelligence.totalHarm,
        evidenceStrength: intelligence.evidenceStrength,
        classActionEligible: intelligence.classActionEligible,
        winningStrategies: JSON.stringify(intelligence.winningStrategies),
        averagePdiImpact: intelligence.averagePdiImpact,
        lastUpdated: new Date()
      },
      update: {
        violationPattern: intelligence.violationPattern,
        affectedUsers: intelligence.affectedUsers,
        totalHarm: intelligence.totalHarm,
        evidenceStrength: intelligence.evidenceStrength,
        classActionEligible: intelligence.classActionEligible,
        winningStrategies: JSON.stringify(intelligence.winningStrategies),
        averagePdiImpact: intelligence.averagePdiImpact,
        lastUpdated: new Date()
      }
    });
  }

  private calculateEvidenceStrength(events: LearningEvent[]): 'weak' | 'moderate' | 'strong' | 'conclusive' {
    const successfulEvents = events.filter(e => e.success);
    const successRate = successfulEvents.length / events.length;
    const sampleSize = events.length;

    if (sampleSize < 10) return 'weak';
    if (sampleSize < 50 && successRate < 0.3) return 'weak';
    if (sampleSize < 50 && successRate >= 0.3) return 'moderate';
    if (sampleSize >= 50 && successRate >= 0.5) return 'strong';
    if (sampleSize >= 100 && successRate >= 0.7) return 'conclusive';

    return 'moderate';
  }

  private assessClassActionEligibility(events: LearningEvent[], affectedUsers: number, totalHarm: number): boolean {
    return (
      affectedUsers >= 50 &&
      totalHarm >= 1000000 && // 1M NOK threshold
      events.filter(e => e.success).length >= 25 // Minimum successful cases
    );
  }

  private extractWinningStrategies(events: LearningEvent[]): string[] {
    const strategySuccess = this.calculateStrategySuccessRates(events);

    return Object.entries(strategySuccess)
      .filter(([_, stats]: [string, any]) => stats.successRate >= 0.5 && stats.sampleCount >= 5)
      .sort(([_, a]: [string, any], [__, b]: [string, any]) => b.successRate - a.successRate)
      .slice(0, 5)
      .map(([strategy, _]) => strategy);
  }

  private identifyViolationPattern(events: LearningEvent[]): string {
    const violationTypes = events
      .filter(e => e.violationType)
      .map(e => e.violationType!);

    const mostCommon = this.getMostCommon(violationTypes);
    return mostCommon || 'Multiple violations detected';
  }

  private async triggerClassActionProtocol(creditorId: string, events: LearningEvent[]): Promise<void> {
    console.log(`🗡️ SWORD Protocol triggered for creditor ${creditorId}`);

    // Create class action case
    const classActionId = this.generateClassActionId();
    const affectedUserIds = [...new Set(events.map(e => e.userId))];
    const totalHarm = events.reduce((sum, e) => sum + (e.recoveryAmount || 0), 0);

    // This would integrate with legal service
    this.emit('class-action-triggered', {
      classActionId,
      creditorId,
      affectedUserIds,
      totalHarm,
      evidenceEvents: events.filter(e => e.success)
    });

    console.log(`📧 Notifying ${affectedUserIds.length} users of class action eligibility`);
  }

  // Utility methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePatternId(): string {
    return `ptn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateClassActionId(): string {
    return `ca_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMostCommon(arr: string[]): string | null {
    if (arr.length === 0) return null;

    const counts: Record<string, number> = {};
    for (const item of arr) {
      counts[item] = (counts[item] || 0) + 1;
    }

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  private getMostCommonAdmission(admissions: string[]): string {
    const common = this.getMostCommon(admissions);
    return common || 'violation_confirmed';
  }

  private async getCreditorPatterns(creditorId: string): Promise<ResponsePattern[]> {
    const patterns = await this.prisma.responsePattern.findMany({
      where: { creditorId },
      orderBy: { successRate: 'desc' }
    });

    return patterns.map(p => ({
      id: p.id,
      creditorId: p.creditorId,
      triggerPhrase: p.triggerPhrase,
      successRate: p.successRate,
      admissionType: p.admissionType,
      sampleCount: p.sampleCount,
      averageResponseTime: p.averageResponseTime,
      lastUpdated: p.lastUpdated
    }));
  }

  private generateOptimizedPhrases(patterns: ResponsePattern[]): string[] {
    return patterns
      .filter(p => p.successRate >= 0.4)
      .slice(0, 3)
      .map(p => p.triggerPhrase);
  }

  private async optimizeStrategies(creditorId: string): Promise<void> {
    console.log(`🧠 Optimizing strategies for creditor ${creditorId}`);
    // This would trigger template updates and strategy refinements
  }

  private async calculateSuccessRateEvolution(): Promise<any[]> {
    // Implementation for success rate over time
    return [];
  }

  private async getTopPerformingStrategies(): Promise<any[]> {
    // Implementation for top strategies across all creditors
    return [];
  }

  private async getClassActionReadyCreditors(): Promise<any[]> {
    const readyCreditors = await this.prisma.collectiveIntelligence.findMany({
      where: { classActionEligible: true },
      include: {
        creditor: {
          select: { name: true, type: true }
        }
      }
    });

    return readyCreditors.map(c => ({
      creditorId: c.creditorId,
      creditorName: c.creditor?.name || 'Unknown',
      creditorType: c.creditor?.type || 'unknown',
      affectedUsers: c.affectedUsers,
      totalHarm: Number(c.totalHarm),
      evidenceStrength: c.evidenceStrength
    }));
  }

  private async calculateSystemEfficiency(): Promise<number> {
    const recentEvents = await this.prisma.learningEvent.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    if (recentEvents.length === 0) return 0;

    const successfulEvents = recentEvents.filter(e => e.success);
    return successfulEvents.length / recentEvents.length;
  }
}

export default LearningEvolutionEngine;