import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PrivacyEventData {
  aggregateId: string;
  aggregateType: 'case' | 'collector' | 'user';
  eventType: string;
  eventData: any;
  metadata?: any;
  createdBy?: string;
}

export interface EventQuery {
  aggregateId?: string;
  aggregateType?: string;
  eventType?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}

/**
 * EventStore for immutable audit trail
 * Stores all privacy and legal events for compliance and evidence
 */
export class EventStore {
  /**
   * Record a new privacy event (immutable)
   */
  async recordEvent(eventData: PrivacyEventData): Promise<string> {
    try {
      const event = await prisma.privacyEvent.create({
        data: {
          aggregateId: eventData.aggregateId,
          aggregateType: eventData.aggregateType,
          eventType: eventData.eventType,
          eventData: JSON.stringify(eventData.eventData),
          metadata: eventData.metadata ? JSON.stringify(eventData.metadata) : null,
          createdBy: eventData.createdBy || null,
        }
      });

      console.log(`📋 Event recorded: ${eventData.eventType} for ${eventData.aggregateType}:${eventData.aggregateId}`);
      return event.id;
    } catch (error) {
      console.error('Failed to record privacy event:', error);
      throw new Error(`Event recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get events for a specific aggregate (case, collector, user)
   */
  async getEventsForAggregate(aggregateId: string, aggregateType?: string): Promise<any[]> {
    try {
      const where: any = { aggregateId };
      if (aggregateType) {
        where.aggregateType = aggregateType;
      }

      const events = await prisma.privacyEvent.findMany({
        where,
        orderBy: { createdAt: 'asc' }
      });

      return events.map(event => ({
        id: event.id,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        eventData: JSON.parse(event.eventData),
        metadata: event.metadata ? JSON.parse(event.metadata) : null,
        createdAt: event.createdAt,
        createdBy: event.createdBy
      }));
    } catch (error) {
      console.error('Failed to retrieve events:', error);
      throw new Error(`Event retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query events with flexible criteria
   */
  async queryEvents(query: EventQuery): Promise<any[]> {
    try {
      const where: any = {};

      if (query.aggregateId) where.aggregateId = query.aggregateId;
      if (query.aggregateType) where.aggregateType = query.aggregateType;
      if (query.eventType) where.eventType = query.eventType;

      if (query.fromDate || query.toDate) {
        where.createdAt = {};
        if (query.fromDate) where.createdAt.gte = query.fromDate;
        if (query.toDate) where.createdAt.lte = query.toDate;
      }

      const events = await prisma.privacyEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit || 100
      });

      return events.map(event => ({
        id: event.id,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        eventData: JSON.parse(event.eventData),
        metadata: event.metadata ? JSON.parse(event.metadata) : null,
        createdAt: event.createdAt,
        createdBy: event.createdBy
      }));
    } catch (error) {
      console.error('Failed to query events:', error);
      throw new Error(`Event query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get event timeline for legal proceedings
   */
  async getLegalTimeline(caseId: string): Promise<any[]> {
    try {
      const events = await this.getEventsForAggregate(caseId, 'case');

      return events.map(event => ({
        timestamp: event.createdAt,
        eventType: event.eventType,
        description: this.generateEventDescription(event.eventType, event.eventData),
        legalSignificance: this.assessLegalSignificance(event.eventType),
        evidence: {
          eventId: event.id,
          aggregateId: event.aggregateId,
          data: event.eventData,
          metadata: event.metadata
        }
      }));
    } catch (error) {
      console.error('Failed to generate legal timeline:', error);
      throw new Error(`Legal timeline generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Record GDPR request event
   */
  async recordGDPREvent(caseId: string, eventType: string, data: any, userId?: string): Promise<string> {
    return this.recordEvent({
      aggregateId: caseId,
      aggregateType: 'case',
      eventType,
      eventData: data,
      metadata: {
        source: 'gdpr-engine',
        compliance: 'GDPR',
        articles: data.articles || []
      },
      createdBy: userId
    });
  }

  /**
   * Record collector violation event
   */
  async recordViolationEvent(collectorId: string, violationType: string, data: any): Promise<string> {
    return this.recordEvent({
      aggregateId: collectorId,
      aggregateType: 'collector',
      eventType: 'VIOLATION_DETECTED',
      eventData: {
        violationType,
        ...data
      },
      metadata: {
        source: 'violation-detector',
        severity: data.severity || 'MEDIUM',
        confidence: data.confidence || 0.8
      }
    });
  }

  /**
   * Record blockchain evidence event
   */
  async recordBlockchainEvent(caseId: string, txId: string, contentHash: string): Promise<string> {
    return this.recordEvent({
      aggregateId: caseId,
      aggregateType: 'case',
      eventType: 'BLOCKCHAIN_EVIDENCE_CREATED',
      eventData: {
        blockchainTxId: txId,
        contentHash,
        network: 'cardano-testnet',
        immutable: true
      },
      metadata: {
        source: 'blockchain-service',
        legalEvidence: true,
        courtAdmissible: true
      }
    });
  }

  /**
   * Generate event statistics for dashboard
   */
  async getEventStatistics(timeRange?: { from: Date; to: Date }): Promise<any> {
    try {
      const where: any = {};
      if (timeRange) {
        where.createdAt = {
          gte: timeRange.from,
          lte: timeRange.to
        };
      }

      // Get total event counts by type
      const eventTypeCounts = await prisma.privacyEvent.groupBy({
        by: ['eventType'],
        where,
        _count: { eventType: true }
      });

      // Get total events by aggregate type
      const aggregateTypeCounts = await prisma.privacyEvent.groupBy({
        by: ['aggregateType'],
        where,
        _count: { aggregateType: true }
      });

      const totalEvents = await prisma.privacyEvent.count({ where });

      return {
        totalEvents,
        eventsByType: eventTypeCounts.reduce((acc: Record<string, number>, item) => {
          acc[item.eventType] = item._count.eventType;
          return acc;
        }, {}),
        eventsByAggregateType: aggregateTypeCounts.reduce((acc: Record<string, number>, item) => {
          acc[item.aggregateType] = item._count.aggregateType;
          return acc;
        }, {}),
        timeRange: timeRange || { from: null, to: null }
      };
    } catch (error) {
      console.error('Failed to get event statistics:', error);
      throw new Error(`Statistics generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private generateEventDescription(eventType: string, eventData: any): string {
    switch (eventType) {
      case 'DSAR_SUBMITTED':
        return `GDPR Data Subject Access Request submitted to ${eventData.creditorName}`;
      case 'VIOLATION_DETECTED':
        return `Privacy violation detected: ${eventData.violationType}`;
      case 'BLOCKCHAIN_EVIDENCE_CREATED':
        return `Legal evidence recorded on blockchain (TX: ${eventData.blockchainTxId})`;
      case 'SETTLEMENT_REACHED':
        return `Settlement agreement reached for ${eventData.amount} NOK`;
      case 'COLLECTIVE_ACTION_TRIGGERED':
        return `Class action initiated affecting ${eventData.affectedUsers} users`;
      case 'REGULATORY_COMPLAINT_FILED':
        return `Complaint filed with ${eventData.regulator}`;
      default:
        return `Event: ${eventType}`;
    }
  }

  private assessLegalSignificance(eventType: string): string {
    switch (eventType) {
      case 'DSAR_SUBMITTED':
      case 'BLOCKCHAIN_EVIDENCE_CREATED':
        return 'HIGH - Court admissible evidence';
      case 'VIOLATION_DETECTED':
        return 'MEDIUM - Potential legal basis for claims';
      case 'SETTLEMENT_REACHED':
        return 'HIGH - Legally binding agreement';
      case 'COLLECTIVE_ACTION_TRIGGERED':
        return 'CRITICAL - Mass litigation proceedings';
      default:
        return 'LOW - Operational event';
    }
  }
}

// Export singleton instance
export const eventStore = new EventStore();