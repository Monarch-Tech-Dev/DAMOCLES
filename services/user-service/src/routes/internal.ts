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
}
