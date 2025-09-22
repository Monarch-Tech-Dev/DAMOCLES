import Redis from 'ioredis';
import { PDIScore, PDIProfileData, RegionalData } from './types';

export class PDICacheService {
  private redis: Redis;
  private readonly TTL = {
    PDI_SCORE: 3600, // 1 hour
    PROFILE: 7200, // 2 hours
    REGIONAL_DATA: 86400, // 24 hours
    ANALYTICS: 1800, // 30 minutes
    TRUST_CONTEXT: 3600 // 1 hour
  };

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379', {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  /**
   * Cache PDI score
   */
  async cachePDIScore(userId: string, pdiScore: PDIScore): Promise<void> {
    try {
      const key = this.getScoreKey(userId);
      await this.redis.setex(key, this.TTL.PDI_SCORE, JSON.stringify(pdiScore));
    } catch (error) {
      console.error('Failed to cache PDI score:', error);
    }
  }

  /**
   * Get cached PDI score
   */
  async getCachedPDIScore(userId: string): Promise<PDIScore | null> {
    try {
      const key = this.getScoreKey(userId);
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached PDI score:', error);
      return null;
    }
  }

  /**
   * Cache PDI profile
   */
  async cachePDIProfile(userId: string, profile: PDIProfileData): Promise<void> {
    try {
      const key = this.getProfileKey(userId);
      await this.redis.setex(key, this.TTL.PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to cache PDI profile:', error);
    }
  }

  /**
   * Get cached PDI profile
   */
  async getCachedPDIProfile(userId: string): Promise<PDIProfileData | null> {
    try {
      const key = this.getProfileKey(userId);
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached PDI profile:', error);
      return null;
    }
  }

  /**
   * Cache regional data
   */
  async cacheRegionalData(regionCode: string, data: RegionalData[]): Promise<void> {
    try {
      const key = this.getRegionalKey(regionCode);
      await this.redis.setex(key, this.TTL.REGIONAL_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to cache regional data:', error);
    }
  }

  /**
   * Get cached regional data
   */
  async getCachedRegionalData(regionCode: string): Promise<RegionalData[] | null> {
    try {
      const key = this.getRegionalKey(regionCode);
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached regional data:', error);
      return null;
    }
  }

  /**
   * Cache dashboard analytics
   */
  async cacheAnalytics(analytics: any): Promise<void> {
    try {
      const key = 'pdi:analytics:global';
      await this.redis.setex(key, this.TTL.ANALYTICS, JSON.stringify(analytics));
    } catch (error) {
      console.error('Failed to cache analytics:', error);
    }
  }

  /**
   * Get cached dashboard analytics
   */
  async getCachedAnalytics(): Promise<any | null> {
    try {
      const key = 'pdi:analytics:global';
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached analytics:', error);
      return null;
    }
  }

  /**
   * Cache Trust Engine context
   */
  async cacheTrustContext(userId: string, context: any): Promise<void> {
    try {
      const key = this.getTrustContextKey(userId);
      await this.redis.setex(key, this.TTL.TRUST_CONTEXT, JSON.stringify(context));
    } catch (error) {
      console.error('Failed to cache Trust context:', error);
    }
  }

  /**
   * Get cached Trust Engine context
   */
  async getCachedTrustContext(userId: string): Promise<any | null> {
    try {
      const key = this.getTrustContextKey(userId);
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached Trust context:', error);
      return null;
    }
  }

  /**
   * Invalidate user's cache
   */
  async invalidateUserCache(userId: string): Promise<void> {
    try {
      const keys = [
        this.getScoreKey(userId),
        this.getProfileKey(userId),
        this.getTrustContextKey(userId)
      ];

      await this.redis.del(...keys);
    } catch (error) {
      console.error('Failed to invalidate user cache:', error);
    }
  }

  /**
   * Invalidate regional cache
   */
  async invalidateRegionalCache(regionCode?: string): Promise<void> {
    try {
      if (regionCode) {
        await this.redis.del(this.getRegionalKey(regionCode));
      } else {
        // Invalidate all regional data
        const keys = await this.redis.keys('pdi:regional:*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
    } catch (error) {
      console.error('Failed to invalidate regional cache:', error);
    }
  }

  /**
   * Invalidate analytics cache
   */
  async invalidateAnalyticsCache(): Promise<void> {
    try {
      await this.redis.del('pdi:analytics:global');
    } catch (error) {
      console.error('Failed to invalidate analytics cache:', error);
    }
  }

  /**
   * Set with expiry
   */
  async setWithTTL(key: string, value: any, ttl: number): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set with TTL:', error);
    }
  }

  /**
   * Get from cache
   */
  async get(key: string): Promise<any | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get from cache:', error);
      return null;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Failed to check key existence:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    try {
      const info = await this.redis.info('memory');
      const keys = await this.redis.dbsize();

      return {
        totalKeys: keys,
        memoryInfo: info,
        connected: this.redis.status === 'ready'
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalKeys: 0,
        memoryInfo: '',
        connected: false
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  // Private key generators
  private getScoreKey(userId: string): string {
    return `pdi:score:${userId}`;
  }

  private getProfileKey(userId: string): string {
    return `pdi:profile:${userId}`;
  }

  private getRegionalKey(regionCode: string): string {
    return `pdi:regional:${regionCode}`;
  }

  private getTrustContextKey(userId: string): string {
    return `pdi:trust:${userId}`;
  }

  /**
   * Cleanup and close connection
   */
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}