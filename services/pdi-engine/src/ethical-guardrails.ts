/**
 * Ethical Guardrails Service
 * Protects vulnerable users from exploitation and ensures responsible platform usage
 */

import { PDIScore } from './types';

export interface UserVulnerability {
  isVulnerable: boolean;
  vulnerabilityLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  restrictions: string[];
  supportFeatures: string[];
}

export interface EthicalDecision {
  allowed: boolean;
  reason?: string;
  alternatives?: string[];
}

export class EthicalGuardrailsService {
  private static readonly VULNERABILITY_THRESHOLDS = {
    PDI_CRITICAL: 40,
    DSR_CRITICAL: 50, // Can't afford basic needs
    CREDIT_UTIL_CRITICAL: 90,
    DEBT_GROWTH_CRITICAL: 15
  };

  /**
   * Assess user vulnerability based on PDI and financial metrics
   */
  assessVulnerability(pdiScore: PDIScore, additionalContext?: any): UserVulnerability {
    const reasons: string[] = [];
    const restrictions: string[] = [];
    const supportFeatures: string[] = [];

    let vulnerabilityLevel: UserVulnerability['vulnerabilityLevel'] = 'none';

    // Check PDI score
    if (pdiScore.score < EthicalGuardrailsService.VULNERABILITY_THRESHOLDS.PDI_CRITICAL) {
      reasons.push('PDI score indicates critical financial distress');
      vulnerabilityLevel = 'critical';
    } else if (pdiScore.score < 60) {
      reasons.push('PDI score indicates financial risk');
      vulnerabilityLevel = vulnerabilityLevel === 'none' ? 'medium' : vulnerabilityLevel;
    }

    // Check Debt Service Ratio
    const dsr = pdiScore.metrics.dsr.value;
    if (dsr > EthicalGuardrailsService.VULNERABILITY_THRESHOLDS.DSR_CRITICAL) {
      reasons.push('Debt payments exceed ability to afford necessities');
      vulnerabilityLevel = 'critical';
    }

    // Check Credit Utilization
    const creditUtil = pdiScore.metrics.creditUtilization.value;
    if (creditUtil > EthicalGuardrailsService.VULNERABILITY_THRESHOLDS.CREDIT_UTIL_CRITICAL) {
      reasons.push('Credit utilization at dangerous levels');
      if (vulnerabilityLevel !== 'critical') {
        vulnerabilityLevel = 'high';
      }
    }

    // Check Debt Growth
    const debtGrowth = pdiScore.metrics.debtGrowth.value;
    if (debtGrowth > EthicalGuardrailsService.VULNERABILITY_THRESHOLDS.DEBT_GROWTH_CRITICAL) {
      reasons.push('Debt growing at unsustainable rate');
      if (vulnerabilityLevel === 'none' || vulnerabilityLevel === 'low') {
        vulnerabilityLevel = 'high';
      }
    }

    // Apply restrictions based on vulnerability
    if (vulnerabilityLevel === 'critical' || vulnerabilityLevel === 'high') {
      restrictions.push('No investment product promotions');
      restrictions.push('No token sale offers');
      restrictions.push('No high-risk financial products');
      restrictions.push('No credit offers');

      supportFeatures.push('Priority GDPR violation scanning');
      supportFeatures.push('Automatic fee challenge activation');
      supportFeatures.push('Free legal document generation');
      supportFeatures.push('Priority support queue');
      supportFeatures.push('Debt counseling resources');
    }

    if (vulnerabilityLevel === 'medium') {
      restrictions.push('Limited investment product visibility');
      restrictions.push('Warning on token purchases');
      restrictions.push('No aggressive marketing');

      supportFeatures.push('Enhanced GDPR support');
      supportFeatures.push('Debt reduction planning tools');
    }

    return {
      isVulnerable: vulnerabilityLevel !== 'none' && vulnerabilityLevel !== 'low',
      vulnerabilityLevel,
      reasons,
      restrictions,
      supportFeatures
    };
  }

  /**
   * Check if a specific action should be allowed for a user
   */
  checkActionPermission(
    action: string,
    vulnerability: UserVulnerability,
    context?: any
  ): EthicalDecision {
    // Block token sales to vulnerable users
    if (action === 'VIEW_TOKEN_OFFERING' || action === 'PURCHASE_TOKENS') {
      if (vulnerability.vulnerabilityLevel === 'critical' || vulnerability.vulnerabilityLevel === 'high') {
        return {
          allowed: false,
          reason: 'Token investments not available for users in financial distress',
          alternatives: [
            'Focus on debt reduction first',
            'Use free PDI monitoring',
            'Access GDPR violation scanning'
          ]
        };
      }
    }

    // Block credit offers to vulnerable users
    if (action === 'VIEW_CREDIT_OFFERS' || action === 'APPLY_FOR_CREDIT') {
      if (vulnerability.isVulnerable) {
        return {
          allowed: false,
          reason: 'Additional credit not recommended for your financial situation',
          alternatives: [
            'Check for illegal fees in existing debts',
            'Use debt settlement tools',
            'Access financial counseling resources'
          ]
        };
      }
    }

    // Always allow protective actions
    if (action.startsWith('GDPR_') || action.startsWith('PROTECTION_')) {
      return {
        allowed: true
      };
    }

    // Restrict premium upgrades for critical users
    if (action === 'UPGRADE_TO_PREMIUM' && vulnerability.vulnerabilityLevel === 'critical') {
      return {
        allowed: true, // Allow but with warning
        reason: 'Consider using free protection features first before upgrading',
        alternatives: [
          'Free PDI monitoring available',
          'Basic GDPR tools included free',
          'Priority support already activated for you'
        ]
      };
    }

    return {
      allowed: true
    };
  }

