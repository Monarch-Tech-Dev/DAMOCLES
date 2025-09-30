import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eventStore } from '../services/EventStore';

interface EventRecordBody {
  aggregateId: string;
  aggregateType: 'case' | 'collector' | 'user';
  eventType: string;
  eventData: any;
  metadata?: any;
  createdBy?: string;
}

interface EventQueryParams {
  aggregateId?: string;
  aggregateType?: string;
  eventType?: string;
  fromDate?: string;
  toDate?: string;
  limit?: string;
}

export async function eventRoutes(fastify: FastifyInstance) {
  // Record a new event
  fastify.post<{ Body: EventRecordBody }>('/record', async (request, reply) => {
    try {
      const { aggregateId, aggregateType, eventType, eventData, metadata, createdBy } = request.body;

      if (!aggregateId || !aggregateType || !eventType || !eventData) {
        return reply.status(400).send({
          error: 'Missing required fields',
          message: 'aggregateId, aggregateType, eventType, and eventData are required'
        });
      }

      const eventId = await eventStore.recordEvent({
        aggregateId,
        aggregateType,
        eventType,
        eventData,
        metadata,
        createdBy
      });

      reply.send({
        success: true,
        eventId,
        message: 'Event recorded successfully'
      });
    } catch (error) {
      fastify.log.error('Event recording error');
      reply.status(500).send({
        error: 'Event recording failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get events for a specific aggregate
  fastify.get<{
    Params: { aggregateId: string };
    Querystring: { aggregateType?: string }
  }>('/aggregate/:aggregateId', async (request, reply) => {
    try {
      const { aggregateId } = request.params;
      const { aggregateType } = request.query;

      const events = await eventStore.getEventsForAggregate(aggregateId, aggregateType);

      reply.send({
        success: true,
        events,
        count: events.length,
        aggregateId,
        aggregateType: aggregateType || 'all'
      });
    } catch (error) {
      fastify.log.error('Event retrieval error');
      reply.status(500).send({
        error: 'Event retrieval failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Query events with flexible criteria
  fastify.get<{ Querystring: EventQueryParams }>('/query', async (request, reply) => {
    try {
      const { aggregateId, aggregateType, eventType, fromDate, toDate, limit } = request.query;

      const query: any = {};
      if (aggregateId) query.aggregateId = aggregateId;
      if (aggregateType) query.aggregateType = aggregateType;
      if (eventType) query.eventType = eventType;
      if (fromDate) query.fromDate = new Date(fromDate);
      if (toDate) query.toDate = new Date(toDate);
      if (limit) query.limit = parseInt(limit);

      const events = await eventStore.queryEvents(query);

      reply.send({
        success: true,
        events,
        count: events.length,
        query: {
          aggregateId: aggregateId || null,
          aggregateType: aggregateType || null,
          eventType: eventType || null,
          fromDate: fromDate || null,
          toDate: toDate || null,
          limit: limit || 100
        }
      });
    } catch (error) {
      fastify.log.error('Event query error');
      reply.status(500).send({
        error: 'Event query failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get legal timeline for a case
  fastify.get<{ Params: { caseId: string } }>('/legal-timeline/:caseId', async (request, reply) => {
    try {
      const { caseId } = request.params;

      const timeline = await eventStore.getLegalTimeline(caseId);

      reply.send({
        success: true,
        timeline,
        caseId,
        totalEvents: timeline.length,
        legalCompliance: 'Full audit trail available for court proceedings'
      });
    } catch (error) {
      fastify.log.error('Legal timeline error');
      reply.status(500).send({
        error: 'Legal timeline generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Record GDPR-specific event
  fastify.post<{
    Body: {
      caseId: string;
      eventType: string;
      data: any;
      userId?: string;
    }
  }>('/gdpr', async (request, reply) => {
    try {
      const { caseId, eventType, data, userId } = request.body;

      if (!caseId || !eventType || !data) {
        return reply.status(400).send({
          error: 'Missing required fields',
          message: 'caseId, eventType, and data are required'
        });
      }

      const eventId = await eventStore.recordGDPREvent(caseId, eventType, data, userId);

      reply.send({
        success: true,
        eventId,
        caseId,
        eventType,
        message: 'GDPR event recorded successfully',
        legalSignificance: 'Event available as legal evidence'
      });
    } catch (error) {
      fastify.log.error('GDPR event recording error');
      reply.status(500).send({
        error: 'GDPR event recording failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Record violation event
  fastify.post<{
    Body: {
      collectorId: string;
      violationType: string;
      data: any;
    }
  }>('/violation', async (request, reply) => {
    try {
      const { collectorId, violationType, data } = request.body;

      if (!collectorId || !violationType || !data) {
        return reply.status(400).send({
          error: 'Missing required fields',
          message: 'collectorId, violationType, and data are required'
        });
      }

      const eventId = await eventStore.recordViolationEvent(collectorId, violationType, data);

      reply.send({
        success: true,
        eventId,
        collectorId,
        violationType,
        severity: data.severity || 'MEDIUM',
        message: 'Violation event recorded successfully'
      });
    } catch (error) {
      fastify.log.error('Violation event recording error');
      reply.status(500).send({
        error: 'Violation event recording failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Record blockchain evidence event
  fastify.post<{
    Body: {
      caseId: string;
      txId: string;
      contentHash: string;
    }
  }>('/blockchain-evidence', async (request, reply) => {
    try {
      const { caseId, txId, contentHash } = request.body;

      if (!caseId || !txId || !contentHash) {
        return reply.status(400).send({
          error: 'Missing required fields',
          message: 'caseId, txId, and contentHash are required'
        });
      }

      const eventId = await eventStore.recordBlockchainEvent(caseId, txId, contentHash);

      reply.send({
        success: true,
        eventId,
        caseId,
        blockchainTxId: txId,
        contentHash,
        message: 'Blockchain evidence event recorded successfully',
        legalValidity: 'Immutable evidence suitable for court proceedings'
      });
    } catch (error) {
      fastify.log.error('Blockchain evidence event recording error');
      reply.status(500).send({
        error: 'Blockchain evidence event recording failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get event statistics
  fastify.get<{
    Querystring: {
      fromDate?: string;
      toDate?: string;
    }
  }>('/statistics', async (request, reply) => {
    try {
      const { fromDate, toDate } = request.query;

      let timeRange;
      if (fromDate && toDate) {
        timeRange = {
          from: new Date(fromDate),
          to: new Date(toDate)
        };
      }

      const statistics = await eventStore.getEventStatistics(timeRange);

      reply.send({
        success: true,
        statistics,
        period: timeRange ? `${fromDate} to ${toDate}` : 'All time',
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      fastify.log.error('Event statistics error');
      reply.status(500).send({
        error: 'Statistics generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Bulk event recording (for migrations or batch operations)
  fastify.post<{
    Body: {
      events: EventRecordBody[]
    }
  }>('/bulk', async (request, reply) => {
    try {
      const { events } = request.body;

      if (!events || !Array.isArray(events) || events.length === 0) {
        return reply.status(400).send({
          error: 'Invalid input',
          message: 'events must be a non-empty array'
        });
      }

      const results = [];
      const errors = [];

      for (const eventData of events) {
        try {
          const eventId = await eventStore.recordEvent(eventData);
          results.push({
            eventId,
            aggregateId: eventData.aggregateId,
            eventType: eventData.eventType
          });
        } catch (error) {
          errors.push({
            aggregateId: eventData.aggregateId,
            eventType: eventData.eventType,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      reply.send({
        success: true,
        processed: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
        message: `Bulk operation completed: ${results.length} successful, ${errors.length} failed`
      });
    } catch (error) {
      fastify.log.error('Bulk event recording error');
      reply.status(500).send({
        error: 'Bulk event recording failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check for event store
  fastify.get('/health', async (request, reply) => {
    try {
      // Try to record a test event
      const testEventId = await eventStore.recordEvent({
        aggregateId: 'health-check',
        aggregateType: 'user',
        eventType: 'HEALTH_CHECK',
        eventData: { timestamp: new Date().toISOString() },
        metadata: { test: true }
      });

      reply.send({
        status: 'healthy',
        service: 'event-store',
        testEventId,
        message: 'Event store is operational'
      });
    } catch (error) {
      fastify.log.error('Event store health check failed');
      reply.status(500).send({
        status: 'unhealthy',
        service: 'event-store',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}