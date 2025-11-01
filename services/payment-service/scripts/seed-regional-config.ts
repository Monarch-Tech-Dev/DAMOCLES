/**
 * Seed Regional Configuration
 *
 * Initializes database with:
 * - Nordic country configurations (Norway, Sweden, Denmark, Finland)
 * - Currency exchange rates
 * - Example fee customizations
 *
 * Run with: npx ts-node scripts/seed-regional-config.ts
 */

import { PrismaClient } from '@prisma/client';
import { regionalPricingService } from '../src/RegionalPricingService';

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Seeding regional configuration...\n');

  // 1. Initialize Nordic configurations
  console.log('📍 Creating regional configs for Nordic countries...');
  await regionalPricingService.initializeNordicConfigs();

  // 2. Update exchange rates
  console.log('\n💱 Fetching latest exchange rates...');
  try {
    await regionalPricingService.updateExchangeRates('EUR');
    console.log('✅ Exchange rates updated');
  } catch (error) {
    console.warn('⚠️  Failed to update exchange rates:', error);
    console.log('   Continuing with manual rates...');

    // Fallback: Add manual exchange rates
    const manualRates = [
      { base: 'EUR', target: 'NOK', rate: 11.5 },
      { base: 'EUR', target: 'SEK', rate: 11.3 },
      { base: 'EUR', target: 'DKK', rate: 7.45 },
      { base: 'EUR', target: 'USD', rate: 1.08 },
      { base: 'EUR', target: 'GBP', rate: 0.86 },
    ];

    for (const { base, target, rate } of manualRates) {
      await prisma.currencyExchangeRate.upsert({
        where: {
          baseCurrency_targetCurrency: { baseCurrency: base, targetCurrency: target },
        },
        create: {
          baseCurrency: base,
          targetCurrency: target,
          rate,
          source: 'manual',
        },
        update: { rate, lastUpdated: new Date() },
      });
    }
    console.log('✅ Manual exchange rates added');
  }

  // 3. Create example fee customizations
  console.log('\n🎁 Creating example fee customizations...');

  // Get Norway config
  const norwayConfig = await prisma.regionalConfig.findUnique({
    where: { countryCode: 'NO' },
  });

  if (norwayConfig) {
    // Premium user discount
    await prisma.feeCustomization.create({
      data: {
        regionalConfigId: norwayConfig.id,
        name: 'Gold Shield Discount',
        description: '10% discount for Gold Shield tier users',
        feeDiscount: 0.1, // 10% off
        applicableToUserTiers: 'Gold Shield,Platinum Shield',
        isActive: true,
        priority: 10,
      },
    });

    // High-value case discount
    await prisma.feeCustomization.create({
      data: {
        regionalConfigId: norwayConfig.id,
        name: 'High Value Case Discount',
        description: '5% discount for recoveries over 50,000 NOK',
        feeDiscount: 0.05, // 5% off
        minRecoveryAmount: 50000,
        isActive: true,
        priority: 5,
      },
    });

    // Early adopter bonus
    await prisma.feeCustomization.create({
      data: {
        regionalConfigId: norwayConfig.id,
        name: 'Early Adopter Special',
        description: 'First 1000 users get 20% fee',
        feePercentageOverride: 0.2, // 20% instead of 25%
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31'),
        isActive: true,
        priority: 20,
      },
    });

    console.log('✅ Created 3 fee customizations for Norway');
  }

  // 4. Display summary
  console.log('\n📊 Summary:');

  const configCount = await prisma.regionalConfig.count();
  const rateCount = await prisma.currencyExchangeRate.count();
  const customizationCount = await prisma.feeCustomization.count();

  console.log(`   Regional configs: ${configCount}`);
  console.log(`   Exchange rates: ${rateCount}`);
  console.log(`   Fee customizations: ${customizationCount}`);

  // 5. Test pricing calculation
  console.log('\n🧪 Testing pricing calculations...\n');

  const testCases = [
    { amount: 10000, country: 'NO', tier: undefined },
    { amount: 10000, country: 'NO', tier: 'Gold Shield' },
    { amount: 75000, country: 'NO', tier: undefined },
    { amount: 10000, country: 'SE', tier: undefined },
  ];

  for (const { amount, country, tier } of testCases) {
    try {
      const pricing = await regionalPricingService.calculatePricing(amount, country, tier);
      console.log(`${country} - ${amount} (${tier || 'No tier'}):`);
      console.log(`   Platform fee: ${pricing.platformFee} ${pricing.currency} (${pricing.platformFeePercent * 100}%)`);
      console.log(`   VAT: ${pricing.vatAmount} ${pricing.currency} (${pricing.vatRate * 100}%)`);
      console.log(`   Processing: ${pricing.processingFee} ${pricing.currency}`);
      console.log(`   Total: ${pricing.totalDue} ${pricing.currency}`);
      if (pricing.appliedCustomizations) {
        console.log(`   Applied: ${pricing.appliedCustomizations.join(', ')}`);
      }
      console.log();
    } catch (error: any) {
      console.error(`   Error: ${error.message}\n`);
    }
  }

  console.log('✅ Regional configuration seeded successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding regional configuration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
