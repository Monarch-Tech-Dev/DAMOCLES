use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use bigdecimal::BigDecimal;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Settlement {
    pub id: Uuid,
    pub user_id: Uuid,
    pub debt_id: Uuid,
    pub original_amount: BigDecimal,
    pub settled_amount: BigDecimal,
    pub saved_amount: BigDecimal,
    pub platform_fee: BigDecimal,
    pub status: SettlementStatus,
    pub smart_contract_address: Option<String>,
    pub transaction_hash: Option<String>,
    pub proposed_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "settlement_status", rename_all = "snake_case")]
pub enum SettlementStatus {
    Proposed,
    Negotiating,
    Accepted,
    Rejected,
    Completed,
    Failed,
}

#[derive(Debug, Deserialize)]
pub struct CreateSettlementRequest {
    pub user_id: Uuid,
    pub creditor_id: Uuid,
    pub debt_id: Option<Uuid>,
    pub violations: Vec<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct AcceptSettlementRequest {
    pub settlement_id: Uuid,
    pub user_signature: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SettlementProposal {
    pub settlement: Settlement,
    pub leverage_analysis: LeverageAnalysis,
    pub recommended_action: String,
    pub confidence_score: f64,
}

#[derive(Debug, Serialize)]
pub struct LeverageAnalysis {
    pub violation_count: i32,
    pub total_leverage_score: f64,
    pub estimated_reduction_percentage: f64,
    pub legal_strength: String, // "weak", "moderate", "strong", "very_strong"
    pub key_violations: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct OptimalSettlement {
    pub amount: BigDecimal,
    pub reduction_percentage: f64,
    pub confidence: f64,
    pub reasoning: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct AutoNegotiateRequest {
    pub user_id: Uuid,
    pub creditor_id: Uuid,
    pub trigger: String, // "sword_protocol", "manual", "ai_recommendation"
}