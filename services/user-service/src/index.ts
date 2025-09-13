import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const redis = Redis.createClient({ url: process.env.REDIS_URL });

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
});

// Register plugins
fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production' ? 
    ['https://damocles.no'] : 
    ['http://localhost:3001', 'http://localhost:3000']
});

fastify.register(helmet);

fastify.register(rateLimit, {
  max: parseInt(process.env.API_RATE_LIMIT || '100'),
  timeWindow: '1 minute'
});

// Health check
fastify.get('/health', async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    return { status: 'healthy', service: 'user-service' };
  } catch (error) {
    fastify.log.error(error);
    throw new Error('Service unhealthy');
  }
});

// Routes
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { debtRoutes } from './routes/debts';

fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(userRoutes, { prefix: '/api/users' });
fastify.register(debtRoutes, { prefix: '/api/debts' });

// Error handling
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  if (error.code === 'P2002') {
    return reply.status(409).send({
      error: 'Conflict',
      message: 'Resource already exists'
    });
  }
  
  if (error.code === 'P2025') {
    return reply.status(404).send({
      error: 'Not Found',
      message: 'Resource not found'
    });
  }
  
  reply.status(error.statusCode || 500).send({
    error: error.name || 'Internal Server Error',
    message: error.message
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  await fastify.close();
  await prisma.$disconnect();
  await redis.disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start server
const start = async () => {
  try {
    await redis.connect();
    await fastify.listen({ 
      port: parseInt(process.env.USER_SERVICE_PORT || '3000'), 
      host: '0.0.0.0' 
    });
    fastify.log.info('User service started successfully');
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();