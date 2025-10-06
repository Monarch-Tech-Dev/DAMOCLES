import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateUser } from '../middleware/auth';

const prisma = new PrismaClient();

const CreateCreditorSchema = z.object({
  name: z.string().min(1),
  organizationNumber: z.string().optional(),
  type: z.enum(['bank', 'inkasso', 'bnpl', 'other']),
  privacyEmail: z.string().email().optional()
});

export async function creditorRoutes(fastify: FastifyInstance) {
  // Get creditor types - MUST be before /:creditorId route
  fastify.get('/types', async (request: FastifyRequest, reply: FastifyReply) => {
    const types = [
      { value: 'bank', label: 'Bank', description: 'Commercial banks and financial institutions' },
      { value: 'inkasso', label: 'Inkasso', description: 'Debt collection companies' },
      { value: 'bnpl', label: 'Buy Now Pay Later', description: 'BNPL service providers' },
      { value: 'other', label: 'Other', description: 'Other creditor types' }
    ];

    return reply.send({ types });
  });

  // Get all creditors (public - no auth required)
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const search = (request.query as any).search || '';
    const type = (request.query as any).type;
    const limit = Math.min(parseInt((request.query as any).limit) || 50, 100);
    const offset = parseInt((request.query as any).offset) || 0;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { organizationNumber: { contains: search } }
      ];
    }
    
    if (type) {
      where.type = type;
    }
    
    const creditors = await prisma.creditor.findMany({
      where,
      select: {
        id: true,
        name: true,
        organizationNumber: true,
        type: true,
        violationScore: true,
        totalViolations: true,
        averageSettlementRate: true,
        _count: {
          select: {
            debts: true
          }
        }
      },
      orderBy: [
        { violationScore: 'desc' },
        { name: 'asc' }
      ],
      take: limit,
      skip: offset
    });
    
    const total = await prisma.creditor.count({ where });
    
    return reply.send({ 
      creditors, 
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  });
  
  // Get specific creditor details
  fastify.get('/:creditorId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { creditorId } = request.params as { creditorId: string };
    
    const creditor = await prisma.creditor.findUnique({
      where: { id: creditorId },
      include: {
        _count: {
          select: {
            debts: true,
            violations: true
          }
        }
      }
    });
    
    if (!creditor) {
      return reply.status(404).send({ error: 'Creditor not found' });
    }
    
    return reply.send({ creditor });
  });
  
  // Create new creditor (authenticated users only)
  fastify.post('/', { preHandler: authenticateUser }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = CreateCreditorSchema.parse(request.body);
      
      // Check if creditor already exists
      const existingCreditor = await prisma.creditor.findFirst({
        where: {
          OR: [
            { name: body.name },
            ...(body.organizationNumber ? [{ organizationNumber: body.organizationNumber }] : [])
          ]
        }
      });
      
      if (existingCreditor) {
        return reply.status(409).send({ 
          error: 'Creditor already exists',
          creditor: {
            id: existingCreditor.id,
            name: existingCreditor.name,
            organizationNumber: existingCreditor.organizationNumber
          }
        });
      }
      
      const creditor = await prisma.creditor.create({
        data: {
          ...body,
          violationScore: 0,
          totalViolations: 0,
          averageSettlementRate: 0.0
        },
        select: {
          id: true,
          name: true,
          organizationNumber: true,
          type: true,
          violationScore: true
        }
      });
      
      return reply.status(201).send({ creditor });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      throw error;
    }
  });
}