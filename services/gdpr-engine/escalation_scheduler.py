"""
GDPR Request Escalation Scheduler
Automated enforcement of 30-day response deadline per GDPR Article 12(3)

Runs daily checks for:
- Day 25: Friendly reminder to creditor
- Day 35: Formal notice + Datatilsynet notification
- Day 45: Legal proceedings (forliksrådet)
- Day 60+: SWORD protocol trigger
"""

import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import Database
from services.gdpr_engine import GDPREngine
from services.email_service import EmailService

logger = logging.getLogger(__name__)

class EscalationScheduler:
    """Automated escalation for non-responsive GDPR requests"""

    def __init__(self):
        self.db = Database()
        self.email_service = EmailService()
        self.gdpr_engine = GDPREngine(self.db, self.email_service)

        # Escalation checkpoints (days after sending)
        self.checkpoints = [25, 35, 45, 60]

        # Stats tracking
        self.stats = {
            'checks_performed': 0,
            'escalations_triggered': 0,
            'last_check_time': None,
            'errors': 0
        }

        # Control flags
        self.is_running = True
        self.is_paused = False

    async def run(self):
        """Main scheduler loop - checks every hour"""
        logger.info("⚖️  GDPR Escalation Scheduler started")
        logger.info(f"📋 Monitoring checkpoints: Day {', Day '.join(map(str, self.checkpoints))}")

        # Connect to database
        await self.db.connect()

        while self.is_running:
            try:
                if not self.is_paused:
                    await self._check_pending_requests()

                # Check every hour (3600 seconds)
                await asyncio.sleep(3600)

            except Exception as e:
                logger.error(f"Scheduler error: {e}")
                self.stats['errors'] += 1
                await asyncio.sleep(600)  # Wait 10 minutes on error

        # Cleanup
        await self.db.disconnect()

    async def _check_pending_requests(self):
        """Check all pending GDPR requests for escalation"""
        try:
            logger.info("🔍 Checking for GDPR requests requiring escalation...")

            # Query for all sent requests that haven't received a response
            pending_requests = await self._get_pending_requests()

            escalation_count = 0

            for request in pending_requests:
                days_elapsed = self._calculate_days_elapsed(request)

                # Check if this request needs escalation at any checkpoint
                if days_elapsed in self.checkpoints:
                    logger.info(f"⚠️  Request {request['id']} has reached Day {days_elapsed} checkpoint")
                    await self.gdpr_engine._escalate_non_response(request['id'], days_elapsed)
                    escalation_count += 1

                # Also check if we're past day 25 but missed the exact checkpoint
                elif days_elapsed > 25 and days_elapsed < 35:
                    logger.warning(f"⏰ Request {request['id']} is overdue for Day 25 reminder (currently Day {days_elapsed})")
                    await self.gdpr_engine._escalate_non_response(request['id'], 25)
                    escalation_count += 1

            self.stats['checks_performed'] += 1
            self.stats['escalations_triggered'] += escalation_count
            self.stats['last_check_time'] = datetime.now()

            logger.info(f"✅ Check complete: {len(pending_requests)} pending requests, {escalation_count} escalations triggered")

        except Exception as e:
            logger.error(f"Error checking pending requests: {e}")
            self.stats['errors'] += 1

    async def _get_pending_requests(self) -> List[Dict[str, Any]]:
        """Get all GDPR requests awaiting response"""
        # Query user-service API for pending requests
        import aiohttp

        try:
            user_service_url = os.getenv('USER_SERVICE_URL', 'http://localhost:3001')
            service_api_key = os.getenv('SERVICE_API_KEY', 'dev-service-key-12345')

            url = f"{user_service_url}/api/internal/gdpr-requests/pending"
            headers = {'x-service-api-key': service_api_key}

            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status != 200:
                        logger.error(f"Failed to fetch pending requests: HTTP {response.status}")
                        return []

                    data = await response.json()
                    return data.get('requests', [])

        except Exception as e:
            logger.error(f"Error fetching pending requests: {e}")
            return []

    def _calculate_days_elapsed(self, request: Dict[str, Any]) -> int:
        """Calculate days since request was sent"""
        sent_at_str = request.get('sentAt') or request.get('sent_at')

        if not sent_at_str:
            return 0

        try:
            sent_at = datetime.fromisoformat(sent_at_str.replace('Z', '+00:00'))
            days_elapsed = (datetime.now(sent_at.tzinfo) - sent_at).days
            return days_elapsed
        except Exception as e:
            logger.error(f"Error calculating days elapsed: {e}")
            return 0

    async def check_now(self) -> Dict[str, Any]:
        """Manually trigger escalation check (for testing)"""
        logger.info("🔧 Manual escalation check triggered")
        await self._check_pending_requests()
        return self.get_stats()

    def get_stats(self) -> Dict[str, Any]:
        """Get scheduler statistics"""
        return {
            **self.stats,
            'status': 'paused' if self.is_paused else 'running',
            'checkpoints': self.checkpoints,
            'last_check': self.stats['last_check_time'].isoformat() if self.stats['last_check_time'] else None
        }

    def pause(self):
        """Pause automated checking"""
        self.is_paused = True
        logger.info("⏸️  Scheduler paused")

    def resume(self):
        """Resume automated checking"""
        self.is_paused = False
        logger.info("▶️  Scheduler resumed")

    def stop(self):
        """Stop scheduler gracefully"""
        self.is_running = False
        logger.info("🛑 Scheduler stopping...")


async def main():
    """Run scheduler as standalone service"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    scheduler = EscalationScheduler()

    try:
        await scheduler.run()
    except KeyboardInterrupt:
        logger.info("⚡ Shutdown signal received")
        scheduler.stop()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
