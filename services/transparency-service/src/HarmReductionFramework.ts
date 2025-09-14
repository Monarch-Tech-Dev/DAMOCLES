// Brutal Honesty Framework - DAMOCLES Transparency Service
// "You might lose everything" - No lies, no extraction

export interface TransparencyMetrics {
  // The metrics that matter - tracking both harm and help
  harmCaused: {
    tokenInvestorsWhoLostMoney: number;
    totalLossesInNOK: number;
    averageLossPerInvestor: number;
    peopleWhoBoughtDuringDesperation: number;
  };
  helpProvided: {
    debtReliefRecipients: number;
    totalDebtReduced: number;
    averageReliefPerUser: number;
    illegalFeesRecovered: number;
  };
  harmToHelpRatio: number; // The ratio we must track ruthlessly
  overallNetBenefit: number; // Negative means we're causing more harm than help
}

export class HarmReductionFramework {
  private readonly BRUTAL_HONESTY = true;
  
  // Transparent messaging - no sugarcoating
  public getTransparentTokenMessage(): string {
    return `
🚨 BRUTAL HONESTY WARNING 🚨

We're using speculative token mechanics to fund legal action against predatory debt collectors.

REALITY CHECK:
• You might lose everything
• Most crypto/token projects fail
• This could be worth zero
• We cannot guarantee any returns
• The debt collectors might win

ONLY invest what you can afford to lose completely.

The debt relief services will ALWAYS be available regardless of whether you invest or not.

If you're currently facing debt collection, DO NOT invest. Use the free services instead.

Are you sure you want to continue?
    `;
  }
  
  // Harm reduction: Forbid marketing to vulnerable users
  public canUserSeeTokenOffering(userProfile: any): boolean {
    const forbiddenConditions = [
      userProfile.currentlyInDebtCollection,
      userProfile.hasActiveGDPRCases,
      userProfile.markedAsFinanciallyVulnerable,
      userProfile.lastLoginFromDebtStressIndicators,
      userProfile.signupSourceWasDebtRelief
    ];
    
    // If ANY forbidden condition is true, no token offering
    return !forbiddenConditions.some(condition => condition === true);
  }
  
  // Cooling-off period - no impulse buying
  public async enforceCoolingOffPeriod(userId: string): Promise<boolean> {
    const COOLING_OFF_HOURS = 72; // 3 days to think it over
    
    const userInterest = await this.getUserTokenInterest(userId);
    
    if (!userInterest.expressedInterest) {
      return false; // Can't buy if never expressed interest
    }
    
    const hoursSinceInterest = this.calculateHoursSince(userInterest.timestamp);
    
    if (hoursSinceInterest < COOLING_OFF_HOURS) {
      return false; // Still in cooling off period
    }
    
    // Additional check: re-confirm they understand the risks
    return await this.reconfirmRiskUnderstanding(userId);
  }
  
  // Cap individual investment amounts
  public calculateMaxInvestmentAmount(userProfile: any): number {
    const baseLimit = 10000; // NOK - reasonable amount to lose
    
    // Reduce limit based on risk factors
    let adjustedLimit = baseLimit;
    
    if (userProfile.hasLimitedIncome) adjustedLimit *= 0.3;
    if (userProfile.hasRecentDebtHistory) adjustedLimit *= 0.1;
    if (userProfile.showsFinancialStress) adjustedLimit *= 0.1;
    
    // Absolute floor and ceiling
    const minLimit = 100; // NOK
    const maxLimit = 50000; // NOK
    
    return Math.max(minLimit, Math.min(adjustedLimit, maxLimit));
  }
  
  // Track the metrics that actually matter
  public async calculateTransparencyMetrics(): Promise<TransparencyMetrics> {
    const harmCaused = await this.calculateHarmCaused();
    const helpProvided = await this.calculateHelpProvided();
    
    const harmToHelpRatio = helpProvided.totalDebtReduced > 0 
      ? harmCaused.totalLossesInNOK / helpProvided.totalDebtReduced
      : Infinity; // If no help provided, ratio is infinite (bad)
    
    const overallNetBenefit = helpProvided.totalDebtReduced - harmCaused.totalLossesInNOK;
    
    return {
      harmCaused,
      helpProvided,
      harmToHelpRatio,
      overallNetBenefit
    };
  }
  
  private async calculateHarmCaused(): Promise<TransparencyMetrics['harmCaused']> {
    // This must be tracked ruthlessly - no hiding losses
    return {
      tokenInvestorsWhoLostMoney: await this.countLosers(),
      totalLossesInNOK: await this.sumAllLosses(),
      averageLossPerInvestor: await this.calculateAverageLoss(),
      peopleWhoBoughtDuringDesperation: await this.countDesperateInvestors()
    };
  }
  
  private async calculateHelpProvided(): Promise<TransparencyMetrics['helpProvided']> {
    return {
      debtReliefRecipients: await this.countHelpedUsers(),
      totalDebtReduced: await this.sumDebtReductions(),
      averageReliefPerUser: await this.calculateAverageRelief(),
      illegalFeesRecovered: await this.sumRecoveredFees()
    };
  }
  
