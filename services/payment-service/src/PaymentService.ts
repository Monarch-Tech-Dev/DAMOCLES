import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createLogger } from 'winston';
import { VippsClient } from './VippsClient';

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
  amount: number;
  fees: number;
}

export interface SuccessFeeCalculation {
  recoveryAmount: number;
  platformFee: number; // 25% of recovery
  userNet: number; // 75% of recovery
  processing_fee: number;
  vat: number; // 25% Norwegian VAT on platform fee
}

export interface Invoice {
  id: string;
  userId: string;
  caseId: string;
  recoveryAmount: number;
  platformFee: number;
  vatAmount: number;
  totalDue: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
}

const paymentSchema = z.object({
  userId: z.string().uuid(),
  caseId: z.string().uuid(),
  recoveryAmount: z.number().positive(),
  paymentMethod: z.enum(['stripe', 'vipps', 'bank_transfer']),
  currency: z.enum(['NOK', 'EUR', 'USD']).default('NOK')
});

export class PaymentService {
  private stripe: Stripe;
  private vipps: VippsClient;
  private prisma: PrismaClient;
  private logger = createLogger({
    level: 'info',
    format: require('winston').format.json(),
    defaultMeta: { service: 'payment-service' }
  });

  private readonly PLATFORM_FEE_PERCENTAGE = 0.25; // 25%
  private readonly VAT_RATE = 0.25; // 25% Norwegian VAT
  private readonly MIN_RECOVERY_AMOUNT = 100; // Minimum 100 NOK to charge fee

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-10-28.acacia'
    });
    this.vipps = new VippsClient();
    this.prisma = new PrismaClient();
  }

  /**
   * Calculate 25% success fee with VAT and processing fees
   */
  calculateSuccessFee(recoveryAmount: number): SuccessFeeCalculation {
    if (recoveryAmount < this.MIN_RECOVERY_AMOUNT) {
      return {
        recoveryAmount,
        platformFee: 0,
        userNet: recoveryAmount,
        processing_fee: 0,
        vat: 0
      };
    }

    const platformFee = Math.round(recoveryAmount * this.PLATFORM_FEE_PERCENTAGE);
    const vatAmount = Math.round(platformFee * this.VAT_RATE);
    const processingFee = Math.min(50, Math.round(platformFee * 0.029) + 2); // Stripe-like fee structure
    const totalFee = platformFee + vatAmount + processingFee;
    const userNet = recoveryAmount - totalFee;

    return {
      recoveryAmount,
      platformFee,
      userNet: Math.max(0, userNet),
      processing_fee: processingFee,
      vat: vatAmount
    };
  }

  /**
   * Generate invoice for successful debt recovery
   */
  async generateInvoice(
    userId: string,
    caseId: string,
    recoveryAmount: number
  ): Promise<Invoice> {
    const calculation = this.calculateSuccessFee(recoveryAmount);
    const totalDue = calculation.platformFee + calculation.vat + calculation.processing_fee;

    // Skip invoice if amount is too small
    if (totalDue === 0) {
      this.logger.info('Recovery amount too small, no fee charged', {
        userId,
        caseId,
        recoveryAmount
      });
      return null;
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        userId,
        caseId,
        recoveryAmount,
        platformFee: calculation.platformFee,
        vatAmount: calculation.vat,
        processingFee: calculation.processing_fee,
        totalDue,
        status: 'pending',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        generatedAt: new Date(),
        description: `DAMOCLES Success Fee - Case ${caseId.slice(-8)}`
      }
    });

    this.logger.info('Invoice generated for successful recovery', {
      invoiceId: invoice.id,
      userId,
      caseId,
      recoveryAmount,
      totalDue
    });

    return invoice;
  }

  /**
   * Process payment via Stripe
   */
  async processStripePayment(
    invoiceId: string,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { user: true }
      });

      if (!invoice) {
        return { success: false, error: 'Invoice not found', amount: 0, fees: 0 };
      }

      if (invoice.status === 'paid') {
        return { success: false, error: 'Invoice already paid', amount: 0, fees: 0 };
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: invoice.totalDue * 100, // Convert to øre/cents
        currency: 'nok',
        payment_method: paymentMethodId,
        confirm: true,
        return_url: `${process.env.WEB_URL}/payment/success`,
        metadata: {
          invoiceId: invoice.id,
          userId: invoice.userId,
          caseId: invoice.caseId,
          type: 'success_fee'
        },
        description: `DAMOCLES Success Fee - Recovery ${invoice.recoveryAmount} NOK`,
        receipt_email: invoice.user.email
      });

      if (paymentIntent.status === 'succeeded') {
        await this.prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: 'paid',
            paidAt: new Date(),
            paymentId: paymentIntent.id
          }
        });

        // Record payment in the case
        await this.prisma.debt.update({
          where: { id: invoice.caseId },
          data: {
            platformFeeStatus: 'paid',
            platformFeePaidAt: new Date()
          }
        });

        this.logger.info('Payment processed successfully', {
          paymentIntentId: paymentIntent.id,
          invoiceId,
          amount: invoice.totalDue
        });

        return {
          success: true,
          paymentId: paymentIntent.id,
          amount: invoice.totalDue,
          fees: invoice.processingFee
        };
      }

      return {
        success: false,
        error: `Payment failed: ${paymentIntent.status}`,
        amount: invoice.totalDue,
        fees: 0
      };

    } catch (error) {
      this.logger.error('Stripe payment processing failed', {
        error: error.message,
        invoiceId
      });

      return {
        success: false,
        error: error.message,
        amount: 0,
        fees: 0
      };
    }
  }

  /**
   * Process payment via Vipps (Norwegian mobile payment)
   */
  async processVippsPayment(
    invoiceId: string,
    phoneNumber: string
  ): Promise<PaymentResult & { vippsUrl?: string }> {
    try {
      // Check if Vipps is configured
      if (!this.vipps.isConfigured()) {
        this.logger.warn('Vipps not configured, falling back to manual processing');
        return this.processVippsPaymentManual(invoiceId, phoneNumber);
      }

      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { user: true }
      });

      if (!invoice) {
        return { success: false, error: 'Invoice not found', amount: 0, fees: 0 };
      }

      if (invoice.status === 'paid') {
        return { success: false, error: 'Invoice already paid', amount: 0, fees: 0 };
      }

      // Format phone number
      const formattedPhone = VippsClient.formatPhoneNumber(phoneNumber);

      // Convert NOK to øre (1 NOK = 100 øre)
      const amountInOre = invoice.totalDue * 100;

      // Validate amount
      if (!VippsClient.validateAmount(amountInOre)) {
        return {
          success: false,
          error: 'Invalid amount',
          amount: 0,
          fees: 0
        };
      }

      // Create Vipps payment
      const vippsPayment = await this.vipps.initiatePayment({
        merchantOrderId: `INV-${invoice.id}`,
        amount: amountInOre,
        phoneNumber: formattedPhone,
        description: `DAMOCLES Success Fee - Recovery ${invoice.recoveryAmount} NOK`,
        callbackUrl: `${process.env.WEB_URL || 'https://damocles.no'}/api/webhook/vipps`,
        returnUrl: `${process.env.WEB_URL || 'https://damocles.no'}/payment/success`,
        userId: invoice.userId,
        metadata: {
          invoiceId: invoice.id,
          caseId: invoice.caseId,
          type: 'success_fee'
        }
      });

      // Store payment record
      await this.prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          userId: invoice.userId,
          amount: invoice.totalDue,
          method: 'vipps',
          status: 'processing',
          phoneNumber: formattedPhone,
          externalId: vippsPayment.orderId,
          description: `DAMOCLES Success Fee - Case ${invoice.caseId.slice(-8)}`
        }
      });

      // Update invoice status
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'processing',
          paymentMethod: 'vipps'
        }
      });

      this.logger.info('Vipps payment initiated via API', {
        orderId: vippsPayment.orderId,
        invoiceId,
        amount: invoice.totalDue,
        phoneNumber: formattedPhone.slice(-4)
      });

      return {
        success: true,
        paymentId: vippsPayment.orderId,
        amount: invoice.totalDue,
        fees: invoice.processingFee,
        vippsUrl: vippsPayment.url
      };

    } catch (error) {
      this.logger.error('Vipps payment processing failed', {
        error: error.message,
        invoiceId
      });

      return {
        success: false,
        error: error.message,
        amount: 0,
        fees: 0
      };
    }
  }

  /**
   * Fallback: Process Vipps payment manually (when API not configured)
   */
  private async processVippsPaymentManual(
    invoiceId: string,
    phoneNumber: string
  ): Promise<PaymentResult> {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { user: true }
      });

      if (!invoice) {
        return { success: false, error: 'Invoice not found', amount: 0, fees: 0 };
      }

      // Create payment intent that requires manual processing
      const vippsPayment = await this.prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          userId: invoice.userId,
          amount: invoice.totalDue,
          method: 'vipps',
          status: 'processing',
          phoneNumber,
          description: `DAMOCLES Success Fee - Case ${invoice.caseId.slice(-8)}`
        }
      });

      this.logger.info('Vipps payment initiated (manual processing)', {
        paymentId: vippsPayment.id,
        invoiceId,
        phoneNumber: phoneNumber.slice(-4)
      });

      return {
        success: true,
        paymentId: vippsPayment.id,
        amount: invoice.totalDue,
        fees: invoice.processingFee
      };

    } catch (error) {
      this.logger.error('Vipps manual payment failed', {
        error: error.message,
        invoiceId
      });

      return {
        success: false,
        error: error.message,
        amount: 0,
        fees: 0
      };
    }
  }

  /**
   * Handle Vipps webhook callback
   */
  async handleVippsCallback(orderId: string): Promise<void> {
    try {
      // Get payment details from Vipps
      const paymentDetails = await this.vipps.getPaymentDetails(orderId);

      // Find invoice by order ID
      const payment = await this.prisma.payment.findFirst({
        where: { externalId: orderId },
        include: { invoice: true }
      });

      if (!payment) {
        this.logger.error('Payment not found for Vipps callback', { orderId });
        return;
      }

      // Update payment status based on Vipps status
      if (paymentDetails.status === 'SALE' || paymentDetails.status === 'RESERVE') {
        // Payment successful
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            completedAt: new Date()
          }
        });

        // Mark invoice as paid
        await this.prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            status: 'paid',
            paidAt: new Date(),
            paymentId: orderId
          }
        });

        // Update debt record
        await this.prisma.debt.update({
          where: { id: payment.invoice.caseId },
          data: {
            platformFeeStatus: 'paid',
            platformFeePaidAt: new Date()
          }
        });

        this.logger.info('Vipps payment completed', {
          orderId,
          invoiceId: payment.invoiceId,
          amount: payment.amount
        });

        // Capture the payment if it's only reserved
        if (paymentDetails.status === 'RESERVE') {
          await this.vipps.capturePayment(orderId);
          this.logger.info('Vipps payment captured', { orderId });
        }

      } else if (paymentDetails.status === 'CANCEL' || paymentDetails.status === 'FAILED') {
        // Payment failed or cancelled
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'failed',
            error: `Payment ${paymentDetails.status.toLowerCase()}`
          }
        });

        this.logger.warn('Vipps payment failed', {
          orderId,
          status: paymentDetails.status
        });
      }

    } catch (error) {
      this.logger.error('Vipps callback handling failed', {
        error: error.message,
        orderId
      });
      throw error;
    }
  }

  /**
   * Get payment history for user
   */
  async getUserPaymentHistory(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      include: {
        debt: {
          select: {
            id: true,
            creditorName: true,
            originalAmount: true,
            description: true
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get pending invoices for user
   */
  async getUserPendingInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: {
        userId,
        status: 'pending',
        dueDate: { gte: new Date() }
      },
      include: {
        debt: {
          select: {
            creditorName: true,
            description: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  /**
   * Automatically trigger fee calculation when recovery is confirmed
   */
  async onRecoveryConfirmed(caseId: string, recoveredAmount: number) {
    try {
      const debt = await this.prisma.debt.findUnique({
        where: { id: caseId },
        include: { user: true }
      });

      if (!debt) {
        this.logger.error('Debt not found for recovery confirmation', { caseId });
        return;
      }

      // Generate invoice
      const invoice = await this.generateInvoice(debt.userId, caseId, recoveredAmount);

      if (invoice) {
        // Update debt record
        await this.prisma.debt.update({
          where: { id: caseId },
          data: {
            recoveredAmount,
            platformFeeStatus: 'pending',
            status: 'recovered'
          }
        });

        // Send notification to user about fee payment
        // This would integrate with the notification service
        this.logger.info('Recovery confirmed, fee invoice generated', {
          caseId,
          invoiceId: invoice.id,
          recoveredAmount,
          feeDue: invoice.totalDue
        });
      }

    } catch (error) {
      this.logger.error('Failed to process recovery confirmation', {
        error: error.message,
        caseId,
        recoveredAmount
      });
    }
  }

  /**
   * Get platform revenue statistics
   */
  async getRevenueStats() {
    const stats = await this.prisma.invoice.aggregate({
      where: { status: 'paid' },
      _sum: {
        platformFee: true,
        vatAmount: true,
        processingFee: true,
        totalDue: true
      },
      _count: true
    });

    const monthlyStats = await this.prisma.invoice.groupBy({
      by: ['createdAt'],
      where: {
        status: 'paid',
        createdAt: {
          gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) // Last 12 months
        }
      },
      _sum: {
        platformFee: true,
        totalDue: true
      }
    });

    return {
      totalRevenue: stats._sum.totalDue || 0,
      platformFees: stats._sum.platformFee || 0,
      vatCollected: stats._sum.vatAmount || 0,
      processingFees: stats._sum.processingFee || 0,
      invoicesCount: stats._count,
      monthlyTrends: monthlyStats
    };
  }

  /**
   * Create payment link for invoice
   */
  async createPaymentLink(invoiceId: string): Promise<string> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'nok',
          product_data: {
            name: 'DAMOCLES Success Fee',
            description: `Recovery fee for case ${invoice.caseId.slice(-8)}`
          },
          unit_amount: invoice.totalDue * 100
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.WEB_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEB_URL}/payment/cancel`,
      customer_email: invoice.user.email,
      metadata: {
        invoiceId: invoice.id,
        userId: invoice.userId,
        caseId: invoice.caseId
      }
    });

    return session.url;
  }
}