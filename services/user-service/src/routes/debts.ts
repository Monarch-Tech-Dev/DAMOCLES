import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateUser } from '../middleware/auth';

const prisma = new PrismaClient();

const AddDebtSchema = z.object({
  creditorId: z.string().cuid(),
  originalAmount: z.number().positive(),
  currentAmount: z.number().positive(),
  accountNumber: z.string().optional()
});

const UpdateDebtSchema = z.object({
  currentAmount: z.number().positive().optional(),
  status: z.enum(['active', 'negotiating', 'settled']).optional()
});

export async function debtRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateUser);
  
  // Add new debt
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const body = AddDebtSchema.parse(request.body);
      
      // Verify creditor exists
      const creditor = await prisma.creditor.findUnique({
        where: { id: body.creditorId }
      });
      
      if (!creditor) {
        return reply.status(404).send({ error: 'Creditor not found' });
      }
      
      const debt = await prisma.debt.create({
        data: {
          userId,
          creditorId: body.creditorId,
          originalAmount: body.originalAmount,
          currentAmount: body.currentAmount,
          accountNumber: body.accountNumber,
          status: 'active'
        },
        include: {
          creditor: {
            select: {
              id: true,
              name: true,
              type: true,
              violationScore: true
            }
          }
        }
      });
      
      return reply.status(201).send({ debt });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      throw error;
    }
  });
  
  // Get user's debts
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.userId;
    const status = (request.query as any).status;
    
    const where: any = { userId };
    if (status) {
      where.status = status;
    }
    
    const debts = await prisma.debt.findMany({
      where,
      include: {
        creditor: {
          select: {
            id: true,
            name: true,
            type: true,
            violationScore: true,
            averageSettlementRate: true
          }
        },
        settlements: {
          select: {
            id: true,
            status: true,
            settledAmount: true,
            savedAmount: true
          },
          orderBy: { proposedAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            settlements: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return reply.send({ debts });
  });
  
  // Get specific debt
  fastify.get('/:debtId', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.userId;
    const { debtId } = request.params as { debtId: string };
    
    const debt = await prisma.debt.findFirst({
      where: {
        id: debtId,
        userId
      },
      include: {
        creditor: {
          select: {
            id: true,
            name: true,
            type: true,
            organizationNumber: true,
            violationScore: true,
            totalViolations: true,
            averageSettlementRate: true
          }
        },
        settlements: {
          select: {
            id: true,
            status: true,
            originalAmount: true,
            settledAmount: true,
            savedAmount: true,
            platformFee: true,
            proposedAt: true,
            completedAt: true
          },
          orderBy: { proposedAt: 'desc' }
        }
      }
    });
    
    if (!debt) {
      return reply.status(404).send({ error: 'Debt not found' });
    }
    
    return reply.send({ debt });
  });
  
  // Update debt
  fastify.patch('/:debtId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { debtId } = request.params as { debtId: string };
      const body = UpdateDebtSchema.parse(request.body);
      
      const debt = await prisma.debt.updateMany({
        where: {
          id: debtId,
          userId
        },
        data: body
      });
      
      if (debt.count === 0) {
        return reply.status(404).send({ error: 'Debt not found' });
      }
      
      const updatedDebt = await prisma.debt.findUnique({
        where: { id: debtId },
        include: {
          creditor: {
            select: {
              id: true,
              name: true,
              type: true,
              violationScore: true
            }
          }
        }
      });
      
      return reply.send({ debt: updatedDebt });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      throw error;
    }
  });
  
  // Delete debt
  fastify.delete('/:debtId', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.userId;
    const { debtId } = request.params as { debtId: string };
    
    const debt = await prisma.debt.deleteMany({
      where: {
        id: debtId,
        userId,
        status: { not: 'settled' } // Prevent deletion of settled debts
      }
    });
    
    if (debt.count === 0) {
      return reply.status(404).send({ 
        error: 'Debt not found or cannot be deleted' 
      });
    }
    
    return reply.status(204).send();
  });
}