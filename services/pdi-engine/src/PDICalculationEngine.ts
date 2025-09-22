import { Decimal } from 'decimal.js';

export interface FinancialMetrics {
  // Core Metrics
  monthlyIncome: number;      // Total monthly income after tax
  totalDebt: number;          // All debt obligations
  monthlyDebtPayments: number; // Minimum payments required

  // Additional Context
  fixedExpenses: number;      // Rent, utilities, etc.
  variableExpenses: number;   // Food, transport, etc.
  emergencyFund: number;      // Available emergency savings

  // Optional Advanced Metrics
  mortgageBalance?: number;
  creditCardBalances?: number;
  studentLoanBalance?: number;
  otherDebtBalances?: number;

  // Debt Growth Indicators
  debtGrowthRate?: number;    // Percentage change over 6 months
  missedPayments?: number;    // Number of missed payments in last 12 months
}

export interface PDIMetric {
  name: string;
  value: number;
  weight: number;
  score: number;
  category: 'excellent' | 'good' | 'caution' | 'risky' | 'critical';
  description: string;
}

export interface PDIScore {
  overallScore: number;
  category: 'healthy' | 'caution' | 'risky' | 'critical';
  metrics: {
    dsr: PDIMetric;           // Debt Service Ratio
    dti: PDIMetric;           // Debt to Income
    liquidityBuffer: PDIMetric; // Emergency fund ratio
    debtGrowth: PDIMetric;    // Debt growth trend
    paymentStress: PDIMetric; // Payment reliability
    financialFlexibility: PDIMetric; // Discretionary income
  };
  recommendations: string[];
  riskFactors: string[];
  protectionLevel: 'maximum' | 'enhanced' | 'standard' | 'monitoring';
  lastCalculated: Date;
  trends: {
    thirtyDay: number;
    ninetyDay: number;
    yearOverYear: number;
  };
}

export class PDICalculationEngine {
  private static readonly WEIGHTS = {
    dsr: 0.25,           // Debt Service Ratio - 25%
    dti: 0.20,           // Debt to Income - 20%
    liquidityBuffer: 0.20, // Emergency buffer - 20%
    debtGrowth: 0.15,    // Debt growth trend - 15%
    paymentStress: 0.10,  // Payment reliability - 10%
    financialFlexibility: 0.10 // Discretionary income - 10%
  };

  /**
   * Calculate comprehensive PDI score
   */
  public static calculatePDI(metrics: FinancialMetrics, historicalData?: FinancialMetrics[]): PDIScore {
    const calculatedMetrics = {
      dsr: this.calculateDebtServiceRatio(metrics),
      dti: this.calculateDebtToIncome(metrics),
      liquidityBuffer: this.calculateLiquidityBuffer(metrics),
      debtGrowth: this.calculateDebtGrowth(metrics, historicalData),
      paymentStress: this.calculatePaymentStress(metrics),
      financialFlexibility: this.calculateFinancialFlexibility(metrics)
    };

    // Calculate weighted overall score
    const overallScore = this.calculateWeightedScore(calculatedMetrics);

    // Determine category
    const category = this.determineCategory(overallScore);

    // Generate recommendations and risk factors
    const recommendations = this.generateRecommendations(calculatedMetrics, overallScore);
    const riskFactors = this.identifyRiskFactors(calculatedMetrics);

    // Determine protection level for DAMOCLES automation
    const protectionLevel = this.determineProtectionLevel(overallScore, calculatedMetrics);

    // Calculate trends (mock data for now - would use historical in production)
    const trends = this.calculateTrends(historicalData);

    return {
      overallScore: Math.round(overallScore * 10) / 10,
      category,
      metrics: calculatedMetrics,
      recommendations,
      riskFactors,
      protectionLevel,
      lastCalculated: new Date(),
      trends
    };
  }

  /**
   * Debt Service Ratio: Monthly debt payments / Monthly income
   */
  private static calculateDebtServiceRatio(metrics: FinancialMetrics): PDIMetric {
    const ratio = new Decimal(metrics.monthlyDebtPayments)
      .dividedBy(metrics.monthlyIncome)
      .times(100)
      .toNumber();

    let score: number;
    let category: PDIMetric['category'];

    // Norwegian standard: DSR should be below 40%
    if (ratio <= 20) {
      score = 100;
      category = 'excellent';
    } else if (ratio <= 30) {
      score = 85 - (ratio - 20) * 1.5; // Linear decrease
      category = 'good';
    } else if (ratio <= 40) {
      score = 70 - (ratio - 30) * 2; // Steeper decrease
      category = 'caution';
    } else if (ratio <= 60) {
      score = 50 - (ratio - 40) * 1.5; // Risk zone
      category = 'risky';
    } else {
      score = Math.max(0, 20 - (ratio - 60) * 0.5); // Critical zone
      category = 'critical';
    }

    return {
      name: 'Debt Service Ratio',
      value: ratio,
      weight: this.WEIGHTS.dsr,
      score: Math.max(0, Math.min(100, score)),
      category,
      description: `${ratio.toFixed(1)}% of income goes to debt payments`
    };
  }

