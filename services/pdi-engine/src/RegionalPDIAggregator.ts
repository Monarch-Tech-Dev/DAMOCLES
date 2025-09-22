import Redis from 'ioredis';
import { PDIScore } from './PDICalculationEngine';

export interface RegionalPDIData {
  regionCode: string;
  regionName: string;
  averagePDI: number;
  totalProfiles: number;
  criticalPercentage: number;
  debtUnderStress: number; // Total debt in NOK for critical/risky users
  profileIds: string[];
  topCreditors: string[];
  lastUpdated: Date;
  trend: {
    thirtyDay: number;
    ninetyDay: number;
    yearOverYear: number;
  };
  demographics: {
    averageAge: number;
    averageIncome: number;
    averageDebt: number;
    employmentRate: number;
  };
}

export interface NationalPDIData {
  nationalAverage: number;
  totalUsers: number;
  criticalPercentage: number;
  totalDebtStress: number;
  regionsInCrisis: number;
  lastUpdated: Date;
  trend: 'improving' | 'worsening' | 'stable';
  changePercent: number;
  regions: RegionalPDIData[];
  keyMetrics: {
    averageDSR: number;
    averageDTI: number;
    averageEmergencyFund: number;
    paymentStressRate: number;
  };
}

export interface Region {
  code: string;
  name: string;
  population: number;
  postalCodes: string[];
  economicIndicators: {
    unemploymentRate: number;
    averageIncome: number;
    costOfLivingIndex: number;
  };
}

export class RegionalPDIAggregator {
  private redis: Redis;
  private memoryCache: Map<string, { data: any; expires: number }> = new Map();
  private redisConnected = false;
  private regions: Region[] = [
    {
      code: 'NO_OSLO',
      name: 'Oslo',
      population: 700000,
      postalCodes: ['0000-0999'],
      economicIndicators: { unemploymentRate: 3.2, averageIncome: 650000, costOfLivingIndex: 120 }
    },
    {
      code: 'NO_BERGEN',
      name: 'Bergen',
      population: 285000,
      postalCodes: ['5000-5999'],
      economicIndicators: { unemploymentRate: 3.8, averageIncome: 580000, costOfLivingIndex: 110 }
    },
    {
      code: 'NO_STAVANGER',
      name: 'Stavanger',
      population: 230000,
      postalCodes: ['4000-4999'],
      economicIndicators: { unemploymentRate: 2.9, averageIncome: 680000, costOfLivingIndex: 115 }
    },
    {
      code: 'NO_TRONDHEIM',
      name: 'Trondheim',
      population: 210000,
      postalCodes: ['7000-7999'],
      economicIndicators: { unemploymentRate: 3.5, averageIncome: 590000, costOfLivingIndex: 105 }
    },
    {
      code: 'NO_NORD',
      name: 'Nord-Norge',
      population: 480000,
      postalCodes: ['8000-9999'],
      economicIndicators: { unemploymentRate: 4.2, averageIncome: 520000, costOfLivingIndex: 95 }
    },
    {
      code: 'NO_VEST',
      name: 'Vestlandet',
      population: 800000,
      postalCodes: ['6000-6999'],
      economicIndicators: { unemploymentRate: 3.6, averageIncome: 550000, costOfLivingIndex: 100 }
    },
    {
      code: 'NO_OST',
      name: 'Østlandet',
      population: 1500000,
      postalCodes: ['1000-3999'],
      economicIndicators: { unemploymentRate: 3.4, averageIncome: 600000, costOfLivingIndex: 108 }
    },
    {
      code: 'NO_SOR',
      name: 'Sørlandet',
      population: 320000,
      postalCodes: ['4600-4999'],
      economicIndicators: { unemploymentRate: 3.9, averageIncome: 540000, costOfLivingIndex: 98 }
    }
  ];

  constructor(redisConfig?: Redis.RedisOptions) {
    this.redis = new Redis(redisConfig || {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 1,
      lazyConnect: true
    });

    // Test Redis connection
    this.redis.ping()
      .then(() => {
        this.redisConnected = true;
        console.log('✅ Redis connected successfully');
      })
      .catch((error) => {
        console.warn('⚠️ Redis unavailable, using memory cache:', error.message);
        this.redisConnected = false;
      });
  }

