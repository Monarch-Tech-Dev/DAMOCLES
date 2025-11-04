import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { PaymentService } from './PaymentService';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { authenticateUser, authenticateAdmin } from './middleware/auth';
import { initializeSentry } from './sentry';

// Explicitly load .env from payment-service directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Sentry as early as possible
initializeSentry();

const fastify = Fastify({
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

// Middleware
fastify.register(cors, {
  origin: ['http://localhost:3001', 'https://damocles.no'],
  credentials: true
});

fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
});

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

const paymentService = new PaymentService();

// Validation schemas
const calculateFeeSchema = z.object({
  recoveryAmount: z.number().positive()
});

const generateInvoiceSchema = z.object({
  userId: z.string().uuid(),
  caseId: z.string().uuid(),
  recoveryAmount: z.number().positive()
});

const processPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  paymentMethod: z.enum(['stripe', 'vipps']),
  paymentMethodId: z.string().optional(),
  phoneNumber: z.string().optional()
});

const webhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any()
  })
});

// Routes

/**
 * Calculate success fee for a recovery amount
 */
fastify.post('/api/calculate-fee', async (request, reply) => {
  try {
    const { recoveryAmount } = calculateFeeSchema.parse(request.body);

    const calculation = paymentService.calculateSuccessFee(recoveryAmount);

    return {
      success: true,
      calculation
    };
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate invoice for successful recovery
 */
fastify.post('/api/generate-invoice', async (request, reply) => {
  try {
    const { userId, caseId, recoveryAmount } = generateInvoiceSchema.parse(request.body);

    const invoice = await paymentService.generateInvoice(userId, caseId, recoveryAmount);

    if (!invoice) {
      return {
        success: true,
        message: 'Recovery amount too small, no fee charged',
        invoice: null
      };
    }

    return {
      success: true,
      invoice
    };
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Process payment
 */
fastify.post('/api/process-payment', async (request, reply) => {
  try {
    const { invoiceId, paymentMethod, paymentMethodId, phoneNumber } = processPaymentSchema.parse(request.body);

    let result;
    if (paymentMethod === 'stripe') {
      if (!paymentMethodId) {
        throw new Error('Payment method ID required for Stripe payments');
      }
      result = await paymentService.processStripePayment(invoiceId, paymentMethodId);
    } else if (paymentMethod === 'vipps') {
      if (!phoneNumber) {
        throw new Error('Phone number required for Vipps payments');
      }
      result = await paymentService.processVippsPayment(invoiceId, phoneNumber);
    }

    return result;
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create payment link for invoice
 */
fastify.post('/api/create-payment-link/:invoiceId', async (request, reply) => {
  try {
    const { invoiceId } = request.params as { invoiceId: string };

    const paymentLink = await paymentService.createPaymentLink(invoiceId);

    return {
      success: true,
      paymentLink
    };
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get user payment history
 */
fastify.get('/api/user/:userId/payments', async (request, reply) => {
  try {
    const { userId } = request.params as { userId: string };

    const payments = await paymentService.getUserPaymentHistory(userId);

    return {
      success: true,
      payments
    };
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get user pending invoices
 */
fastify.get('/api/user/:userId/invoices/pending', async (request, reply) => {
  try {
    const { userId } = request.params as { userId: string };

    const invoices = await paymentService.getUserPendingInvoices(userId);

    return {
      success: true,
      invoices
    };
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get revenue statistics (admin only)
 */
fastify.get('/api/admin/revenue-stats', {
  preHandler: [authenticateUser, authenticateAdmin]
}, async (request, reply) => {
  try {
    const stats = await paymentService.getRevenueStats();

    return {
      success: true,
      stats
    };
  } catch (error) {
    reply.code(500).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Webhook for recovery confirmation
 */
fastify.post('/api/webhook/recovery-confirmed', async (request, reply) => {
  try {
    const { caseId, recoveredAmount } = request.body as {
      caseId: string;
      recoveredAmount: number;
    };

    await paymentService.onRecoveryConfirmed(caseId, recoveredAmount);

    return {
      success: true,
      message: 'Recovery processing initiated'
    };
  } catch (error) {
    reply.code(500).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Stripe webhook handler
 */
fastify.post('/api/webhook/stripe', async (request, reply) => {
  try {
    const sig = request.headers['stripe-signature'] as string;
    const event = JSON.parse(request.body as string);

    // In production, verify the webhook signature
    // const event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        fastify.log.info('Payment succeeded', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount
        });
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        fastify.log.error('Payment failed', {
          paymentIntentId: failedPayment.id,
          error: failedPayment.last_payment_error
        });
        break;

      default:
        fastify.log.info('Unhandled event type', { type: event.type });
    }

    return { received: true };
  } catch (error) {
    fastify.log.error('Stripe webhook error', { error: error.message });
    reply.code(400).send(`Webhook error: ${error.message}`);
  }
});

/**
 * Vipps webhook handler
 */
fastify.post('/api/webhook/vipps', async (request, reply) => {
  try {
    const { orderId } = request.body as { orderId: string };

    if (!orderId) {
      return reply.code(400).send({
        success: false,
        error: 'Missing orderId'
      });
    }

    // Process the Vipps callback
    await paymentService.handleVippsCallback(orderId);

    fastify.log.info('Vipps webhook processed', { orderId });

    return { received: true };

  } catch (error) {
    fastify.log.error('Vipps webhook error', {
      error: error.message,
      body: request.body
    });

    // Return 200 to prevent Vipps from retrying
    return {
      received: false,
      error: error.message
    };
  }
});

/**
 * ==========================================
 * SETTLEMENT PAYMENT ENDPOINTS (ESCROW)
 * ==========================================
 */

/**
 * Create settlement payment intent
 */
fastify.post('/api/settlement/create', async (request, reply) => {
  try {
    const {
      userId,
      debtId,
      settlementAmount,
      creditorId,
      creditorName,
      metadata
    } = request.body as {
      userId: string;
      debtId: string;
      settlementAmount: number;
      creditorId: string;
      creditorName: string;
      metadata?: Record<string, any>;
    };

    const result = await paymentService.createSettlementPayment(
      userId,
      debtId,
      settlementAmount,
      creditorId,
      creditorName,
      metadata
    );

    return result;
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Process settlement payment (hold in escrow)
 */
fastify.post('/api/settlement/:settlementPaymentId/pay', async (request, reply) => {
  try {
    const { settlementPaymentId } = request.params as { settlementPaymentId: string };
    const { paymentMethodId } = request.body as { paymentMethodId: string };

    if (!paymentMethodId) {
      return reply.code(400).send({
        success: false,
        error: 'Payment method ID required'
      });
    }

    const result = await paymentService.processSettlementPaymentStripe(
      settlementPaymentId,
      paymentMethodId
    );

    return result;
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Release settlement funds to creditor
 */
fastify.post('/api/settlement/:settlementPaymentId/release', async (request, reply) => {
  try {
    const { settlementPaymentId } = request.params as { settlementPaymentId: string };
    const { confirmationDetails } = request.body as { confirmationDetails?: string };

    const result = await paymentService.releaseSettlementFunds(
      settlementPaymentId,
      confirmationDetails
    );

    return result;
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Refund settlement payment
 */
fastify.post('/api/settlement/:settlementPaymentId/refund', async (request, reply) => {
  try {
    const { settlementPaymentId } = request.params as { settlementPaymentId: string };
    const { reason } = request.body as { reason: string };

    if (!reason) {
      return reply.code(400).send({
        success: false,
        error: 'Refund reason required'
      });
    }

    const result = await paymentService.refundSettlementPayment(
      settlementPaymentId,
      reason
    );

    return result;
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get settlement payment details
 */
fastify.get('/api/settlement/:settlementPaymentId', async (request, reply) => {
  try {
    const { settlementPaymentId } = request.params as { settlementPaymentId: string };

    const settlement = await paymentService.getSettlementPayment(settlementPaymentId);

    if (!settlement) {
      return reply.code(404).send({
        success: false,
        error: 'Settlement payment not found'
      });
    }

    return {
      success: true,
      settlement
    };
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get user's settlement payment history
 */
fastify.get('/api/user/:userId/settlements', async (request, reply) => {
  try {
    const { userId } = request.params as { userId: string };

    const settlements = await paymentService.getUserSettlementPayments(userId);

    return {
      success: true,
      settlements
    };
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Calculate settlement payment amount
 */
fastify.post('/api/settlement/calculate', async (request, reply) => {
  try {
    const { settlementAmount } = request.body as { settlementAmount: number };

    if (!settlementAmount || settlementAmount <= 0) {
      return reply.code(400).send({
        success: false,
        error: 'Valid settlement amount required'
      });
    }

    const calculation = paymentService.calculateSettlementPayment(settlementAmount);

    return {
      success: true,
      calculation
    };
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 */
fastify.get('/api/health', async (request, reply) => {
  return {
    status: 'healthy',
    service: 'payment-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
});

/**
 * Metrics endpoint for monitoring (admin only)
 */
fastify.get('/api/metrics', {
  preHandler: [authenticateUser, authenticateAdmin]
}, async (request, reply) => {
  try {
    const stats = await paymentService.getRevenueStats();

    return {
      totalRevenue: stats.totalRevenue,
      invoicesCount: stats.invoicesCount,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    reply.code(500).send({
      error: 'Failed to fetch metrics'
    });
  }
});

// Start server
const start = async () => {
  try {
    // Force payment service to use port 8009 to avoid conflicts
    const port = 8009;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    fastify.log.info(`Payment service running on http://${host}:${port}`);
    fastify.log.info('Available endpoints:');
    fastify.log.info('');
    fastify.log.info('Recovery Fee Endpoints (25% success fee):');
    fastify.log.info('- POST /api/calculate-fee - Calculate 25% success fee');
    fastify.log.info('- POST /api/generate-invoice - Generate payment invoice');
    fastify.log.info('- POST /api/process-payment - Process payment via Stripe/Vipps');
    fastify.log.info('- POST /api/create-payment-link/:invoiceId - Create Stripe checkout link');
    fastify.log.info('- GET /api/user/:userId/payments - Get payment history');
    fastify.log.info('- GET /api/user/:userId/invoices/pending - Get pending invoices');
    fastify.log.info('');
    fastify.log.info('Settlement Payment Endpoints (20% platform fee + escrow):');
    fastify.log.info('- POST /api/settlement/calculate - Calculate settlement payment');
    fastify.log.info('- POST /api/settlement/create - Create settlement payment intent');
    fastify.log.info('- POST /api/settlement/:id/pay - Process payment (hold in escrow)');
    fastify.log.info('- POST /api/settlement/:id/release - Release funds to creditor');
    fastify.log.info('- POST /api/settlement/:id/refund - Refund to user');
    fastify.log.info('- GET /api/settlement/:id - Get settlement details');
    fastify.log.info('- GET /api/user/:userId/settlements - Get settlement history');
    fastify.log.info('');
    fastify.log.info('Admin & Webhooks:');
    fastify.log.info('- GET /api/admin/revenue-stats - Revenue statistics (admin)');
    fastify.log.info('- POST /api/webhook/recovery-confirmed - Recovery confirmation webhook');
    fastify.log.info('- POST /api/webhook/stripe - Stripe webhook handler');
    fastify.log.info('- POST /api/webhook/vipps - Vipps webhook handler');

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

export default fastify;