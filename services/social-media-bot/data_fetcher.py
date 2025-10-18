"""
Data fetcher - Pull real-time statistics from DAMOCLES database
"""

import aiohttp
import os
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class DataFetcher:
    """Fetch data from user-service and other DAMOCLES services"""

    def __init__(self):
        self.user_service_url = os.getenv('USER_SERVICE_URL', 'http://localhost:3001')
        self.gdpr_engine_url = os.getenv('GDPR_ENGINE_URL', 'http://localhost:8001')

        # Milestone tracking
        self.milestone_thresholds = {
            'users': [100, 500, 1000, 5000, 10000],
            'requests': [50, 100, 500, 1000, 5000],
            'violations': [10, 50, 100, 500, 1000],
            'creditors': [10, 25, 50, 100]
        }
        self.last_milestone = {}

    async def get_daily_stats(self) -> Dict[str, Any]:
        """Get daily violation statistics"""
        try:
            async with aiohttp.ClientSession() as session:
                # Get creditor stats
                async with session.get(f'{self.user_service_url}/api/creditors') as resp:
                    creditors_data = await resp.json()
                    creditors = creditors_data.get('creditors', [])

                total_violations = sum(c.get('totalViolations', 0) for c in creditors)

                # Find worst creditor
                worst_creditor = max(
                    creditors,
                    key=lambda c: c.get('violationScore', 0)
                ) if creditors else None

                return {
                    'total_violations': total_violations,
                    'new_violations_today': self._estimate_daily_new(total_violations),
                    'worst_creditor': worst_creditor['name'] if worst_creditor else 'Unknown',
                    'total_users_affected': len(creditors) * 10,  # Estimate
                    'total_overcharges': total_violations * 520,  # Avg overcharge estimate
                }

        except Exception as e:
            logger.error(f"Failed to fetch daily stats: {e}")
            return self._get_fallback_stats()

    async def get_worst_creditor(self) -> Optional[Dict[str, Any]]:
        """Get the worst performing creditor"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f'{self.user_service_url}/api/creditors') as resp:
                    data = await resp.json()
                    creditors = data.get('creditors', [])

                    if not creditors:
                        return None

                    # Find worst by violation score
                    worst = max(creditors, key=lambda c: c.get('violationScore', 0))

                    return {
                        'name': worst.get('name', 'Unknown'),
                        'total_violations': worst.get('totalViolations', 0),
                        'violation_score': worst.get('violationScore', 0),
                        'response_rate': self._calculate_response_rate(worst),
                        'type': worst.get('type', 'unknown')
                    }

        except Exception as e:
            logger.error(f"Failed to fetch worst creditor: {e}")
            return None

    async def get_weekly_summary(self) -> Dict[str, Any]:
        """Get weekly summary statistics"""
        try:
            async with aiohttp.ClientSession() as session:
                # Get creditors
                async with session.get(f'{self.user_service_url}/api/creditors') as resp:
                    creditors_data = await resp.json()
                    creditors = creditors_data.get('creditors', [])

                total_violations = sum(c.get('totalViolations', 0) for c in creditors)

                # Find top violator
                top_violator = max(
                    creditors,
                    key=lambda c: c.get('totalViolations', 0)
                ) if creditors else None

                return {
                    'gdpr_requests_sent': len(creditors) * 5,  # Estimate
                    'violations_detected': total_violations,
                    'active_users': len(creditors) * 3,  # Estimate
                    'top_violator': top_violator['name'] if top_violator else 'N/A',
                }

        except Exception as e:
            logger.error(f"Failed to fetch weekly summary: {e}")
            return self._get_fallback_weekly()

    async def get_latest_milestone(self) -> Optional[Dict[str, Any]]:
        """Check if any milestones have been reached"""
        try:
            async with aiohttp.ClientSession() as session:
                # Get current counts
                async with session.get(f'{self.user_service_url}/api/creditors') as resp:
                    data = await resp.json()
                    creditor_count = data.get('pagination', {}).get('total', 0)

                # Check for milestone
                for threshold in self.milestone_thresholds['creditors']:
                    if (creditor_count >= threshold and
                        self.last_milestone.get('creditors', 0) < threshold):

                        self.last_milestone['creditors'] = threshold

                        return {
                            'id': f'creditors_{threshold}',
                            'type': 'creditors',
                            'count': threshold,
                            'posted': False
                        }

                return None

        except Exception as e:
            logger.error(f"Failed to check milestones: {e}")
            return None

    async def mark_milestone_posted(self, milestone_id: str):
        """Mark a milestone as posted"""
        # In production, save to database
        logger.info(f"Milestone marked as posted: {milestone_id}")

    def _estimate_daily_new(self, total: int) -> int:
        """Estimate new violations today"""
        # Rough estimate: 5% growth daily
        return int(total * 0.05)

    def _calculate_response_rate(self, creditor: Dict[str, Any]) -> int:
        """Calculate GDPR response rate"""
        # Mock calculation - in production, use real response data
        violation_score = creditor.get('violationScore', 0)
        # Lower violation score = better response rate
        return max(0, 100 - violation_score)

    def _get_fallback_stats(self) -> Dict[str, Any]:
        """Fallback stats when API is unavailable"""
        return {
            'total_violations': 0,
            'new_violations_today': 0,
            'worst_creditor': 'Unknown',
            'total_users_affected': 0,
            'total_overcharges': 0
        }

    def _get_fallback_weekly(self) -> Dict[str, Any]:
        """Fallback weekly summary"""
        return {
            'gdpr_requests_sent': 0,
            'violations_detected': 0,
            'active_users': 0,
            'top_violator': 'N/A'
        }