  /**
   * Main aggregation function - calculates regional and national PDI data
   */
  public async aggregateRegionalData(): Promise<NationalPDIData> {
    const regionalData: RegionalPDIData[] = [];

    // Process each region
    for (const region of this.regions) {
      try {
        const data = await this.calculateRegionalPDI(region);
        regionalData.push(data);

        // Cache regional data
        await this.cacheRegionalData(region.code, data);

        // Check for regional crisis
        if (data.averagePDI < 50 || data.criticalPercentage > 30) {
          await this.triggerRegionalAlert(region, data);
        }

        console.log(`Processed region ${region.name}: PDI ${data.averagePDI.toFixed(1)}`);
      } catch (error) {
        console.error(`Failed to process region ${region.name}:`, error);
      }
    }

    // Calculate national aggregates
    const nationalData = this.calculateNationalAverage(regionalData);

    // Cache national data
    await this.cacheNationalData(nationalData);

    // Broadcast real-time updates
    await this.broadcastUpdate(nationalData);

    return nationalData;
  }

  /**
   * Calculate PDI data for a specific region
   */
  private async calculateRegionalPDI(region: Region): Promise<RegionalPDIData> {
    // In production, this would query the database
    // For now, we'll simulate with realistic data based on region characteristics

    const baseData = this.generateRegionalBaseData(region);

    // Apply economic factors to PDI calculation
    const economicAdjustment = this.calculateEconomicAdjustment(region);

    const adjustedPDI = baseData.averagePDI + economicAdjustment;

    return {
      regionCode: region.code,
      regionName: region.name,
      averagePDI: Math.max(0, Math.min(100, adjustedPDI)),
      totalProfiles: baseData.totalProfiles,
      criticalPercentage: this.calculateCriticalPercentage(adjustedPDI),
      debtUnderStress: this.calculateDebtUnderStress(baseData, adjustedPDI),
      profileIds: baseData.profileIds,
      topCreditors: this.getTopRegionalCreditors(region),
      lastUpdated: new Date(),
      trend: baseData.trend,
      demographics: {
        averageAge: baseData.averageAge,
        averageIncome: region.economicIndicators.averageIncome,
        averageDebt: baseData.averageDebt,
        employmentRate: 100 - region.economicIndicators.unemploymentRate
      }
    };
  }

  /**
   * Generate base data for a region (would come from database in production)
   */
  private generateRegionalBaseData(region: Region) {
    // Simulate realistic regional variations
    const baseScore = 68; // National baseline
    const populationFactor = Math.log(region.population / 100000) * 2;
    const randomVariation = (Math.random() - 0.5) * 10;

    const totalProfiles = Math.floor(region.population * 0.15); // 15% DAMOCLES adoption

    return {
      averagePDI: baseScore + populationFactor + randomVariation,
      totalProfiles,
      profileIds: Array.from({ length: totalProfiles }, (_, i) => `user_${region.code}_${i}`),
      averageAge: 35 + Math.random() * 20,
      averageDebt: region.economicIndicators.averageIncome * (1.2 + Math.random() * 0.8),
      trend: {
        thirtyDay: (Math.random() - 0.5) * 4,
        ninetyDay: (Math.random() - 0.5) * 8,
        yearOverYear: (Math.random() - 0.5) * 12
      }
    };
  }

  /**
   * Calculate economic adjustment factor for PDI
   */
  private calculateEconomicAdjustment(region: Region): number {
    const { unemploymentRate, averageIncome, costOfLivingIndex } = region.economicIndicators;

    // Higher unemployment = lower PDI
    const unemploymentAdjustment = -(unemploymentRate - 3.5) * 3;

    // Higher income relative to cost of living = higher PDI
    const incomeRatio = averageIncome / (costOfLivingIndex * 5000);
    const incomeAdjustment = (incomeRatio - 1) * 10;

    return unemploymentAdjustment + incomeAdjustment;
  }

  /**
   * Calculate percentage of users in critical/risky zones
   */
  private calculateCriticalPercentage(averagePDI: number): number {
    // Statistical distribution based on average PDI
    if (averagePDI >= 80) return 5 + Math.random() * 5; // Healthy regions: 5-10% critical
    if (averagePDI >= 60) return 15 + Math.random() * 10; // Caution regions: 15-25% critical
    if (averagePDI >= 40) return 25 + Math.random() * 15; // Risky regions: 25-40% critical
    return 40 + Math.random() * 20; // Critical regions: 40-60% critical
  }

  /**
   * Calculate total debt under stress in the region
   */
  private calculateDebtUnderStress(baseData: any, averagePDI: number): number {
    const averageDebtPerUser = baseData.averageDebt;
    const criticalUsers = Math.floor(baseData.totalProfiles * (this.calculateCriticalPercentage(averagePDI) / 100));

    // Critical users typically have 1.5x average debt
    return criticalUsers * averageDebtPerUser * 1.5;
  }

