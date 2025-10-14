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
        # In-memory storage for development (until real DB is connected)
        self._gdpr_requests = {}  # key: request_id, value: request_data
        self._gdpr_by_user = {}    # key: user_id, value: list of request_ids
        
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
        """Fetch user from user-service database"""
        import os
        from datetime import datetime

        try:
            # Query user-service database directly
            query = """
                SELECT
                    id, email, name, phone_number, street_address,
                    postal_code, city, country, date_of_birth,
                    risk_score, shield_tier, token_balance,
                    onboarding_status, gdpr_profile_complete,
                    vipps_verified, vipps_sub, is_active,
                    created_at, updated_at
                FROM users
                WHERE id = $1
            """

            # Use connection to user-service database
            user_db_url = os.getenv('USER_DB_URL', os.getenv('DATABASE_URL'))

            import asyncpg
            conn = await asyncpg.connect(user_db_url)
            try:
                row = await conn.fetchrow(query, user_id)
                if not row:
                    return None

                return User(
                    id=row['id'],
                    email=row['email'],
                    name=row.get('name'),
                    phone_number=row.get('phone_number'),
                    street_address=row.get('street_address'),
                    postal_code=row.get('postal_code'),
                    city=row.get('city'),
                    country=row.get('country'),
                    date_of_birth=row.get('date_of_birth'),
                    risk_score=float(row.get('risk_score', 0.5)),
                    shield_tier=row.get('shield_tier', 'bronze'),
                    token_balance=float(row.get('token_balance', 0.0)),
                    onboarding_status=row.get('onboarding_status', 'PENDING'),
                    is_active=row.get('is_active', True),
                    created_at=row['created_at'],
                    updated_at=row['updated_at']
                )
            finally:
                await conn.close()

        except Exception as e:
            import logging
            logging.error(f"Error fetching user {user_id}: {e}")
            return None
        
    async def get_creditor(self, creditor_id: str) -> Optional[Creditor]:
        """Fetch creditor from user-service database"""
        import os
        from datetime import datetime

        try:
            # Query user-service database directly
            query = """
                SELECT
                    id, name, organization_number, type, privacy_email,
                    violation_score, total_violations, average_settlement_rate,
                    is_active, created_at, updated_at
                FROM creditors
                WHERE id = $1
            """

            # Use connection to user-service database
            user_db_url = os.getenv('USER_DB_URL', os.getenv('DATABASE_URL'))

            import asyncpg
            conn = await asyncpg.connect(user_db_url)
            try:
                row = await conn.fetchrow(query, creditor_id)
                if not row:
                    return None

                return Creditor(
                    id=row['id'],
                    name=row['name'],
                    organization_number=row.get('organization_number'),
                    type=row.get('type', 'default'),
                    privacy_email=row.get('privacy_email'),
                    violation_score=float(row.get('violation_score', 0.0)),
                    total_violations=int(row.get('total_violations', 0)),
                    average_settlement_rate=float(row.get('average_settlement_rate', 0.0)),
                    is_active=row.get('is_active', True),
                    created_at=row['created_at'],
                    updated_at=row['updated_at']
                )
            finally:
                await conn.close()

        except Exception as e:
            import logging
            logging.error(f"Error fetching creditor {creditor_id}: {e}")
            return None
        
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
        # Get from in-memory storage
        request_ids = self._gdpr_by_user.get(user_id, [])
        requests = []

        for req_id in request_ids:
            if req_id in self._gdpr_requests:
                req = self._gdpr_requests[req_id]
                # Filter by status if specified
                if status is None or req.get("status") == status:
                    requests.append(DictObj(req))

        # Apply pagination
        return requests[offset:offset + limit]
        
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

        # Create GDPR request with in-memory storage
        gdpr_request = {
            "id": request_data.get("id", str(uuid.uuid4())),
            "user_id": request_data["user_id"],
            "creditor_id": request_data["creditor_id"],
            "reference_id": request_data["reference_id"],
            "content": request_data.get("content", ""),
            "status": request_data.get("status", "pending"),
            "request_type": request_data.get("request_type", "DATA_ACCESS"),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "sent_at": None,
            "response_received_at": None,
            "response_due": request_data.get("response_due").isoformat() if request_data.get("response_due") else None,
            "legal_deadline": request_data.get("legal_deadline").isoformat() if request_data.get("legal_deadline") else None,
            "followup_scheduled_at": request_data.get("followup_scheduled_at").isoformat() if request_data.get("followup_scheduled_at") else None
        }

        # Store in memory
        request_id = gdpr_request["id"]
        user_id = gdpr_request["user_id"]

        self._gdpr_requests[request_id] = gdpr_request

        # Index by user_id
        if user_id not in self._gdpr_by_user:
            self._gdpr_by_user[user_id] = []
        self._gdpr_by_user[user_id].append(request_id)

        print(f"Stored GDPR request {request_id} for user {user_id} in memory")
        return DictObj(gdpr_request)

    async def update_gdpr_request(self, request_id: str, update_data: Dict[str, Any]) -> bool:
        """Update a GDPR request record"""
        from datetime import datetime

        # Update in memory storage
        if request_id in self._gdpr_requests:
            request = self._gdpr_requests[request_id]

            # Update fields
            for key, value in update_data.items():
                # Convert datetime objects to ISO format strings
                if hasattr(value, 'isoformat'):
                    request[key] = value.isoformat()
                else:
                    request[key] = value

            request["updated_at"] = datetime.now().isoformat()

            print(f"Updated GDPR request {request_id} in memory with {update_data}")
            return True

        print(f"Warning: GDPR request {request_id} not found in memory")
        return False