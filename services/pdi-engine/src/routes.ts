import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PDIService } from './service';
import { PDIRewardCalculator } from './rewards';
import { DamoclesTriggerService } from './damocles-trigger';

// Validation schemas
const PDIInputSchema = z.object({
  monthlyIncome: z.number().min(0, 'Monthly income must be non-negative'),
  totalDebt: z.number().min(0, 'Total debt must be non-negative'),
  monthlyDebtPayments: z.number().min(0, 'Monthly debt payments must be non-negative'),
  creditUsed: z.number().min(0, 'Credit used must be non-negative'),
  availableCredit: z.number().min(0, 'Available credit must be non-negative'),
  totalAssets: z.number().min(0, 'Total assets must be non-negative'),
  previousMonthDebt: z.number().min(0).optional()
});

const QueryParamsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(30),
  offset: z.coerce.number().min(0).default(0),
  includeAcknowledged: z.coerce.boolean().default(false)
});

const RegionParamsSchema = z.object({
  regionCode: z.string().min(1)
});

const AlertParamsSchema = z.object({
  alertId: z.string().min(1)
});

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
    // Add other user properties as needed
  };
}

export async function pdiRoutes(fastify: FastifyInstance) {
  const pdiService = new PDIService();
  const damoclesTrigger = new DamoclesTriggerService();

  // Authentication hook
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // In a real implementation, this would verify JWT token
      // For now, we'll assume user is authenticated
      (request as AuthenticatedRequest).user = {
        id: 'test-user-id',
        email: 'test@example.com'
      };
    } catch (error) {
      reply.status(401).send({ error: 'Authentication required' });
    }
  });

  /**
   * Calculate PDI score
   * POST /api/pdi/calculate
   */
  fastify.post('/api/pdi/calculate', {
    schema: {
      body: PDIInputSchema,
      response: {
        200: z.object({
          score: z.number(),
          category: z.enum(['healthy', 'caution', 'risky', 'critical']),
          metrics: z.object({
            dti: z.object({
              value: z.number(),
              score: z.number(),
              category: z.string()
            }),
            dsr: z.object({
              value: z.number(),
              score: z.number(),
              category: z.string()
            }),
            creditUtilization: z.object({
              value: z.number(),
              score: z.number(),
              category: z.string()
            }),
            debtToAssets: z.object({
              value: z.number(),
              score: z.number(),
              category: z.string()
            }),
            debtGrowth: z.object({
              value: z.number(),
              score: z.number(),
              category: z.string()
            })
          }),
          recommendations: z.array(z.string()),
          damoclesActionTriggered: z.boolean(),
          swordRewards: z.object({
            totalReward: z.number(),
            breakdown: z.array(z.string()),
            explanation: z.string()
          })
        })
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const userId = request.user.id;
      const inputs = PDIInputSchema.parse(request.body);

      // Get previous score for comparison
      const previousProfile = await pdiService.getPDIProfile(userId);
      const previousScore = previousProfile?.currentScore;

      // Calculate PDI score
      const pdiScore = await pdiService.calculateAndSavePDI(userId, inputs);

      // Calculate rewards
      const rewardCalculation = PDIRewardCalculator.calculateRewards(
        pdiScore.score,
        previousScore,
        pdiScore.category,
        !previousProfile // First time calculation
      );

      // Check for DAMOCLES triggers
      let damoclesAction = null;
      if (pdiScore.damoclesActionRequired) {
        // Check if user has recent triggers to prevent spam
        const hasRecentTrigger = await damoclesTrigger.hasRecentTrigger(userId, 24);
        if (!hasRecentTrigger) {
          damoclesAction = await damoclesTrigger.triggerProtection(userId, pdiScore);
        }
      }

      return {
        score: pdiScore.score,
        category: pdiScore.category,
        metrics: pdiScore.metrics,
        recommendations: pdiScore.recommendations,
        damoclesActionTriggered: !!damoclesAction,
        swordRewards: {
          totalReward: rewardCalculation.totalReward,
          breakdown: rewardCalculation.reasonBreakdown,
          explanation: PDIRewardCalculator.generateRewardExplanation(rewardCalculation)
        }
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors
        });
      }

      fastify.log.error('PDI calculation error:', error);
      return reply.status(500).send({
        error: 'Internal server error'
      });
    }
  });

  /**
   * Get PDI profile
   * GET /api/pdi/profile
   */
  fastify.get('/api/pdi/profile', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const userId = request.user.id;
      const profile = await pdiService.getPDIProfile(userId);

      if (!profile) {
        return reply.status(404).send({
          error: 'PDI profile not found'
        });
      }

      return profile;
    } catch (error) {
      fastify.log.error('Get PDI profile error:', error);
      return reply.status(500).send({
        error: 'Internal server error'
      });
    }
  });

  /**
   * Get PDI history
   * GET /api/pdi/history?limit=30&offset=0
   */
  fastify.get('/api/pdi/history', {
    schema: {
      querystring: QueryParamsSchema
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const userId = request.user.id;
      const { limit, offset } = QueryParamsSchema.parse(request.query);

      const history = await pdiService.getPDIHistory(userId, limit, offset);
      return { history, total: history.length };
    } catch (error) {
      fastify.log.error('Get PDI history error:', error);
      return reply.status(500).send({
        error: 'Internal server error'
      });
    }
  });

  /**
   * Get regional PDI data
   * GET /api/pdi/regional/:regionCode
   */
  fastify.get('/api/pdi/regional/:regionCode', {
    schema: {
      params: RegionParamsSchema
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { regionCode } = RegionParamsSchema.parse(request.params);
      const regionalData = await pdiService.getRegionalData(regionCode);
      return regionalData;
    } catch (error) {
      fastify.log.error('Get regional PDI data error:', error);
      return reply.status(500).send({
        error: 'Internal server error'
      });
    }
  });

  /**
   * Get all regional PDI data
   * GET /api/pdi/regional
   */
  fastify.get('/api/pdi/regional', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const regionalData = await pdiService.getRegionalData();
      return regionalData;
    } catch (error) {
      fastify.log.error('Get all regional PDI data error:', error);
      return reply.status(500).send({
        error: 'Internal server error'
      });
    }
  });

  /**
   * Get PDI alerts
   * GET /api/pdi/alerts?includeAcknowledged=false
   */
  fastify.get('/api/pdi/alerts', {
    schema: {
      querystring: z.object({
        includeAcknowledged: z.coerce.boolean().default(false)
      })
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const userId = request.user.id;
      const { includeAcknowledged } = request.query as any;

      const alerts = await pdiService.getAlerts(userId, includeAcknowledged);
      return { alerts };
    } catch (error) {
      fastify.log.error('Get PDI alerts error:', error);
      return reply.status(500).send({
        error: 'Internal server error'
      });
    }
  });

  /**
   * Acknowledge alert
   * POST /api/pdi/alerts/:alertId/acknowledge
   */
  fastify.post('/api/pdi/alerts/:alertId/acknowledge', {
    schema: {
      params: AlertParamsSchema
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { alertId } = AlertParamsSchema.parse(request.params);
      const success = await pdiService.acknowledgeAlert(alertId);

      if (!success) {
        return reply.status(404).send({
          error: 'Alert not found'
        });
      }

      return { acknowledged: true };
    } catch (error) {
      fastify.log.error('Acknowledge alert error:', error);
      return reply.status(500).send({
        error: 'Internal server error'
      });
    }
  });

  /**
   * Get dashboard analytics
   * GET /api/pdi/analytics
   */
  fastify.get('/api/pdi/analytics', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const analytics = await pdiService.getDashboardAnalytics();
      const triggerAnalytics = await damoclesTrigger.getTriggerAnalytics();

      return {
        pdi: analytics,
        triggers: triggerAnalytics
      };
    } catch (error) {
      fastify.log.error('Get PDI analytics error:', error);
      return reply.status(500).send({
        error: 'Internal server error'
      });
    }
  });

  /**
   * Health check
   * GET /api/pdi/health
   */
  fastify.get('/api/pdi/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'pdi-engine',
      version: '1.0.0'
    };
  });

  /**
   * Get DAMOCLES trigger history
   * GET /api/pdi/triggers
   */
  fastify.get('/api/pdi/triggers', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const userId = request.user.id;
      const triggerHistory = await damoclesTrigger.getTriggerHistory(userId);

      return { triggers: triggerHistory };
    } catch (error) {
      fastify.log.error('Get trigger history error:', error);
      return reply.status(500).send({
        error: 'Internal server error'
      });
    }
  });
}