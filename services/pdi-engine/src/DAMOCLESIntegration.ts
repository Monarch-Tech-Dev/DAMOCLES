import { PDIScore, PDICalculationEngine, FinancialMetrics } from './PDICalculationEngine';
import { PDIAutomationEngine, AutomationResult, TriggerContext } from './PDIAutomationEngine';
import axios from 'axios';

export interface DAMOCLESUser {
  id: string;
  email: string;
  name?: string;
  age?: number;
  region?: string;
  dependents?: number;
  currentPDI?: PDIScore;
  protectionLevel: 'maximum' | 'enhanced' | 'standard' | 'monitoring';
  damoclesActivated: boolean;
  onboardingCompleted: boolean;
  lastGDPRGeneration?: Date;
  swordBalance: number;
}

export interface DAMOCLESCreditor {
  id: string;
  name: string;
  type: 'inkasso' | 'bank' | 'bnpl' | 'telecom' | 'utility' | 'other';
  organizationNumber?: string;
  violationHistory: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface DAMOCLESDebt {
  id: string;
  userId: string;
  creditorId: string;
  originalAmount: number;
  currentAmount: number;
  monthlyPayment: number;
  status: 'active' | 'disputed' | 'settled' | 'recovered';
  createdAt: Date;
  lastPaymentDate?: Date;
}

export interface PDIIntegrationResult {
  userId: string;
  pdiCalculated: boolean;
  automationTriggered: boolean;
  protectionLevelChanged: boolean;
  gdprRequestsGenerated: number;
  swordAwarded: number;
  nextActions: string[];
  alerts: string[];
}

export class DAMOCLESIntegration {
  private userServiceUrl: string;
  private gdprEngineUrl: string;
  private paymentServiceUrl: string;
  private learningEngineUrl: string;

  constructor() {
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8000';
    this.gdprEngineUrl = process.env.GDPR_ENGINE_URL || 'http://localhost:8001';
    this.paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:8009';
    this.learningEngineUrl = process.env.LEARNING_ENGINE_URL || 'http://localhost:8010';
  }

  /**
   * Main integration point - called when user financial data is updated
   */
  public async processPDIUpdate(
    userId: string,
    financialMetrics: FinancialMetrics,
    forceRecalculation = false
  ): Promise<PDIIntegrationResult> {
    try {
      // Get user data from DAMOCLES
      const user = await this.getUserData(userId);
      const userDebts = await this.getUserDebts(userId);
      const historicalData = await this.getHistoricalFinancialData(userId);

      // Calculate PDI score
      const pdiScore = PDICalculationEngine.calculatePDI(financialMetrics, historicalData);

      // Prepare trigger context
      const context: TriggerContext = {
        previousPDI: user.currentPDI,
        userHistory: historicalData,
        userProfile: {
          age: user.age,
          dependents: user.dependents,
          region: user.region,
          riskTolerance: this.calculateRiskTolerance(user)
        },
        externalFactors: {
          economicConditions: await this.getEconomicConditions(),
          seasonalFactors: this.checkSeasonalFactors(),
          regionalCrisis: await this.checkRegionalCrisis(user.region)
        }
      };

      // Process automation
      const automationResult = await PDIAutomationEngine.processNewPDIScore(userId, pdiScore, context);

      // Update user protection level if needed
      const protectionLevelChanged = await this.updateProtectionLevel(user, pdiScore);

      // Execute automation actions
      const executionResults = await this.executeAutomationActions(user, automationResult, userDebts);

      // Update user PDI data
      await this.updateUserPDI(userId, pdiScore);

      // Award SWORD tokens
      if (automationResult.swordAwarded > 0) {
        await this.awardSwordTokens(userId, automationResult.swordAwarded);
      }

      // Record learning event
      await this.recordLearningEvent(userId, pdiScore, automationResult);

      return {
        userId,
        pdiCalculated: true,
        automationTriggered: automationResult.actionsExecuted.length > 0,
        protectionLevelChanged,
        gdprRequestsGenerated: executionResults.gdprGenerated,
        swordAwarded: automationResult.swordAwarded,
        nextActions: executionResults.nextActions,
        alerts: automationResult.alertsSent
      };

    } catch (error) {
      console.error(`PDI integration failed for user ${userId}:`, error);
      return {
        userId,
        pdiCalculated: false,
        automationTriggered: false,
        protectionLevelChanged: false,
        gdprRequestsGenerated: 0,
        swordAwarded: 0,
        nextActions: ['Retry PDI calculation'],
        alerts: ['PDI processing failed']
      };
    }
  }

