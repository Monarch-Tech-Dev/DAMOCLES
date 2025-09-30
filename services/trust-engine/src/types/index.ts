// Sacred Architecture Trust Engine Types
// Built with love for consumer protection ❤️⚔️

export interface KindnessMetrics {
  userWellbeing: number;           // 0-1 scale
  systemSustainability: number;   // 0-1 scale  
  communityHealth: number;        // 0-1 scale
  longTermViability: number;      // 0-1 scale
}

export interface TrustScoreCalculation {
  // Core formula: TrustScore = Σ(Authority_Weight × Authority_Score × Cross_Vector_Confidence)
  //                          - Σ(Contradiction_Penalty × Authority_Differential)
  positiveFactors: AuthorityFactor[];
  contradictionPenalties: ContradictionPenalty[];
  finalScore: number; // 0-100 scale
  confidence: number; // 0-1 confidence in the calculation
}

export interface AuthorityFactor {
  source: string;
  authority_weight: number;        // 0-1 based on source credibility
  authority_score: number;         // 0-1 based on source reputation
  cross_vector_confidence: number; // 0-1 based on corroborating sources
  claim: string;
  evidence?: string[];
}

export interface ContradictionPenalty {
  contradictionType: ContradictionType;
  contradiction_penalty: number;   // Severity of logical inconsistency (0-1)
  authority_differential: number;  // Difference in authority levels (0-1)
  explanation: string;
  sources: string[];
}

export enum ContradictionType {
  SETTLEMENT_LOGIC = 'settlement_logic',           // "No liability" + settlement offer
  DATA_CONTRADICTION = 'data_contradiction',      // "No data" + debt records
  AUTHORITY_HIERARCHY = 'authority_hierarchy',    // Lower authority contradicting higher
  TEMPORAL_INCONSISTENCY = 'temporal_inconsistency', // Contradicts previous statements
  LOGICAL_IMPOSSIBILITY = 'logical_impossibility',   // Mathematically impossible claims
  REGULATORY_VIOLATION = 'regulatory_violation'      // Contradicts known regulations
}

export enum SystemBehavior {
  SERVICE = 'service',     // Gives more than takes
  NEUTRAL = 'neutral',     // Balanced exchange
  EXTRACTION = 'extraction' // Takes more than gives
}

export interface ContradictionResult {
  detected: boolean;
  confidence: number;          // 0-1 probability of contradiction
  type: ContradictionType;
  explanation: string;         // Technical explanation
  kindnessMessage: string;     // User-friendly educational message
  evidence: Evidence[];
  recommendation: string;      // What user should do
  legalBasis?: string[];      // Relevant laws/regulations
}

export interface Evidence {
  type: 'document' | 'statement' | 'regulation' | 'court_decision';
  source: string;
  authority_weight: number;
  content: string;
  timestamp?: Date;
  verified: boolean;
}

export interface AuthorityHierarchy {
  [key: string]: {
    weight: number;           // 0-1 authority weight
    category: AuthorityCategory;
    description: string;
    country?: string;         // For jurisdiction-specific authorities
    supersedes?: string[];    // Lower authorities this overrides
  }
}

export enum AuthorityCategory {
  SUPREME_COURT = 'supreme_court',
  APPELLATE_COURT = 'appellate_court', 
  DISTRICT_COURT = 'district_court',
  REGULATORY_BODY = 'regulatory_body',
  GOVERNMENT_MINISTRY = 'government_ministry',
  PARLIAMENT = 'parliament',
  LEGAL_EXPERT = 'legal_expert',
  INDUSTRY_BODY = 'industry_body',
  CORPORATE_CLAIM = 'corporate_claim',
  INDIVIDUAL_CLAIM = 'individual_claim',
  UNKNOWN_SOURCE = 'unknown_source'
}

export interface KindnessConfig {
  // Core behavior
  detectionSensitivity: number;    // 0-1, how readily to flag issues
  responseGentleness: number;      // 0-1, how gently to communicate
  userAgencyRespect: number;       // 0-1, how much choice to preserve

  // Community features
  communityLearning: boolean;      // Share patterns for collective intelligence
  privacyFirst: boolean;          // Never share personal data

