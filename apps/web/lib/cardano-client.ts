/**
 * DAMOCLES Cardano Client
 *
 * Connects frontend to Cardano blockchain and DAMOCLES security contracts
 * Provides real-time data for treasury, SWORD tokens, and emergency status
 */

// Types for Cardano integration
export interface CardanoConfig {
  network: 'testnet' | 'mainnet'
  explorerApi: string
  contracts: {
    treasuryAddress: string
    swordPolicyId: string
    emergencyAddress: string
    vestingPolicyId: string
  }
}

export interface TreasuryStatus {
  balance: number // ADA amount
  pendingWithdrawals: PendingWithdrawal[]
  totalWithdrawn: number
  lastActivity: string
}

export interface PendingWithdrawal {
  id: string
  amount: number
  recipient: string
  requestedAt: string
  timeRemaining: number // milliseconds until executable
  requiredSignatures: number
  currentSignatures: number
  status: 'pending' | 'approved' | 'executable' | 'cancelled'
}

export interface SwordTokenBalance {
  total: number
  available: number
  vested: number
  locked: number
  nextVestingDate?: string
  nextVestingAmount?: number
  vestingSchedule: VestingEvent[]
}

export interface VestingEvent {
  date: string
  amount: number
  type: 'founder' | 'team' | 'advisor'
}

export interface EmergencyStatus {
  isActive: boolean
  isPaused: boolean
  pausedSince?: string
  pauseReason?: string
  unpauseVotes: number
  requiredVotes: number
  canUnpause: boolean
  emergencyHistory: EmergencyEvent[]
}

export interface EmergencyEvent {
  timestamp: string
  action: 'pause' | 'unpause' | 'vote'
  initiator: string
  reason?: string
}

// Cardano network configurations
const CARDANO_CONFIGS: Record<string, CardanoConfig> = {
  testnet: {
    network: 'testnet',
    explorerApi: 'https://cardano-testnet.blockfrost.io/api/v0',
    contracts: {
      treasuryAddress: process.env.NEXT_PUBLIC_TREASURY_ADDRESS_TESTNET || 'addr_test1...',
      swordPolicyId: process.env.NEXT_PUBLIC_SWORD_POLICY_TESTNET || 'policy1...',
      emergencyAddress: process.env.NEXT_PUBLIC_EMERGENCY_ADDRESS_TESTNET || 'addr_test1...',
      vestingPolicyId: process.env.NEXT_PUBLIC_VESTING_POLICY_TESTNET || 'policy1...'
    }
  },
  mainnet: {
    network: 'mainnet',
    explorerApi: 'https://cardano-mainnet.blockfrost.io/api/v0',
    contracts: {
      treasuryAddress: process.env.NEXT_PUBLIC_TREASURY_ADDRESS_MAINNET || 'addr1...',
      swordPolicyId: process.env.NEXT_PUBLIC_SWORD_POLICY_MAINNET || 'policy1...',
      emergencyAddress: process.env.NEXT_PUBLIC_EMERGENCY_ADDRESS_MAINNET || 'addr1...',
      vestingPolicyId: process.env.NEXT_PUBLIC_VESTING_POLICY_MAINNET || 'policy1...'
    }
  }
}

class CardanoClient {
  private config: CardanoConfig
  private apiKey: string

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.config = CARDANO_CONFIGS[network]
    this.apiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || ''

