// Jest setup file for PDI Engine tests

// Mock console methods to reduce noise in test output
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless VERBOSE_TESTS is set
  if (!process.env.VERBOSE_TESTS) {
    console.error = jest.fn();
    console.log = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  if (!process.env.VERBOSE_TESTS) {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
  }
});

// Global test utilities
global.testUtils = {
  createMockPDIInputs: (overrides = {}) => ({
    monthlyIncome: 5000,
    totalDebt: 50000,
    monthlyDebtPayments: 1500,
    availableCredit: 10000,
    creditUsed: 3000,
    totalAssets: 80000,
    previousMonthDebt: 48000,
    ...overrides
  }),

  createMockPDIScore: (overrides = {}) => ({
    score: 75,
    category: 'healthy' as const,
    metrics: {
      dti: { value: 83.33, score: 70, category: 'caution' as const },
      dsr: { value: 30, score: 75, category: 'caution' as const },
      creditUtilization: { value: 30, score: 85, category: 'healthy' as const },
      debtToAssets: { value: 62.5, score: 70, category: 'caution' as const },
      debtGrowth: { value: 4.17, score: 90, category: 'healthy' as const }
    },
    recommendations: [],
    damoclesActionRequired: false,
    calculatedAt: new Date(),
    ...overrides
  }),

  createMockProfile: (overrides = {}) => ({
    id: 'profile-1',
    userId: 'user-1',
    currentScore: 75,
    scoreCategory: 'healthy',
    lastCalculated: new Date(),
    calculationVersion: '1.0.0',
    metrics: [],
    alerts: [],
    ...overrides
  }),

  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

// Type declarations for global utilities
declare global {
  var testUtils: {
    createMockPDIInputs: (overrides?: any) => any;
    createMockPDIScore: (overrides?: any) => any;
    createMockProfile: (overrides?: any) => any;
    delay: (ms: number) => Promise<void>;
  };
}