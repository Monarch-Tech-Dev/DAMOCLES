import aiohttp
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class EventClient:
    """Client for recording events in the user-service event store"""

    def __init__(self, user_service_url: str = "http://localhost:3001"):
        self.base_url = user_service_url
        self.api_base = f"{self.base_url}/api/events"

    async def record_gdpr_event(
        self,
        case_id: str,
        event_type: str,
        data: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> Optional[str]:
        """Record a GDPR-specific event"""

        payload = {
            "caseId": case_id,
            "eventType": event_type,
            "data": data,
            "userId": user_id
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base}/gdpr",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                ) as response:

                    if response.status == 200:
                        result = await response.json()
                        event_id = result.get('eventId')
                        logger.info(f"✅ GDPR event recorded successfully: {event_id}")
                        return event_id
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Failed to record GDPR event: {response.status} - {error_text}")
                        return None

        except Exception as e:
            logger.error(f"❌ Error recording GDPR event: {str(e)}")
            return None

    async def record_dsar_submitted(
        self,
        case_id: str,
        user_id: str,
        creditor_id: str,
        creditor_name: str,
        reference_id: str,
        blockchain_tx_id: Optional[str] = None
    ) -> Optional[str]:
        """Record DSAR submission event"""

        event_data = {
            "userId": user_id,
            "creditorId": creditor_id,
            "creditorName": creditor_name,
            "referenceId": reference_id,
            "submissionTime": datetime.now().isoformat(),
            "blockchainTxId": blockchain_tx_id,
            "legalBasis": "GDPR Article 15 - Right of Access",
            "status": "SUBMITTED"
        }

        return await self.record_gdpr_event(
            case_id=case_id,
            event_type="DSAR_SUBMITTED",
            data=event_data,
            user_id=user_id
        )

    async def record_template_generated(
        self,
        case_id: str,
        user_id: str,
        template_type: str,
        jurisdiction: str,
        articles: list
    ) -> Optional[str]:
        """Record template generation event"""

        event_data = {
            "templateType": template_type,
            "jurisdiction": jurisdiction,
            "articles": articles,
            "generationTime": datetime.now().isoformat(),
            "status": "GENERATED"
        }

        return await self.record_gdpr_event(
            case_id=case_id,
            event_type="TEMPLATE_GENERATED",
            data=event_data,
            user_id=user_id
        )

    async def record_request_sent(
        self,
        case_id: str,
        user_id: str,
        creditor_id: str,
        delivery_method: str,
        tracking_info: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        """Record request sent event"""

        event_data = {
            "creditorId": creditor_id,
            "deliveryMethod": delivery_method,
            "sentTime": datetime.now().isoformat(),
            "trackingInfo": tracking_info or {},
            "status": "SENT"
        }

        return await self.record_gdpr_event(
            case_id=case_id,
            event_type="REQUEST_SENT",
            data=event_data,
            user_id=user_id
        )

    async def record_response_received(
        self,
        case_id: str,
        user_id: str,
        creditor_id: str,
        response_type: str,
        response_data: Dict[str, Any]
    ) -> Optional[str]:
        """Record creditor response event"""

        event_data = {
            "creditorId": creditor_id,
            "responseType": response_type,
            "responseData": response_data,
            "receivedTime": datetime.now().isoformat(),
            "status": "RECEIVED"
        }

        return await self.record_gdpr_event(
            case_id=case_id,
            event_type="RESPONSE_RECEIVED",
            data=event_data,
            user_id=user_id
        )

    async def record_compliance_violation(
        self,
        case_id: str,
        user_id: str,
        creditor_id: str,
        violation_type: str,
        violation_details: Dict[str, Any]
    ) -> Optional[str]:
        """Record compliance violation event"""

        event_data = {
            "creditorId": creditor_id,
            "violationType": violation_type,
            "violationDetails": violation_details,
            "detectedTime": datetime.now().isoformat(),
            "severity": violation_details.get("severity", "MEDIUM"),
            "status": "DETECTED"
        }

        return await self.record_gdpr_event(
            case_id=case_id,
            event_type="COMPLIANCE_VIOLATION",
            data=event_data,
            user_id=user_id
        )

    async def record_case_resolved(
        self,
        case_id: str,
        user_id: str,
        resolution_type: str,
        resolution_details: Dict[str, Any]
    ) -> Optional[str]:
        """Record case resolution event"""

        event_data = {
            "resolutionType": resolution_type,
            "resolutionDetails": resolution_details,
            "resolvedTime": datetime.now().isoformat(),
            "status": "RESOLVED"
        }

        return await self.record_gdpr_event(
            case_id=case_id,
            event_type="CASE_RESOLVED",
            data=event_data,
            user_id=user_id
        )

    async def health_check(self) -> bool:
        """Check if event service is healthy"""

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base}/health",
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:

                    if response.status == 200:
                        result = await response.json()
                        return result.get("status") == "healthy"
                    else:
                        return False

        except Exception as e:
            logger.error(f"❌ Event service health check failed: {str(e)}")
            return False