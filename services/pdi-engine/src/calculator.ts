import { Decimal } from 'decimal.js';
import { PDIInputs, PDIMetrics, PDIScore, MetricResult } from './types';

export class PDICalculator {
  private static readonly WEIGHTS = {
    dti: 0.25,
    dsr: 0.25,
    creditUtilization: 0.20,
    debtToAssets: 0.20,
    debtGrowth: 0.10
  };

  private static readonly CALCULATION_VERSION = '1.0.0';

  /**
   * Calculate PDI score from financial inputs
   */
  calculate(inputs: PDIInputs): PDIScore {
    this.validateInputs(inputs);

    const metrics = this.calculateMetrics(inputs);
    const totalScore = this.calculateTotalScore(metrics);
    const category = this.determineCategory(totalScore);
    const recommendations = this.generateRecommendations(metrics, category);
    const damoclesActionRequired = this.checkDamoclesTrigger(totalScore, metrics);

    return {
      score: totalScore,
      category,
      metrics,
      recommendations,
      damoclesActionRequired,
      calculatedAt: new Date()
    };
  }

  private validateInputs(inputs: PDIInputs): void {
    const requiredFields = [
      'monthlyIncome', 'totalDebt', 'monthlyDebtPayments',
      'availableCredit', 'creditUsed', 'totalAssets'
    ];

    for (const field of requiredFields) {
      if (typeof inputs[field as keyof PDIInputs] !== 'number' || inputs[field as keyof PDIInputs] < 0) {
        throw new Error(`Invalid input: ${field} must be a non-negative number`);
      }
    }

    if (inputs.monthlyIncome <= 0) {
      throw new Error('Monthly income must be greater than 0');
    }

    if (inputs.creditUsed > inputs.availableCredit) {
      throw new Error('Credit used cannot exceed available credit');
    }
  }

  private calculateMetrics(inputs: PDIInputs): PDIMetrics {
    return {
      dti: this.calculateDTI(inputs),
      dsr: this.calculateDSR(inputs),
      creditUtilization: this.calculateCreditUtilization(inputs),
      debtToAssets: this.calculateDebtToAssets(inputs),
      debtGrowth: this.calculateDebtGrowth(inputs)
    };
  }

  private calculateDTI(inputs: PDIInputs): MetricResult {
    const annualIncome = inputs.monthlyIncome * 12;
    const ratio = new Decimal(inputs.totalDebt)
      .dividedBy(annualIncome)
      .times(100)
      .toNumber();

    let score: number;
    let category: 'healthy' | 'caution' | 'risky' | 'critical';

    if (ratio < 35) {
      score = 20;
      category = 'healthy';
    } else if (ratio < 50) {
      score = Math.max(15, 20 - ((ratio - 35) / 15) * 5);
      category = 'caution';
    } else if (ratio < 75) {
      score = Math.max(5, 15 - ((ratio - 50) / 25) * 10);
      category = 'risky';
    } else {
      score = Math.max(0, 5 - ((ratio - 75) / 25) * 5);
      category = 'critical';
    }

    return { value: Math.round(ratio * 100) / 100, score: Math.round(score), category };
  }

  private calculateDSR(inputs: PDIInputs): MetricResult {
    const ratio = new Decimal(inputs.monthlyDebtPayments)
      .dividedBy(inputs.monthlyIncome)
      .times(100)
      .toNumber();

    let score: number;
    let category: 'healthy' | 'caution' | 'risky' | 'critical';

    if (ratio < 30) {
      score = 20;
      category = 'healthy';
    } else if (ratio < 40) {
      score = Math.max(15, 20 - ((ratio - 30) / 10) * 5);
      category = 'caution';
    } else if (ratio < 50) {
      score = Math.max(5, 15 - ((ratio - 40) / 10) * 10);
      category = 'risky';
    } else {
      score = Math.max(0, 5 - ((ratio - 50) / 10) * 5);
      category = 'critical';
    }

    return { value: Math.round(ratio * 100) / 100, score: Math.round(score), category };
  }

  private calculateCreditUtilization(inputs: PDIInputs): MetricResult {
    if (inputs.availableCredit === 0) {
      return { value: 0, score: 20, category: 'healthy' };
    }

    const ratio = new Decimal(inputs.creditUsed)
      .dividedBy(inputs.availableCredit)
      .times(100)
      .toNumber();

    let score: number;
    let category: 'healthy' | 'caution' | 'risky' | 'critical';

    if (ratio < 30) {
      score = 20;
      category = 'healthy';
    } else if (ratio < 60) {
      score = Math.max(15, 20 - ((ratio - 30) / 30) * 5);
      category = 'caution';
    } else if (ratio < 90) {
      score = Math.max(5, 15 - ((ratio - 60) / 30) * 10);
      category = 'risky';
    } else {
      score = Math.max(0, 5 - ((ratio - 90) / 10) * 5);
      category = 'critical';
    }

    return { value: Math.round(ratio * 100) / 100, score: Math.round(score), category };
  }

  private calculateDebtToAssets(inputs: PDIInputs): MetricResult {
    if (inputs.totalAssets === 0) {
      return { value: 100, score: 0, category: 'critical' };
    }

    const ratio = new Decimal(inputs.totalDebt)
      .dividedBy(inputs.totalAssets)
      .times(100)
      .toNumber();

    let score: number;
    let category: 'healthy' | 'caution' | 'risky' | 'critical';

    if (ratio < 50) {
      score = 20;
      category = 'healthy';
    } else if (ratio < 100) {
      score = Math.max(5, 20 - ((ratio - 50) / 50) * 15);
      category = 'caution';
    } else if (ratio < 150) {
      score = Math.max(2, 5 - ((ratio - 100) / 50) * 3);
      category = 'risky';
    } else {
      score = 0;
      category = 'critical';
    }

    return { value: Math.round(ratio * 100) / 100, score: Math.round(score), category };
  }