  // Educational approach
  explainReasoning: boolean;       // Help users understand why
  provideAlternatives: boolean;    // Offer different perspectives
  encourageReflection: boolean;    // Invite conscious consideration

  // Sacred principles
  serveMindfulness: boolean;       // Support conscious awareness
  protectVulnerability: boolean;   // Extra care for vulnerable states
  facilitateGrowth: boolean;       // Help users develop discernment
}

export interface TrustAnalysisRequest {
  claims: Claim[];
  context?: AnalysisContext;
  kindnessConfig?: Partial<KindnessConfig>;
}

export interface Claim {
  id: string;
  content: string;
  source: string;
  timestamp: Date;
  evidence?: Evidence[];
  metadata?: Record<string, any>;
}

export interface AnalysisContext {
  domain: 'debt_collection' | 'banking' | 'consumer_rights' | 'gdpr' | 'general';
  jurisdiction: string; // e.g., 'norway', 'eu', 'global'
  userVulnerabilityLevel?: 'low' | 'medium' | 'high';
  urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency';
}

export interface TrustAnalysisResponse {
  trustScore: TrustScoreCalculation;
  kindnessMetrics: KindnessMetrics;
  contradictions: ContradictionResult[];
  recommendations: Recommendation[];
  educationalContent: EducationalContent[];
  systemBehavior: SystemBehavior;
}

export interface Recommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action: string;
  reasoning: string;
  kindnessApproach: string; // How to implement this kindly
  alternatives?: string[];  // Other options for user
  resources?: Resource[];   // Helpful links/documents
}

export interface EducationalContent {
  topic: string;
  explanation: string;
  analogies?: string[];     // Help make complex concepts clear
  visualAids?: string[];    // Suggested charts/diagrams
  furtherReading?: Resource[];
}

export interface Resource {
  title: string;
  url?: string;
  type: 'article' | 'regulation' | 'guide' | 'video' | 'legal_document';
  authority_weight: number;
  description: string;
}

// Norwegian-specific types
export interface NorwegianLegalContext extends AnalysisContext {
  relevantLaws: NorwegianLaw[];
  regulatoryBodies: NorwegianAuthority[];
  courtJurisdiction: 'tingrett' | 'lagmannsrett' | 'høyesterett';
}

export interface NorwegianLaw {
  name: string;
  section?: string;
  description: string;
  relevance: number; // 0-1 how relevant to current case
  url?: string;
}

export interface NorwegianAuthority {
  name: string;
  weight: number;
  expertise: string[];
  contactInfo?: ContactInfo;
}

export interface ContactInfo {
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// SWORD Protocol integration
export interface SWORDTriggerAnalysis {
  creditorId: string;
  aggregatedTrustScore: number;
  affectedUsers: number;
  totalViolations: number;
  recommendedAction: 'monitor' | 'investigate' | 'initiate_sword' | 'emergency_action';
  collectivePower: number; // 0-1 strength of collective case
  expectedOutcome: string;
  legalStrength: number;   // 0-1 likelihood of legal success
}

export interface KindnessUIConfig {
  gentleWarnings: boolean;      // Use educational tone vs. alarming
  respectUserAgency: boolean;   // Inform but don't control
  provideContext: boolean;      // Explain why something matters
  enableUserChoice: boolean;    // Always allow user override
  colorScheme: 'calm' | 'professional' | 'warm';
  language: 'norwegian' | 'english' | 'simple_english';
}

export interface KindnessResponse {
  message: string;
  tone: 'gentle' | 'educational' | 'supportive' | 'empowering';
  options: UserOption[];
  dismissible: boolean;
  urgency: 'info' | 'suggestion' | 'recommendation' | 'warning';
  visualStyle: {
    color: string;
    icon: string;
    animation?: string;
  };
}

export interface UserOption {
  label: string;
  action: string;
  consequence: string;  // What happens if user chooses this
  recommended: boolean;
  difficulty: 'easy' | 'medium' | 'advanced';
}

// Additional types needed for risk scoring
export interface ViolationAnalysis {
  violationId?: string;
  severityScore: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  violationType: string;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
  recommendedActions?: string[];
  metadata?: Record<string, any>;
}

export interface TrustScoreInput {
  claims: Claim[];
  violations?: ViolationAnalysis[];
  historicalData?: any;
  context?: AnalysisContext;
}