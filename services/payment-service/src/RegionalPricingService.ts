/**
 * Regional Pricing Service
 *
 * Handles multi-currency pricing, regional fee configuration,
 * VAT calculation, and currency conversion.
 *
 * Supports Nordic expansion (Norway, Sweden, Denmark, Finland) and beyond.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PricingCalculation {
  recoveryAmount: number;
  platformFee: number;
  platformFeePercent: number;
  vatAmount: number;
  vatRate: number;
  processingFee: number;
  totalDue: number;
  currency: string;
  exchangeRate?: number;
  breakdown: {
    subtotal: number;
    vat: number;
    processing: number;
    total: number;
  };
  appliedCustomizations?: string[];
}

export interface RegionalConfigData {
  countryCode: string;
  countryName: string;
  currency: string;
  language: string;
  platformFeePercentage: number;
  vatRate: number;
  minRecoveryAmount: number;
  maxRecoveryAmount?: number;
  enabledPaymentMethods: string[];
  defaultPaymentMethod: string;
}

export class RegionalPricingService {
  /**
   * Get regional configuration by country code
   */
  async getRegionalConfig(countryCode: string): Promise<RegionalConfigData | null> {
    const config = await prisma.regionalConfig.findUnique({
      where: { countryCode: countryCode.toUpperCase() },
    });

    if (!config || !config.isActive) {
      return null;
    }

    return {
      countryCode: config.countryCode,
      countryName: config.countryName,
      currency: config.currency,
      language: config.language,
      platformFeePercentage: config.platformFeePercentage,
      vatRate: config.vatRate,
      minRecoveryAmount: config.minRecoveryAmount,
      maxRecoveryAmount: config.maxRecoveryAmount || undefined,
      enabledPaymentMethods: config.enabledPaymentMethods.split(','),
      defaultPaymentMethod: config.defaultPaymentMethod,
    };
  }

  /**
   * Calculate pricing with regional configuration
   */
  async calculatePricing(
    recoveryAmount: number,
    countryCode: string,
    userTier?: string
  ): Promise<PricingCalculation> {
    // Get regional config
    const config = await this.getRegionalConfig(countryCode);

    if (!config) {
      throw new Error(`No regional configuration found for country: ${countryCode}`);
    }

    // Check minimum amount
    if (recoveryAmount < config.minRecoveryAmount) {
      throw new Error(
        `Recovery amount ${recoveryAmount} ${config.currency} is below minimum ${config.minRecoveryAmount} ${config.currency}`
      );
    }

    // Check maximum amount (if set)
    if (config.maxRecoveryAmount && recoveryAmount > config.maxRecoveryAmount) {
      throw new Error(
        `Recovery amount ${recoveryAmount} ${config.currency} exceeds maximum ${config.maxRecoveryAmount} ${config.currency}`
      );
    }

    // Get applicable fee customizations
    const customization = await this.getApplicableCustomization(
      countryCode,
      recoveryAmount,
      userTier
    );

    // Calculate platform fee
    let platformFeePercent = config.platformFeePercentage;
    let platformFee = recoveryAmount * platformFeePercent;
    const appliedCustomizations: string[] = [];

    if (customization) {
      appliedCustomizations.push(customization.name);

      // Apply customization
      if (customization.feePercentageOverride) {
        platformFeePercent = customization.feePercentageOverride;
        platformFee = recoveryAmount * platformFeePercent;
      } else if (customization.fixedFeeAmount) {
        platformFee = customization.fixedFeeAmount;
      } else if (customization.feeDiscount) {
        platformFee = platformFee * (1 - customization.feeDiscount);
      }

      // Apply min/max caps
      if (customization.minAmount && platformFee < customization.minAmount) {
        platformFee = customization.minAmount;
      }
      if (customization.maxAmount && platformFee > customization.maxAmount) {
        platformFee = customization.maxAmount;
      }
    }

    // Calculate VAT on platform fee
    const vatAmount = platformFee * config.vatRate;

    // Calculate processing fee (Stripe: 2.9% + 0.3 EUR equivalent)
    const processingFee = this.calculateProcessingFee(platformFee + vatAmount, config.currency);

    // Calculate total
    const totalDue = platformFee + vatAmount + processingFee;

    return {
      recoveryAmount,
      platformFee: this.roundCurrency(platformFee, config.currency),
      platformFeePercent,
      vatAmount: this.roundCurrency(vatAmount, config.currency),
      vatRate: config.vatRate,
      processingFee: this.roundCurrency(processingFee, config.currency),
      totalDue: this.roundCurrency(totalDue, config.currency),
      currency: config.currency,
      breakdown: {
        subtotal: this.roundCurrency(platformFee, config.currency),
        vat: this.roundCurrency(vatAmount, config.currency),
        processing: this.roundCurrency(processingFee, config.currency),
        total: this.roundCurrency(totalDue, config.currency),
      },
      appliedCustomizations: appliedCustomizations.length > 0 ? appliedCustomizations : undefined,
    };
  }

  /**
   * Get applicable fee customization
   */
  private async getApplicableCustomization(
    countryCode: string,
    recoveryAmount: number,
    userTier?: string
  ) {
    const config = await prisma.regionalConfig.findUnique({
      where: { countryCode },
      include: {
        feeCustomizations: {
          where: {
            isActive: true,
            // Amount conditions
            OR: [
              { minRecoveryAmount: null },
              { minRecoveryAmount: { lte: recoveryAmount } },
            ],
            AND: [
              {
                OR: [
                  { maxRecoveryAmount: null },
                  { maxRecoveryAmount: { gte: recoveryAmount } },
                ],
              },
              // Time conditions
              {
                OR: [
                  { validFrom: null },
                  { validFrom: { lte: new Date() } },
                ],
              },
              {
                OR: [
                  { validTo: null },
                  { validTo: { gte: new Date() } },
                ],
              },
            ],
          },
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (!config) return null;

    // Filter by user tier if provided
    for (const customization of config.feeCustomizations) {
      if (!customization.applicableToUserTiers) {
        return customization; // No tier restriction, apply
      }

      if (userTier && customization.applicableToUserTiers.includes(userTier)) {
        return customization;
      }
    }

    return null;
  }

  /**
   * Calculate payment processing fee
   * Stripe: 2.9% + fixed fee per currency
   */
  private calculateProcessingFee(amount: number, currency: string): number {
    const stripePercentage = 0.029; // 2.9%

    // Fixed fees per currency (approximate Stripe fees)
    const fixedFees: Record<string, number> = {
      NOK: 3.0,  // ~0.30 EUR
      SEK: 3.0,  // ~0.30 EUR
      DKK: 2.25, // ~0.30 EUR
      EUR: 0.3,
      USD: 0.3,
      GBP: 0.2,
    };

    const fixedFee = fixedFees[currency] || 0.3;
    return amount * stripePercentage + fixedFee;
  }

  /**
   * Round amount to currency precision
   */
  private roundCurrency(amount: number, currency: string): number {
    // Most currencies use 2 decimal places
    // Some (JPY, KRW) use 0 decimal places
    const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP'];

    if (zeroDecimalCurrencies.includes(currency)) {
      return Math.round(amount);
    }

    return Math.round(amount * 100) / 100;
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<{ amount: number; rate: number }> {
    if (fromCurrency === toCurrency) {
      return { amount, rate: 1.0 };
    }

    // Get exchange rate
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);

    if (!rate) {
      throw new Error(`No exchange rate found for ${fromCurrency} -> ${toCurrency}`);
    }

    const convertedAmount = amount * rate.rate;

    return {
      amount: this.roundCurrency(convertedAmount, toCurrency),
      rate: rate.rate,
    };
  }

  /**
   * Get exchange rate between currencies
   */
  async getExchangeRate(baseCurrency: string, targetCurrency: string) {
    const rate = await prisma.currencyExchangeRate.findUnique({
      where: {
        baseCurrency_targetCurrency: {
          baseCurrency,
          targetCurrency,
        },
      },
    });

    // If not found, try reverse rate
    if (!rate) {
      const reverseRate = await prisma.currencyExchangeRate.findUnique({
        where: {
          baseCurrency_targetCurrency: {
            baseCurrency: targetCurrency,
            targetCurrency: baseCurrency,
          },
        },
      });

      if (reverseRate) {
        return {
          ...reverseRate,
          rate: 1 / reverseRate.rate,
        };
      }
    }

    return rate;
  }

  /**
   * Update exchange rates from external API
   */
  async updateExchangeRates(baseCurrency: string = 'EUR'): Promise<void> {
    try {
      // Use European Central Bank API (free, no API key required)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
      }

      const data = await response.json();
      const rates = data.rates as Record<string, number>;

      // Update each currency rate
      for (const [targetCurrency, rate] of Object.entries(rates)) {
        await prisma.currencyExchangeRate.upsert({
          where: {
            baseCurrency_targetCurrency: {
              baseCurrency,
              targetCurrency,
            },
          },
          create: {
            baseCurrency,
            targetCurrency,
            rate,
            source: 'exchangerate-api',
          },
          update: {
            rate,
            lastUpdated: new Date(),
          },
        });
      }

      console.log(`✅ Updated exchange rates for ${baseCurrency}: ${Object.keys(rates).length} currencies`);
    } catch (error) {
      console.error('❌ Failed to update exchange rates:', error);
      throw error;
    }
  }

  /**
   * Initialize regional configurations for Nordic countries
   */
  async initializeNordicConfigs(): Promise<void> {
    const configs = [
      {
        countryCode: 'NO',
        countryName: 'Norway',
        currency: 'NOK',
        language: 'no',
        timezone: 'Europe/Oslo',
        platformFeePercentage: 0.25,
        vatRate: 0.25,
        minRecoveryAmount: 100,
        enabledPaymentMethods: 'stripe,vipps,bank_transfer',
        defaultPaymentMethod: 'vipps',
        legalEntityName: 'DAMOCLES Norge AS',
        supportEmail: 'support@damocles.no',
      },
      {
        countryCode: 'SE',
        countryName: 'Sweden',
        currency: 'SEK',
        language: 'sv',
        timezone: 'Europe/Stockholm',
        platformFeePercentage: 0.25,
        vatRate: 0.25,
        minRecoveryAmount: 100,
        enabledPaymentMethods: 'stripe,swish,bank_transfer',
        defaultPaymentMethod: 'swish',
        legalEntityName: 'DAMOCLES Sverige AB',
        supportEmail: 'support@damocles.se',
      },
      {
        countryCode: 'DK',
        countryName: 'Denmark',
        currency: 'DKK',
        language: 'da',
        timezone: 'Europe/Copenhagen',
        platformFeePercentage: 0.25,
        vatRate: 0.25,
        minRecoveryAmount: 75,
        enabledPaymentMethods: 'stripe,mobilepay,bank_transfer',
        defaultPaymentMethod: 'mobilepay',
        legalEntityName: 'DAMOCLES Danmark ApS',
        supportEmail: 'support@damocles.dk',
      },
      {
        countryCode: 'FI',
        countryName: 'Finland',
        currency: 'EUR',
        language: 'fi',
        timezone: 'Europe/Helsinki',
        platformFeePercentage: 0.25,
        vatRate: 0.24, // Finland has 24% VAT
        minRecoveryAmount: 10,
        enabledPaymentMethods: 'stripe,bank_transfer',
        defaultPaymentMethod: 'stripe',
        legalEntityName: 'DAMOCLES Finland Oy',
        supportEmail: 'support@damocles.fi',
      },
    ];

    for (const config of configs) {
      await prisma.regionalConfig.upsert({
        where: { countryCode: config.countryCode },
        create: config,
        update: config,
      });
    }

    console.log('✅ Initialized Nordic regional configurations');
  }
}

export const regionalPricingService = new RegionalPricingService();
