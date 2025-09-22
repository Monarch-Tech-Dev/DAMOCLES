import { PDIScore } from './types';

export interface RewardCalculation {
  baseReward: number;
  improvementBonus: number;
  categoryBonus: number;
  achievementBonus: number;
  totalReward: number;
  reasonBreakdown: string[];
}

export class PDIRewardCalculator {
  /**
   * Calculate SWORD token rewards for PDI tracking and improvements
   */
  static calculateRewards(
    currentScore: number,
    previousScore?: number,
    category?: string,
    firstTimeCalculation: boolean = false
  ): RewardCalculation {
    let baseReward = 10; // Base reward for calculating PDI
    let improvementBonus = 0;
    let categoryBonus = 0;
    let achievementBonus = 0;
    const reasonBreakdown: string[] = [];

    // Base reward
    reasonBreakdown.push(`Base PDI calculation: ${baseReward} SWORD`);

    // First time bonus
    if (firstTimeCalculation) {
      achievementBonus += 100;
      reasonBreakdown.push(`First PDI calculation bonus: 100 SWORD`);
    }

    // Improvement rewards
    if (previousScore !== undefined) {
      const improvement = currentScore - previousScore;

      if (improvement > 0) {
        improvementBonus = improvement * 10; // 10 SWORD per point improvement
        reasonBreakdown.push(`Improvement bonus (+${improvement} points): ${improvementBonus} SWORD`);
      }

      // Major achievement bonuses
      if (previousScore < 40 && currentScore >= 40) {
        achievementBonus += 1000; // Escaping critical
        reasonBreakdown.push(`Escaped critical category: 1000 SWORD`);
      }

      if (previousScore < 60 && currentScore >= 60) {
        achievementBonus += 500; // Reaching caution
        reasonBreakdown.push(`Reached caution category: 500 SWORD`);
      }

      if (previousScore < 80 && currentScore >= 80) {
        achievementBonus += 250; // Reaching healthy
        reasonBreakdown.push(`Reached healthy category: 250 SWORD`);
      }

      // Decline penalty (still get base reward)
      if (improvement < -10) {
        const penaltyReduction = Math.abs(improvement) * 2;
        baseReward = Math.max(5, baseReward - penaltyReduction);
        reasonBreakdown.push(`Large decline penalty: -${penaltyReduction} SWORD`);
      }
    }

    // Category-based bonuses (incentive for critical users to track)
    if (category === 'critical') {
      categoryBonus = Math.floor((baseReward + improvementBonus) * 0.5); // 50% bonus
      reasonBreakdown.push(`Critical user tracking bonus: ${categoryBonus} SWORD`);
    } else if (category === 'risky') {
      categoryBonus = Math.floor((baseReward + improvementBonus) * 0.25); // 25% bonus
      reasonBreakdown.push(`Risky user tracking bonus: ${categoryBonus} SWORD`);
    }

    const totalReward = baseReward + improvementBonus + categoryBonus + achievementBonus;

    return {
      baseReward,
      improvementBonus,
      categoryBonus,
      achievementBonus,
      totalReward: Math.floor(totalReward),
      reasonBreakdown
    };
  }

  /**
   * Calculate rewards for specific PDI-related actions
   */
  static calculateActionRewards(actionType: string, context?: any): number {
    switch (actionType) {
      case 'pdi_calculation':
        return 10;

      case 'pdi_improvement':
        return (context?.improvement || 0) * 10;

      case 'damocles_trigger':
        return 500; // Bonus for triggering automated protection

      case 'financial_counseling_referral':
        return 100; // Seeking help bonus

      case 'debt_consolidation_action':
        return 200; // Taking action bonus

      case 'monthly_tracking_streak':
        const streak = context?.streak || 0;
        return streak * 50; // Compound bonus for consistency

      case 'help_other_user':
        return 150; // Community support bonus

      default:
        return 0;
    }
  }

  /**
   * Calculate milestone rewards
   */
  static calculateMilestoneRewards(milestoneType: string): number {
    const milestones = {
      'first_pdi': 100,
      'first_improvement': 250,
      'escape_critical': 1000,
      'reach_healthy': 500,
      'perfect_score': 2000,
      'help_10_users': 1500,
      '30_day_streak': 1000,
      '90_day_streak': 2500,
      '365_day_streak': 5000
    };

    return milestones[milestoneType as keyof typeof milestones] || 0;
  }

  /**
   * Apply multipliers based on user status
   */
  static applyMultipliers(baseReward: number, userContext: any): number {
    let multiplier = 1.0;

    // Core developer bonus
    if (userContext?.isCoreDeveloper) {
      multiplier += 0.5; // 50% bonus
    }

    // High shield tier bonus
    if (userContext?.shieldTier === 'diamond' || userContext?.shieldTier === 'obsidian') {
      multiplier += 0.25; // 25% bonus
    }

    // Community contributor bonus
    if (userContext?.hasHelpedOthers) {
      multiplier += 0.1; // 10% bonus
    }

    // Early adopter bonus (first 1000 users)
    if (userContext?.isEarlyAdopter) {
      multiplier += 0.2; // 20% bonus
    }

    return Math.floor(baseReward * multiplier);
  }

  /**
   * Generate reward explanation for user
   */
  static generateRewardExplanation(calculation: RewardCalculation): string {
    let explanation = `🎯 PDI Reward Breakdown:\n\n`;

    calculation.reasonBreakdown.forEach((reason, index) => {
      explanation += `${index + 1}. ${reason}\n`;
    });

    explanation += `\n💰 Total Earned: ${calculation.totalReward} SWORD tokens\n\n`;

    if (calculation.totalReward >= 1000) {
      explanation += `🎉 Excellent progress! Major achievement unlocked!\n`;
    } else if (calculation.totalReward >= 500) {
      explanation += `🚀 Great improvement! Keep up the good work!\n`;
    } else if (calculation.totalReward >= 100) {
      explanation += `📈 Nice progress! Every step counts!\n`;
    } else {
      explanation += `✅ Good tracking! Consistency is key to financial health!\n`;
    }

    return explanation;
  }
}

export default PDIRewardCalculator;