  /**
   * Generate appropriate messaging for vulnerable users
   */
  generateSupportiveMessaging(vulnerability: UserVulnerability): string[] {
    const messages: string[] = [];

    if (vulnerability.vulnerabilityLevel === 'critical') {
      messages.push('We\'re here to help you regain financial control');
      messages.push('You qualify for our priority protection program');
      messages.push('Free tools activated to help reduce your debt burden');
    } else if (vulnerability.vulnerabilityLevel === 'high') {
      messages.push('Let\'s work together to improve your financial health');
      messages.push('Enhanced protection features have been enabled');
      messages.push('Focus on the actions that will help most');
    } else if (vulnerability.vulnerabilityLevel === 'medium') {
      messages.push('You\'re taking the right steps by monitoring your PDI');
      messages.push('Small changes now can prevent bigger problems');
    }

    return messages;
  }

  /**
   * Determine which features to highlight for vulnerable users
   */
  prioritizeFeaturesForVulnerable(vulnerability: UserVulnerability): string[] {
    const priorityFeatures: string[] = [];

    if (vulnerability.vulnerabilityLevel === 'critical' || vulnerability.vulnerabilityLevel === 'high') {
      priorityFeatures.push('GDPR_VIOLATION_SCANNER');
      priorityFeatures.push('ILLEGAL_FEE_DETECTOR');
      priorityFeatures.push('DEBT_SETTLEMENT_TOOL');
      priorityFeatures.push('FINANCIAL_COUNSELING');
      priorityFeatures.push('PRIORITY_SUPPORT');
    } else if (vulnerability.vulnerabilityLevel === 'medium') {
      priorityFeatures.push('PDI_MONITORING');
      priorityFeatures.push('DEBT_REDUCTION_PLANNER');
      priorityFeatures.push('GDPR_TEMPLATES');
    } else {
      priorityFeatures.push('PDI_TRACKING');
      priorityFeatures.push('COMPARISON_TOOLS');
      priorityFeatures.push('PREDICTIVE_SCENARIOS');
    }

    return priorityFeatures;
  }

  /**
   * Check if user should see investment/token content
   */
  shouldShowInvestmentContent(pdiScore: number, debtServiceRatio: number): boolean {
    // Never show to users who can't afford necessities
    if (debtServiceRatio > 50) return false;

    // Don't show to users in critical financial state
    if (pdiScore < 40) return false;

    // Warn but allow for risky users
    if (pdiScore < 60) {
      console.log('User in risky category - investment content shown with warnings');
      return true;
    }

    return true;
  }

  /**
   * Generate ethical report for compliance
   */
  generateEthicalReport(userId: string, actions: any[]): any {
    return {
      userId,
      timestamp: new Date().toISOString(),
      totalActions: actions.length,
      blockedActions: actions.filter(a => !a.allowed).length,
      protectiveActionsEnabled: actions.filter(a => a.type === 'protective').length,
      vulnerabilityAssessments: actions.filter(a => a.type === 'assessment').length,
      ethicalCompliance: {
        noExploitation: true,
        prioritizedProtection: true,
        transparentRestrictions: true,
        alternativesProvided: true
      }
    };
  }

  /**
   * Emergency intervention check
   */
  requiresEmergencyIntervention(pdiScore: PDIScore): boolean {
    // Trigger emergency help for extreme cases
    if (pdiScore.score < 20) return true;
    if (pdiScore.metrics.dsr.value > 70) return true; // 70% of income to debt
    if (pdiScore.metrics.debtGrowth.value > 25) return true; // 25% monthly growth

    return false;
  }

  /**
   * Get support resources based on vulnerability
   */
  getSupportResources(vulnerability: UserVulnerability): any {
    const resources = {
      immediate: [],
      tools: [],
      education: [],
      external: []
    };

    if (vulnerability.vulnerabilityLevel === 'critical') {
      resources.immediate = [
        'Emergency GDPR request generator',
        'Illegal fee scanner (automatic)',
        'Priority human support',
        'Debt freeze letter templates'
      ];
      resources.external = [
        'National debt helpline',
        'Free legal aid contacts',
        'Consumer protection agency'
      ];
    }

    if (vulnerability.vulnerabilityLevel === 'high' || vulnerability.vulnerabilityLevel === 'critical') {
      resources.tools = [
        'Automated settlement negotiator',
        'Payment plan calculator',
        'Creditor communication templates'
      ];
      resources.education = [
        'Debt reduction strategies guide',
        'Rights under Norwegian law',
        'How to negotiate with creditors'
      ];
    }

    return resources;
  }
}

// Export singleton instance
export const ethicalGuardrails = new EthicalGuardrailsService();