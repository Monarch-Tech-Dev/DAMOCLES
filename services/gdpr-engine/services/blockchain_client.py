import aiohttp
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class BlockchainClient:
    """Client for interacting with blockchain evidence service"""

    def __init__(self, blockchain_service_url: str = "http://localhost:8020"):
        self.base_url = blockchain_service_url
        self.api_base = f"{self.base_url}/api"

    async def create_evidence(
        self,
        case_id: str,
        document_content: str,
        evidence_type: str = "GDPR_REQUEST",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """Create blockchain evidence for a legal document"""

        payload = {
            "caseId": case_id,
            "documentContent": document_content,
            "evidenceType": evidence_type,
            "metadata": metadata or {}
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base}/evidence/create",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                ) as response:

                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"✅ Blockchain evidence created successfully: {result.get('txId')}")
                        return result
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Failed to create blockchain evidence: {response.status} - {error_text}")
                        return None

        except Exception as e:
            logger.error(f"❌ Error creating blockchain evidence: {str(e)}")
            return None

    async def verify_evidence(self, tx_id: str) -> Optional[Dict[str, Any]]:
        """Verify blockchain evidence by transaction ID"""

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base}/evidence/verify/{tx_id}"
                ) as response:

                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"✅ Evidence verification successful: {tx_id}")
                        return result
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Failed to verify evidence: {response.status} - {error_text}")
                        return None

        except Exception as e:
            logger.error(f"❌ Error verifying evidence: {str(e)}")
            return None

    async def get_legal_package(self, case_id: str) -> Optional[Dict[str, Any]]:
        """Get legal evidence package for court proceedings"""

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base}/evidence/legal-package/{case_id}"
                ) as response:

                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"✅ Legal package retrieved for case: {case_id}")
                        return result
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Failed to get legal package: {response.status} - {error_text}")
                        return None

        except Exception as e:
            logger.error(f"❌ Error retrieving legal package: {str(e)}")
            return None

    async def health_check(self) -> bool:
        """Check if blockchain service is healthy"""

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/health",
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:

                    if response.status == 200:
                        result = await response.json()
                        return result.get("status") == "healthy"
                    else:
                        return False

        except Exception as e:
            logger.error(f"❌ Blockchain service health check failed: {str(e)}")
            return False