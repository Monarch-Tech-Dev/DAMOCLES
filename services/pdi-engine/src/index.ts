import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { pdiRoutes } from './routes';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PDI_SERVICE_PORT || '8002', 10);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Prisma client
const prisma = new PrismaClient();

async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: {
      level: NODE_ENV === 'production' ? 'info' : 'debug'
    },
    trustProxy: true
  });

  // Security plugins
  await server.register(helmet, {
    contentSecurityPolicy: false
  });

  await server.register(cors, {
    origin: NODE_ENV === 'production'
      ? ['https://damocles.no', 'https://app.damocles.no']
      : true, // Allow all origins in development
    credentials: true
  });

  // Rate limiting
  await server.register(rateLimit, {
    max: NODE_ENV === 'production' ? 100 : 1000, // requests per minute
    timeWindow: '1 minute',
    errorResponseBuilder: function (request, context) {
      return {
        code: 429,
        error: 'Rate limit exceeded',
        message: `Too many requests, retry after ${Math.round(context.after)} seconds`
      };
    }
  });

  // Health check endpoint
  server.get('/health', async (request, reply) => {
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'pdi-engine',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'connected'
      };
    } catch (error) {
      reply.status(500);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'pdi-engine',
        version: '1.0.0',
        error: 'Database connection failed'
      };
    }
  });

  // Register PDI routes
  await server.register(pdiRoutes);

  // Global error handler
  server.setErrorHandler(async (error, request, reply) => {
    server.log.error('Unhandled error:', error);

    if (reply.statusCode < 400) {
      reply.status(500);
    }

    return {
      error: 'Internal server error',
      message: NODE_ENV === 'development' ? error.message : 'Something went wrong',
      timestamp: new Date().toISOString()
    };
  });

  // 404 handler
  server.setNotFoundHandler(async (request, reply) => {
    reply.status(404);
    return {
      error: 'Not found',
      message: `Route ${request.method}:${request.url} not found`,
      timestamp: new Date().toISOString()
    };
  });

  return server;
}

async function start() {
  try {
    const server = await buildServer();

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        server.log.info(`Received ${signal}, shutting down gracefully...`);

        try {
          await server.close();
          await prisma.$disconnect();
          server.log.info('Server closed successfully');
          process.exit(0);
        } catch (error) {
          server.log.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    });

    // Start server
    const address = await server.listen({ port: PORT, host: HOST });
    server.log.info(`🚀 PDI Engine server ready at ${address}`);

    if (NODE_ENV === 'development') {
      server.log.info('📊 PDI API Endpoints:');
      server.log.info('  POST /api/pdi/calculate - Calculate PDI score');
      server.log.info('  GET  /api/pdi/profile - Get user PDI profile');
      server.log.info('  GET  /api/pdi/history - Get PDI history');
      server.log.info('  GET  /api/pdi/alerts - Get PDI alerts');
      server.log.info('  GET  /api/pdi/analytics - Get dashboard analytics');
      server.log.info('  GET  /api/pdi/regional - Get regional data');
      server.log.info('  GET  /health - Health check');
    }

  } catch (error) {
    console.error('❌ Failed to start PDI Engine server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
start();