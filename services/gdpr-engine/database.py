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
        """Fetch user from user-service via HTTP API"""
        import os
        import aiohttp
        import logging
        from datetime import datetime

        try:
            user_service_url = os.getenv('USER_SERVICE_URL', 'http://localhost:3001')
            service_api_key = os.getenv('SERVICE_API_KEY', 'dev-service-key-12345')

            url = f"{user_service_url}/api/internal/users/{user_id}"
            headers = {'x-service-api-key': service_api_key}

            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 404:
                        logging.warning(f"User {user_id} not found")
                        return None

                    if response.status != 200:
                        logging.error(f"Error fetching user {user_id}: HTTP {response.status}")
                        return None

                    data = await response.json()
                    user_data = data.get('user')

                    if not user_data:
                        return None

                    # Convert date strings to date/datetime objects
                    date_of_birth = None
                    if user_data.get('dateOfBirth'):
                        try:
                            date_of_birth = datetime.fromisoformat(user_data['dateOfBirth'].replace('Z', '+00:00')).date()
                        except:
                            pass

                    created_at = datetime.fromisoformat(user_data['createdAt'].replace('Z', '+00:00'))
                    updated_at = datetime.fromisoformat(user_data['updatedAt'].replace('Z', '+00:00'))

                    return User(
                        id=user_data['id'],
                        email=user_data['email'],
                        name=user_data.get('name'),
                        phone_number=user_data.get('phoneNumber'),
                        street_address=user_data.get('streetAddress'),
                        postal_code=user_data.get('postalCode'),
                        city=user_data.get('city'),
                        country=user_data.get('country'),
                        date_of_birth=date_of_birth,
                        risk_score=float(user_data.get('riskScore') or 0.5),
                        shield_tier=user_data.get('shieldTier', 'bronze'),
                        token_balance=float(user_data.get('tokenBalance') or 0.0),
                        onboarding_status=user_data.get('onboardingStatus', 'PENDING'),
                        is_active=user_data.get('isActive', True),
                        created_at=created_at,
                        updated_at=updated_at
                    )

        except Exception as e:
            logging.error(f"Error fetching user {user_id}: {e}")
            return None
        
    async def get_creditor(self, creditor_id: str) -> Optional[Creditor]:
        """Fetch creditor from user-service via HTTP API"""
        import os
        import aiohttp
        import logging
        from datetime import datetime

        try:
            user_service_url = os.getenv('USER_SERVICE_URL', 'http://localhost:3001')
            service_api_key = os.getenv('SERVICE_API_KEY', 'dev-service-key-12345')

            url = f"{user_service_url}/api/internal/creditors/{creditor_id}"
            headers = {'x-service-api-key': service_api_key}

            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 404:
                        logging.warning(f"Creditor {creditor_id} not found")
                        return None

                    if response.status != 200:
                        logging.error(f"Error fetching creditor {creditor_id}: HTTP {response.status}")
                        return None

                    data = await response.json()
                    creditor_data = data.get('creditor')

                    if not creditor_data:
                        return None

                    created_at = datetime.fromisoformat(creditor_data['createdAt'].replace('Z', '+00:00'))
                    updated_at = datetime.fromisoformat(creditor_data['updatedAt'].replace('Z', '+00:00'))

                    return Creditor(
                        id=creditor_data['id'],
                        name=creditor_data['name'],
                        organization_number=creditor_data.get('organizationNumber'),
                        type=creditor_data.get('type', 'default'),
                        privacy_email=creditor_data.get('privacyEmail'),
                        violation_score=float(creditor_data.get('violationScore') or 0.0),
                        total_violations=int(creditor_data.get('totalViolations') or 0),
                        average_settlement_rate=float(creditor_data.get('averageSettlementRate') or 0.0),
                        is_active=creditor_data.get('isActive', True),
                        created_at=created_at,
                        updated_at=updated_at
                    )

        except Exception as e:
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

    async def get_last_gdpr_request_for_creditor(
        self,
        user_id: str,
        creditor_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get the most recent GDPR request for a user-creditor pair"""
        from datetime import datetime

        # Query user-service API for the most recent request
        import os
        import aiohttp
        import logging

        try:
            user_service_url = os.getenv('USER_SERVICE_URL', 'http://localhost:3001')
            service_api_key = os.getenv('SERVICE_API_KEY', 'dev-service-key-12345')

            url = f"{user_service_url}/api/internal/gdpr-requests/last"
            headers = {'x-service-api-key': service_api_key}
            params = {
                'user_id': user_id,
                'creditor_id': creditor_id
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status == 404:
                        # No previous request found
                        return None

                    if response.status != 200:
                        logging.error(f"Error fetching last GDPR request: HTTP {response.status}")
                        return None

                    data = await response.json()
                    request_data = data.get('request')

                    if not request_data:
                        return None

                    # Convert timestamp strings
                    created_at_str = request_data.get('createdAt')
                    if created_at_str:
                        request_data['created_at'] = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))

                    return request_data

        except Exception as e:
            logging.error(f"Error fetching last GDPR request: {e}")
            return None