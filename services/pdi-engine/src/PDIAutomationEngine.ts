import { PDIScore, FinancialMetrics } from './PDICalculationEngine';

export interface AutomationAction {
  type: 'IMMEDIATE_PROTECTION' | 'PROACTIVE_MONITORING' | 'GROWTH_INTERVENTION' | 'PAYMENT_RELIEF' | 'EARLY_WARNING';
  priority: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  triggeredBy: string;
  steps: AutomationStep[];
  expectedOutcome?: string;
  swordReward?: number;
}

export interface AutomationStep {
  action: string;
  parameters?: Record<string, any>;
  timeframe?: string;
  description?: string;
}

export interface AutomationResult {
  userId: string;
  pdiScore: number;
  actionsExecuted: AutomationAction[];
  swordAwarded: number;
  nextCheckIn: Date;
  protectionLevel: string;
  alertsSent: string[];
  gdprRequestsGenerated: number;
}

export interface TriggerContext {
  previousPDI?: PDIScore;
  userHistory: FinancialMetrics[];
  userProfile: {
    age?: number;
    dependents?: number;
    region?: string;
    riskTolerance?: 'low' | 'medium' | 'high';
  };
  externalFactors: {
    economicConditions?: 'recession' | 'growth' | 'stable';
    seasonalFactors?: boolean;
    regionalCrisis?: boolean;
  };
}

export class PDIAutomationEngine {
  private static readonly SWORD_MULTIPLIERS = {
    critical: 3.0,
    risky: 2.0,
    caution: 1.5,
    healthy: 1.0
  };

  /**
   * Main automation engine - processes PDI score and triggers appropriate actions
   */
  public static async processNewPDIScore(
    userId: string,
    pdiData: PDIScore,
    context: TriggerContext
  ): Promise<AutomationResult> {
    const actions: AutomationAction[] = [];
    let totalSwordReward = 0;

    // Critical Score Automation (PDI < 40)
    if (pdiData.overallScore < 40) {
      const criticalActions = this.handleCriticalPDI(pdiData, context);
      actions.push(...criticalActions);
      totalSwordReward += 1000 * this.SWORD_MULTIPLIERS.critical;
    }

    // Risky Score Monitoring (PDI 40-60)
    else if (pdiData.overallScore < 60) {
      const riskyActions = this.handleRiskyPDI(pdiData, context);
      actions.push(...riskyActions);
      totalSwordReward += 500 * this.SWORD_MULTIPLIERS.risky;
    }

    // Caution Zone Monitoring (PDI 60-80)
    else if (pdiData.overallScore < 80) {
      const cautionActions = this.handleCautionPDI(pdiData, context);
      actions.push(...cautionActions);
      totalSwordReward += 200 * this.SWORD_MULTIPLIERS.caution;
    }

    // Healthy Zone Maintenance (PDI 80+)
    else {
      const maintenanceActions = this.handleHealthyPDI(pdiData, context);
      actions.push(...maintenanceActions);
      totalSwordReward += 100 * this.SWORD_MULTIPLIERS.healthy;
    }

    // Metric-specific triggers
    const metricActions = this.handleSpecificMetricTriggers(pdiData, context);
    actions.push(...metricActions);

    // Trend-based triggers
    if (context.previousPDI) {
      const trendActions = this.handleTrendTriggers(pdiData, context.previousPDI);
      actions.push(...trendActions);
    }

    // Regional crisis adjustments
    if (context.externalFactors.regionalCrisis) {
      totalSwordReward *= 2; // Double rewards during regional crisis
      actions.push(this.createRegionalCrisisAction());
    }

    return {
      userId,
      pdiScore: pdiData.overallScore,
      actionsExecuted: actions,
      swordAwarded: Math.round(totalSwordReward),
      nextCheckIn: this.calculateNextCheckIn(pdiData.overallScore),
      protectionLevel: pdiData.protectionLevel,
      alertsSent: this.extractAlerts(actions),
      gdprRequestsGenerated: this.countGDPRRequests(actions)
    };
  }