    if (!this.apiKey) {
      console.warn('Blockfrost API key not found. Using mock data.')
    }
  }

  private async apiCall<T>(endpoint: string): Promise<T> {
    if (!this.apiKey) {
      // Return mock data when no API key is available
      return this.getMockData<T>(endpoint)
    }

    try {
      const response = await fetch(`${this.config.explorerApi}${endpoint}`, {
        headers: {
          'project_id': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Cardano API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Cardano API call failed:', error)
      // Fallback to mock data
      return this.getMockData<T>(endpoint)
    }
  }

  private getMockData<T>(endpoint: string): T {
    // Mock data for development/testing
    const mockData: Record<string, any> = {
      '/addresses/': {
        balance: [
          { unit: 'lovelace', quantity: '125000000000' } // 125k ADA
        ]
      },
      '/assets/': [
        {
          asset: 'policy1...SWORD',
          quantity: '50000000',
          metadata: {
            name: 'SWORD',
            description: 'DAMOCLES governance token'
          }
        }
      ]
    }

    // Return mock data based on endpoint pattern
    for (const pattern in mockData) {
      if (endpoint.includes(pattern)) {
        return mockData[pattern] as T
      }
    }

    return {} as T
  }

  // Get treasury balance and status
  async getTreasuryStatus(): Promise<TreasuryStatus> {
    try {
      const addressData = await this.apiCall<any>(`/addresses/${this.config.contracts.treasuryAddress}`)

      const balanceLovelace = addressData.balance?.find((b: any) => b.unit === 'lovelace')?.quantity || '0'
      const balanceAda = parseInt(balanceLovelace) / 1000000 // Convert lovelace to ADA

      // Mock pending withdrawals for now
      const pendingWithdrawals: PendingWithdrawal[] = [
        {
          id: 'w1',
          amount: 10000,
          recipient: 'Marketing Budget',
          requestedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          timeRemaining: 86400000, // 1 day remaining
          requiredSignatures: 3,
          currentSignatures: 2,
          status: 'approved'
        }
      ]

      return {
        balance: balanceAda,
        pendingWithdrawals,
        totalWithdrawn: 75000, // Mock data
        lastActivity: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to fetch treasury status:', error)
      // Return fallback data
      return {
        balance: 125000,
        pendingWithdrawals: [],
        totalWithdrawn: 0,
        lastActivity: new Date().toISOString()
      }
    }
  }

  // Get user's SWORD token balance and vesting info
  async getSwordBalance(userAddress?: string): Promise<SwordTokenBalance> {
    if (!userAddress) {
      // Return empty balance if no user address
      return {
        total: 0,
        available: 0,
        vested: 0,
        locked: 0,
        vestingSchedule: []
      }
    }

    // Check if this is the founder address
    const founderAddress = '***REMOVED***'
    if (userAddress === founderAddress) {
      // Return founder allocation
      const totalTokens = 50000000 // 50M SWORD tokens (5% of 1B supply)
      const now = new Date()
      const tgeDate = new Date('2025-09-25') // Token Generation Event
      const monthsElapsed = (now.getTime() - tgeDate.getTime()) / (1000 * 60 * 60 * 24 * 30)

      // Founder vesting: 1 year cliff, then linear over 3 years
      // First 20% available immediately (from cert), rest vests over time
      const immediateRelease = 10000000 // 20% immediate (10M tokens)
      const vestingTokens = 40000000 // 80% vesting (40M tokens)

      const vestedFromSchedule = Math.max(0, Math.floor(vestingTokens * Math.min(1, Math.max(0, (monthsElapsed - 12) / 36))))
      const totalVested = immediateRelease + vestedFromSchedule
      const availableTokens = Math.min(totalVested, totalTokens)

      const vestingSchedule: VestingEvent[] = [
        {
          date: '2025-09-25',
          amount: 10000000, // 20% immediate
          type: 'founder'
        },
        {
          date: '2026-09-25',
          amount: 10000000, // After 1 year cliff
          type: 'founder'
        },
        {
          date: '2027-03-25',
          amount: 10000000, // 6 months later
          type: 'founder'
        },
        {
          date: '2027-09-25',
          amount: 10000000, // 6 months later
          type: 'founder'
        },
        {
          date: '2028-03-25',
          amount: 10000000, // Final vesting
          type: 'founder'
        }
      ]

      return {
        total: totalTokens,
        available: availableTokens,
        vested: totalVested,
        locked: totalTokens - totalVested,
        nextVestingDate: '2026-09-25',
        nextVestingAmount: 10000000,
        vestingSchedule
      }
    }

    try {
      const assets = await this.apiCall<any[]>(`/addresses/${userAddress}/assets`)

      const swordAsset = assets.find(asset =>
        asset.asset.includes(this.config.contracts.swordPolicyId)
      )

      const totalTokens = swordAsset ? parseInt(swordAsset.quantity) : 0

      // Mock vesting calculation (in real implementation, this would query the vesting contract)
      const now = new Date()
      const tgeDate = new Date('2024-01-01') // Token Generation Event
      const monthsElapsed = (now.getTime() - tgeDate.getTime()) / (1000 * 60 * 60 * 24 * 30)

      // Founder vesting: 1 year cliff, then linear over 3 years
      const vestedTokens = Math.max(0, Math.floor(totalTokens * Math.min(1, Math.max(0, (monthsElapsed - 12) / 36))))
      const availableTokens = vestedTokens

      const vestingSchedule: VestingEvent[] = [
        {
          date: '2024-07-01',
          amount: totalTokens * 0.25,
          type: 'founder'
        },
        {
          date: '2025-01-01',
          amount: totalTokens * 0.25,
          type: 'founder'
        },
        {
          date: '2025-07-01',
          amount: totalTokens * 0.25,
          type: 'founder'
        },
        {
          date: '2026-01-01',
          amount: totalTokens * 0.25,
          type: 'founder'
        }
      ]

      return {
        total: totalTokens,
        available: availableTokens,
        vested: vestedTokens,
        locked: totalTokens - vestedTokens,
        nextVestingDate: '2024-07-01',
        nextVestingAmount: totalTokens * 0.25,
        vestingSchedule
      }
    } catch (error) {
      console.error('Failed to fetch SWORD balance:', error)
      return {
        total: 0,
        available: 0,
        vested: 0,
        locked: 0,
        vestingSchedule: []
      }
    }
  }

  // Get emergency pause status
  async getEmergencyStatus(): Promise<EmergencyStatus> {
    try {
      // In real implementation, this would query the emergency contract state
      // For now, we'll use mock data

      return {
        isActive: true,
        isPaused: false,
        unpauseVotes: 0,
        requiredVotes: 3,
        canUnpause: false,
        emergencyHistory: [
          {
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            action: 'unpause',
            initiator: 'Governance',
            reason: 'Issue resolved'
          }
        ]
      }
    } catch (error) {
      console.error('Failed to fetch emergency status:', error)
      return {
        isActive: true,
        isPaused: false,
        unpauseVotes: 0,
        requiredVotes: 3,
        canUnpause: false,
        emergencyHistory: []
      }
    }
  }

  // Get current network status
  getNetworkInfo() {
    return {
      network: this.config.network,
      explorerUrl: this.config.network === 'mainnet'
        ? 'https://cardanoscan.io'
        : 'https://testnet.cardanoscan.io',
      contracts: this.config.contracts
    }
  }

  // Subscribe to real-time updates (WebSocket)
  subscribeToUpdates(callback: (data: any) => void) {
    // In a real implementation, this would establish a WebSocket connection
    // to receive real-time blockchain updates

    // For now, simulate updates every 30 seconds
    const interval = setInterval(async () => {
      try {
        const [treasury, emergency] = await Promise.all([
          this.getTreasuryStatus(),
          this.getEmergencyStatus()
        ])

        callback({
          type: 'update',
          data: { treasury, emergency },
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Update subscription error:', error)
      }
    }, 30000)

    // Return cleanup function
    return () => clearInterval(interval)
  }

  // Format ADA amounts for display
  static formatAda(lovelace: number): string {
    const ada = lovelace / 1000000
    return new Intl.NumberFormat('no-NO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(ada)
  }

  // Format SWORD token amounts
  static formatSword(amount: number): string {
    return new Intl.NumberFormat('no-NO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Convert time remaining to human readable format
  static formatTimeRemaining(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }

    return `${hours}h ${minutes}m`
  }
}

// Export singleton instance
const cardanoClient = new CardanoClient(
  (process.env.NEXT_PUBLIC_CARDANO_NETWORK as 'testnet' | 'mainnet') || 'testnet'
)

export default cardanoClient