import { PDICalculator } from '../calculator';
import { PDIInputs } from '../types';

describe('PDICalculator', () => {
  let calculator: PDICalculator;

  beforeEach(() => {
    calculator = new PDICalculator();
  });

  describe('calculate', () => {
    it('should calculate PDI score correctly for healthy finances', () => {
      const inputs: PDIInputs = {
        monthlyIncome: 10000,
        totalDebt: 50000,
        monthlyDebtPayments: 1500,
        availableCredit: 20000,
        creditUsed: 5000,
        totalAssets: 150000,
        previousMonthDebt: 50000
      };

      const result = calculator.calculate(inputs);

      expect(result.score).toBeGreaterThan(70);
      expect(result.category).toBe('healthy');
      expect(result.damoclesActionRequired).toBe(false);
      expect(result.metrics).toHaveProperty('dti');
      expect(result.metrics).toHaveProperty('dsr');
      expect(result.metrics).toHaveProperty('creditUtilization');
      expect(result.metrics).toHaveProperty('debtToAssets');
      expect(result.metrics).toHaveProperty('debtGrowth');
    });

    it('should calculate PDI score correctly for critical finances', () => {
      const inputs: PDIInputs = {
        monthlyIncome: 3000,
        totalDebt: 80000,
        monthlyDebtPayments: 2500,
        availableCredit: 5000,
        creditUsed: 4900,
        totalAssets: 20000,
        previousMonthDebt: 70000
      };

      const result = calculator.calculate(inputs);

      expect(result.score).toBeLessThan(40);
      expect(result.category).toBe('critical');
      expect(result.damoclesActionRequired).toBe(true);
    });

    it('should handle zero income gracefully', () => {
      const inputs: PDIInputs = {
        monthlyIncome: 0,
        totalDebt: 10000,
        monthlyDebtPayments: 500,
        availableCredit: 1000,
        creditUsed: 800,
        totalAssets: 5000,
        previousMonthDebt: 9500
      };

      const result = calculator.calculate(inputs);

      expect(result.score).toBeLessThan(20);
      expect(result.category).toBe('critical');
      expect(result.damoclesActionRequired).toBe(true);
    });

    it('should handle negative values correctly', () => {
      expect(() => {
        calculator.calculate({
          monthlyIncome: -1000,
          totalDebt: 10000,
          monthlyDebtPayments: 500,
          availableCredit: 1000,
          creditUsed: 800,
          totalAssets: 5000,
          previousMonthDebt: 9500
        });
      }).toThrow('Monthly income must be non-negative');
    });
  });

  describe('metric calculations', () => {
    it('should calculate DTI ratio correctly', () => {
      const inputs: PDIInputs = {
        monthlyIncome: 5000,
        totalDebt: 100000,
        monthlyDebtPayments: 2000,
        availableCredit: 10000,
        creditUsed: 3000,
        totalAssets: 80000,
        previousMonthDebt: 95000
      };

      const result = calculator.calculate(inputs);

      // DTI = (totalDebt / (monthlyIncome * 12)) * 100
      // DTI = (100000 / (5000 * 12)) * 100 = 166.67%
      expect(result.metrics.dti.value).toBeCloseTo(166.67, 1);
      expect(result.metrics.dti.category).toBe('critical');
    });

    it('should calculate DSR ratio correctly', () => {
      const inputs: PDIInputs = {
        monthlyIncome: 5000,
        totalDebt: 100000,
        monthlyDebtPayments: 1500,
        availableCredit: 10000,
        creditUsed: 3000,
        totalAssets: 80000,
        previousMonthDebt: 95000
      };

      const result = calculator.calculate(inputs);

      // DSR = (monthlyDebtPayments / monthlyIncome) * 100
      // DSR = (1500 / 5000) * 100 = 30%
      expect(result.metrics.dsr.value).toBeCloseTo(30, 1);
      expect(result.metrics.dsr.category).toBe('caution');
    });

    it('should calculate credit utilization correctly', () => {
      const inputs: PDIInputs = {
        monthlyIncome: 5000,
        totalDebt: 50000,
        monthlyDebtPayments: 1000,
        availableCredit: 10000,
        creditUsed: 8000,
        totalAssets: 80000,
        previousMonthDebt: 48000
      };

      const result = calculator.calculate(inputs);

      // Credit Utilization = (creditUsed / availableCredit) * 100
      // Credit Utilization = (8000 / 10000) * 100 = 80%
      expect(result.metrics.creditUtilization.value).toBeCloseTo(80, 1);
      expect(result.metrics.creditUtilization.category).toBe('risky');
    });

    it('should calculate debt-to-assets ratio correctly', () => {
      const inputs: PDIInputs = {
        monthlyIncome: 5000,
        totalDebt: 40000,
        monthlyDebtPayments: 1000,
        availableCredit: 10000,
        creditUsed: 3000,
        totalAssets: 100000,
        previousMonthDebt: 38000
      };

      const result = calculator.calculate(inputs);

      // Debt-to-Assets = (totalDebt / totalAssets) * 100
      // Debt-to-Assets = (40000 / 100000) * 100 = 40%
      expect(result.metrics.debtToAssets.value).toBeCloseTo(40, 1);
      expect(result.metrics.debtToAssets.category).toBe('healthy');
    });

    it('should calculate debt growth correctly', () => {
      const inputs: PDIInputs = {
        monthlyIncome: 5000,
        totalDebt: 55000,
        monthlyDebtPayments: 1000,
        availableCredit: 10000,
        creditUsed: 3000,
        totalAssets: 100000,
        previousMonthDebt: 50000
      };

      const result = calculator.calculate(inputs);

      // Debt Growth = ((totalDebt - previousMonthDebt) / previousMonthDebt) * 100
      // Debt Growth = ((55000 - 50000) / 50000) * 100 = 10%
      expect(result.metrics.debtGrowth.value).toBeCloseTo(10, 1);
      expect(result.metrics.debtGrowth.category).toBe('caution');
    });
  });

  describe('category determination', () => {
    it('should categorize healthy scores correctly', () => {
      const mockMetrics = {
        dti: { value: 50, score: 85, category: 'healthy' as const },
        dsr: { value: 20, score: 90, category: 'healthy' as const },
        creditUtilization: { value: 25, score: 85, category: 'healthy' as const },
        debtToAssets: { value: 30, score: 85, category: 'healthy' as const },
        debtGrowth: { value: 0, score: 100, category: 'healthy' as const }
      };

      const totalScore = calculator['calculateTotalScore'](mockMetrics);
      const category = calculator['determineCategory'](totalScore);

      expect(category).toBe('healthy');
      expect(totalScore).toBeGreaterThan(80);
    });

    it('should categorize critical scores correctly', () => {
      const mockMetrics = {
        dti: { value: 300, score: 10, category: 'critical' as const },
        dsr: { value: 80, score: 15, category: 'critical' as const },
        creditUtilization: { value: 95, score: 20, category: 'critical' as const },
        debtToAssets: { value: 150, score: 5, category: 'critical' as const },
        debtGrowth: { value: 25, score: 25, category: 'critical' as const }
      };

      const totalScore = calculator['calculateTotalScore'](mockMetrics);
      const category = calculator['determineCategory'](totalScore);

      expect(category).toBe('critical');
      expect(totalScore).toBeLessThan(40);
    });
  });

  describe('DAMOCLES trigger logic', () => {
    it('should trigger DAMOCLES for critical scores', () => {
      const inputs: PDIInputs = {
        monthlyIncome: 2000,
        totalDebt: 80000,
        monthlyDebtPayments: 1800,
        availableCredit: 2000,
        creditUsed: 1900,
        totalAssets: 15000,
        previousMonthDebt: 75000
      };

      const result = calculator.calculate(inputs);

      expect(result.score).toBeLessThan(30);
      expect(result.damoclesActionRequired).toBe(true);
    });

    it('should not trigger DAMOCLES for healthy scores', () => {
      const inputs: PDIInputs = {
        monthlyIncome: 8000,
        totalDebt: 40000,
        monthlyDebtPayments: 1200,
        availableCredit: 15000,
        creditUsed: 3000,
        totalAssets: 120000,
        previousMonthDebt: 41000
      };

      const result = calculator.calculate(inputs);

      expect(result.score).toBeGreaterThan(70);
      expect(result.damoclesActionRequired).toBe(false);
    });
  });

  describe('recommendations generation', () => {
    it('should generate relevant recommendations for high DTI', () => {
      const inputs: PDIInputs = {
        monthlyIncome: 3000,
        totalDebt: 80000,
        monthlyDebtPayments: 1500,
        availableCredit: 5000,
        creditUsed: 2000,
        totalAssets: 50000,
        previousMonthDebt: 78000
      };

      const result = calculator.calculate(inputs);

      expect(result.recommendations).toContain(
        expect.objectContaining({
          type: 'debt_reduction'
        })
      );
    });

    it('should generate credit utilization recommendations', () => {
      const inputs: PDIInputs = {
        monthlyIncome: 5000,
        totalDebt: 30000,
        monthlyDebtPayments: 800,
        availableCredit: 5000,
        creditUsed: 4500,
        totalAssets: 80000,
        previousMonthDebt: 29000
      };

      const result = calculator.calculate(inputs);

      expect(result.recommendations).toContain(
        expect.objectContaining({
          type: 'credit_management'
        })
      );
    });
  });

  describe('input validation', () => {
    it('should validate required fields', () => {
      expect(() => {
        calculator.calculate({} as PDIInputs);
      }).toThrow();
    });

    it('should validate numeric ranges', () => {
      expect(() => {
        calculator.calculate({
          monthlyIncome: -100,
          totalDebt: 10000,
          monthlyDebtPayments: 500,
          availableCredit: 1000,
          creditUsed: 800,
          totalAssets: 5000,
          previousMonthDebt: 9500
        });
      }).toThrow('Monthly income must be non-negative');
    });

    it('should validate logical constraints', () => {
      expect(() => {
        calculator.calculate({
          monthlyIncome: 5000,
          totalDebt: 10000,
          monthlyDebtPayments: 500,
          availableCredit: 1000,
          creditUsed: 1500, // More than available
          totalAssets: 5000,
          previousMonthDebt: 9500
        });
      }).toThrow('Credit used cannot exceed available credit');
    });
  });
});