  /**
   * Handle critical PDI scores (< 40)
   */
  private static handleCriticalPDI(pdiData: PDIScore, context: TriggerContext): AutomationAction[] {
    const actions: AutomationAction[] = [];

    // Immediate protection activation
    actions.push({
      type: 'IMMEDIATE_PROTECTION',
      priority: 'CRITICAL',
      triggeredBy: `Critical PDI score: ${pdiData.overallScore}`,
      steps: [
        {
          action: 'activate_maximum_protection',
          description: 'Enable highest level of DAMOCLES protection'
        },
        {
          action: 'generate_emergency_gdpr_batch',
          parameters: {
            templates: ['fee_challenge', 'interest_audit', 'payment_history', 'debt_validation'],
            urgency: 'immediate'
          },
          timeframe: '24_hours',
          description: 'Generate comprehensive GDPR requests to all creditors'
        },
        {
          action: 'notify_legal_team',
          parameters: {
            message: 'Critical PDI user requires immediate review',
            escalation: 'priority_queue'
          },
          timeframe: '4_hours'
        },
        {
          action: 'schedule_emergency_callback',
          parameters: { timeframe: '24_hours' },
          description: 'Schedule personal consultation within 24 hours'
        }
      ],
      expectedOutcome: 'Immediate debt relief and legal protection',
      swordReward: 1000
    });

    // Specific debt service ratio intervention
    if (pdiData.metrics.dsr.value > 60) {
      actions.push({
        type: 'PAYMENT_RELIEF',
        priority: 'URGENT',
        triggeredBy: `Extreme debt service ratio: ${pdiData.metrics.dsr.value}%`,
        steps: [
          {
            action: 'generate_payment_plan_request',
            description: 'Request extended payment plans from all creditors'
          },
          {
            action: 'request_interest_freeze',
            description: 'Request temporary interest rate freezes'
          },
          {
            action: 'notify_creditors_of_hardship',
            parameters: { urgency: 'immediate' },
            description: 'Formal hardship notifications to creditors'
          },
          {
            action: 'explore_debt_consolidation',
            description: 'Analyze consolidation opportunities'
          }
        ],
        expectedOutcome: 'Reduced monthly payment obligations'
      });
    }

    // Cash flow crisis intervention
    if (pdiData.metrics.financialFlexibility.value < 0) {
      actions.push({
        type: 'IMMEDIATE_PROTECTION',
        priority: 'CRITICAL',
        triggeredBy: 'Negative cash flow detected',
        steps: [
          {
            action: 'emergency_budget_analysis',
            description: 'Immediate expense reduction analysis'
          },
          {
            action: 'creditor_communication_takeover',
            description: 'DAMOCLES assumes creditor communications'
          },
          {
            action: 'explore_emergency_assistance',
            description: 'Connect with government assistance programs'
          }
        ]
      });
    }

    return actions;
  }

  /**
   * Handle risky PDI scores (40-60)
   */
  private static handleRiskyPDI(pdiData: PDIScore, context: TriggerContext): AutomationAction[] {
    const actions: AutomationAction[] = [];

    // Enhanced monitoring
    actions.push({
      type: 'PROACTIVE_MONITORING',
      priority: 'HIGH',
      triggeredBy: `Risky PDI score: ${pdiData.overallScore}`,
      steps: [
        {
          action: 'enable_enhanced_monitoring',
          parameters: { frequency: 'weekly' },
          description: 'Weekly PDI recalculations'
        },
        {
          action: 'analyze_debt_patterns',
          description: 'Deep analysis of debt composition and terms'
        },
        {
          action: 'prepare_gdpr_templates',
          parameters: { creditors: 'all_active' },
          description: 'Pre-generate GDPR requests for rapid deployment'
        },
        {
          action: 'early_warning_setup',
          description: 'Set up automated alerts for metric deterioration'
        }
      ],
      swordReward: 500
    });

    // Debt growth intervention
    if (pdiData.metrics.debtGrowth.value > 5) {
      actions.push({
        type: 'GROWTH_INTERVENTION',
        priority: 'MEDIUM',
        triggeredBy: `Debt growing at ${pdiData.metrics.debtGrowth.value}% annually`,
        steps: [
          {
            action: 'debt_consolidation_analysis',
            description: 'Analyze consolidation opportunities'
          },
          {
            action: 'creditor_negotiation_prep',
            description: 'Prepare negotiation strategy for better terms'
          },
          {
            action: 'payment_optimization',
            description: 'Optimize payment timing and amounts'
          }
        ]
      });
    }

    // Emergency fund building
    if (pdiData.metrics.liquidityBuffer.value < 1) {
      actions.push({
        type: 'EARLY_WARNING',
        priority: 'MEDIUM',
        triggeredBy: 'Insufficient emergency savings',
        steps: [
          {
            action: 'emergency_fund_plan',
            description: 'Create automated savings plan'
          },
          {
            action: 'expense_optimization',
            description: 'Identify expense reduction opportunities'
          }
        ]
      });
    }

    return actions;
  }

