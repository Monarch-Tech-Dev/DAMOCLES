export interface PDIInputs {
  monthlyIncome: number;
  totalDebt: number;
  monthlyDebtPayments: number;
  availableCredit: number;
  creditUsed: number;
  totalAssets: number;
  previousMonthDebt?: number;
}

export interface MetricResult {
  value: number;
  score: number;
  category: 'healthy' | 'caution' | 'risky' | 'critical';
}

export interface PDIMetrics {
  dti: MetricResult;
  dsr: MetricResult;
  creditUtilization: MetricResult;
  debtToAssets: MetricResult;
  debtGrowth: MetricResult;
}

export interface PDIScore {
  score: number;
  category: 'healthy' | 'caution' | 'risky' | 'critical';
  metrics: PDIMetrics;
  recommendations: string[];
  damoclesActionRequired: boolean;
  calculatedAt: Date;
}

export interface PDIProfileData {
  id: string;
  userId: string;
  currentScore: number;
  scoreCategory: string;
  lastCalculated: Date;
  calculationVersion: string;
}

export interface PDIAlert {
  id: string;
  profileId: string;
  alertType: 'score_critical' | 'rapid_decline' | 'metric_warning' | 'improvement';
  alertMessage: string;
  triggerValue?: number;
  damoclesActionTriggered: boolean;
  actionId?: string;
  createdAt: Date;
  acknowledgedAt?: Date;
}

export interface RegionalData {
  id: string;
  regionCode: string;
  regionName: string;
  countryCode: string;
  averagePDI?: number;
  totalProfiles: number;
  criticalPercentage?: number;
  lastUpdated: Date;
}