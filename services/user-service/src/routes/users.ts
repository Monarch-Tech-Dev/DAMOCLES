import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateUser } from '../middleware/auth';

const prisma = new PrismaClient();

const UpdateProfileSchema = z.object({
  phoneNumber: z.string().optional(),
  shieldTier: z.enum(['bronze', 'silver', 'gold']).optional()
});

export async function userRoutes(fastify: FastifyInstance) {
  // Add authentication middleware
  fastify.addHook('preHandler', authenticateUser);
  
  // Get user profile
  fastify.get('/profile', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        riskScore: true,
        shieldTier: true,
        tokenBalance: true,
        onboardingStatus: true,
        createdAt: true,
        _count: {
          select: {
            debts: { where: { status: 'active' } },
            gdprRequests: true,
            settlements: { where: { status: 'completed' } }
          }
        }
      }
    });
    
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    
    return reply.send({ user });
  });
  
  // Update user profile
  fastify.patch('/profile', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const body = UpdateProfileSchema.parse(request.body);
      
      const user = await prisma.user.update({
        where: { id: userId },
        data: body,
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          shieldTier: true,
          tokenBalance: true
        }
      });
      
      return reply.send({ user });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      throw error;
    }
  });
  
  // Get user statistics
  fastify.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.userId;
    
    const stats = await prisma.$transaction(async (tx) => {
      const [
        totalDebts,
        activeDebts,
        totalViolations,
        completedSettlements,
        totalSaved,
        tokenBalance
      ] = await Promise.all([
        tx.debt.count({ where: { userId } }),
        tx.debt.count({ where: { userId, status: 'active' } }),
        tx.violation.count({
          where: {
            gdprRequest: { userId }
          }
        }),
        tx.settlement.count({ where: { userId, status: 'completed' } }),
        tx.settlement.aggregate({
          where: { userId, status: 'completed' },
          _sum: { savedAmount: true }
        }),
        tx.user.findUnique({
          where: { id: userId },
          select: { tokenBalance: true }
        })
      ]);
      
      return {
        totalDebts,
        activeDebts,
        totalViolations,
        completedSettlements,
        totalSaved: totalSaved._sum.savedAmount || 0,
        tokenBalance: tokenBalance?.tokenBalance || 0
      };
    });
    
    return reply.send({ stats });
  });
  
  // Get user activity feed
  fastify.get('/activity', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.userId;
    const page = parseInt((request.query as any).page) || 1;
    const limit = Math.min(parseInt((request.query as any).limit) || 20, 100);
    const skip = (page - 1) * limit;
    
    // Get recent activities across different tables
    const [gdprRequests, violations, settlements, tokenTransactions] = await Promise.all([
      prisma.gdprRequest.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          createdAt: true,
          creditor: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      
      prisma.violation.findMany({
        where: { gdprRequest: { userId } },
        select: {
          id: true,
          type: true,
          severity: true,
          createdAt: true,
          creditor: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      
      prisma.settlement.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          savedAmount: true,
          proposedAt: true,
          debt: {
            select: {
              creditor: { select: { name: true } }
            }
          }
        },
        orderBy: { proposedAt: 'desc' },
        take: limit
      }),
      
      prisma.tokenTransaction.findMany({
        where: { userId },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    ]);
    
    // Combine and sort all activities
    const activities = [
      ...gdprRequests.map(item => ({
        type: 'gdpr_request',
        id: item.id,
        title: `GDPR request to ${item.creditor.name}`,
        status: item.status,
        timestamp: item.createdAt
      })),
      ...violations.map(item => ({
        type: 'violation',
        id: item.id,
        title: `${item.type} violation detected at ${item.creditor.name}`,
        status: item.severity,
        timestamp: item.createdAt
      })),
      ...settlements.map(item => ({
        type: 'settlement',
        id: item.id,
        title: `Settlement with ${item.debt.creditor.name}`,
        status: item.status,
        amount: item.savedAmount,
        timestamp: item.proposedAt
      })),
      ...tokenTransactions.map(item => ({
        type: 'token',
        id: item.id,
        title: `${item.type} transaction`,
        status: item.status,
        amount: item.amount,
        timestamp: item.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(skip, skip + limit);
    
    return reply.send({
      activities,
      pagination: {
        page,
        limit,
        total: activities.length
      }
    });
  });
}