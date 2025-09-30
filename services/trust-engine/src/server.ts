// Sacred Architecture Trust Engine Server
// API endpoints for trust scoring and kindness-powered analysis
// Built with love for consumer protection ❤️⚔️

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import { TrustAnalyzer } from './core/TrustAnalyzer';
import { CollectorRiskCalculator } from './services/CollectorRiskCalculator';
import {
  ContradictionType,
  AuthorityCategory
} from './types/index';

const server = Fastify({ 
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});

// Trust analyzer instance
const trustAnalyzer = new TrustAnalyzer();

// Risk calculator instance
const riskCalculator = new CollectorRiskCalculator();

// Register plugins
server.register(cors, {
  origin: (origin, callback) => {
    const hostname = new URL(origin!).hostname;
    if (hostname === 'localhost' || hostname === 'damocles.no' || hostname === 'www.damocles.no') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  }
});

server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  }
});

server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({
    code: 429,
    error: 'Rate limit exceeded',
    message: 'Too many requests, please try again later. Our kindness has limits! 😊'
  })
});

// Request validation schemas
const ClaimSchema = z.object({
  id: z.string(),
  content: z.string().min(1),
  source: z.string(),
  timestamp: z.string().transform(str => new Date(str)),
  evidence: z.array(z.object({
    type: z.enum(['document', 'statement', 'regulation', 'court_decision']),
    source: z.string(),
    authority_weight: z.number().min(0).max(1),
    content: z.string(),
    timestamp: z.string().transform(str => new Date(str)).optional(),
    verified: z.boolean()
  })).optional(),
  metadata: z.record(z.any()).optional()
});

const TrustAnalysisRequestSchema = z.object({
  claims: z.array(ClaimSchema).min(1),
  context: z.object({
    domain: z.enum(['debt_collection', 'banking', 'consumer_rights', 'gdpr', 'general']),
    jurisdiction: z.string().default('norway'),
    userVulnerabilityLevel: z.enum(['low', 'medium', 'high']).optional(),
    urgencyLevel: z.enum(['low', 'medium', 'high', 'emergency']).optional()
  }).optional(),
  kindnessConfig: z.object({
    detectionSensitivity: z.number().min(0).max(1).optional(),
    responseGentleness: z.number().min(0).max(1).optional(),
    userAgencyRespect: z.number().min(0).max(1).optional(),
    communityLearning: z.boolean().optional(),
    privacyFirst: z.boolean().optional(),
    explainReasoning: z.boolean().optional(),
    provideAlternatives: z.boolean().optional(),
    encourageReflection: z.boolean().optional(),
    serveMindfulness: z.boolean().optional(),
    protectVulnerability: z.boolean().optional(),
    facilitateGrowth: z.boolean().optional()
  }).optional()
});

// Health check endpoint
server.get('/health', async () => {
  return { 
    status: 'healthy',
    service: 'Sacred Architecture Trust Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    message: 'Built with love for truth and justice ❤️⚔️'
  };
});

