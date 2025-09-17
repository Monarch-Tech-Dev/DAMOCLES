import asyncio
import aiohttp
from typing import Dict, Any, List
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

class LearningIntegration:
    """
    Integration layer between GDPR Engine and Learning Evolution Engine
    Records all GDPR interactions as learning events to improve future strategies
    """

    def __init__(self, learning_engine_url: str = "http://learning-engine:8005"):
        self.learning_engine_url = learning_engine_url
        self.session = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def record_gdpr_sent(
        self,
        user_id: str,
        creditor_id: str,
        strategy: str,
        template_used: str,
        metadata: Dict[str, Any] = None
    ):
        """Record when a GDPR request is sent"""

        learning_event = {
            "eventType": "gdpr_sent",
            "userId": user_id,
            "creditorId": creditor_id,
            "strategy": strategy,
            "success": False,  # Will be updated when response received
            "metadata": {
                "template_used": template_used,
                "sent_at": datetime.now().isoformat(),
                **(metadata or {})
            }
        }

        await self._send_learning_event(learning_event)
        logger.info(f"📚 Recorded GDPR sent event: {user_id} -> {creditor_id} using {strategy}")

    async def record_gdpr_response(
        self,
        user_id: str,
        creditor_id: str,
        strategy: str,
        response_received: bool,
        response_time_hours: float,
        violations_found: List[Dict[str, Any]],
        admission_detected: bool = False,
        admission_text: str = None,
        metadata: Dict[str, Any] = None
    ):
        """Record when a GDPR response is received and analyzed"""

        # Determine success based on response and violations
        success = response_received and (len(violations_found) > 0 or admission_detected)

        learning_event = {
            "eventType": "response_received",
            "userId": user_id,
            "creditorId": creditor_id,
            "strategy": strategy,
            "success": success,
            "responseTimeHours": response_time_hours,
            "violationType": violations_found[0].get("type") if violations_found else None,
            "admissionText": admission_text if admission_detected else None,
            "metadata": {
                "response_received": response_received,
                "violations_count": len(violations_found),
                "admission_detected": admission_detected,
                "violations": violations_found[:3],  # Store first 3 violations
                "analyzed_at": datetime.now().isoformat(),
                **(metadata or {})
            }
        }

        await self._send_learning_event(learning_event)
        logger.info(f"📊 Recorded GDPR response: {user_id} -> {creditor_id}, Success: {success}")

        # If successful, also record specific violation findings
        if violations_found and admission_detected:
            await self._record_admission_found(user_id, creditor_id, strategy, violations_found, admission_text)

    async def record_settlement_reached(
        self,
        user_id: str,
        creditor_id: str,
        strategy: str,
        recovery_amount: float,
        original_debt: float,
        pdi_improvement: float = None,
        metadata: Dict[str, Any] = None
    ):
        """Record when a settlement is successfully reached"""

        learning_event = {
            "eventType": "settlement_reached",
            "userId": user_id,
            "creditorId": creditor_id,
            "strategy": strategy,
            "success": True,
            "recoveryAmount": recovery_amount,
            "pdiImpact": pdi_improvement,
            "metadata": {
                "original_debt": original_debt,
                "recovery_percentage": (recovery_amount / original_debt) * 100 if original_debt > 0 else 0,
                "settled_at": datetime.now().isoformat(),
                **(metadata or {})
            }
        }

        await self._send_learning_event(learning_event)
        logger.info(f"💰 Recorded settlement: {user_id} -> {creditor_id}, Recovery: {recovery_amount} NOK")

    async def get_optimal_strategy(self, creditor_id: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get the optimal strategy for a creditor based on learning"""

        if not self.session:
            self.session = aiohttp.ClientSession()

        try:
            params = {}
            if context:
                params.update(context)

            async with self.session.get(
                f"{self.learning_engine_url}/strategy/{creditor_id}",
                params=params
            ) as response:
                if response.status == 200:
                    strategy_data = await response.json()
                    logger.info(f"🎯 Retrieved optimal strategy for {creditor_id}: {strategy_data.get('strategy')}")
                    return strategy_data
                else:
                    logger.warning(f"Failed to get strategy for {creditor_id}: {response.status}")
                    return self._get_default_strategy()

        except Exception as e:
            logger.error(f"Error getting optimal strategy: {e}")
            return self._get_default_strategy()

    async def get_collective_intelligence(self, creditor_id: str) -> Dict[str, Any]:
        """Get collective intelligence data for a creditor"""

        if not self.session:
            self.session = aiohttp.ClientSession()

        try:
            async with self.session.get(
                f"{self.learning_engine_url}/intelligence/{creditor_id}"
            ) as response:
                if response.status == 200:
                    intelligence_data = await response.json()
                    logger.info(f"🧠 Retrieved collective intelligence for {creditor_id}")
                    return intelligence_data
                else:
                    logger.warning(f"No collective intelligence found for {creditor_id}")
                    return None

        except Exception as e:
            logger.error(f"Error getting collective intelligence: {e}")
            return None

    async def check_class_action_eligibility(self, creditor_id: str) -> bool:
        """Check if creditor is eligible for class action"""

        intelligence = await self.get_collective_intelligence(creditor_id)

        if intelligence:
            return intelligence.get('classActionEligible', False)

        return False

    async def _record_admission_found(
        self,
        user_id: str,
        creditor_id: str,
        strategy: str,
        violations: List[Dict[str, Any]],
        admission_text: str
    ):
        """Record when admission/violation is found in response"""

        learning_event = {
            "eventType": "admission_found",
            "userId": user_id,
            "creditorId": creditor_id,
            "strategy": strategy,
            "success": True,
            "admissionText": admission_text,
            "violationType": violations[0].get("type") if violations else "unknown",
            "metadata": {
                "violations": violations,
                "admission_strength": len(violations),
                "found_at": datetime.now().isoformat()
            }
        }

        await self._send_learning_event(learning_event)

    async def _send_learning_event(self, event: Dict[str, Any]):
        """Send learning event to Learning Evolution Engine"""

        if not self.session:
            self.session = aiohttp.ClientSession()

        try:
            async with self.session.post(
                f"{self.learning_engine_url}/events",
                json=event,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.debug(f"Learning event recorded: {result}")
                else:
                    logger.error(f"Failed to record learning event: {response.status}")

        except Exception as e:
            logger.error(f"Error sending learning event: {e}")

    def _get_default_strategy(self) -> Dict[str, Any]:
        """Return default strategy when learning engine is unavailable"""

        return {
            "strategy": "generic_gdpr_request",
            "expectedSuccessRate": 0.2,
            "triggerPhrases": [
                "Please provide information according to GDPR Article 15",
                "I request access to my personal data"
            ],
            "estimatedResponseTime": 720  # 30 days in hours
        }

class EnhancedGDPREngine:
    """
    Enhanced GDPR Engine with Learning Integration
    Combines existing GDPR functionality with learning-based strategy optimization
    """

    def __init__(self, database, learning_integration: LearningIntegration):
        from services.gdpr_engine import GDPREngine
        self.base_engine = GDPREngine(database)
        self.learning = learning_integration
        self.database = database

    async def generate_optimized_gdpr_request(self, user, creditor):
        """Generate GDPR request using learned optimal strategy"""

        # Get optimal strategy from learning engine
        strategy_data = await self.learning.get_optimal_strategy(
            creditor.id,
            context={
                "creditor_type": creditor.type,
                "user_tier": getattr(user, 'shieldTier', 'bronze')
            }
        )

        # Determine template based on learning or fall back to base logic
        if strategy_data['expectedSuccessRate'] > 0.5:
            # Use learned optimal strategy
            template_name = self._get_template_for_strategy(strategy_data['strategy'], creditor.type)
        else:
            # Fall back to base template selection
            template_name = self.base_engine.templates.get(
                creditor.type.lower(),
                self.base_engine.templates['default']
            )

        # Generate request using base engine but with optimized template
        gdpr_request = await self.base_engine.generate_gdpr_request(user, creditor)

        # Record the learning event
        await self.learning.record_gdpr_sent(
            user_id=user.id,
            creditor_id=creditor.id,
            strategy=strategy_data['strategy'],
            template_used=template_name,
            metadata={
                "expected_success_rate": strategy_data['expectedSuccessRate'],
                "trigger_phrases": strategy_data['triggerPhrases']
            }
        )

        return gdpr_request

    async def process_optimized_gdpr_response(self, request_id: str, response_content: bytes, response_format: str):
        """Process GDPR response with learning integration"""

        # Get the original request
        gdpr_request = await self.database.get_gdpr_request(request_id)
        if not gdpr_request:
            raise Exception("GDPR request not found")

        # Calculate response time
        response_time_hours = (
            datetime.now() - gdpr_request.sent_at
        ).total_seconds() / 3600 if gdpr_request.sent_at else None

        # Process response using base engine
        violations = await self.base_engine.process_gdpr_response(
            request_id, response_content, response_format
        )

        # Detect admissions in the response
        admission_detected, admission_text = self._detect_admission_in_response(response_content)

        # Record learning event
        await self.learning.record_gdpr_response(
            user_id=gdpr_request.user_id,
            creditor_id=gdpr_request.creditor_id,
            strategy=gdpr_request.content.get('strategy', 'unknown'),  # Would need to store this
            response_received=True,
            response_time_hours=response_time_hours or 0,
            violations_found=violations,
            admission_detected=admission_detected,
            admission_text=admission_text
        )

        # Check if this creditor is now eligible for class action
        if len(violations) > 0:
            class_action_eligible = await self.learning.check_class_action_eligibility(gdpr_request.creditor_id)
            if class_action_eligible:
                logger.info(f"🗡️ Creditor {gdpr_request.creditor_id} is now eligible for class action")

        return violations

    def _get_template_for_strategy(self, strategy: str, creditor_type: str) -> str:
        """Map learned strategy to appropriate template"""

        strategy_template_map = {
            'gdpr_inkasso_template': 'gdpr_inkasso.html',
            'gdpr_bank_template': 'gdpr_bank.html',
            'gdpr_bnpl_template': 'gdpr_bnpl.html',
            'fee_challenge_strategy': 'gdpr_inkasso.html',  # Use inkasso for fee challenges
            'compound_interest_strategy': 'gdpr_bank.html',  # Use bank for interest issues
        }

        return strategy_template_map.get(strategy, self.base_engine.templates.get(
            creditor_type.lower(),
            self.base_engine.templates['default']
        ))

    def _detect_admission_in_response(self, response_content: bytes) -> tuple[bool, str]:
        """Detect admission or violation confirmation in response"""

        try:
            content = response_content.decode('utf-8', errors='ignore').lower()

            admission_patterns = [
                'we acknowledge',
                'we confirm',
                'error was made',
                'mistake occurred',
                'will refund',
                'will adjust',
                'violation occurred',
                'fee was incorrect',
                'charge was improper'
            ]

            for pattern in admission_patterns:
                if pattern in content:
                    # Extract surrounding context for admission text
                    start_idx = max(0, content.find(pattern) - 100)
                    end_idx = min(len(content), content.find(pattern) + 200)
                    admission_context = content[start_idx:end_idx]
                    return True, admission_context

            return False, None

        except Exception as e:
            logger.error(f"Error detecting admission: {e}")
            return False, None

# Usage example for integration
async def example_usage():
    """Example of how to use the enhanced GDPR engine with learning"""

    async with LearningIntegration() as learning:
        # Mock database and user/creditor objects
        database = None  # Would be actual database
        user = type('User', (), {'id': 'user123', 'email': 'user@example.com'})()
        creditor = type('Creditor', (), {'id': 'creditor456', 'type': 'inkasso', 'name': 'Test Inkasso'})()

        # Create enhanced engine
        enhanced_engine = EnhancedGDPREngine(database, learning)

        # Generate optimized GDPR request
        gdpr_request = await enhanced_engine.generate_optimized_gdpr_request(user, creditor)

        # Process response (mock response)
        mock_response = b"We acknowledge that the fee calculation contained an error."
        violations = await enhanced_engine.process_optimized_gdpr_response(
            gdpr_request.id, mock_response, "email"
        )

        print(f"Found {len(violations)} violations with learning integration")

if __name__ == "__main__":
    asyncio.run(example_usage())