  /**
   * Get user data from user service
   */
  private async getUserData(userId: string): Promise<DAMOCLESUser> {
    const response = await axios.get(`${this.userServiceUrl}/users/${userId}`);
    return response.data;
  }

  /**
   * Get user's debts
   */
  private async getUserDebts(userId: string): Promise<DAMOCLESDebt[]> {
    const response = await axios.get(`${this.userServiceUrl}/users/${userId}/debts`);
    return response.data;
  }

  /**
   * Get historical financial data for trend analysis
   */
  private async getHistoricalFinancialData(userId: string): Promise<FinancialMetrics[]> {
    try {
      const response = await axios.get(`${this.userServiceUrl}/users/${userId}/financial-history`);
      return response.data;
    } catch (error) {
      console.warn(`No historical data found for user ${userId}`);
      return [];
    }
  }

  /**
   * Calculate user's risk tolerance based on profile
   */
  private calculateRiskTolerance(user: DAMOCLESUser): 'low' | 'medium' | 'high' {
    // Young users typically have higher risk tolerance
    if (user.age && user.age < 30) return 'high';

    // Users with dependents are more risk-averse
    if (user.dependents && user.dependents > 0) return 'low';

    // Middle-aged users
    if (user.age && user.age > 50) return 'low';

    return 'medium';
  }

  /**
   * Get current economic conditions
   */
  private async getEconomicConditions(): Promise<'recession' | 'growth' | 'stable'> {
    // In production, this would connect to economic data APIs
    // For now, return stable
    return 'stable';
  }

  /**
   * Check for seasonal factors affecting debt stress
   */
  private checkSeasonalFactors(): boolean {
    const month = new Date().getMonth();
    // Holiday seasons (November-January) typically increase debt stress
    return month >= 10 || month <= 1;
  }

