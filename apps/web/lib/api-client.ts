import { getSession } from 'next-auth/react'

// Types
interface ApiConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  subscription?: {
    tier: 'free' | 'pdi_fighter' | 'shield_bearer' | 'sword_master'
    status: 'active' | 'cancelled' | 'past_due'
    expiresAt: string
  }
  createdAt: string
  updatedAt: string
}

// PDI types
export interface PDICalculation {
  id: string
  userId: string
  score: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  factors: {
    debtToIncome: number
    totalDebtAmount: number
    numberOfCreditors: number
    overduePercentage: number
    collectionActivity: number
  }
  recommendations: string[]
  calculatedAt: string
}

// Debt types
export interface Debt {
  id: string
  userId: string
  creditorId: string
  creditor?: Creditor
  originalAmount: number
  currentAmount: number
  status: 'active' | 'paid' | 'disputed' | 'settled'
  dueDate?: string
  accountNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Creditor {
  id: string
  name: string
  type: 'bank' | 'credit_company' | 'debt_collector' | 'other'
  organizationNumber?: string
  contactEmail?: string
  contactPhone?: string
  violationScore: number
}

// Document types
export interface Document {
  id: string
  userId: string
  type: 'gdpr_request' | 'dispute' | 'complaint' | 'other'
  recipientId?: string
  content: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  scheduledAt?: string
  sentAt?: string
  createdAt: string
  updatedAt: string
}

// Payment types
export interface CheckoutSession {
  id: string
  url: string
  subscription: string
}

// Base API client class
class ApiClient {
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 30000,
      ...config
    }
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    const session = await getSession()
    if (session?.accessToken) {
      return { Authorization: `Bearer ${session.accessToken}` }
    }
    return {}
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const authHeaders = await this.getAuthHeader()

      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...authHeaders,
          ...options?.headers
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options
      })

      const responseData = await response.json().catch(() => null)

      if (!response.ok) {
        return {
          error: responseData?.message || `Request failed with status ${response.status}`,
          status: response.status
        }
      }

      return {
        data: responseData,
        status: response.status
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      }
    }
  }

  // Auth endpoints
  auth = {
    register: async (data: {
      email: string
      password: string
      name: string
    }): Promise<ApiResponse<User>> => {
      return this.request<User>('POST', '/auth/register', data)
    },

    login: async (data: {
      email: string
      password: string
    }): Promise<ApiResponse<{ user: User; token: string }>> => {
      return this.request('POST', '/auth/login', data)
    },

    logout: async (): Promise<ApiResponse<void>> => {
      return this.request('POST', '/auth/logout')
    },

    forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
      return this.request('POST', '/auth/forgot-password', { email })
    },

    resetPassword: async (data: {
      token: string
      password: string
    }): Promise<ApiResponse<void>> => {
      return this.request('POST', '/auth/reset-password', data)
    },

    verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
      return this.request('POST', '/auth/verify-email', { token })
    }
  }

  // User endpoints
  user = {
    getProfile: async (): Promise<ApiResponse<User>> => {
      return this.request<User>('GET', '/user/profile')
    },

    updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
      return this.request<User>('PATCH', '/user/profile', data)
    },

    deleteAccount: async (password: string): Promise<ApiResponse<void>> => {
      return this.request('DELETE', '/user/account', { password })
    },

    getSubscription: async (): Promise<ApiResponse<User['subscription']>> => {
      return this.request('GET', '/user/subscription')
    },

    cancelSubscription: async (): Promise<ApiResponse<void>> => {
      return this.request('POST', '/user/subscription/cancel')
    }
  }

  // PDI endpoints
  pdi = {
    calculate: async (data: {
      monthlyIncome: number
      totalDebt: number
      monthlyPayments: number
      overdueDebts: number
      creditorCount: number
    }): Promise<ApiResponse<PDICalculation>> => {
      return this.request<PDICalculation>('POST', '/pdi/calculate', data)
    },

    getHistory: async (
      limit = 10,
      offset = 0
    ): Promise<ApiResponse<PDICalculation[]>> => {
      return this.request<PDICalculation[]>(
        'GET',
        `/pdi/history?limit=${limit}&offset=${offset}`
      )
    },

    getLatest: async (): Promise<ApiResponse<PDICalculation>> => {
      return this.request<PDICalculation>('GET', '/pdi/latest')
    },

    getById: async (id: string): Promise<ApiResponse<PDICalculation>> => {
      return this.request<PDICalculation>('GET', `/pdi/${id}`)
    }
  }

  // Debt endpoints
  debts = {
    create: async (data: Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Debt>> => {
      return this.request<Debt>('POST', '/debts', data)
    },

    list: async (params?: {
      status?: Debt['status']
      creditorId?: string
      limit?: number
      offset?: number
    }): Promise<ApiResponse<Debt[]>> => {
      const query = new URLSearchParams(params as any).toString()
      return this.request<Debt[]>('GET', `/debts${query ? `?${query}` : ''}`)
    },

    get: async (id: string): Promise<ApiResponse<Debt>> => {
      return this.request<Debt>('GET', `/debts/${id}`)
    },

    update: async (
      id: string,
      data: Partial<Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
    ): Promise<ApiResponse<Debt>> => {
      return this.request<Debt>('PATCH', `/debts/${id}`, data)
    },

    delete: async (id: string): Promise<ApiResponse<void>> => {
      return this.request('DELETE', `/debts/${id}`)
    },

    getStatistics: async (): Promise<ApiResponse<{
      total: number
      totalAmount: number
      activeCount: number
      overdueCount: number
      byStatus: Record<Debt['status'], number>
      byCreditor: Array<{ creditorId: string; count: number; amount: number }>
    }>> => {
      return this.request('GET', '/debts/statistics')
    }
  }

  // Creditor endpoints
  creditors = {
    create: async (data: Omit<Creditor, 'id'>): Promise<ApiResponse<Creditor>> => {
      return this.request<Creditor>('POST', '/creditors', data)
    },

    list: async (params?: {
      type?: Creditor['type']
      search?: string
      limit?: number
      offset?: number
    }): Promise<ApiResponse<Creditor[]>> => {
      const query = new URLSearchParams(params as any).toString()
      return this.request<Creditor[]>('GET', `/creditors${query ? `?${query}` : ''}`)
    },

    get: async (id: string): Promise<ApiResponse<Creditor>> => {
      return this.request<Creditor>('GET', `/creditors/${id}`)
    },

    update: async (
      id: string,
      data: Partial<Omit<Creditor, 'id'>>
    ): Promise<ApiResponse<Creditor>> => {
      return this.request<Creditor>('PATCH', `/creditors/${id}`, data)
    },

    reportViolation: async (
      id: string,
      violation: {
        type: string
        description: string
        evidence?: string[]
      }
    ): Promise<ApiResponse<void>> => {
      return this.request('POST', `/creditors/${id}/violations`, violation)
    }
  }

  // Document endpoints
  documents = {
    generate: async (data: {
      type: Document['type']
      recipientId: string
      templateId?: string
      variables?: Record<string, any>
    }): Promise<ApiResponse<Document>> => {
      return this.request<Document>('POST', '/documents/generate', data)
    },

    list: async (params?: {
      type?: Document['type']
      status?: Document['status']
      limit?: number
      offset?: number
    }): Promise<ApiResponse<Document[]>> => {
      const query = new URLSearchParams(params as any).toString()
      return this.request<Document[]>('GET', `/documents${query ? `?${query}` : ''}`)
    },

    get: async (id: string): Promise<ApiResponse<Document>> => {
      return this.request<Document>('GET', `/documents/${id}`)
    },

    update: async (
      id: string,
      data: Partial<Pick<Document, 'content' | 'status' | 'scheduledAt'>>
    ): Promise<ApiResponse<Document>> => {
      return this.request<Document>('PATCH', `/documents/${id}`, data)
    },

    send: async (id: string, consent: {
      reviewed: boolean
      understood: boolean
      accepted: boolean
    }): Promise<ApiResponse<void>> => {
      return this.request('POST', `/documents/${id}/send`, { consent })
    },

    schedule: async (
      id: string,
      scheduledAt: string
    ): Promise<ApiResponse<Document>> => {
      return this.request<Document>('POST', `/documents/${id}/schedule`, { scheduledAt })
    },

    cancel: async (id: string): Promise<ApiResponse<void>> => {
      return this.request('POST', `/documents/${id}/cancel`)
    },

    download: async (id: string): Promise<ApiResponse<Blob>> => {
      return this.request<Blob>('GET', `/documents/${id}/download`)
    }
  }

  // Payment endpoints
  payments = {
    createCheckout: async (data: {
      tier: 'pdi_fighter' | 'shield_bearer' | 'sword_master'
      successUrl: string
      cancelUrl: string
    }): Promise<ApiResponse<CheckoutSession>> => {
      return this.request<CheckoutSession>('POST', '/payments/create-checkout', data)
    },

    getHistory: async (): Promise<ApiResponse<Array<{
      id: string
      amount: number
      status: string
      createdAt: string
    }>>> => {
      return this.request('GET', '/payments/history')
    },

    updatePaymentMethod: async (data: {
      paymentMethodId: string
    }): Promise<ApiResponse<void>> => {
      return this.request('POST', '/payments/update-method', data)
    }
  }

  // GDPR endpoints
  gdpr = {
    requestData: async (creditorId: string): Promise<ApiResponse<Document>> => {
      return this.request<Document>('POST', '/gdpr/request-data', { creditorId })
    },

    requestDeletion: async (creditorId: string): Promise<ApiResponse<Document>> => {
      return this.request<Document>('POST', '/gdpr/request-deletion', { creditorId })
    },

    requestCorrection: async (data: {
      creditorId: string
      corrections: Record<string, any>
    }): Promise<ApiResponse<Document>> => {
      return this.request<Document>('POST', '/gdpr/request-correction', data)
    },

    fileComplaint: async (data: {
      creditorId: string
      reason: string
      description: string
    }): Promise<ApiResponse<Document>> => {
      return this.request<Document>('POST', '/gdpr/complaint', data)
    }
  }

  // Analytics endpoints
  analytics = {
    getDashboard: async (): Promise<ApiResponse<{
      pdiTrend: Array<{ date: string; score: number }>
      debtReduction: number
      documentsS sent: number
      successRate: number
    }>> => {
      return this.request('GET', '/analytics/dashboard')
    },

    trackEvent: async (event: {
      action: string
      category: string
      label?: string
      value?: number
    }): Promise<ApiResponse<void>> => {
      return this.request('POST', '/analytics/event', event)
    }
  }
}

// Create and export the API client instance
const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
})

export default apiClient