  /**
   * Get top creditors operating in this region
   */
  private getTopRegionalCreditors(region: Region): string[] {
    const nationalCreditors = ['DNB', 'Nordea', 'SpareBank 1', 'Santander', 'Bank Norwegian'];
    const regionalCreditors = {
      'NO_OSLO': ['Storebrand Bank', 'Skandiabanken'],
      'NO_BERGEN': ['Sparebanken Vest', 'BN Bank'],
      'NO_STAVANGER': ['SR-Bank', 'Sparebanken Rogaland'],
      'NO_TRONDHEIM': ['Sparebanken Midt-Norge'],
      'NO_NORD': ['Sparebanken Nord-Norge'],
      'NO_VEST': ['Sparebanken Vest'],
      'NO_OST': ['Sparebanken Øst'],
      'NO_SOR': ['Sparebanken Sør']
    };

    return [...nationalCreditors, ...(regionalCreditors[region.code] || [])];
  }

  /**
   * Calculate national averages from regional data
   */
  private calculateNationalAverage(regionalData: RegionalPDIData[]): NationalPDIData {
    const totalUsers = regionalData.reduce((sum, region) => sum + region.totalProfiles, 0);
    const totalDebtStress = regionalData.reduce((sum, region) => sum + region.debtUnderStress, 0);

    // Weighted average by population
    const weightedPDI = regionalData.reduce((sum, region) => {
      return sum + (region.averagePDI * region.totalProfiles);
    }, 0) / totalUsers;

    const averageCriticalPercentage = regionalData.reduce((sum, region) => {
      return sum + (region.criticalPercentage * region.totalProfiles);
    }, 0) / totalUsers;

    const regionsInCrisis = regionalData.filter(region =>
      region.averagePDI < 50 || region.criticalPercentage > 30
    ).length;

    // Calculate trend
    const averageTrend = regionalData.reduce((sum, region) => sum + region.trend.thirtyDay, 0) / regionalData.length;
    const trend = averageTrend > 2 ? 'improving' : averageTrend < -2 ? 'worsening' : 'stable';

    return {
      nationalAverage: weightedPDI,
      totalUsers,
      criticalPercentage: averageCriticalPercentage,
      totalDebtStress,
      regionsInCrisis,
      lastUpdated: new Date(),
      trend,
      changePercent: averageTrend,
      regions: regionalData,
      keyMetrics: this.calculateKeyMetrics(regionalData)
    };
  }

  /**
   * Calculate key national metrics
   */
  private calculateKeyMetrics(regionalData: RegionalPDIData[]) {
    // These would come from actual user data in production
    return {
      averageDSR: 32.5,
      averageDTI: 245,
      averageEmergencyFund: 1.8,
      paymentStressRate: 12.3
    };
  }

  /**
   * Cache regional data for fast retrieval
   */
  private async cacheRegionalData(regionCode: string, data: RegionalPDIData): Promise<void> {
    const key = `pdi:regional:${regionCode}`;

    if (this.redisConnected) {
      try {
        await this.redis.setex(key, 300, JSON.stringify(data)); // 5-minute cache
      } catch (error) {
        console.warn('Redis cache failed, using memory cache:', error.message);
        this.redisConnected = false;
        this.setMemoryCache(key, data, 300000); // 5 minutes in milliseconds
      }
    } else {
      this.setMemoryCache(key, data, 300000); // 5 minutes in milliseconds
    }
  }

  /**
   * Cache national data for public API
   */
  private async cacheNationalData(data: NationalPDIData): Promise<void> {
    const publicData = {
      nationalAverage: data.nationalAverage,
      totalUsers: data.totalUsers,
      criticalPercentage: data.criticalPercentage,
      totalDebtStress: data.totalDebtStress,
      regionsInCrisis: data.regionsInCrisis,
      lastUpdated: data.lastUpdated,
      trend: data.trend,
      changePercent: data.changePercent
    };

    if (this.redisConnected) {
      try {
        await this.redis.setex('pdi:national:public', 300, JSON.stringify(publicData)); // 5-minute cache for public
        await this.redis.setex('pdi:national:internal', 300, JSON.stringify(data)); // 5-minute cache for internal
      } catch (error) {
        console.warn('Redis cache failed, using memory cache:', error.message);
        this.redisConnected = false;
        this.setMemoryCache('pdi:national:public', publicData, 300000); // 5 minutes
        this.setMemoryCache('pdi:national:internal', data, 300000); // 5 minutes
      }
    } else {
      this.setMemoryCache('pdi:national:public', publicData, 300000); // 5 minutes
      this.setMemoryCache('pdi:national:internal', data, 300000); // 5 minutes
    }
  }

