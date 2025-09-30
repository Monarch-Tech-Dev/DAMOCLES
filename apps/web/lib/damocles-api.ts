/**
 * DAMOCLES Platform API Client
 * Specialized API client for dashboard components with type safety and error handling
 */

import { useState, useEffect, useCallback } from 'react';

export interface APIError {
  message: string;
  status?: number;
  code?: string;
}

export class DamoclesAPIClient {
  private baseUrls = {
    userService: 'http://localhost:3001',
    trustEngine: 'http://localhost:3003',
    gdprEngine: 'http://localhost:8001',
    blockchainService: 'http://localhost:8020',
  };

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: errorData.code,
        } as APIError;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return (await response.text()) as unknown as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw {
          message: 'Network error: Unable to connect to service',
          code: 'NETWORK_ERROR',
        } as APIError;
      }
      throw error;
    }
  }

  // Event Timeline API
  async getEventTimeline(params: {
    userId?: string;
    creditorId?: string;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{
      events: Array<{
        id: string;
        eventType: string;
        title: string;
        description: string;
        timestamp: string;
        status: string;
        metadata?: Record<string, any>;
      }>;
      totalCount: number;
    }>(`${this.baseUrls.userService}/api/events/timeline?${searchParams}`);
  }

  // Risk Score API
  async getRiskScore(collectorId: string) {
    return this.request<{
      collectorId: string;
      collectorName: string;
      overallRiskScore: number;
      violationScore: number;
      complianceScore: number;
      trustScore: number;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      breakdown: {
        gdprCompliance: number;
        settlementLogic: number;
        responsePatterns: number;
        violationFrequency: number;
        authorityRespect: number;
      };
      recommendations: string[];
      lastCalculated: string;
      trend?: {
        direction: 'up' | 'down' | 'stable';
        percentage: number;
      };
    }>(`${this.baseUrls.trustEngine}/risk/score/${collectorId}`);
  }

  async getRiskSummary(collectorIds?: string[]) {
    const body = collectorIds ? { collectorIds } : {};
    return this.request<{
      collectors: Array<{
        collectorId: string;
        collectorName: string;
        overallRiskScore: number;
        trustScore: number;
        riskLevel: string;
        lastCalculated: string;
      }>;
      summary: {
        averageRiskScore: number;
        highRiskCount: number;
        totalCollectors: number;
      };
    }>(`${this.baseUrls.trustEngine}/risk/summary`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Template Selection API
  async selectTemplate(userData: {
    user_email?: string;
    creditor_name?: string;
    creditor_type?: string;
    jurisdiction?: string;
    language?: string;
  }) {
    return this.request<{
      template_filename: string;
      metadata: {
        detected_jurisdiction: string;
        detected_language: string;
        detected_creditor_type: string;
        template_filename: string;
        template_path: string;
        fallback_chain: string[];
        features: {
          has_schufa_ruling: boolean;
          has_article_22: boolean;
          has_local_laws: boolean;
          has_enhanced_inkasso: boolean;
          supports_nordic_compliance: boolean;
        };
        confidence_score: number;
        schufa_ruling_included: boolean;
        article_22_compliance: boolean;
      };
    }>(`${this.baseUrls.gdprEngine}/template/select`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Health Check API
  async healthCheck() {
    const services = Object.entries(this.baseUrls);
    const results = await Promise.allSettled(
      services.map(async ([name, url]) => {
        try {
          const response = await fetch(`${url}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          return {
            service: name,
            status: response.ok ? 'healthy' : 'unhealthy',
            url,
            response_time: Date.now(),
          };
        } catch (error) {
          return {
            service: name,
            status: 'unreachable',
            url,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return results.map((result, index) => {
      const serviceName = services[index][0];
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          service: serviceName,
          status: 'error',
          url: services[index][1],
          error: result.reason,
        };
      }
    });
  }
}

// Export singleton instance
export const damoclesApi = new DamoclesAPIClient();

// Export specialized hooks for React components
export function useEventTimeline(params: Parameters<DamoclesAPIClient['getEventTimeline']>[0] = {}) {
  const [data, setData] = useState<Awaited<ReturnType<DamoclesAPIClient['getEventTimeline']>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await damoclesApi.getEventTimeline(params);
      setData(result);
    } catch (err) {
      setError(err as APIError);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useRiskScore(collectorId: string) {
  const [data, setData] = useState<Awaited<ReturnType<DamoclesAPIClient['getRiskScore']>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);

  const fetchData = useCallback(async () => {
    if (!collectorId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await damoclesApi.getRiskScore(collectorId);
      setData(result);
    } catch (err) {
      setError(err as APIError);
    } finally {
      setLoading(false);
    }
  }, [collectorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useTemplateSelection(userData: Parameters<DamoclesAPIClient['selectTemplate']>[0]) {
  const [data, setData] = useState<Awaited<ReturnType<DamoclesAPIClient['selectTemplate']>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const selectTemplate = useCallback(async (newUserData?: typeof userData) => {
    const dataToUse = newUserData || userData;
    if (!dataToUse || Object.keys(dataToUse).length === 0) return;

    try {
      setLoading(true);
      setError(null);
      const result = await damoclesApi.selectTemplate(dataToUse);
      setData(result);
      return result;
    } catch (err) {
      setError(err as APIError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(userData)]);

  return { data, loading, error, selectTemplate };
}