from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date

class User(BaseModel):
    id: str
    name: Optional[str] = None
    email: EmailStr
    personal_number: Optional[str] = None
    phone_number: Optional[str] = None
    street_address: Optional[str] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    date_of_birth: Optional[date] = None
    risk_score: Optional[float] = 0.5
    shield_tier: Optional[str] = 'bronze'
    token_balance: Optional[float] = 0.0
    onboarding_status: Optional[str] = 'PENDING'
    created_at: datetime
    updated_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    personal_number: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None