  /**
   * Trigger regional crisis alert
   */
  private async triggerRegionalAlert(region: Region, data: RegionalPDIData): Promise<void> {
    console.warn(`🚨 REGIONAL DEBT CRISIS DETECTED: ${region.name}`);
    console.warn(`   Average PDI: ${data.averagePDI.toFixed(1)}`);
    console.warn(`   Critical Users: ${data.criticalPercentage.toFixed(1)}%`);
    console.warn(`   Debt at Risk: ${(data.debtUnderStress / 1000000).toFixed(1)}M NOK`);

    // In production, this would:
    // 1. Alert authorities (Finanstilsynet, Forbrukerrådet)
    // 2. Trigger collective action preparation
    // 3. Boost SWORD rewards for affected users
    // 4. Activate regional support measures

    // Store crisis event
    if (this.redisConnected) {
      try {
        await this.redis.zadd(
          'pdi:crises',
          Date.now(),
          JSON.stringify({
            region: region.code,
            timestamp: new Date(),
            severity: data.averagePDI < 40 ? 'critical' : 'high',
            affectedUsers: data.totalProfiles,
            debtAtRisk: data.debtUnderStress
          })
        );
      } catch (error) {
        console.warn('Redis zadd failed:', error.message);
        this.redisConnected = false;
      }
    }
  }

  /**
   * Broadcast real-time updates for live displays
   */
  private async broadcastUpdate(data: NationalPDIData): Promise<void> {
    if (this.redisConnected) {
      try {
        // Publish to Redis pubsub for WebSocket clients
        await this.redis.publish('pdi:live_update', JSON.stringify({
          type: 'national_update',
          data: {
            nationalAverage: data.nationalAverage,
            totalDebtStress: data.totalDebtStress,
            criticalPercentage: data.criticalPercentage,
            timestamp: Date.now(),
            changeRate: data.totalDebtStress * 0.00001 // Simulated per-second change
          }
        }));
      } catch (error) {
        console.warn('Redis publish failed:', error.message);
        this.redisConnected = false;
      }
    }
  }

  /**
   * Memory cache helper methods
   */
  private setMemoryCache(key: string, data: any, ttlMs: number): void {
    this.memoryCache.set(key, {
      data,
      expires: Date.now() + ttlMs
    });
  }

  private getMemoryCache(key: string): any | null {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expires) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Get cached regional data
   */
  public async getCachedRegionalData(regionCode: string): Promise<RegionalPDIData | null> {
    const key = `pdi:regional:${regionCode}`;

    if (this.redisConnected) {
      try {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.warn('Redis get failed, checking memory cache:', error.message);
        this.redisConnected = false;
      }
    }

    return this.getMemoryCache(key);
  }

  /**
   * Get cached national data
   */
  public async getCachedNationalData(includeInternal = false): Promise<any | null> {
    const key = includeInternal ? 'pdi:national:internal' : 'pdi:national:public';

    if (this.redisConnected) {
      try {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.warn('Redis get failed, checking memory cache:', error.message);
        this.redisConnected = false;
      }
    }

    return this.getMemoryCache(key);
  }

  /**
   * Get regions in crisis
   */
  public async getRegionsInCrisis(): Promise<any[]> {
    if (!this.redisConnected) {
      return [];
    }

    try {
      const crises = await this.redis.zrevrange('pdi:crises', 0, 10, 'WITHSCORES');
      return crises.map((crisis, index) => {
        if (index % 2 === 0) {
          return JSON.parse(crisis);
        }
      }).filter(Boolean);
    } catch (error) {
      console.warn('Redis zrevrange failed:', error.message);
      this.redisConnected = false;
      return [];
    }
  }

  /**
   * Start automatic aggregation schedule
   */
  public startScheduledAggregation(): void {
    // Run every 5 minutes
    setInterval(async () => {
      try {
        await this.aggregateRegionalData();
        console.log('✅ Regional PDI aggregation completed');
      } catch (error) {
        console.error('❌ Regional PDI aggregation failed:', error);
      }
    }, 5 * 60 * 1000);

    console.log('🚀 Regional PDI aggregation scheduler started');
  }

  /**
   * Cleanup Redis connections
   */
  public async cleanup(): Promise<void> {
    await this.redis.quit();
  }
}