import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../middleware/auth';

const prisma = new PrismaClient();

export async function gdprRequestRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateUser);

  // Get all GDPR requests for the authenticated user
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { creditorId, status } = request.query as any;

      const where: any = { userId };
      if (creditorId) {
        where.creditorId = creditorId;
      }
      if (status) {
        where.status = status;
      }

      const requests = await prisma.gdprRequest.findMany({
        where,
        include: {
          creditor: {
            select: {
              id: true,
              name: true,
              type: true,
              privacyEmail: true,
              organizationNumber: true,
              violationScore: true
            }
          },
          violations: {
            select: {
              id: true,
              type: true,
              severity: true,
              status: true,
              evidence: true,
              estimatedDamage: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reply.send({ requests });

    } catch (error) {
      console.error('Error fetching GDPR requests:', error);
      return reply.status(500).send({ error: 'Failed to fetch GDPR requests' });
    }
  });

  // Get a single GDPR request by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as any;

      const gdprRequest = await prisma.gdprRequest.findFirst({
        where: {
          id,
          userId
        },
        include: {
          creditor: {
            select: {
              id: true,
              name: true,
              type: true,
              privacyEmail: true,
              organizationNumber: true,
              violationScore: true,
              totalViolations: true
            }
          },
          violations: {
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
              createdAt: 'desc'
            }
          }
        }
      });

      if (!gdprRequest) {
        return reply.status(404).send({ error: 'GDPR request not found' });
      }

      return reply.send({ request: gdprRequest });

    } catch (error) {
      console.error('Error fetching GDPR request:', error);
      return reply.status(500).send({ error: 'Failed to fetch GDPR request' });
    }
  });

  // Get GDPR requests for a specific creditor
  fastify.get('/creditor/:creditorId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { creditorId } = request.params as any;

      const requests = await prisma.gdprRequest.findMany({
        where: {
          userId,
          creditorId
        },
        include: {
          creditor: {
            select: {
              id: true,
              name: true,
              type: true,
              privacyEmail: true,
              organizationNumber: true,
              violationScore: true
            }
          },
          violations: {
            select: {
              id: true,
              type: true,
              severity: true,
              status: true,
              evidence: true,
              estimatedDamage: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reply.send({ requests });

    } catch (error) {
      console.error('Error fetching GDPR requests for creditor:', error);
      return reply.status(500).send({ error: 'Failed to fetch GDPR requests' });
    }
  });

  // Get GDPR request statistics for the user
  fastify.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      const [total, pending, sent, responded, escalated, violations] = await Promise.all([
        prisma.gdprRequest.count({ where: { userId } }),
        prisma.gdprRequest.count({ where: { userId, status: 'PENDING' } }),
        prisma.gdprRequest.count({ where: { userId, status: 'SENT' } }),
        prisma.gdprRequest.count({ where: { userId, status: 'RESPONDED' } }),
        prisma.gdprRequest.count({ where: { userId, status: 'ESCALATED' } }),
        prisma.violation.count({
          where: {
            gdprRequest: {
              userId
            }
          }
        })
      ]);

      return reply.send({
        stats: {
          total,
          pending,
          sent,
          responded,
          escalated,
          violations
        }
      });

    } catch (error) {
      console.error('Error fetching GDPR request stats:', error);
      return reply.status(500).send({ error: 'Failed to fetch statistics' });
    }
  });
}