// Main trust analysis endpoint
server.post('/analyze', async (request, reply) => {
  try {
    const validatedRequest = TrustAnalysisRequestSchema.parse(request.body);
    
    const analysis = await trustAnalyzer.analyzeTrust(validatedRequest);
    
    return {
      success: true,
      analysis,
      kindness_message: 'Analysis completed with care for your wellbeing',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    server.log.error('Trust analysis error:', error);
    
    if (error instanceof z.ZodError) {
      reply.code(400);
      return {
        success: false,
        error: 'Validation error',
        details: error.errors,
        kindness_message: 'We had trouble understanding your request. Could you check the format and try again?'
      };
    }
    
    reply.code(500);
    return {
      success: false,
      error: 'Analysis failed',
      message: 'Something went wrong during analysis',
      kindness_message: 'We encountered an issue while helping you. Our team has been notified and will look into this.'
    };
  }
});

// DAMOCLES-specific debt collection analysis
server.post('/analyze/debt-collection', async (request, reply) => {
  try {
    const schema = z.object({
      creditorClaims: z.array(z.string()).min(1),
      userEvidence: z.array(z.string()),
      context: z.object({
        domain: z.literal('debt_collection'),
        jurisdiction: z.string().default('norway'),
        userVulnerabilityLevel: z.enum(['low', 'medium', 'high']).optional(),
        urgencyLevel: z.enum(['low', 'medium', 'high', 'emergency']).optional()
      })
    });

    const { creditorClaims, userEvidence, context } = schema.parse(request.body);
    
    const analysis = await trustAnalyzer.analyzeDebtCollection(creditorClaims, userEvidence, context);
    
    return {
      success: true,
      analysis,
      kindness_message: 'Your debt situation has been analyzed with care. You have rights and options.',
      timestamp: new Date().toISOString(),
      user_rights_reminder: 'Remember: You have the right to accurate information, fair treatment, and legal protection.'
    };
  } catch (error) {
    server.log.error('Debt collection analysis error:', error);
    
    reply.code(500);
    return {
      success: false,
      error: 'Analysis failed',
      kindness_message: 'We encountered an issue analyzing your debt situation. Please try again or contact support if this continues.'
    };
  }
});

// GDPR response analysis
server.post('/analyze/gdpr-response', async (request, reply) => {
  try {
    const schema = z.object({
      gdprResponse: z.string().min(1),
      originalRequest: z.string(),
      creditorInfo: z.object({
        name: z.string(),
        type: z.string().optional(),
        organizationId: z.string().optional()
      })
    });

    const { gdprResponse, originalRequest, creditorInfo } = schema.parse(request.body);
    
    const analysis = await trustAnalyzer.analyzeGDPRResponse(gdprResponse, originalRequest, creditorInfo);
    
    return {
      success: true,
      analysis,
      kindness_message: 'Your GDPR response has been analyzed. We\'re here to help protect your data rights.',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    server.log.error('GDPR response analysis error:', error);
    
    reply.code(500);
    return {
      success: false,
      error: 'Analysis failed',
      kindness_message: 'We had trouble analyzing this GDPR response. Your privacy rights are important to us.'
    };
  }
});

// Settlement logic analysis (DNB pattern detection)
server.post('/analyze/settlement-logic', async (request, reply) => {
  try {
    const schema = z.object({
      denialStatements: z.array(z.string()),
      settlementOffers: z.array(z.string()),
      context: z.object({
        domain: z.enum(['banking', 'debt_collection', 'general']),
        jurisdiction: z.string().default('norway')
      })
    });

    const { denialStatements, settlementOffers, context } = schema.parse(request.body);
    
    const analysis = await trustAnalyzer.analyzeSettlementLogic(denialStatements, settlementOffers, context);
    
    return {
      success: true,
      analysis,
      kindness_message: 'We\'ve analyzed these statements for logical consistency. Knowledge is power.',
      timestamp: new Date().toISOString(),
      legal_note: 'Logical contradictions in settlement negotiations may strengthen your position.'
    };
  } catch (error) {
    server.log.error('Settlement logic analysis error:', error);
    
    reply.code(500);
    return {
      success: false,
      error: 'Analysis failed',
      kindness_message: 'We had trouble analyzing these settlement statements. Legal logic can be complex.'
    };
  }
});

// SWORD Protocol eligibility analysis
server.post('/analyze/sword-eligibility', async (request, reply) => {
  try {
    const schema = z.object({
      creditorId: z.string(),
      aggregatedTrustScore: z.number().min(0).max(100),
      affectedUsers: z.number().min(1),
      violationCount: z.number().min(0)
    });

    const { creditorId, aggregatedTrustScore, affectedUsers, violationCount } = schema.parse(request.body);
    
    const analysis = trustAnalyzer.analyzeSWORDEligibility(creditorId, aggregatedTrustScore, affectedUsers, violationCount);
    
    return {
      success: true,
      analysis,
      kindness_message: 'Collective action analysis completed. Together we are stronger.',
      timestamp: new Date().toISOString(),
      empowerment_note: 'SWORD Protocol represents the power of community working together for justice.'
    };
  } catch (error) {
    server.log.error('SWORD eligibility analysis error:', error);
    
    reply.code(500);
    return {
      success: false,
      error: 'Analysis failed',
      kindness_message: 'We had trouble analyzing SWORD eligibility. Community power calculations are complex.'
    };
  }
});

// Authority hierarchy information
server.get('/authorities', async (request, reply) => {
  return {
    success: true,
    authorities: trustAnalyzer['authorityHierarchy'].getAllAuthorities(),
    message: 'Authority hierarchy for Norwegian legal system',
    note: 'Higher weights indicate greater legal authority and precedence'
  };
});

server.get('/authorities/top', async (request) => {
  const query = request.query as { limit?: string };
  const limit = query?.limit ? parseInt(query.limit) : 10;
  
  return {
    success: true,
    topAuthorities: trustAnalyzer['authorityHierarchy'].getTopAuthorities(limit),
    message: `Top ${limit} authorities in Norwegian legal system`
  };
});

server.get('/authorities/category/:category', async (request, reply) => {
  try {
    const params = request.params as { category: string };
  const category = params.category;
    
    // Validate category exists
    if (!Object.values(AuthorityCategory).includes(category as AuthorityCategory)) {
      reply.code(400);
      return {
        success: false,
        error: 'Invalid category',
        validCategories: Object.values(AuthorityCategory)
      };
    }
    
    const authorities = trustAnalyzer['authorityHierarchy'].getAuthoritiesByCategory(category as AuthorityCategory);
    
    return {
      success: true,
      category,
      authorities,
      message: `Authorities in category: ${category}`
    };
  } catch (error) {
    reply.code(500);
    return {
      success: false,
      error: 'Failed to retrieve authorities by category'
    };
  }
});

// Risk scoring endpoints

// Calculate risk score for a collector
server.post('/risk/calculate', async (request, reply) => {
  try {
    const schema = z.object({
      collectorId: z.string().min(1),
      violationPatterns: z.array(z.object({
        id: z.string(),
        collectorId: z.string(),
        article: z.string(),
        violationType: z.string(),
        occurrenceCount: z.number().min(0),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        confidence: z.number().min(0).max(1),
        lastOccurrence: z.string().transform(str => new Date(str))
      })).optional(),
      responsePatterns: z.array(z.object({
        id: z.string(),
        creditorId: z.string(),
        triggerPhrase: z.string(),
        successRate: z.number().min(0).max(1),
        admissionType: z.string(),
        complianceIndicators: z.array(z.string()),
        lastUpdated: z.string().transform(str => new Date(str))
      })).optional(),
      settlementPatterns: z.object({
        deniesLiabilityButOffersSettlement: z.boolean().optional(),
        inconsistentSettlementOffers: z.boolean().optional(),
        contradictoryStatements: z.boolean().optional(),
        hasPattern: z.boolean().optional(),
        consistencyScore: z.number().min(0).max(100).optional()
      }).optional(),
      authorityWeights: z.record(z.number().min(0).max(1)).optional()
    });

    const validatedRequest = schema.parse(request.body);
    const result = await riskCalculator.calculateRiskScore(validatedRequest);

    return {
      success: true,
      riskAssessment: result,
      kindness_message: 'Risk assessment completed with care for your protection.',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    server.log.error('Risk calculation error:', error);

    if (error instanceof z.ZodError) {
      reply.code(400);
      return {
        success: false,
        error: 'Validation error',
        details: error.errors,
        kindness_message: 'We had trouble understanding your risk calculation request. Could you check the format?'
      };
    }

    reply.code(500);
    return {
      success: false,
      error: 'Risk calculation failed',
      kindness_message: 'We encountered an issue calculating the risk score. Our team has been notified.'
    };
  }
});

// Assess collector risk with automatic data fetching
server.post('/risk/assess/:collectorId', async (request, reply) => {
  try {
    const params = request.params as { collectorId: string };
    const collectorId = params.collectorId;

    const schema = z.object({
      additionalData: z.object({
        settlementPatterns: z.object({
          deniesLiabilityButOffersSettlement: z.boolean().optional(),
          inconsistentSettlementOffers: z.boolean().optional(),
          contradictoryStatements: z.boolean().optional(),
          hasPattern: z.boolean().optional(),
          consistencyScore: z.number().min(0).max(100).optional()
        }).optional(),
        authorityWeights: z.record(z.number().min(0).max(1)).optional()
      }).optional()
    });

    const { additionalData } = schema.parse(request.body || {});
    const result = await riskCalculator.assessCollectorRisk(collectorId, additionalData);

    return {
      success: true,
      collectorId,
      riskAssessment: result,
      kindness_message: 'Complete risk assessment finished. Your safety is our priority.',
      timestamp: new Date().toISOString(),
      protection_note: result.riskLevel === 'CRITICAL' ? 'High risk detected. Consider immediate protective measures.' : 'Risk level manageable with standard precautions.'
    };
  } catch (error) {
    server.log.error('Risk assessment error:', error);

    reply.code(500);
    return {
      success: false,
      error: 'Risk assessment failed',
      kindness_message: 'We had trouble assessing this collector\'s risk. Consumer protection is complex.'
    };
  }
});

// Get stored risk score for a collector
server.get('/risk/score/:collectorId', async (request, reply) => {
  try {
    const params = request.params as { collectorId: string };
    const collectorId = params.collectorId;

    const storedRisk = await riskCalculator.getStoredRiskScore(collectorId);

    if (!storedRisk) {
      reply.code(404);
      return {
        success: false,
        error: 'Risk score not found',
        kindness_message: 'We don\'t have risk data for this collector yet. Would you like us to calculate it?'
      };
    }

    return {
      success: true,
      collectorId,
      riskData: storedRisk,
      kindness_message: 'Risk data retrieved successfully.',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    server.log.error('Risk score retrieval error:', error);

    reply.code(500);
    return {
      success: false,
      error: 'Failed to retrieve risk score',
      kindness_message: 'We had trouble getting the risk data. Database connections can be tricky.'
    };
  }
});

// Get violation patterns for a collector
server.get('/risk/violations/:collectorId', async (request, reply) => {
  try {
    const params = request.params as { collectorId: string };
    const collectorId = params.collectorId;

    const violations = await riskCalculator.getViolationPatterns(collectorId);

    return {
      success: true,
      collectorId,
      violationPatterns: violations,
      totalViolations: violations.length,
      kindness_message: violations.length > 0 ? 'Violation patterns found. Knowledge is power for protection.' : 'No violations found. This is good news!',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    server.log.error('Violation patterns retrieval error:', error);

    reply.code(500);
    return {
      success: false,
      error: 'Failed to retrieve violation patterns',
      kindness_message: 'We had trouble getting violation data. Legal pattern analysis is complex.'
    };
  }
});

// Get response patterns for a collector
server.get('/risk/responses/:collectorId', async (request, reply) => {
  try {
    const params = request.params as { collectorId: string };
    const collectorId = params.collectorId;

    const responses = await riskCalculator.getResponsePatterns(collectorId);

    return {
      success: true,
      collectorId,
      responsePatterns: responses,
      totalPatterns: responses.length,
      kindness_message: responses.length > 0 ? 'Response patterns analyzed. Understanding behavior protects you.' : 'No response patterns found yet.',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    server.log.error('Response patterns retrieval error:', error);

    reply.code(500);
    return {
      success: false,
      error: 'Failed to retrieve response patterns',
      kindness_message: 'We had trouble getting response pattern data. Behavioral analysis takes time.'
    };
  }
});

// Get risk level summary for multiple collectors
server.post('/risk/summary', async (request, reply) => {
  try {
    const schema = z.object({
      collectorIds: z.array(z.string()).min(1).max(50) // Limit to prevent overload
    });

    const { collectorIds } = schema.parse(request.body);

    const summaries = await Promise.allSettled(
      collectorIds.map(async (id) => {
        const riskData = await riskCalculator.getStoredRiskScore(id);
        return {
          collectorId: id,
          riskScore: riskData?.riskScore || null,
          riskLevel: riskData?.complianceRating || 'UNKNOWN',
          lastUpdated: riskData?.lastUpdated || null
        };
      })
    );

    const results = summaries.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          collectorId: collectorIds[index],
          riskScore: null,
          riskLevel: 'ERROR',
          lastUpdated: null,
          error: 'Failed to retrieve data'
        };
      }
    });

    return {
      success: true,
      riskSummaries: results,
      totalCollectors: collectorIds.length,
      kindness_message: 'Risk summary completed. Collective knowledge strengthens protection.',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    server.log.error('Risk summary error:', error);

    if (error instanceof z.ZodError) {
      reply.code(400);
      return {
        success: false,
        error: 'Validation error',
        details: error.errors,
        kindness_message: 'Please check your collector ID list format.'
      };
    }

    reply.code(500);
    return {
      success: false,
      error: 'Summary generation failed',
      kindness_message: 'We had trouble generating the risk summary. Bulk analysis is complex.'
    };
  }
});

// Educational endpoint
server.get('/learn/contradiction-types', async () => {
  return {
    success: true,
    contradictionTypes: Object.values(ContradictionType).map(type => ({
      type,
      description: getContradictionDescription(type),
      example: getContradictionExample(type),
      severity: getContradictionSeverity(type)
    })),
    kindness_message: 'Learning about logical patterns helps you think more clearly and make better decisions.'
  };
});

// Utility endpoint for testing
server.post('/test/kindness', async (request, reply) => {
  const schema = z.object({
    message: z.string(),
    gentleness: z.number().min(0).max(1).default(0.8)
  });

  try {
    const { message, gentleness } = schema.parse(request.body);
    
    // Create a mock contradiction for testing kindness response
    const mockContradiction = {
      detected: true,
      confidence: 0.8,
      type: ContradictionType.SETTLEMENT_LOGIC,
      explanation: 'Test contradiction',
      kindnessMessage: message,
      evidence: [],
      recommendation: 'This is a test recommendation'
    };
    
    const kindnessAlgorithm = trustAnalyzer['kindnessAlgorithm'];
    const response = kindnessAlgorithm.createKindContradictionResponse(mockContradiction);
    
    return {
      success: true,
      kindnessResponse: response,
      message: 'Kindness algorithm test completed',
      note: 'This endpoint is for testing how the kindness algorithm responds to different inputs'
    };
  } catch (error) {
    reply.code(400);
    return {
      success: false,
      error: 'Invalid test request',
      kindness_message: 'We had trouble with your kindness test. Could you check the format?'
    };
  }
});

// Helper functions
function getContradictionDescription(type: ContradictionType): string {
  const descriptions = {
    [ContradictionType.SETTLEMENT_LOGIC]: 'Denying liability while offering settlement payment',
    [ContradictionType.DATA_CONTRADICTION]: 'Claiming no personal data while conducting data processing',
    [ContradictionType.AUTHORITY_HIERARCHY]: 'Lower authority contradicting established higher authority',
    [ContradictionType.TEMPORAL_INCONSISTENCY]: 'Current statements contradicting previous statements',
    [ContradictionType.LOGICAL_IMPOSSIBILITY]: 'Statements that cannot logically coexist',
    [ContradictionType.REGULATORY_VIOLATION]: 'Claims that contradict established regulations'
  };
  return descriptions[type];
}

function getContradictionExample(type: ContradictionType): string {
  const examples = {
    [ContradictionType.SETTLEMENT_LOGIC]: '"We deny wrongdoing" + "We offer 40% reduction"',
    [ContradictionType.DATA_CONTRADICTION]: '"No personal data" + "We have your debt record"',
    [ContradictionType.AUTHORITY_HIERARCHY]: 'Company claim vs. Supreme Court ruling',
    [ContradictionType.TEMPORAL_INCONSISTENCY]: 'Monday: "Never happened" Tuesday: "It was justified"',
    [ContradictionType.LOGICAL_IMPOSSIBILITY]: '"Always compliant" + "Sometimes violated rules"',
    [ContradictionType.REGULATORY_VIOLATION]: '"25% interest is legal" vs. "Max 23.5% allowed"'
  };
  return examples[type];
}

function getContradictionSeverity(type: ContradictionType): 'low' | 'medium' | 'high' {
  const severities: Record<ContradictionType, 'low' | 'medium' | 'high'> = {
    [ContradictionType.SETTLEMENT_LOGIC]: 'high',
    [ContradictionType.DATA_CONTRADICTION]: 'high',
    [ContradictionType.AUTHORITY_HIERARCHY]: 'medium',
    [ContradictionType.TEMPORAL_INCONSISTENCY]: 'medium',
    [ContradictionType.LOGICAL_IMPOSSIBILITY]: 'high',
    [ContradictionType.REGULATORY_VIOLATION]: 'high'
  };
  return severities[type];
}

// Error handling
server.setErrorHandler(async (error, request, reply) => {
  server.log.error(error);
  
  reply.code(500);
  return {
    success: false,
    error: 'Internal server error',
    kindness_message: 'Something unexpected happened. We\'re sorry about that! Our team has been notified.',
    timestamp: new Date().toISOString(),
    requestId: request.id
  };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8002');
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    
    console.log(`
🌟✨ Sacred Architecture Trust Engine ✨🌟
Built with love for truth and justice ❤️⚔️

🚀 Server running on http://${host}:${port}
🔍 Health check: http://${host}:${port}/health
📖 Trust analysis: http://${host}:${port}/analyze
⚔️ DAMOCLES ready: http://${host}:${port}/analyze/debt-collection
🎯 Risk scoring: http://${host}:${port}/risk/assess/{collectorId}
📊 Risk summary: http://${host}:${port}/risk/summary

Sacred Architecture principles active:
✅ Service over extraction
✅ Kindness-powered responses  
✅ User agency preservation
✅ Community intelligence
✅ Mathematical truth verification

"Every algorithm is a chance to serve consciousness.
 Every calculation is an opportunity for kindness.
 Every analysis brings us closer to justice."

May your code serve love. May your logic serve truth. ⚔️✨
    `);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🌅 Gracefully shutting down Sacred Architecture Trust Engine...');
  await server.close();
  console.log('👋 Thank you for building the future with kindness. Until next time! ✨');
  process.exit(0);
});

start();