  /**
   * Handle caution PDI scores (60-80)
   */
  private static handleCautionPDI(pdiData: PDIScore, context: TriggerContext): AutomationAction[] {
    const actions: AutomationAction[] = [];

    // Preventive monitoring
    actions.push({
      type: 'PROACTIVE_MONITORING',
      priority: 'MEDIUM',
      triggeredBy: `Caution zone PDI: ${pdiData.overallScore}`,
      steps: [
        {
          action: 'monthly_pdi_tracking',
          description: 'Regular monthly PDI assessments'
        },
        {
          action: 'debt_optimization_review',
          description: 'Review debt terms for optimization opportunities'
        },
        {
          action: 'financial_education',
          parameters: { topics: ['debt_management', 'budgeting'] },
          description: 'Provide targeted financial education'
        }
      ],
      swordReward: 200
    });

    return actions;
  }

  /**
   * Handle healthy PDI scores (80+)
   */
  private static handleHealthyPDI(pdiData: PDIScore, context: TriggerContext): AutomationAction[] {
    const actions: AutomationAction[] = [];

    // Maintenance monitoring
    actions.push({
      type: 'PROACTIVE_MONITORING',
      priority: 'LOW',
      triggeredBy: `Healthy PDI: ${pdiData.overallScore}`,
      steps: [
        {
          action: 'quarterly_health_check',
          description: 'Quarterly PDI assessments'
        },
        {
          action: 'financial_optimization',
          description: 'Optimize for wealth building and investment'
        },
        {
          action: 'reward_good_behavior',
          description: 'Provide positive reinforcement and rewards'
        }
      ],
      swordReward: 100
    });

    return actions;
  }

  /**
   * Handle specific metric triggers
   */
  private static handleSpecificMetricTriggers(pdiData: PDIScore, context: TriggerContext): AutomationAction[] {
    const actions: AutomationAction[] = [];

    // Missed payments trigger
    if (pdiData.metrics.paymentStress.value > 2) {
      actions.push({
        type: 'PAYMENT_RELIEF',
        priority: 'HIGH',
        triggeredBy: `${pdiData.metrics.paymentStress.value} missed payments detected`,
        steps: [
          {
            action: 'payment_automation_setup',
            description: 'Set up automatic payment systems'
          },
          {
            action: 'payment_scheduling_optimization',
            description: 'Optimize payment dates with income schedule'
          },
          {
            action: 'creditor_payment_plan_negotiation',
            description: 'Negotiate realistic payment plans'
          }
        ]
      });
    }

    // High DTI trigger
    if (pdiData.metrics.dti.value > 400) {
      actions.push({
        type: 'IMMEDIATE_PROTECTION',
        priority: 'URGENT',
        triggeredBy: `Extreme debt-to-income ratio: ${pdiData.metrics.dti.value}%`,
        steps: [
          {
            action: 'debt_restructuring_analysis',
            description: 'Analyze options for debt restructuring'
          },
          {
            action: 'insolvency_consultation',
            description: 'Provide consultation on formal insolvency options'
          }
        ]
      });
    }

    return actions;
  }

