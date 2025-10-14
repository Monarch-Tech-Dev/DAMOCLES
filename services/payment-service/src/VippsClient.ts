import axios, { AxiosInstance } from 'axios';
import { createLogger } from 'winston';

export interface VippsPaymentRequest {
  merchantOrderId: string;
  amount: number; // In øre (1 NOK = 100 øre)
  phoneNumber: string;
  description: string;
  callbackUrl: string;
  returnUrl: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface VippsPaymentResponse {
  orderId: string;
  url: string;
}

export interface VippsPaymentDetails {
  orderId: string;
  transactionId: string;
  status: 'INITIATE' | 'RESERVE' | 'SALE' | 'CANCEL' | 'VOID' | 'FAILED';
  amount: number;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Vipps eCom API v2 Client
 * Documentation: https://developer.vippsmobilepay.com/docs/APIs/ecom-api/
 */
export class VippsClient {
  private client: AxiosInstance;
  private logger = createLogger({
    level: 'info',
    format: require('winston').format.json(),
    defaultMeta: { service: 'vipps-client' }
  });

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly subscriptionKey: string;
  private readonly merchantSerialNumber: string;
  private readonly environment: 'test' | 'production';

  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.clientId = process.env.VIPPS_CLIENT_ID || '';
    this.clientSecret = process.env.VIPPS_CLIENT_SECRET || '';
    this.subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY || '';
    this.merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER || '';
    this.environment = (process.env.VIPPS_ENVIRONMENT || 'test') as 'test' | 'production';

    const baseURL = this.environment === 'production'
      ? 'https://api.vipps.no'
      : 'https://apitest.vipps.no';

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        'Content-Type': 'application/json',
        'Merchant-Serial-Number': this.merchantSerialNumber
      }
    });

    // Log configuration (without secrets)
    this.logger.info('Vipps client initialized', {
      environment: this.environment,
      merchantSerialNumber: this.merchantSerialNumber,
      baseURL
    });
  }

  /**
   * Get or refresh access token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await this.client.post('/accesstoken/get', null, {
        headers: {
          'client_id': this.clientId,
          'client_secret': this.clientSecret
        }
      });

      this.accessToken = response.data.access_token;
      // Tokens typically expire in 3600 seconds, refresh 5 minutes early
      this.tokenExpiry = new Date(Date.now() + 3300 * 1000);

      this.logger.info('Vipps access token obtained');

      return this.accessToken;

    } catch (error) {
      this.logger.error('Failed to get Vipps access token', {
        error: error.response?.data || error.message
      });
      throw new Error('Failed to authenticate with Vipps');
    }
  }

  /**
   * Initiate a payment with Vipps
   */
  async initiatePayment(request: VippsPaymentRequest): Promise<VippsPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const payload = {
        customerInfo: {
          mobileNumber: request.phoneNumber.replace(/\s/g, '') // Remove spaces
        },
        merchantInfo: {
          merchantSerialNumber: this.merchantSerialNumber,
          callbackPrefix: request.callbackUrl,
          fallBack: request.returnUrl,
          isApp: false
        },
        transaction: {
          orderId: request.merchantOrderId,
          amount: request.amount,
          transactionText: request.description.substring(0, 100) // Max 100 characters
        }
      };

      const response = await this.client.post('/ecomm/v2/payments', payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Request-Id': this.generateRequestId()
        }
      });

      this.logger.info('Vipps payment initiated', {
        orderId: request.merchantOrderId,
        amount: request.amount,
        phoneNumber: request.phoneNumber.slice(-4) // Log only last 4 digits
      });

      return {
        orderId: response.data.orderId,
        url: response.data.url
      };

    } catch (error) {
      this.logger.error('Failed to initiate Vipps payment', {
        error: error.response?.data || error.message,
        orderId: request.merchantOrderId
      });

      throw new Error(
        error.response?.data?.message ||
        'Failed to initiate Vipps payment'
      );
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(orderId: string): Promise<VippsPaymentDetails> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await this.client.get(`/ecomm/v2/payments/${orderId}/details`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Request-Id': this.generateRequestId()
        }
      });

      const details = response.data.transactionInfo;

      return {
        orderId: response.data.orderId,
        transactionId: details.transactionId,
        status: details.status,
        amount: details.amount,
        phoneNumber: response.data.userDetails?.mobileNumber || 'N/A',
        createdAt: details.timeStamp,
        updatedAt: details.timeStamp
      };

    } catch (error) {
      this.logger.error('Failed to get Vipps payment details', {
        error: error.response?.data || error.message,
        orderId
      });

      throw new Error('Failed to get payment details');
    }
  }

  /**
   * Capture a reserved payment amount
   */
  async capturePayment(orderId: string, amount?: number): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      // If amount not specified, capture full amount
      const details = await this.getPaymentDetails(orderId);
      const captureAmount = amount || details.amount;

      const payload = {
        merchantInfo: {
          merchantSerialNumber: this.merchantSerialNumber
        },
        transaction: {
          amount: captureAmount,
          transactionText: 'Payment captured'
        }
      };

      await this.client.post(`/ecomm/v2/payments/${orderId}/capture`, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Request-Id': this.generateRequestId()
        }
      });

      this.logger.info('Vipps payment captured', {
        orderId,
        amount: captureAmount
      });

    } catch (error) {
      this.logger.error('Failed to capture Vipps payment', {
        error: error.response?.data || error.message,
        orderId
      });

      throw new Error('Failed to capture payment');
    }
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(orderId: string, reason: string = 'User cancelled'): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      const payload = {
        merchantInfo: {
          merchantSerialNumber: this.merchantSerialNumber
        },
        transaction: {
          transactionText: reason.substring(0, 100)
        }
      };

      await this.client.put(`/ecomm/v2/payments/${orderId}/cancel`, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Request-Id': this.generateRequestId()
        }
      });

      this.logger.info('Vipps payment cancelled', {
        orderId,
        reason
      });

    } catch (error) {
      this.logger.error('Failed to cancel Vipps payment', {
        error: error.response?.data || error.message,
        orderId
      });

      throw new Error('Failed to cancel payment');
    }
  }

  /**
   * Generate unique request ID for Vipps API
   * Format: timestamp-random
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Check if Vipps is configured
   */
  isConfigured(): boolean {
    return !!(
      this.clientId &&
      this.clientSecret &&
      this.subscriptionKey &&
      this.merchantSerialNumber &&
      this.clientId !== 'your_vipps_client_id'
    );
  }

  /**
   * Format Norwegian phone number for Vipps
   * Accepts: +4712345678, 4712345678, 12345678
   * Returns: 4712345678
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Add country code if missing
    if (digits.length === 8) {
      return `47${digits}`;
    }

    // Remove leading + or 00
    if (digits.startsWith('47')) {
      return digits;
    }

    throw new Error('Invalid Norwegian phone number format');
  }

  /**
   * Validate amount (must be positive integer in øre)
   */
  static validateAmount(amount: number): boolean {
    return Number.isInteger(amount) && amount > 0;
  }
}