  /**
   * Debt to Income: Total debt / Annual income
   */
  private static calculateDebtToIncome(metrics: FinancialMetrics): PDIMetric {
    const annualIncome = metrics.monthlyIncome * 12;
    const ratio = new Decimal(metrics.totalDebt)
      .dividedBy(annualIncome)
      .times(100)
      .toNumber();

    let score: number;
    let category: PDIMetric['category'];

    // Conservative thresholds for Norwegian market
    if (ratio <= 100) {
      score = 100;
      category = 'excellent';
    } else if (ratio <= 200) {
      score = 90 - (ratio - 100) * 0.3;
      category = 'good';
    } else if (ratio <= 300) {
      score = 60 - (ratio - 200) * 0.4;
      category = 'caution';
    } else if (ratio <= 500) {
      score = 20 - (ratio - 300) * 0.1;
      category = 'risky';
    } else {
      score = 0;
      category = 'critical';
    }

    return {
      name: 'Debt to Income',
      value: ratio,
      weight: this.WEIGHTS.dti,
      score: Math.max(0, Math.min(100, score)),
      category,
      description: `Total debt is ${ratio.toFixed(0)}% of annual income`
    };
  }

  /**
   * Liquidity Buffer: Emergency fund / Monthly expenses
   */
  private static calculateLiquidityBuffer(metrics: FinancialMetrics): PDIMetric {
    const monthlyExpenses = metrics.fixedExpenses + metrics.variableExpenses + metrics.monthlyDebtPayments;
    const bufferMonths = new Decimal(metrics.emergencyFund)
      .dividedBy(monthlyExpenses)
      .toNumber();

    let score: number;
    let category: PDIMetric['category'];

    // Emergency fund recommendations
    if (bufferMonths >= 6) {
      score = 100;
      category = 'excellent';
    } else if (bufferMonths >= 3) {
      score = 70 + (bufferMonths - 3) * 10;
      category = 'good';
    } else if (bufferMonths >= 1) {
      score = 40 + (bufferMonths - 1) * 15;
      category = 'caution';
    } else if (bufferMonths >= 0.5) {
      score = 20 + bufferMonths * 40;
      category = 'risky';
    } else {
      score = bufferMonths * 40;
      category = 'critical';
    }

    return {
      name: 'Liquidity Buffer',
      value: bufferMonths,
      weight: this.WEIGHTS.liquidityBuffer,
      score: Math.max(0, Math.min(100, score)),
      category,
      description: `Emergency fund covers ${bufferMonths.toFixed(1)} months of expenses`
    };
  }

  /**
   * Debt Growth: Rate of debt increase/decrease
   */
  private static calculateDebtGrowth(metrics: FinancialMetrics, historicalData?: FinancialMetrics[]): PDIMetric {
    let growthRate = metrics.debtGrowthRate || 0;

    // If we have historical data, calculate actual growth
    if (historicalData && historicalData.length > 0) {
      const oldestData = historicalData[0];
      const monthsAgo = historicalData.length;
      growthRate = ((metrics.totalDebt - oldestData.totalDebt) / oldestData.totalDebt) * 100 * (12 / monthsAgo);
    }

    let score: number;
    let category: PDIMetric['category'];

    // Debt growth scoring (negative growth is good)
    if (growthRate <= -10) {
      score = 100; // Rapidly paying down debt
      category = 'excellent';
    } else if (growthRate <= 0) {
      score = 85 + Math.abs(growthRate) * 1.5;
      category = 'good';
    } else if (growthRate <= 5) {
      score = 70 - growthRate * 3;
      category = 'caution';
    } else if (growthRate <= 15) {
      score = 55 - (growthRate - 5) * 2;
      category = 'risky';
    } else {
      score = Math.max(0, 35 - (growthRate - 15) * 1.5);
      category = 'critical';
    }

    return {
      name: 'Debt Growth',
      value: growthRate,
      weight: this.WEIGHTS.debtGrowth,
      score: Math.max(0, Math.min(100, score)),
      category,
      description: growthRate >= 0
        ? `Debt increasing by ${growthRate.toFixed(1)}% annually`
        : `Debt decreasing by ${Math.abs(growthRate).toFixed(1)}% annually`
    };
  }

  /**
   * Payment Stress: Missed payment frequency
   */
  private static calculatePaymentStress(metrics: FinancialMetrics): PDIMetric {
    const missedPayments = metrics.missedPayments || 0;

    let score: number;
    let category: PDIMetric['category'];

    if (missedPayments === 0) {
      score = 100;
      category = 'excellent';
    } else if (missedPayments <= 1) {
      score = 80;
      category = 'good';
    } else if (missedPayments <= 2) {
      score = 60;
      category = 'caution';
    } else if (missedPayments <= 4) {
      score = 30;
      category = 'risky';
    } else {
      score = 0;
      category = 'critical';
    }

    return {
      name: 'Payment Reliability',
      value: missedPayments,
      weight: this.WEIGHTS.paymentStress,
      score,
      category,
      description: missedPayments === 0
        ? 'No missed payments in last 12 months'
        : `${missedPayments} missed payments in last 12 months`
    };
  }

