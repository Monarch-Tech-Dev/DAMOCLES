from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class GDPRRequestStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    RESPONDED = "RESPONDED"
    ESCALATED = "ESCALATED"

class GDPRRequestCreate(BaseModel):
    user_id: str = Field(..., description="User ID making the request")
    creditor_id: str = Field(..., description="Creditor ID to send request to")
    request_type: str = Field(default="article_15", description="Type of GDPR request")
    custom_message: Optional[str] = Field(None, description="Additional custom message")

class GDPRRequest(BaseModel):
    id: str
    user_id: str
    creditor_id: str
    reference_id: str
    content: Optional[str]
    status: GDPRRequestStatus
    sent_at: Optional[datetime]
    response_due: Optional[datetime]
    response_received_at: Optional[datetime]
    tracking_pixel_viewed: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GDPRResponse(BaseModel):
    id: str
    request_id: str
    content: Optional[bytes]
    extracted_data: Optional[Dict[str, Any]]
    format: str  # 'pdf', 'email', 'json', etc.
    received_at: datetime
    
    class Config:
        from_attributes = True

class ViolationType(str, Enum):
    EXCESSIVE_FEES = "excessive_fees"
    UNDISCLOSED_DATA = "undisclosed_data"
    GDPR_VIOLATION = "gdpr_violation"
    ILLEGAL_AUTOMATION = "illegal_automation"
    DISCRIMINATORY_PRACTICE = "discriminatory_practice"
    DATA_BREACH = "data_breach"
    CONSENT_VIOLATION = "consent_violation"

class Violation(BaseModel):
    id: Optional[str] = None
    gdpr_request_id: Optional[str]
    creditor_id: str
    type: ViolationType
    severity: str  # 'low', 'medium', 'high', 'critical'
    confidence: float = Field(..., ge=0.0, le=1.0)
    evidence: str
    legal_reference: str
    estimated_damage: float
    blockchain_hash: Optional[str] = None
    ipfs_hash: Optional[str] = None
    status: str = "PENDING"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class GDPRTemplate(BaseModel):
    id: str
    name: str
    creditor_type: str
    language: str = "no"
    subject_template: str
    content_template: str
    legal_references: List[str]
    is_active: bool = True
    created_at: datetime

class TrackingEvent(BaseModel):
    id: str
    gdpr_request_id: str
    event_type: str  # 'sent', 'opened', 'clicked', 'responded'
    timestamp: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class EscalationRequest(BaseModel):
    id: str
    gdpr_request_id: str
    escalation_type: str  # 'datatilsynet', 'legal_action', 'media'
    reason: str
    documentation: List[str]
    status: str = "PENDING"
    escalated_at: datetime