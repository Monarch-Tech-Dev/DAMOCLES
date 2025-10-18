"""
Automated posting scheduler - The @ElonJet approach
Posts at optimal times for maximum engagement
"""

import asyncio
from datetime import datetime, time
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class PostScheduler:
    """Schedule automated posts at optimal times"""

    def __init__(self, data_fetcher, content_generator, social_publisher):
        self.data_fetcher = data_fetcher
        self.content_generator = content_generator
        self.social_publisher = social_publisher

        # Posting schedule (Norwegian time)
        self.schedule = {
            'daily_violation': time(8, 0),  # 8 AM every day
            'creditor_shame': time(15, 0),  # 3 PM on Wednesdays
            'weekly_summary': time(19, 0),  # 7 PM on Sundays
            'viral_comparison': time(12, 0),  # Noon on random days
        }

        self.stats = {
            'posts_sent': 0,
            'last_post_time': None,
            'errors': 0
        }

        # Control flags
        self.is_running = True
        self.is_paused = False

        # Post history
        self.post_history = []

        # Scheduled posts queue
        self.scheduled_posts = []

    async def run(self):
        """Main scheduler loop"""
        logger.info("📅 Scheduler started - Automated posting active")

        while self.is_running:
            try:
                if not self.is_paused:
                    await self._check_and_post()
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Scheduler error: {e}")
                self.stats['errors'] += 1
                await asyncio.sleep(300)  # Wait 5 minutes on error

    async def _check_and_post(self):
        """Check if any posts are due"""
        now = datetime.now()
        current_time = now.time()

        # Daily violation report (Every day at 8 AM)
        if self._is_time_to_post(current_time, self.schedule['daily_violation'], 'daily'):
            await self.post_daily_violation()

        # Creditor shame (Wednesdays at 3 PM)
        if now.weekday() == 2 and self._is_time_to_post(current_time, self.schedule['creditor_shame'], 'weekly'):
            await self.post_creditor_shame()

        # Weekly summary (Sundays at 7 PM)
        if now.weekday() == 6 and self._is_time_to_post(current_time, self.schedule['weekly_summary'], 'weekly'):
            await self.post_weekly_summary()

        # Check for milestones (anytime)
        await self.check_milestones()

    def _is_time_to_post(self, current_time: time, scheduled_time: time, frequency: str) -> bool:
        """Check if it's time to post (within 1-minute window)"""
        current_hour = current_time.hour
        current_minute = current_time.minute
        scheduled_hour = scheduled_time.hour
        scheduled_minute = scheduled_time.minute

        # Check if we're within the posting window
        return (current_hour == scheduled_hour and
                current_minute == scheduled_minute)

    async def post_daily_violation(self):
        """Post daily violation report"""
        try:
            logger.info("📊 Generating daily violation report...")

            stats = await self.data_fetcher.get_daily_stats()
            content = self.content_generator.generate_daily_violation_post(stats)

            result = await self.social_publisher.post_to_all(content, post_type='daily')

            self.stats['posts_sent'] += 1
            self.stats['last_post_time'] = datetime.now()

            logger.info(f"✅ Daily report posted: {result}")

        except Exception as e:
            logger.error(f"Failed to post daily violation: {e}")
            self.stats['errors'] += 1

    async def post_creditor_shame(self):
        """Post creditor shame alert"""
        try:
            logger.info("🚨 Generating creditor shame post...")

            worst_creditor = await self.data_fetcher.get_worst_creditor()
            if not worst_creditor:
                logger.info("No creditor data available for shame post")
                return

            content = self.content_generator.generate_creditor_shame(worst_creditor)

            result = await self.social_publisher.post_to_all(content, post_type='shame')

            self.stats['posts_sent'] += 1
            self.stats['last_post_time'] = datetime.now()

            logger.info(f"✅ Shame post published: {worst_creditor['name']}")

        except Exception as e:
            logger.error(f"Failed to post creditor shame: {e}")
            self.stats['errors'] += 1

    async def post_weekly_summary(self):
        """Post weekly summary"""
        try:
            logger.info("📈 Generating weekly summary...")

            summary = await self.data_fetcher.get_weekly_summary()
            content = self.content_generator.generate_weekly_summary(summary)

            result = await self.social_publisher.post_to_all(content, post_type='weekly')

            self.stats['posts_sent'] += 1
            self.stats['last_post_time'] = datetime.now()

            logger.info(f"✅ Weekly summary posted")

        except Exception as e:
            logger.error(f"Failed to post weekly summary: {e}")
            self.stats['errors'] += 1

    async def check_milestones(self):
        """Check and post milestones"""
        try:
            milestone = await self.data_fetcher.get_latest_milestone()

            if milestone and not milestone.get('posted', False):
                logger.info(f"🏆 Milestone detected: {milestone}")

                content = self.content_generator.generate_milestone_post(milestone)

                result = await self.social_publisher.post_to_all(content, post_type='milestone')

                # Mark milestone as posted
                await self.data_fetcher.mark_milestone_posted(milestone['id'])

                self.stats['posts_sent'] += 1
                self.stats['last_post_time'] = datetime.now()

                logger.info(f"✅ Milestone posted: {milestone['type']}")

        except Exception as e:
            logger.error(f"Failed to check milestones: {e}")

    async def post_now(self, post_type: str):
        """Manually trigger a post"""
        try:
            if post_type == 'daily':
                await self.post_daily_violation()
            elif post_type == 'shame':
                await self.post_creditor_shame()
            elif post_type == 'weekly':
                await self.post_weekly_summary()
            elif post_type == 'viral':
                data = await self.data_fetcher.get_daily_stats()
                content = self.content_generator.generate_viral_comparison(data)
                await self.social_publisher.post_to_all(content, post_type='viral')
            else:
                logger.warning(f"Unknown post type: {post_type}")

        except Exception as e:
            logger.error(f"Manual post failed: {e}")

    async def get_performance_stats(self) -> Dict[str, Any]:
        """Get scheduler performance metrics"""
        return {
            **self.stats,
            'schedule': {k: v.strftime('%H:%M') for k, v in self.schedule.items()},
            'next_daily': self._get_next_post_time(self.schedule['daily_violation']),
            'status': 'running'
        }

    def _get_next_post_time(self, scheduled_time: time) -> str:
        """Calculate next post time"""
        now = datetime.now()
        next_post = datetime.combine(now.date(), scheduled_time)

        if next_post < now:
            next_post = datetime.combine(
                now.date() + __import__('datetime').timedelta(days=1),
                scheduled_time
            )

        return next_post.isoformat()

    def pause(self):
        """Pause automated posting"""
        self.is_paused = True
        logger.info("⏸️ Scheduler paused")

    def resume(self):
        """Resume automated posting"""
        self.is_paused = False
        logger.info("▶️ Scheduler resumed")

    def _record_post(self, post_type: str, content: str, result: Dict[str, Any]):
        """Record post in history"""
        self.post_history.insert(0, {
            'timestamp': datetime.now().isoformat(),
            'type': post_type,
            'content': content[:200] + '...' if len(content) > 200 else content,
            'platforms': result,
            'success': all(r.get('status') != 'error' for r in result.values())
        })

        # Keep only last 100 posts
        if len(self.post_history) > 100:
            self.post_history = self.post_history[:100]

    def get_post_history(self, limit: int = 20) -> List[Dict]:
        """Get recent post history"""
        return self.post_history[:limit]

    async def add_scheduled_post(self, post_type: str, scheduled_time: str, content: Optional[str] = None):
        """Add a post to the schedule queue"""
        scheduled_post = {
            'id': f"{post_type}_{datetime.now().timestamp()}",
            'post_type': post_type,
            'scheduled_time': scheduled_time,
            'content': content,
            'status': 'scheduled'
        }

        self.scheduled_posts.append(scheduled_post)

        return scheduled_post
