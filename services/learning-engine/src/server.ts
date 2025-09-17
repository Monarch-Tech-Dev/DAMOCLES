import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import LearningEvolutionEngine from './LearningEvolutionEngine';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8005;
const prisma = new PrismaClient();
const learningEngine = new LearningEvolutionEngine(prisma);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'learning-engine',
    timestamp: new Date().toISOString()
  });
});

// Record learning event
app.post('/events', async (req, res) => {
  try {
    const eventData = req.body;

    await learningEngine.recordLearningEvent(eventData);

    res.json({
      success: true,
      message: 'Learning event recorded',
      eventType: eventData.eventType
    });
  } catch (error) {
    console.error('Failed to record learning event:', error);
    res.status(500).json({
      error: 'Failed to record learning event',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get optimal strategy for creditor
app.get('/strategy/:creditorId', async (req, res) => {
  try {
    const { creditorId } = req.params;
    const context = req.query;

    const strategy = await learningEngine.getOptimalStrategy(creditorId, context);

    res.json(strategy);
  } catch (error) {
    console.error('Failed to get optimal strategy:', error);
    res.status(500).json({
      error: 'Failed to get optimal strategy',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get collective intelligence for creditor
app.get('/intelligence/:creditorId', async (req, res) => {
  try {
    const { creditorId } = req.params;

    const intelligence = await learningEngine.getCollectiveIntelligence(creditorId);

    if (!intelligence) {
      return res.status(404).json({
        error: 'No collective intelligence found for this creditor'
      });
    }

    res.json(intelligence);
  } catch (error) {
    console.error('Failed to get collective intelligence:', error);
    res.status(500).json({
      error: 'Failed to get collective intelligence',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get learning analytics dashboard
app.get('/analytics', async (req, res) => {
  try {
    const analytics = await learningEngine.getLearningAnalytics();

    res.json(analytics);
  } catch (error) {
    console.error('Failed to get learning analytics:', error);
    res.status(500).json({
      error: 'Failed to get learning analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simulate learning event for testing
app.post('/simulate/learning-event', async (req, res) => {
  try {
    const { creditorId = 'test_creditor', eventType = 'gdpr_sent' } = req.body;

    const simulatedEvent = {
      eventType,
      userId: `user_${Date.now()}`,
      creditorId,
      strategy: eventType === 'gdpr_sent' ? 'gdpr_inkasso_template' : 'response_analysis',
      success: Math.random() > 0.3, // 70% success rate
      admissionText: Math.random() > 0.7 ? 'Violation confirmed in response' : undefined,
      pdiImpact: Math.random() * 10 + 5, // 5-15 point impact
      recoveryAmount: Math.random() > 0.5 ? Math.random() * 5000 + 500 : undefined,
      responseTimeHours: Math.random() * 720 + 24, // 24-744 hours
      violationType: ['excessive_fees', 'unauthorized_charges', 'gdpr_violation'][Math.floor(Math.random() * 3)],
      metadata: {
        template: 'gdpr_inkasso.html',
        automated: true,
        simulationRun: true
      }
    };

    await learningEngine.recordLearningEvent(simulatedEvent);

    res.json({
      success: true,
      message: 'Simulated learning event created',
      event: simulatedEvent
    });
  } catch (error) {
    console.error('Failed to simulate learning event:', error);
    res.status(500).json({
      error: 'Failed to simulate learning event',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simulate multiple learning events for rapid testing
app.post('/simulate/batch-events', async (req, res) => {
  try {
    const { count = 10, creditorId = 'test_creditor' } = req.body;

    const events = [];
    for (let i = 0; i < count; i++) {
      const eventTypes = ['gdpr_sent', 'response_received', 'admission_found', 'settlement_reached'];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

      const simulatedEvent = {
        eventType,
        userId: `user_${Date.now()}_${i}`,
        creditorId,
        strategy: `strategy_${i % 3 + 1}`,
        success: Math.random() > 0.3,
        admissionText: Math.random() > 0.7 ? `Violation type ${i % 5} confirmed` : undefined,
        pdiImpact: Math.random() * 15 + 5,
        recoveryAmount: Math.random() > 0.5 ? Math.random() * 10000 + 1000 : undefined,
        responseTimeHours: Math.random() * 500 + 50,
        violationType: ['excessive_fees', 'unauthorized_charges', 'gdpr_violation', 'inkasso_violation'][i % 4],
        metadata: {
          batchSimulation: true,
          batchIndex: i
        }
      };

      await learningEngine.recordLearningEvent(simulatedEvent);
      events.push(simulatedEvent);

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    res.json({
      success: true,
      message: `Created ${count} simulated learning events`,
      events: events.slice(0, 3) // Return first 3 as sample
    });
  } catch (error) {
    console.error('Failed to simulate batch events:', error);
    res.status(500).json({
      error: 'Failed to simulate batch events',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get creditor learning summary
app.get('/creditor/:creditorId/summary', async (req, res) => {
  try {
    const { creditorId } = req.params;

    // Get events for this creditor
    const events = await prisma.learningEvent.findMany({
      where: { creditorId },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    // Get patterns
    const patterns = await prisma.responsePattern.findMany({
      where: { creditorId },
      orderBy: { successRate: 'desc' }
    });

    // Get collective intelligence
    const intelligence = await learningEngine.getCollectiveIntelligence(creditorId);

    // Calculate summary stats
    const totalEvents = events.length;
    const successfulEvents = events.filter(e => e.success).length;
    const successRate = totalEvents > 0 ? successfulEvents / totalEvents : 0;

    const totalRecovery = events.reduce((sum, e) => sum + (e.recoveryAmount ? Number(e.recoveryAmount) : 0), 0);
    const avgResponseTime = events
      .filter(e => e.responseTimeHours)
      .reduce((sum, e, _, arr) => sum + (e.responseTimeHours! / arr.length), 0);

    res.json({
      creditorId,
      summary: {
        totalEvents,
        successfulEvents,
        successRate: Math.round(successRate * 100),
        totalRecovery,
        avgResponseTime: Math.round(avgResponseTime),
        topStrategies: patterns.slice(0, 3).map(p => ({
          strategy: p.triggerPhrase,
          successRate: Math.round(p.successRate * 100),
          sampleSize: p.sampleCount
        }))
      },
      intelligence,
      recentEvents: events.slice(0, 5).map(e => ({
        eventType: e.eventType,
        strategy: e.strategy,
        success: e.success,
        timestamp: e.timestamp
      }))
    });
  } catch (error) {
    console.error('Failed to get creditor summary:', error);
    res.status(500).json({
      error: 'Failed to get creditor summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Event listeners
learningEngine.on('learning-event', (event) => {
  console.log(`📚 Learning event recorded: ${event.eventType} for ${event.creditorId}`);
});

learningEngine.on('strategy-optimized', ({ creditorId }) => {
  console.log(`🧠 Strategy optimized for creditor: ${creditorId}`);
});

learningEngine.on('class-action-triggered', ({ classActionId, creditorId, affectedUserIds }) => {
  console.log(`🗡️ Class action ${classActionId} triggered for ${creditorId} affecting ${affectedUserIds.length} users`);
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`🧠 Learning Evolution Engine listening on port ${port}`);
  console.log(`📊 Analytics available at: http://localhost:${port}/analytics`);
  console.log(`🎯 Strategy optimization endpoints ready`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Learning Engine...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down Learning Engine...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;