  /**
   * Handle trend-based triggers
   */
  private static handleTrendTriggers(currentPDI: PDIScore, previousPDI: PDIScore): AutomationAction[] {
    const actions: AutomationAction[] = [];
    const scoreDifference = currentPDI.overallScore - previousPDI.overallScore;

    // Rapid deterioration
    if (scoreDifference < -10) {
      actions.push({
        type: 'EARLY_WARNING',
        priority: 'HIGH',
        triggeredBy: `PDI dropped by ${Math.abs(scoreDifference)} points`,
        steps: [
          {
            action: 'trend_analysis',
            description: 'Analyze factors causing PDI deterioration'
          },
          {
            action: 'early_intervention',
            description: 'Implement preventive measures'
          }
        ]
      });
    }

    // Improvement rewards
    if (scoreDifference > 5) {
      actions.push({
        type: 'PROACTIVE_MONITORING',
        priority: 'LOW',
        triggeredBy: `PDI improved by ${scoreDifference} points`,
        steps: [
          {
            action: 'reward_improvement',
            parameters: { bonus_sword: Math.round(scoreDifference * 10) },
            description: 'Reward financial improvement'
          }
        ]
      });
    }

    return actions;
  }

  /**
   * Create regional crisis action
   */
  private static createRegionalCrisisAction(): AutomationAction {
    return {
      type: 'IMMEDIATE_PROTECTION',
      priority: 'HIGH',
      triggeredBy: 'Regional debt crisis detected',
      steps: [
        {
          action: 'regional_crisis_protection',
          description: 'Apply enhanced protection during regional crisis'
        },
        {
          action: 'collective_action_preparation',
          description: 'Prepare for potential collective legal action'
        }
      ],
      swordReward: 500
    };
  }

  /**
   * Calculate next check-in date based on PDI score
   */
  private static calculateNextCheckIn(pdiScore: number): Date {
    const now = new Date();
    let daysUntilNext: number;

    if (pdiScore < 40) {
      daysUntilNext = 7; // Weekly for critical
    } else if (pdiScore < 60) {
      daysUntilNext = 14; // Bi-weekly for risky
    } else if (pdiScore < 80) {
      daysUntilNext = 30; // Monthly for caution
    } else {
      daysUntilNext = 90; // Quarterly for healthy
    }

    return new Date(now.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
  }

  /**
   * Extract alert information from actions
   */
  private static extractAlerts(actions: AutomationAction[]): string[] {
    return actions
      .filter(action => action.priority === 'CRITICAL' || action.priority === 'URGENT')
      .map(action => action.triggeredBy);
  }

  /**
   * Count GDPR requests generated
   */
  private static countGDPRRequests(actions: AutomationAction[]): number {
    return actions.reduce((count, action) => {
      const gdprSteps = action.steps.filter(step =>
        step.action.includes('gdpr') || step.action.includes('GDPR')
      );
      return count + gdprSteps.length;
    }, 0);
  }

  /**
   * Get recommended protection level based on PDI score and context
   */
  public static getRecommendedProtectionLevel(
    pdiScore: number,
    riskFactors: string[],
    context: TriggerContext
  ): 'maximum' | 'enhanced' | 'standard' | 'monitoring' {
    // Critical situations always get maximum protection
    if (pdiScore < 40 || riskFactors.includes('Spending exceeds income')) {
      return 'maximum';
    }

    // Regional crisis escalates protection level
    if (context.externalFactors.regionalCrisis && pdiScore < 70) {
      return 'enhanced';
    }

    // Age-based adjustments (protect vulnerable populations)
    if (context.userProfile.age && (context.userProfile.age > 65 || context.userProfile.age < 25) && pdiScore < 70) {
      return 'enhanced';
    }

    // Standard scoring
    if (pdiScore < 60) return 'enhanced';
    if (pdiScore < 80) return 'standard';
    return 'monitoring';
  }
}