  /**
   * Financial Flexibility: Discretionary income ratio
   */
  private static calculateFinancialFlexibility(metrics: FinancialMetrics): PDIMetric {
    const totalObligations = metrics.fixedExpenses + metrics.variableExpenses + metrics.monthlyDebtPayments;
    const discretionaryIncome = metrics.monthlyIncome - totalObligations;
    const flexibilityRatio = new Decimal(discretionaryIncome)
      .dividedBy(metrics.monthlyIncome)
      .times(100)
      .toNumber();

    let score: number;
    let category: PDIMetric['category'];

    if (flexibilityRatio >= 20) {
      score = 100;
      category = 'excellent';
    } else if (flexibilityRatio >= 10) {
      score = 70 + (flexibilityRatio - 10) * 3;
      category = 'good';
    } else if (flexibilityRatio >= 5) {
      score = 40 + (flexibilityRatio - 5) * 6;
      category = 'caution';
    } else if (flexibilityRatio >= 0) {
      score = flexibilityRatio * 8;
      category = 'risky';
    } else {
      score = 0;
      category = 'critical';
    }

    return {
      name: 'Financial Flexibility',
      value: flexibilityRatio,
      weight: this.WEIGHTS.financialFlexibility,
      score: Math.max(0, Math.min(100, score)),
      category,
      description: flexibilityRatio >= 0
        ? `${flexibilityRatio.toFixed(1)}% of income available for discretionary spending`
        : `Spending exceeds income by ${Math.abs(flexibilityRatio).toFixed(1)}%`
    };
  }

  /**
   * Calculate weighted overall score
   */
  private static calculateWeightedScore(metrics: Record<string, PDIMetric>): number {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.values(metrics).forEach(metric => {
      weightedSum += metric.score * metric.weight;
      totalWeight += metric.weight;
    });

    return weightedSum / totalWeight;
  }

  /**
   * Determine overall category
   */
  private static determineCategory(score: number): PDIScore['category'] {
    if (score >= 80) return 'healthy';
    if (score >= 60) return 'caution';
    if (score >= 40) return 'risky';
    return 'critical';
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(metrics: Record<string, PDIMetric>, overallScore: number): string[] {
    const recommendations: string[] = [];

    // DSR recommendations
    if (metrics.dsr.score < 70) {
      recommendations.push('Reduce monthly debt payments through consolidation or negotiation');
    }

    // Emergency fund recommendations
    if (metrics.liquidityBuffer.score < 60) {
      recommendations.push('Build emergency fund to cover 3-6 months of expenses');
    }

    // Debt growth recommendations
    if (metrics.debtGrowth.score < 50) {
      recommendations.push('Focus on debt reduction to prevent further financial stress');
    }

    // Payment stress recommendations
    if (metrics.paymentStress.score < 80) {
      recommendations.push('Set up automatic payments to avoid missed payments');
    }

    // Overall recommendations based on score
    if (overallScore < 40) {
      recommendations.unshift('URGENT: Consider activating DAMOCLES debt protection immediately');
      recommendations.push('Contact financial counselor or debt advisor');
    } else if (overallScore < 60) {
      recommendations.push('Monitor debt levels closely and consider preventive measures');
    }

    return recommendations;
  }

  /**
   * Identify specific risk factors
   */
  private static identifyRiskFactors(metrics: Record<string, PDIMetric>): string[] {
    const risks: string[] = [];

    if (metrics.dsr.value > 40) risks.push('High debt service ratio (>40%)');
    if (metrics.dti.value > 300) risks.push('Excessive debt burden (>300% of income)');
    if (metrics.liquidityBuffer.value < 1) risks.push('Insufficient emergency savings');
    if (metrics.debtGrowth.value > 10) risks.push('Rapidly increasing debt levels');
    if (metrics.paymentStress.value > 2) risks.push('History of missed payments');
    if (metrics.financialFlexibility.value < 0) risks.push('Spending exceeds income');

    return risks;
  }

  /**
   * Determine DAMOCLES protection level
   */
  private static determineProtectionLevel(score: number, metrics: Record<string, PDIMetric>): PDIScore['protectionLevel'] {
    // Critical situations require maximum protection
    if (score < 40 || metrics.financialFlexibility.value < 0 || metrics.dsr.value > 60) {
      return 'maximum';
    }

    // Risky situations require enhanced protection
    if (score < 60 || metrics.debtGrowth.value > 10 || metrics.paymentStress.value > 1) {
      return 'enhanced';
    }

    // Caution zone gets standard protection
    if (score < 80) {
      return 'standard';
    }

    // Healthy users just need monitoring
    return 'monitoring';
  }

  /**
   * Calculate trends (simplified for now)
   */
  private static calculateTrends(historicalData?: FinancialMetrics[]): PDIScore['trends'] {
    // In production, this would calculate actual trends from historical PDI scores
    return {
      thirtyDay: 0,
      ninetyDay: 0,
      yearOverYear: 0
    };
  }
}