  /**
   * Check if user's region is experiencing crisis
   */
  private async checkRegionalCrisis(region?: string): Promise<boolean> {
    if (!region) return false;

    try {
      const response = await axios.get(`${this.userServiceUrl}/regions/${region}/crisis-status`);
      return response.data.inCrisis;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update user's protection level if needed
   */
  private async updateProtectionLevel(user: DAMOCLESUser, pdiScore: PDIScore): Promise<boolean> {
    if (user.protectionLevel !== pdiScore.protectionLevel) {
      await axios.patch(`${this.userServiceUrl}/users/${user.id}`, {
        protectionLevel: pdiScore.protectionLevel
      });

      console.log(`Updated protection level for user ${user.id}: ${user.protectionLevel} → ${pdiScore.protectionLevel}`);
      return true;
    }
    return false;
  }

  /**
   * Execute automation actions
   */
  private async executeAutomationActions(
    user: DAMOCLESUser,
    automationResult: AutomationResult,
    userDebts: DAMOCLESDebt[]
  ): Promise<{ gdprGenerated: number; nextActions: string[] }> {
    let gdprGenerated = 0;
    const nextActions: string[] = [];

    for (const action of automationResult.actionsExecuted) {
      try {
        switch (action.type) {
          case 'IMMEDIATE_PROTECTION':
            await this.activateImmediateProtection(user, action);
            gdprGenerated += await this.generateEmergencyGDPRRequests(user, userDebts);
            nextActions.push('Emergency protection activated');
            break;

          case 'PROACTIVE_MONITORING':
            await this.setupProactiveMonitoring(user, action);
            nextActions.push('Enhanced monitoring enabled');
            break;

          case 'PAYMENT_RELIEF':
            await this.initiatePaymentRelief(user, userDebts, action);
            nextActions.push('Payment relief initiated');
            break;

          case 'GROWTH_INTERVENTION':
            await this.initiateGrowthIntervention(user, action);
            nextActions.push('Debt growth intervention started');
            break;

          case 'EARLY_WARNING':
            await this.setupEarlyWarning(user, action);
            nextActions.push('Early warning system activated');
            break;
        }
      } catch (error) {
        console.error(`Failed to execute action ${action.type} for user ${user.id}:`, error);
        nextActions.push(`Failed to execute ${action.type}`);
      }
    }

    return { gdprGenerated, nextActions };
  }

  /**
   * Activate immediate protection for critical users
   */
  private async activateImmediateProtection(user: DAMOCLESUser, action: any): Promise<void> {
    // Set highest protection level
    await axios.patch(`${this.userServiceUrl}/users/${user.id}`, {
      protectionLevel: 'maximum',
      damoclesActivated: true,
      priorityQueue: true
    });

    // Schedule emergency consultation
    await axios.post(`${this.userServiceUrl}/consultations/schedule`, {
      userId: user.id,
      type: 'emergency',
      timeframe: '24_hours',
      priority: 'critical'
    });
  }

  /**
   * Generate emergency GDPR requests for all creditors
   */
  private async generateEmergencyGDPRRequests(user: DAMOCLESUser, debts: DAMOCLESDebt[]): Promise<number> {
    let generated = 0;

    for (const debt of debts) {
      try {
        const creditor = await this.getCreditorData(debt.creditorId);

        await axios.post(`${this.gdprEngineUrl}/gdpr/generate`, {
          userId: user.id,
          creditorId: debt.creditorId,
          urgency: 'immediate',
          templates: ['fee_challenge', 'interest_audit', 'payment_history']
        });

        generated++;
      } catch (error) {
        console.error(`Failed to generate GDPR request for creditor ${debt.creditorId}:`, error);
      }
    }

    return generated;
  }

  /**
   * Setup proactive monitoring
   */
  private async setupProactiveMonitoring(user: DAMOCLESUser, action: any): Promise<void> {
    await axios.post(`${this.userServiceUrl}/monitoring/setup`, {
      userId: user.id,
      frequency: 'weekly',
      alerts: ['pdi_deterioration', 'debt_growth', 'payment_stress'],
      enabled: true
    });
  }

  /**
   * Initiate payment relief measures
   */
  private async initiatePaymentRelief(user: DAMOCLESUser, debts: DAMOCLESDebt[], action: any): Promise<void> {
    for (const debt of debts) {
      // Generate payment plan requests
      await axios.post(`${this.gdprEngineUrl}/payment-plans/request`, {
        userId: user.id,
        creditorId: debt.creditorId,
        currentPayment: debt.monthlyPayment,
        requestedReduction: 0.3 // Request 30% reduction
      });
    }
  }

  /**
   * Initiate debt growth intervention
   */
  private async initiateGrowthIntervention(user: DAMOCLESUser, action: any): Promise<void> {
    // Analyze consolidation opportunities
    await axios.post(`${this.userServiceUrl}/debt/analyze-consolidation`, {
      userId: user.id
    });

    // Prepare creditor negotiations
    await axios.post(`${this.userServiceUrl}/negotiations/prepare`, {
      userId: user.id,
      strategy: 'debt_reduction'
    });
  }

  /**
   * Setup early warning system
   */
  private async setupEarlyWarning(user: DAMOCLESUser, action: any): Promise<void> {
    await axios.post(`${this.userServiceUrl}/alerts/setup`, {
      userId: user.id,
      triggers: ['pdi_drop_5', 'payment_missed', 'debt_increase_10'],
      enabled: true
    });
  }

  /**
   * Get creditor data
   */
  private async getCreditorData(creditorId: string): Promise<DAMOCLESCreditor> {
    const response = await axios.get(`${this.userServiceUrl}/creditors/${creditorId}`);
    return response.data;
  }

  /**
   * Update user's PDI data
   */
  private async updateUserPDI(userId: string, pdiScore: PDIScore): Promise<void> {
    await axios.patch(`${this.userServiceUrl}/users/${userId}`, {
      currentPDI: pdiScore,
      lastPDICalculation: new Date()
    });
  }

  /**
   * Award SWORD tokens
   */
  private async awardSwordTokens(userId: string, amount: number): Promise<void> {
    await axios.post(`${this.paymentServiceUrl}/sword/award`, {
      userId,
      amount,
      reason: 'PDI automation reward',
      source: 'pdi_engine'
    });
  }

  /**
   * Record learning event for algorithm improvement
   */
  private async recordLearningEvent(
    userId: string,
    pdiScore: PDIScore,
    automationResult: AutomationResult
  ): Promise<void> {
    try {
      await axios.post(`${this.learningEngineUrl}/events/record`, {
        userId,
        eventType: 'pdi_calculation',
        data: {
          pdiScore: pdiScore.overallScore,
          category: pdiScore.category,
          protectionLevel: pdiScore.protectionLevel,
          actionsTriggered: automationResult.actionsExecuted.length,
          swordAwarded: automationResult.swordAwarded
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.warn(`Failed to record learning event for user ${userId}:`, error);
    }
  }

  /**
   * Bulk process PDI updates for multiple users
   */
  public async bulkProcessPDIUpdates(
    userUpdates: Array<{ userId: string; financialMetrics: FinancialMetrics }>
  ): Promise<PDIIntegrationResult[]> {
    const results: PDIIntegrationResult[] = [];
    const batchSize = 10;

    for (let i = 0; i < userUpdates.length; i += batchSize) {
      const batch = userUpdates.slice(i, i + batchSize);

      const batchPromises = batch.map(update =>
        this.processPDIUpdate(update.userId, update.financialMetrics)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            userId: batch[index].userId,
            pdiCalculated: false,
            automationTriggered: false,
            protectionLevelChanged: false,
            gdprRequestsGenerated: 0,
            swordAwarded: 0,
            nextActions: ['Retry PDI calculation'],
            alerts: ['Bulk processing failed']
          });
        }
      });

      // Rate limiting between batches
      if (i + batchSize < userUpdates.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Get PDI statistics for user dashboard
   */
  public async getPDIStatistics(userId: string): Promise<any> {
    try {
      const user = await this.getUserData(userId);

      if (!user.currentPDI) {
        return { error: 'No PDI data available' };
      }

      return {
        currentScore: user.currentPDI.overallScore,
        category: user.currentPDI.category,
        protectionLevel: user.protectionLevel,
        lastCalculated: user.currentPDI.lastCalculated,
        trends: user.currentPDI.trends,
        recommendations: user.currentPDI.recommendations,
        riskFactors: user.currentPDI.riskFactors,
        metrics: {
          dsr: user.currentPDI.metrics.dsr,
          dti: user.currentPDI.metrics.dti,
          liquidityBuffer: user.currentPDI.metrics.liquidityBuffer,
          debtGrowth: user.currentPDI.metrics.debtGrowth,
          paymentStress: user.currentPDI.metrics.paymentStress,
          financialFlexibility: user.currentPDI.metrics.financialFlexibility
        }
      };
    } catch (error) {
      console.error(`Failed to get PDI statistics for user ${userId}:`, error);
      return { error: 'Failed to retrieve PDI statistics' };
    }
  }
}