from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Creditor(BaseModel):
    id: str
    name: str
    organization_number: Optional[str] = None
    type: str  # "bank", "inkasso", "bnpl", "other"
    privacy_email: Optional[EmailStr] = None
    violation_score: float = 0.0
    total_violations: int = 0
    average_settlement_rate: Optional[float] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CreditorCreate(BaseModel):
    name: str
    organization_number: Optional[str] = None
    type: str
    privacy_email: Optional[EmailStr] = None

class CreditorUpdate(BaseModel):
    name: Optional[str] = None
    privacy_email: Optional[EmailStr] = None
    violation_score: Optional[float] = None
    total_violations: Optional[int] = None
    average_settlement_rate: Optional[float] = None
    is_active: Optional[bool] = None
