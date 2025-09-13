import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshResponse = await api.post('/auth/refresh')
        const { token } = refreshResponse.data
        
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (data: { email: string; bankIdToken: string }) =>
    api.post('/auth/login', data),
  
  register: (data: {
    email: string
    phoneNumber?: string
    personalNumber: string
    bankIdToken: string
  }) => api.post('/auth/register', data),
  
  refresh: () => api.post('/auth/refresh'),
  
  logout: () => api.post('/auth/logout'),
}

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (data: {
    phoneNumber?: string
    shieldTier?: string
  }) => api.patch('/users/profile', data),
  
  getStats: () => api.get('/users/stats'),
  
  getActivity: (params?: {
    page?: number
    limit?: number
  }) => api.get('/users/activity', { params }),
}

export const debtAPI = {
  getDebts: (status?: string) => 
    api.get('/debts', { params: status ? { status } : {} }),
  
  getDebt: (debtId: string) => api.get(`/debts/${debtId}`),
  
  addDebt: (data: {
    creditorId: string
    originalAmount: number
    currentAmount: number
    accountNumber?: string
  }) => api.post('/debts', data),
  
  updateDebt: (debtId: string, data: {
    currentAmount?: number
    status?: string
  }) => api.patch(`/debts/${debtId}`, data),
  
  deleteDebt: (debtId: string) => api.delete(`/debts/${debtId}`),
}

export const gdprAPI = {
  generateRequest: (data: {
    user_id: string
    creditor_id: string
    request_type?: string
    custom_message?: string
  }) => api.post('/gdpr/generate', data),
  
  sendRequest: (requestId: string) =>
    api.post(`/gdpr/send/${requestId}`),
  
  getRequests: (userId: string, params?: {
    status?: string
    limit?: number
    offset?: number
  }) => api.get(`/gdpr/requests/${userId}`, { params }),
  
  processResponse: (requestId: string, data: {
    content: string
    format: string
  }) => api.post(`/gdpr/response/${requestId}`, data),
}

export const violationAPI = {
  getViolations: (userId: string, params?: {
    severity?: string
    limit?: number
    offset?: number
  }) => api.get(`/violations/${userId}`, { params }),
  
  analyzeDocument: (data: any) =>
    api.post('/analyze/document', data),
}

export const settlementAPI = {
  createProposal: (data: {
    user_id: string
    creditor_id: string
    debt_id?: string
    violations: string[]
  }) => api.post('/settlements/propose', data),
  
  acceptSettlement: (settlementId: string, data: {
    user_signature?: string
  }) => api.post(`/settlements/${settlementId}/accept`, data),
  
  getSettlements: (userId: string) =>
    api.get(`/settlements/user/${userId}`),
  
  getSettlement: (settlementId: string) =>
    api.get(`/settlements/${settlementId}`),
}

export const creditorAPI = {
  getCreditors: () => api.get('/creditors'),
  
  getCreditor: (creditorId: string) =>
    api.get(`/creditors/${creditorId}`),
  
  getCreditorStats: (creditorId: string) =>
    api.get(`/stats/creditor/${creditorId}`),
}

export const tokenAPI = {
  getBalance: () => api.get('/token/balance'),
  
  stake: (amount: number, lockTime: number) =>
    api.post('/token/stake', { amount, lockTime }),
  
  unstake: (stakeId: string) =>
    api.post('/token/unstake', { stakeId }),
  
  getTransactions: (params?: {
    type?: string
    limit?: number
    offset?: number
  }) => api.get('/token/transactions', { params }),
}