  // Red alert system - if we're causing more harm than help
  public async evaluateNetImpact(): Promise<{
    shouldContinueOperating: boolean;
    reason: string;
    requiredActions: string[];
  }> {
    const metrics = await this.calculateTransparencyMetrics();
    
    // If we're causing net harm, we need to stop or change
    if (metrics.overallNetBenefit < 0) {
      return {
        shouldContinueOperating: false,
        reason: `Net harm: ${Math.abs(metrics.overallNetBenefit)} NOK more harm than help`,
        requiredActions: [
          'Suspend token sales immediately',
          'Refund recent investors',
          'Focus only on free debt relief services',
          'Conduct full ethical review'
        ]
      };
    }
    
    // If harm ratio is too high, we need to adjust
    if (metrics.harmToHelpRatio > 0.5) { // More than 50% harm relative to help
      return {
        shouldContinueOperating: true,
        reason: `Harm ratio too high: ${metrics.harmToHelpRatio}`,
        requiredActions: [
          'Tighten investment restrictions',
          'Increase harm reduction measures',
          'Improve investor education',
          'Consider reducing token mechanics'
        ]
      };
    }
    
    return {
      shouldContinueOperating: true,
      reason: 'Net positive impact maintained',
      requiredActions: []
    };
  }
  
  // Public transparency report - published monthly
  public async generatePublicTransparencyReport(): Promise<string> {
    const metrics = await this.calculateTransparencyMetrics();
    const impact = await this.evaluateNetImpact();
    
    return `
# DAMOCLES Transparency Report - ${new Date().toISOString().slice(0, 7)}

## The Brutal Truth

### Harm We've Caused
- **Investors who lost money**: ${metrics.harmCaused.tokenInvestorsWhoLostMoney}
- **Total losses**: ${metrics.harmCaused.totalLossesInNOK.toLocaleString()} NOK
- **Average loss per investor**: ${metrics.harmCaused.averageLossPerInvestor.toLocaleString()} NOK
- **People who bought during desperation**: ${metrics.harmCaused.peopleWhoBoughtDuringDesperation}

### Help We've Provided  
- **People who got debt relief**: ${metrics.helpProvided.debtReliefRecipients}
- **Total debt reduced**: ${metrics.helpProvided.totalDebtReduced.toLocaleString()} NOK
- **Average relief per user**: ${metrics.helpProvided.averageReliefPerUser.toLocaleString()} NOK
- **Illegal fees recovered**: ${metrics.helpProvided.illegalFeesRecovered.toLocaleString()} NOK

### The Bottom Line
- **Harm-to-Help Ratio**: ${metrics.harmToHelpRatio.toFixed(3)}
- **Net Benefit**: ${metrics.overallNetBenefit >= 0 ? '+' : ''}${metrics.overallNetBenefit.toLocaleString()} NOK

${metrics.overallNetBenefit < 0 ? '🚨 **WE ARE CAUSING NET HARM** 🚨' : '✅ Net positive impact'}

### What We're Doing About It
${impact.requiredActions.map(action => `- ${action}`).join('\n')}

### Our Commitment
If we ever cause more harm than help, we will shut down the token system and focus purely on free debt relief services.

---
*This report is published monthly and cannot be edited or deleted.*
    `;
  }
  
  // Helper methods (would connect to real database)
  private async getUserTokenInterest(userId: string): Promise<any> {
    // TODO: Connect to real database
    return { expressedInterest: false, timestamp: new Date() };
  }
  
  private calculateHoursSince(timestamp: Date): number {
    return (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
  }
  
  private async reconfirmRiskUnderstanding(userId: string): Promise<boolean> {
    // TODO: Show risk confirmation dialog again
    return false; // Default to no
  }
  
  private async countLosers(): Promise<number> {
    // TODO: Count investors whose tokens are worth less than purchase price
    return 0;
  }
  
  private async sumAllLosses(): Promise<number> {
    // TODO: Sum total NOK lost by investors
    return 0;
  }
  
  private async calculateAverageLoss(): Promise<number> {
    // TODO: Calculate average loss per losing investor
    return 0;
  }
  
  private async countDesperateInvestors(): Promise<number> {
    // TODO: Count people who bought tokens while in debt collection
    return 0;
  }
  
  private async countHelpedUsers(): Promise<number> {
    // TODO: Count users who received actual debt relief
    return 0;
  }
  
  private async sumDebtReductions(): Promise<number> {
    // TODO: Sum total debt reduced across all users
    return 0;
  }
  
  private async calculateAverageRelief(): Promise<number> {
    // TODO: Calculate average debt relief per helped user
    return 0;
  }
  
  private async sumRecoveredFees(): Promise<number> {
    // TODO: Sum total illegal fees recovered
    return 0;
  }
}

export default HarmReductionFramework;