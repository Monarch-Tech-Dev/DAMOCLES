"""
Creditor Portal Service
Provides API for creditors to view violations, respond to GDPR requests, and negotiate settlements

Sacred Architecture: Transparency gives creditors opportunity to self-correct
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import logging
import hashlib
import secrets

logger = logging.getLogger(__name__)


class CreditorPortalService:
    """Service for creditor-facing portal functionality"""

    def __init__(self):
        # Access control
        self.session_duration_hours = 24

        # Norwegian language support
        self.status_translations = {
            "PENDING": "Venter på svar",
            "RESPONDED": "Besvart",
            "EXPIRED": "Utløpt",
            "ESCALATED": "Eskalert"
        }

    async def get_creditor_dashboard(
        self,
        creditor_id: str,
        creditor_data: Dict[str, Any],
        gdpr_requests: List[Dict[str, Any]],
        violations: List[Dict[str, Any]],
        settlements: List[Dict[str, Any]],
        datatilsynet_complaints: List[Dict[str, Any]],
        sword_tokens: List[Dict[str, Any]],
        transparency_report: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive dashboard for creditor portal.

        Shows creditor their current compliance status and action items.
        """

        # Calculate urgent action items
        urgent_items = self._get_urgent_action_items(
            gdpr_requests,
            settlements,
            datatilsynet_complaints
        )

        # Calculate compliance trends
        trends = self._calculate_compliance_trends(gdpr_requests, violations)

        # Get pending responses
        pending_responses = [
            req for req in gdpr_requests
            if req.get("status") in ["PENDING", "SENT"]
        ]

        # Get active settlements
        active_settlements = [
            s for s in settlements
            if s.get("status") in ["pending", "negotiating"]
        ]

        dashboard = {
            "creditor": {
                "id": creditor_id,
                "name": creditor_data.get("name"),
                "org_number": creditor_data.get("org_number"),
                "type": creditor_data.get("type")
            },
            "compliance_summary": {
                "grade": transparency_report.get("compliance_grade", {}).get("grade", "F"),
                "reputation_score": transparency_report.get("reputation_score", 0),
                "total_violations": len(violations),
                "pending_gdpr_requests": len(pending_responses),
                "active_settlements": len(active_settlements),
                "datatilsynet_complaints": len(datatilsynet_complaints),
                "sword_tokens_minted": len(sword_tokens)
            },
            "urgent_actions": urgent_items,
            "trends": trends,
            "recent_activity": self._get_recent_activity(
                gdpr_requests,
                settlements,
                violations
            ),
            "dashboard_generated_at": datetime.now().isoformat()
        }

        logger.info(f"📊 Creditor dashboard generated for {creditor_data.get('name')}")
        logger.info(f"   Grade: {dashboard['compliance_summary']['grade']}")
        logger.info(f"   Urgent actions: {len(urgent_items)}")

        return dashboard

    async def respond_to_gdpr_request(
        self,
        creditor_id: str,
        gdpr_request_id: str,
        response_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Allow creditor to respond to a GDPR request.

        Response includes:
        - Personal data provided
        - Explanation of data processing
        - Optional: Confirmation of data deletion
        """

        response_type = response_data.get("type", "full_response")
        data_provided = response_data.get("data_provided", {})
        processing_explanation = response_data.get("processing_explanation", "")
        data_deleted = response_data.get("data_deleted", False)
        additional_notes = response_data.get("notes", "")

        # Validate response completeness
        is_complete = self._validate_gdpr_response(data_provided, processing_explanation)

        response = {
            "gdpr_request_id": gdpr_request_id,
            "creditor_id": creditor_id,
            "response_type": response_type,
            "data_provided": data_provided,
            "processing_explanation": processing_explanation,
            "data_deleted": data_deleted,
            "additional_notes": additional_notes,
            "is_complete": is_complete,
            "responded_at": datetime.now().isoformat(),
            "response_status": "complete" if is_complete else "incomplete"
        }

        logger.info(f"✅ GDPR response submitted by creditor {creditor_id}")
        logger.info(f"   Request: {gdpr_request_id}")
        logger.info(f"   Complete: {is_complete}")

        return response

    async def respond_to_settlement(
        self,
        creditor_id: str,
        settlement_id: str,
        response_action: str,
        counter_offer_amount: Optional[float] = None,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Allow creditor to respond to settlement offer.

        Actions: "accept", "reject", "counter"
        """

        valid_actions = ["accept", "reject", "counter"]
        if response_action not in valid_actions:
            raise ValueError(f"Invalid action. Must be one of: {valid_actions}")

        if response_action == "counter" and not counter_offer_amount:
            raise ValueError("Counter-offer requires counter_offer_amount")

        response = {
            "settlement_id": settlement_id,
            "creditor_id": creditor_id,
            "action": response_action,
            "counter_offer_amount": counter_offer_amount,
            "notes": notes,
            "responded_at": datetime.now().isoformat()
        }

        logger.info(f"💼 Settlement response from creditor {creditor_id}")
        logger.info(f"   Settlement: {settlement_id}")
        logger.info(f"   Action: {response_action}")
        if counter_offer_amount:
            logger.info(f"   Counter-offer: {counter_offer_amount} NOK")

        return response

    async def view_violations(
        self,
        creditor_id: str,
        violations: List[Dict[str, Any]],
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Show creditor all violations reported against them.

        Allows filtering by severity, type, date range.
        """

        # Apply filters
        filtered_violations = violations

        if filters:
            severity_filter = filters.get("severity")
            if severity_filter:
                filtered_violations = [
                    v for v in filtered_violations
                    if v.get("severity") == severity_filter
                ]

            type_filter = filters.get("type")
            if type_filter:
                filtered_violations = [
                    v for v in filtered_violations
                    if v.get("type") == type_filter
                ]

        # Group by severity
        by_severity = {}
        for violation in filtered_violations:
            severity = violation.get("severity", "unknown")
            if severity not in by_severity:
                by_severity[severity] = []
            by_severity[severity].append(violation)

        # Group by type
        by_type = {}
        for violation in filtered_violations:
            vtype = violation.get("type", "unknown")
            if vtype not in by_type:
                by_type[vtype] = []
            by_type[vtype].append(violation)

        return {
            "creditor_id": creditor_id,
            "total_violations": len(filtered_violations),
            "by_severity": {
                severity: {
                    "count": len(viols),
                    "violations": viols
                }
                for severity, viols in by_severity.items()
            },
            "by_type": {
                vtype: {
                    "count": len(viols),
                    "violations": viols
                }
                for vtype, viols in by_type.items()
            },
            "violations": filtered_violations,
            "filters_applied": filters or {},
            "retrieved_at": datetime.now().isoformat()
        }

    async def dispute_violation(
        self,
        creditor_id: str,
        violation_id: str,
        dispute_reason: str,
        evidence: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Allow creditor to dispute a violation.

        Requires:
        - Clear explanation of why violation is incorrect
        - Supporting evidence (optional)
        """

        if len(dispute_reason) < 50:
            raise ValueError("Dispute reason must be at least 50 characters")

        dispute = {
            "violation_id": violation_id,
            "creditor_id": creditor_id,
            "dispute_reason": dispute_reason,
            "evidence": evidence or {},
            "status": "under_review",
            "submitted_at": datetime.now().isoformat(),
            "review_deadline": (datetime.now() + timedelta(days=14)).isoformat()
        }

        logger.info(f"⚖️  Violation dispute submitted by creditor {creditor_id}")
        logger.info(f"   Violation: {violation_id}")
        logger.info(f"   Reason length: {len(dispute_reason)} chars")

        return dispute

    async def request_score_improvement_plan(
        self,
        creditor_id: str,
        current_grade: str,
        target_grade: str,
        violations: List[Dict[str, Any]],
        gdpr_requests: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate action plan for creditor to improve compliance score.

        Shows concrete steps to improve from current grade to target grade.
        """

        # Calculate what's needed for target grade
        grade_requirements = {
            "A": {"response_rate": 95, "avg_response_days": 15, "max_violations": 10},
            "B": {"response_rate": 85, "avg_response_days": 20, "max_violations": 25},
            "C": {"response_rate": 70, "avg_response_days": 25, "max_violations": 50},
            "D": {"response_rate": 50, "avg_response_days": 30, "max_violations": 100}
        }

        target_reqs = grade_requirements.get(target_grade, {})

        # Calculate current metrics
        total_requests = len(gdpr_requests)
        responded = len([r for r in gdpr_requests if r.get("status") == "RESPONDED"])
        current_response_rate = (responded / total_requests * 100) if total_requests > 0 else 0

        # Generate action items
        action_items = []

        # Response rate improvement
        if current_response_rate < target_reqs.get("response_rate", 0):
            pending = total_requests - responded
            action_items.append({
                "category": "response_rate",
                "priority": "high",
                "action": f"Responder på {pending} utestående GDPR-forespørsler",
                "impact": f"Vil øke svarrate til {target_reqs.get('response_rate')}%"
            })

        # Violation reduction
        current_violations = len(violations)
        max_allowed = target_reqs.get("max_violations", 0)
        if current_violations > max_allowed:
            excess = current_violations - max_allowed
            action_items.append({
                "category": "violations",
                "priority": "high",
                "action": f"Reduser antall overtredelser med {excess}",
                "impact": f"Må være under {max_allowed} overtredelser for {target_grade}-karakter"
            })

        # Response time improvement
        action_items.append({
            "category": "response_time",
            "priority": "medium",
            "action": f"Svar på GDPR-forespørsler innen {target_reqs.get('avg_response_days')} dager",
            "impact": "Forbedrer gjennomsnittlig responstid"
        })

        improvement_plan = {
            "creditor_id": creditor_id,
            "current_grade": current_grade,
            "target_grade": target_grade,
            "requirements": target_reqs,
            "current_metrics": {
                "response_rate": round(current_response_rate, 1),
                "total_violations": current_violations,
                "pending_responses": total_requests - responded
            },
            "action_items": action_items,
            "estimated_timeline": f"{len(action_items) * 7}-{len(action_items) * 14} dager",
            "generated_at": datetime.now().isoformat()
        }

        logger.info(f"📈 Improvement plan generated for creditor {creditor_id}")
        logger.info(f"   Current: {current_grade} → Target: {target_grade}")
        logger.info(f"   Action items: {len(action_items)}")

        return improvement_plan

    def generate_access_token(
        self,
        creditor_id: str,
        creditor_email: str
    ) -> Dict[str, Any]:
        """
        Generate secure access token for creditor portal.

        In production, this would:
        1. Verify creditor email via magic link
        2. Generate JWT token
        3. Set expiration
        4. Track session
        """

        # Generate secure token
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(hours=self.session_duration_hours)

        # Hash token for storage
        token_hash = hashlib.sha256(token.encode()).hexdigest()

        access_token = {
            "token": token,
            "token_hash": token_hash,
            "creditor_id": creditor_id,
            "creditor_email": creditor_email,
            "issued_at": datetime.now().isoformat(),
            "expires_at": expires_at.isoformat(),
            "session_duration_hours": self.session_duration_hours
        }

        logger.info(f"🔑 Access token generated for creditor {creditor_id}")

        return access_token

    def _get_urgent_action_items(
        self,
        gdpr_requests: List[Dict[str, Any]],
        settlements: List[Dict[str, Any]],
        datatilsynet_complaints: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Identify urgent action items requiring immediate attention"""

        urgent_items = []

        # Overdue GDPR requests
        now = datetime.now()
        for request in gdpr_requests:
            if request.get("status") == "PENDING":
                deadline = request.get("response_due")
                if deadline:
                    try:
                        deadline_dt = datetime.fromisoformat(str(deadline).replace('Z', '+00:00'))
                        days_remaining = (deadline_dt - now).days

                        if days_remaining < 0:
                            urgent_items.append({
                                "type": "overdue_gdpr_request",
                                "priority": "critical",
                                "message": f"GDPR-forespørsel {days_remaining * -1} dager forsinket",
                                "request_id": request.get("id"),
                                "deadline": deadline
                            })
                        elif days_remaining <= 5:
                            urgent_items.append({
                                "type": "expiring_gdpr_request",
                                "priority": "high",
                                "message": f"GDPR-forespørsel forfaller om {days_remaining} dager",
                                "request_id": request.get("id"),
                                "deadline": deadline
                            })
                    except:
                        pass

        # Pending settlement responses
        for settlement in settlements:
            if settlement.get("status") == "pending":
                urgent_items.append({
                    "type": "pending_settlement",
                    "priority": "medium",
                    "message": "Forlikstilbud venter på svar",
                    "settlement_id": settlement.get("id"),
                    "amount": settlement.get("settlement_amount")
                })

        # Datatilsynet complaints
        for complaint in datatilsynet_complaints:
            if complaint.get("status") in ["submitted", "under_review"]:
                urgent_items.append({
                    "type": "datatilsynet_complaint",
                    "priority": "critical",
                    "message": "Klage til Datatilsynet under behandling",
                    "complaint_id": complaint.get("id"),
                    "estimated_fine": complaint.get("estimated_fine")
                })

        # Sort by priority
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        urgent_items.sort(key=lambda x: priority_order.get(x.get("priority", "low"), 3))

        return urgent_items

    def _calculate_compliance_trends(
        self,
        gdpr_requests: List[Dict[str, Any]],
        violations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate compliance trends over time"""

        # Simple trend: last 30 days vs previous 30 days
        now = datetime.now()
        thirty_days_ago = now - timedelta(days=30)
        sixty_days_ago = now - timedelta(days=60)

        # Recent violations
        recent_violations = len([
            v for v in violations
            if self._is_date_in_range(v.get("detected_at"), thirty_days_ago, now)
        ])

        # Previous period violations
        previous_violations = len([
            v for v in violations
            if self._is_date_in_range(v.get("detected_at"), sixty_days_ago, thirty_days_ago)
        ])

        # Calculate trend
        trend = "improving" if recent_violations < previous_violations else "worsening"
        if recent_violations == previous_violations:
            trend = "stable"

        return {
            "period": "last_30_days",
            "recent_violations": recent_violations,
            "previous_violations": previous_violations,
            "trend": trend,
            "change_percentage": self._calculate_percentage_change(previous_violations, recent_violations)
        }

    def _get_recent_activity(
        self,
        gdpr_requests: List[Dict[str, Any]],
        settlements: List[Dict[str, Any]],
        violations: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Get recent activity log"""

        activity = []

        # Recent GDPR requests
        for req in gdpr_requests[:5]:
            activity.append({
                "type": "gdpr_request",
                "date": req.get("sent_at"),
                "description": f"GDPR-forespørsel mottatt - Status: {req.get('status')}"
            })

        # Recent violations
        for viol in violations[:5]:
            activity.append({
                "type": "violation",
                "date": viol.get("detected_at"),
                "description": f"Overtredelse registrert: {viol.get('type')} ({viol.get('severity')})"
            })

        # Sort by date (most recent first)
        activity.sort(key=lambda x: x.get("date", ""), reverse=True)

        return activity[:10]  # Return top 10 most recent

    def _validate_gdpr_response(
        self,
        data_provided: Dict[str, Any],
        processing_explanation: str
    ) -> bool:
        """Validate completeness of GDPR response"""

        if not data_provided:
            return False

        if len(processing_explanation) < 100:
            return False

        return True

    def _is_date_in_range(
        self,
        date_str: Optional[str],
        start: datetime,
        end: datetime
    ) -> bool:
        """Check if date falls within range"""

        if not date_str:
            return False

        try:
            date = datetime.fromisoformat(str(date_str).replace('Z', '+00:00'))
            return start <= date <= end
        except:
            return False

    def _calculate_percentage_change(self, old_value: float, new_value: float) -> float:
        """Calculate percentage change between two values"""

        if old_value == 0:
            return 100.0 if new_value > 0 else 0.0

        change = ((new_value - old_value) / old_value) * 100
        return round(change, 1)
