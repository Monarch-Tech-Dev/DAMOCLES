import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Service-to-service API key authentication
const SERVICE_API_KEY = process.env.SERVICE_API_KEY || 'dev-service-key-12345';

function authenticateService(request: FastifyRequest, reply: FastifyReply, done: Function) {
  const apiKey = request.headers['x-service-api-key'] as string;

  if (!apiKey || apiKey !== SERVICE_API_KEY) {
    reply.status(401).send({ error: 'Unauthorized - Invalid service API key' });
    return;
  }

  done();
}

export async function internalRoutes(fastify: FastifyInstance) {
  // Add service authentication middleware
  fastify.addHook('preHandler', authenticateService);

  // Get user by ID (internal service-to-service)
  fastify.get('/users/:userId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.params as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        streetAddress: true,
        postalCode: true,
        city: true,
        country: true,
        dateOfBirth: true,
        gdprProfileComplete: true,
        riskScore: true,
        shieldTier: true,
        tokenBalance: true,
        onboardingStatus: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.send({ user });
  });

  // Get creditor by ID (internal service-to-service)
  fastify.get('/creditors/:creditorId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { creditorId } = request.params as { creditorId: string };

    const creditor = await prisma.creditor.findUnique({
      where: { id: creditorId },
      select: {
        id: true,
        name: true,
        organizationNumber: true,
        type: true,
        privacyEmail: true,
        violationScore: true,
        totalViolations: true,
        averageSettlementRate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!creditor) {
      return reply.status(404).send({ error: 'Creditor not found' });
    }

    return reply.send({ creditor });
  });

  // Get last GDPR request for user-creditor pair (internal service-to-service)
  // Used for cooldown period validation
  fastify.get('/gdpr-requests/last', async (request: FastifyRequest, reply: FastifyReply) => {
    const { user_id, creditor_id } = request.query as { user_id: string; creditor_id: string };

    if (!user_id || !creditor_id) {
      return reply.status(400).send({
        error: 'Missing required parameters: user_id and creditor_id'
      });
    }

    const lastRequest = await prisma.gdprRequest.findFirst({
      where: {
        userId: user_id,
        creditorId: creditor_id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        userId: true,
        creditorId: true,
        referenceId: true,
        status: true,
        createdAt: true,
        sentAt: true
      }
    });

    if (!lastRequest) {
      return reply.status(404).send({ error: 'No previous GDPR request found' });
    }

    return reply.send({ request: lastRequest });
  });

  // Get all pending GDPR requests (internal service-to-service)
  // Used by escalation scheduler to find requests requiring follow-up
  fastify.get('/gdpr-requests/pending', async (request: FastifyRequest, reply: FastifyReply) => {
    const pendingRequests = await prisma.gdprRequest.findMany({
      where: {
        status: {
          in: ['sent', 'pending', 'draft']
        },
        sentAt: {
          not: null
        },
        responseReceivedAt: null
      },
      orderBy: {
        sentAt: 'asc'
      },
      select: {
        id: true,
        userId: true,
        creditorId: true,
        referenceId: true,
        status: true,
        createdAt: true,
        sentAt: true,
        responseDue: true
      }
    });

    return reply.send({
      requests: pendingRequests,
      count: pendingRequests.length
    });
  });

  // Get debt by ID (internal service-to-service)
  // Used by settlement service to fetch debt details
  fastify.get('/debts/:debtId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { debtId } = request.params as { debtId: string };

    const debt = await prisma.debt.findUnique({
      where: { id: debtId },
      select: {
        id: true,
        userId: true,
        creditorId: true,
        currentAmount: true,
        originalAmount: true,
        description: true,
        status: true,
        accountNumber: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!debt) {
      return reply.status(404).send({ error: 'Debt not found' });
    }

    return reply.send({ debt });
  });

  // Get violations for user-creditor pair (internal service-to-service)
  // Used by settlement service to analyze GDPR violations
  fastify.get('/violations/user-creditor', async (request: FastifyRequest, reply: FastifyReply) => {
    const { user_id, creditor_id } = request.query as { user_id: string; creditor_id: string };

    if (!user_id || !creditor_id) {
      return reply.status(400).send({
        error: 'Missing required parameters: user_id and creditor_id'
      });
    }

    const violations = await prisma.violation.findMany({
      where: {
        gdprRequest: {
          userId: user_id,
          creditorId: creditor_id
        }
      },
      select: {
        id: true,
        type: true,
        severity: true,
        status: true,
        confidence: true,
        evidence: true,
        legalReference: true,
        estimatedDamage: true,
        blockchainHash: true,
        ipfsHash: true,
        createdAt: true
      },
      orderBy: {
        severity: 'desc'
      }
    });

    return reply.send({
      violations,
      count: violations.length
    });
  });
}
