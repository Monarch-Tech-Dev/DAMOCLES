import asyncpg
import os
from typing import Optional, List, Dict, Any
from models.user import User
from models.creditor import Creditor
from models.gdpr import GDPRRequest, GDPRResponse, Violation

class DictObj:
    """Simple object wrapper for dictionaries to allow attribute access"""
    def __init__(self, data: dict):
        for key, value in data.items():
            setattr(self, key, value)

class Database:
    def __init__(self):
        self.pool = None
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./damocles.db")
        
    async def connect(self):
        # Mock database connection for development
        # In production, this would connect to the actual database
        print("Database connected (mock)")
        
    async def disconnect(self):
        # Mock database disconnection
        print("Database disconnected (mock)")
        
    async def check_connection(self):
        # Mock health check
        return True
        
    async def get_user(self, user_id: str) -> Optional[User]:
        # Mock user retrieval
        from datetime import datetime
        return User(
            id=user_id,
            email="user@example.com",
            phone_number="+4712345678",
            risk_score=0.5,
            shield_tier="bronze",
            token_balance=100.0,
            onboarding_status="COMPLETED",
            is_active=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
    async def get_creditor(self, creditor_id: str) -> Optional[Creditor]:
        # Mock creditor retrieval
        from datetime import datetime
        return Creditor(
            id=creditor_id,
            name="Example Creditor AS",
            organization_number="123456789",
            type="inkasso",
            privacy_email="privacy@example-creditor.no",
            violation_score=2.5,
            total_violations=15,
            average_settlement_rate=0.65,
            is_active=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
    async def get_gdpr_request(self, request_id: str) -> Optional[GDPRRequest]:
        # Mock GDPR request retrieval
        from datetime import datetime, timedelta
        return GDPRRequest(
            id=request_id,
            user_id="user123",
            creditor_id="creditor123",
            reference_id=f"REF-{request_id}",
            content="Mock GDPR request content...",
            status="PENDING",
            response_due=datetime.now() + timedelta(days=30),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
    async def get_user_gdpr_requests(
        self, 
        user_id: str, 
        status: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[GDPRRequest]:
        # Mock user GDPR requests retrieval
        return []
        
    async def get_user_violations(
        self,
        user_id: str,
        severity: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[Violation]:
        # Mock user violations retrieval
        return []
        
    async def get_creditor_violation_stats(self, creditor_id: str) -> Dict[str, Any]:
        # Mock creditor violation statistics
        return {
            "total_violations": 125,
            "severity_breakdown": {
                "critical": 5,
                "high": 15,
                "medium": 45,
                "low": 60
            },
            "violation_score": 3.2,
            "average_response_time": 25.5
        }

    async def get_user_debt_with_creditor(self, user_id: str, creditor_id: str) -> Optional[Dict[str, Any]]:
        # Mock debt retrieval for GDPR request generation
        from datetime import datetime
        return {
            "id": f"debt_{user_id}_{creditor_id}",
            "user_id": user_id,
            "creditor_id": creditor_id,
            "original_amount": 15000.0,
            "current_amount": 18500.0,
            "status": "active",
            "account_number": "AC12345678",
            "description": "Unpaid invoice from 2023",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

    async def create_gdpr_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new GDPR request record"""
        from datetime import datetime
        import uuid

        # Mock GDPR request creation
        gdpr_request = {
            "id": request_data.get("id", str(uuid.uuid4())),
            "user_id": request_data["user_id"],
            "creditor_id": request_data["creditor_id"],
            "reference_id": request_data["reference_id"],
            "content": request_data.get("content", ""),
            "status": request_data.get("status", "PENDING"),
            "request_type": request_data.get("request_type", "DATA_ACCESS"),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "sent_at": None,
            "response_received_at": None,
            "legal_deadline": request_data.get("legal_deadline"),
            "followup_scheduled_at": request_data.get("followup_scheduled_at")
        }

        print(f"Mock: Created GDPR request {gdpr_request['id']} for user {gdpr_request['user_id']}")
        return DictObj(gdpr_request)

    async def update_gdpr_request(self, request_id: str, update_data: Dict[str, Any]) -> bool:
        """Update a GDPR request record"""
        from datetime import datetime

        # Mock GDPR request update
        print(f"Mock: Updated GDPR request {request_id} with {update_data}")
        return True