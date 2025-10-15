import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateUser } from '../middleware/auth';

const prisma = new PrismaClient();

const UpdateProfileSchema = z.object({
  phoneNumber: z.string().optional(),
  shieldTier: z.enum(['bronze', 'silver', 'gold']).optional(),
  // GDPR identity fields
  name: z.string().min(2).optional(),
  streetAddress: z.string().min(5).optional(),
  postalCode: z.string().min(4).max(10).optional(),
  city: z.string().min(2).optional(),
  country: z.string().optional(),
  dateOfBirth: z.string().optional() // ISO date string
});

export async function userRoutes(fastify: FastifyInstance) {
  // Add authentication middleware
  fastify.addHook('preHandler', authenticateUser);

  // Get current user (for token verification)
  fastify.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        shieldTier: true,
        bankIdVerified: true,
        vippsVerified: true,
        tokenBalance: true,
        onboardingStatus: true,
        phoneNumber: true,
        createdAt: true,
        lastLoginAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.send(user);
  });

  // Get user profile
  fastify.get('/profile', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.userId;

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

      // Prepare update data
      const updateData: any = { ...body };

      // Convert dateOfBirth string to Date if provided
      if (body.dateOfBirth) {
        updateData.dateOfBirth = new Date(body.dateOfBirth);
      }

      // Get current user to check what fields will be complete after update
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          streetAddress: true,
          postalCode: true,
          city: true,
          dateOfBirth: true
        }
      });

      // Merge current and new data to check completeness
      const mergedData = {
        name: updateData.name || currentUser?.name,
        streetAddress: updateData.streetAddress || currentUser?.streetAddress,
        postalCode: updateData.postalCode || currentUser?.postalCode,
        city: updateData.city || currentUser?.city,
        dateOfBirth: updateData.dateOfBirth || currentUser?.dateOfBirth
      };

      // Check if GDPR profile is complete (all required fields present)
      const gdprProfileComplete = !!(
        mergedData.name &&
        mergedData.streetAddress &&
        mergedData.postalCode &&
        mergedData.city &&
        mergedData.dateOfBirth
      );

      updateData.gdprProfileComplete = gdprProfileComplete;

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
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
}