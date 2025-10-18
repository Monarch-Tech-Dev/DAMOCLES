"""
Content generation templates for viral social media posts
"""

from typing import Dict, Any
from datetime import datetime
import random

class ContentGenerator:
    """Generate viral, accountability-driven social media content"""

    def __init__(self):
        self.emojis = {
            'alert': '🚨',
            'broken': '❌',
            'success': '✅',
            'fire': '🔥',
            'money': '💰',
            'warning': '⚠️',
            'chart': '📊',
            'target': '🎯',
            'trophy': '🏆'
        }

    def generate_daily_violation_post(self, stats: Dict[str, Any]) -> str:
        """
        Daily creditor violations update (Every morning 8 AM)
        Format: Similar to Norgespris daily updates
        """
        total_violations = stats.get('total_violations', 0)
        new_violations = stats.get('new_violations_today', 0)
        worst_creditor = stats.get('worst_creditor', 'Unknown')
        total_affected = stats.get('total_users_affected', 0)

        post = f"""{self.emojis['alert']} DAILY GDPR VIOLATION REPORT

📅 Date: {datetime.now().strftime('%d.%m.%Y')}

Total Active Violations: {total_violations}
New Violations Today: +{new_violations}
{self.emojis['fire']} Worst Offender: {worst_creditor}

{total_affected} Norwegians affected

Status: {'CRITICAL ' + self.emojis['broken'] if new_violations > 10 else 'MONITORING'}

{self.emojis['target']} Check YOUR creditor:
👉 damocles.no/check

#GDPR #ForbrukerRettigheter #Norge"""

        return post

    def generate_creditor_shame(self, creditor: Dict[str, Any]) -> str:
        """
        Name and shame worst creditor (Wednesday afternoons)
        The @ElonJet approach - public accountability
        """
        name = creditor.get('name', 'Unknown')
        violations = creditor.get('total_violations', 0)
        violation_score = creditor.get('violation_score', 0)
        response_rate = creditor.get('response_rate', 0)
        grade = self._calculate_grade(violation_score)

        post = f"""{self.emojis['alert']} CREDITOR ALERT

Company: {name}
{self.emojis['broken']} Violations: {violations}
{self.emojis['chart']} Score: {violation_score}/100
Response Rate: {response_rate}%
Grade: {grade} {self._get_grade_emoji(grade)}

{self._get_shame_comment(grade)}

Want to check YOUR creditor?
👉 damocles.no/creditor-check

#GDPR #Inkasso #ForbrukerVern"""

        return post

    def generate_weekly_summary(self, summary: Dict[str, Any]) -> str:
        """
        Weekly summary report (Sunday evening)
        Shows collective impact
        """
        total_requests = summary.get('gdpr_requests_sent', 0)
        violations_found = summary.get('violations_detected', 0)
        users_helped = summary.get('active_users', 0)
        top_violator = summary.get('top_violator', 'N/A')

        post = f"""{self.emojis['chart']} WEEKLY IMPACT REPORT

Week: {datetime.now().strftime('Week %W, %Y')}

{self.emojis['success']} GDPR Requests Sent: {total_requests}
{self.emojis['alert']} Violations Found: {violations_found}
{self.emojis['trophy']} Norwegians Protected: {users_helped}

{self.emojis['fire']} Week's Worst Offender:
{top_violator}

Together, we're creating accountability.

Join the movement:
👉 damocles.no

#Transparency #GDPR #Norge"""

        return post

    def generate_milestone_post(self, milestone: Dict[str, Any]) -> str:
        """
        Celebrate platform milestones
        Build community and momentum
        """
        type_emoji = {
            'users': '🎉',
            'requests': '📧',
            'violations': '🚨',
            'creditors': '🏢'
        }

        milestone_type = milestone.get('type', 'users')
        count = milestone.get('count', 0)
        emoji = type_emoji.get(milestone_type, '🎉')

        messages = {
            'users': f"{count:,} Norwegians now using DAMOCLES!",
            'requests': f"{count:,}th GDPR request sent!",
            'violations': f"{count:,} violations detected and counting!",
            'creditors': f"{count} creditors now tracked!"
        }

        post = f"""{emoji} MILESTONE ACHIEVED!

{messages.get(milestone_type, f'{count} milestone reached!')}

{self._get_milestone_impact(milestone_type, count)}

This is just the beginning.

Join us: damocles.no

#Milestone #GDPR #Community #Norge"""

        return post

    def generate_viral_comparison(self, data: Dict[str, Any]) -> str:
        """
        Viral comparison posts (Random throughout week)
        Make violations relatable and shareable
        """
        violation_cost = data.get('total_overcharges', 0)

        comparisons = [
            f"{violation_cost:,.0f} kr = {int(violation_cost/40)} cups of coffee",
            f"{violation_cost:,.0f} kr = {int(violation_cost/150)} months of Netflix",
            f"{violation_cost:,.0f} kr = {int(violation_cost/300)} grocery trips",
            f"{violation_cost:,.0f} kr = {int(violation_cost/1200)} electricity bills"
        ]

        comparison = random.choice(comparisons)

        post = f"""{self.emojis['money']} DID YOU KNOW?

Norwegian creditors have overcharged users:
{violation_cost:,.0f} kr this month

That's enough for:
{comparison}!

{self.emojis['fire']} Stop overpaying.
Check your bills: damocles.no

#MoneyMatters #GDPR #Norge"""

        return post

    def generate_breaking_news(self, news: Dict[str, Any]) -> str:
        """
        Breaking news alerts (When major violations detected)
        Creates urgency and FOMO
        """
        creditor = news.get('creditor', 'Unknown')
        violation_type = news.get('violation_type', 'GDPR violation')
        users_affected = news.get('users_affected', 0)

        post = f"""{self.emojis['alert']} BREAKING

{creditor} caught in major {violation_type}

{self.emojis['broken']} {users_affected}+ users potentially affected

Our AI detected this violation 12 minutes ago.
GDPR request automatically generated.

Are YOU affected?
👉 damocles.no/check-now

#Breaking #GDPR #Consumer Rights"""

        return post

    def _calculate_grade(self, score: int) -> str:
        """Calculate letter grade from violation score"""
        if score >= 90: return 'A'
        if score >= 80: return 'B'
        if score >= 70: return 'C'
        if score >= 60: return 'D'
        return 'F'

    def _get_grade_emoji(self, grade: str) -> str:
        """Get emoji for grade"""
        return {
            'A': '🌟',
            'B': '👍',
            'C': '😐',
            'D': '⚠️',
            'F': '🚨'
        }.get(grade, '❓')

    def _get_shame_comment(self, grade: str) -> str:
        """Get shame comment based on grade"""
        return {
            'A': 'Excellent GDPR compliance!',
            'B': 'Good, but room for improvement.',
            'C': 'Concerning practices detected.',
            'D': 'Multiple violations found.',
            'F': '⚠️ SERIOUS VIOLATIONS - AVOID'
        }.get(grade, 'Under review')

    def _get_milestone_impact(self, milestone_type: str, count: int) -> str:
        """Get impact message for milestone"""
        impacts = {
            'users': f"{count} voices demanding transparency!",
            'requests': "Every request creates accountability.",
            'violations': "Exposing systematic violations.",
            'creditors': "More transparency, more protection."
        }
        return impacts.get(milestone_type, "Growing stronger together!")