  private calculateDebtGrowth(inputs: PDIInputs): MetricResult {
    if (!inputs.previousMonthDebt || inputs.previousMonthDebt === 0) {
      return { value: 0, score: 20, category: 'healthy' };
    }

    const growth = new Decimal(inputs.totalDebt)
      .minus(inputs.previousMonthDebt)
      .dividedBy(inputs.previousMonthDebt)
      .times(100)
      .toNumber();

    let score: number;
    let category: 'healthy' | 'caution' | 'risky' | 'critical';

    if (growth <= 0) {
      score = 20;
      category = 'healthy';
    } else if (growth < 5) {
      score = 15;
      category = 'caution';
    } else if (growth < 10) {
      score = Math.max(5, 15 - ((growth - 5) / 5) * 10);
      category = 'risky';
    } else {
      score = Math.max(0, 5 - ((growth - 10) / 10) * 5);
      category = 'critical';
    }

    return { value: Math.round(growth * 100) / 100, score: Math.round(score), category };
  }

  private calculateTotalScore(metrics: PDIMetrics): number {
    const weightedScore =
      metrics.dti.score * PDICalculator.WEIGHTS.dti +
      metrics.dsr.score * PDICalculator.WEIGHTS.dsr +
      metrics.creditUtilization.score * PDICalculator.WEIGHTS.creditUtilization +
      metrics.debtToAssets.score * PDICalculator.WEIGHTS.debtToAssets +
      metrics.debtGrowth.score * PDICalculator.WEIGHTS.debtGrowth;

    return Math.round(weightedScore * 5); // Scale to 0-100
  }

  private determineCategory(score: number): 'healthy' | 'caution' | 'risky' | 'critical' {
    if (score >= 80) return 'healthy';
    if (score >= 60) return 'caution';
    if (score >= 40) return 'risky';
    return 'critical';
  }

  private generateRecommendations(metrics: PDIMetrics, category: string): string[] {
    const recommendations: string[] = [];

    // Critical metrics get priority recommendations
    const criticalMetrics = Object.entries(metrics)
      .filter(([_, metric]) => metric.category === 'critical')
      .sort((a, b) => a[1].score - b[1].score);

    for (const [metricName, metric] of criticalMetrics) {
      switch (metricName) {
        case 'dti':
          recommendations.push('URGENT: Your debt-to-income ratio is critically high. Consider debt consolidation or negotiation.');
          break;
        case 'dsr':
          recommendations.push('CRITICAL: Monthly debt payments exceed safe limits. Seek immediate financial counseling.');
          break;
        case 'creditUtilization':
          recommendations.push('WARNING: Credit utilization dangerously high. Stop using credit cards immediately.');
          break;
        case 'debtToAssets':
          recommendations.push('ALERT: Your debts exceed your assets. Consider bankruptcy protection options.');
          break;
        case 'debtGrowth':
          recommendations.push('DANGER: Debt growing rapidly. Freeze all non-essential spending immediately.');
          break;
      }
    }

    // Add moderate recommendations for risky metrics
    const riskyMetrics = Object.entries(metrics)
      .filter(([_, metric]) => metric.category === 'risky');

    for (const [metricName, _] of riskyMetrics) {
      switch (metricName) {
        case 'dti':
          recommendations.push('Consider reducing debt through aggressive payments or consolidation.');
          break;
        case 'dsr':
          recommendations.push('Your monthly payments are high. Look for refinancing opportunities.');
          break;
        case 'creditUtilization':
          recommendations.push('Credit usage is high. Pay down balances to improve your score.');
          break;
        case 'debtToAssets':
          recommendations.push('Work on building assets or reducing debt to improve your ratio.');
          break;
        case 'debtGrowth':
          recommendations.push('Debt is increasing. Create a budget to control spending.');
          break;
      }
    }

    // Add general recommendations based on category
    if (category === 'critical' && recommendations.length === 0) {
      recommendations.push('Your PDI score indicates severe financial distress. DAMOCLES protection protocols activated.');
    } else if (category === 'healthy' && recommendations.length === 0) {
      recommendations.push('Excellent financial health! Continue your current debt management strategy.');
    } else if (category === 'caution' && recommendations.length === 0) {
      recommendations.push('Good financial position with room for improvement. Monitor your metrics regularly.');
    }

    return recommendations;
  }

  private checkDamoclesTrigger(score: number, metrics: PDIMetrics): boolean {
    // Trigger DAMOCLES if:
    // 1. Score is below 40 (critical)
    // 2. Any two metrics are critical
    // 3. DSR is above 50% (can't afford basic needs)
    // 4. Debt-to-assets ratio above 150% (insolvent)

    if (score < 40) return true;

    const criticalCount = Object.values(metrics)
      .filter(m => m.category === 'critical').length;
    if (criticalCount >= 2) return true;

    if (metrics.dsr.value > 50) return true;

    if (metrics.debtToAssets.value > 150) return true;

    return false;
  }

  /**
   * Get calculation version for tracking schema changes
   */
  static getVersion(): string {
    return PDICalculator.CALCULATION_VERSION;
  }
}