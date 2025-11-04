"""
Public Transparency Reporting Service
Generates public reports exposing creditor GDPR compliance violations

Sacred Architecture Principle: Sunlight is the best disinfectant.
Public accountability creates market pressure for compliance.
"""

from typing import Dict, List, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class TransparencyService:
    """Service for generating public transparency reports on creditor compliance"""

    def __init__(self):
        # Grading thresholds
        self.grade_thresholds = {
            "A": {"violation_score": 0, "response_rate": 95, "avg_response_days": 15},
            "B": {"violation_score": 10, "response_rate": 85, "avg_response_days": 20},
            "C": {"violation_score": 25, "response_rate": 70, "avg_response_days": 25},
            "D": {"violation_score": 50, "response_rate": 50, "avg_response_days": 30},
            "F": {"violation_score": 100, "response_rate": 0, "avg_response_days": 999}
        }

        # Norwegian compliance language
        self.compliance_levels = {
            "excellent": "Utmerket etterlevelse",
            "good": "God etterlevelse",
            "fair": "Akseptabel etterlevelse",
            "poor": "Dårlig etterlevelse",
            "failing": "Svært dårlig etterlevelse - systematiske brudd"
        }

    async def generate_creditor_report(
        self,
        creditor_data: Dict[str, Any],
        violations: List[Dict[str, Any]],
        gdpr_requests: List[Dict[str, Any]],
        datatilsynet_complaints: List[Dict[str, Any]],
        settlements: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive public transparency report for a creditor.

        Returns public scorecard with:
        - Compliance grade (A-F)
        - Violation statistics
        - Response time metrics
        - Datatilsynet complaint count
        - Settlement behavior
        - Public reputation score
        """

        # Calculate metrics
        violation_metrics = self._calculate_violation_metrics(violations)
        response_metrics = self._calculate_response_metrics(gdpr_requests)
        settlement_metrics = self._calculate_settlement_metrics(settlements)
        complaint_metrics = self._calculate_complaint_metrics(datatilsynet_complaints)

        # Calculate overall compliance grade
        compliance_grade = self._calculate_compliance_grade(
            violation_metrics,
            response_metrics,
            settlement_metrics,
            complaint_metrics
        )

        # Generate public summary
        public_summary = self._generate_public_summary(
            creditor_data,
            compliance_grade,
            violation_metrics,
            response_metrics,
            complaint_metrics
        )

        # Calculate reputation score (0-100)
        reputation_score = self._calculate_reputation_score(
            compliance_grade,
            violation_metrics,
            response_metrics,
            settlement_metrics,
            complaint_metrics
        )

        report = {
            "creditor": {
                "name": creditor_data.get("name"),
                "org_number": creditor_data.get("org_number"),
                "type": creditor_data.get("type", "INKASSO"),
                "industry": "Debt Collection"
            },
            "compliance_grade": compliance_grade,
            "reputation_score": reputation_score,
            "metrics": {
                "violations": violation_metrics,
                "response_performance": response_metrics,
                "settlements": settlement_metrics,
                "datatilsynet_complaints": complaint_metrics
            },
            "public_summary": public_summary,
            "report_metadata": {
                "generated_at": datetime.now().isoformat(),
                "report_period": "all_time",
                "data_sources": ["DAMOCLES Platform", "User Reports", "Public Records"],
                "transparency_version": "1.0"
            }
        }

        logger.info(f"📊 Generated transparency report for {creditor_data.get('name')}")
        logger.info(f"   Grade: {compliance_grade['grade']} | Score: {reputation_score}/100")

        return report

    def _calculate_violation_metrics(self, violations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate violation statistics"""

        total_violations = len(violations)

        # Count by severity
        severity_counts = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }

        # Count by type
        violation_types = {}

        # Calculate violation score (weighted by severity)
        violation_score = 0
        severity_weights = {"critical": 10, "high": 5, "medium": 2, "low": 1}

        for violation in violations:
            severity = violation.get("severity", "low")
            if severity in severity_counts:
                severity_counts[severity] += 1

            violation_type = violation.get("type", "unknown")
            violation_types[violation_type] = violation_types.get(violation_type, 0) + 1

            violation_score += severity_weights.get(severity, 1)

        # Find most common violation types
        top_violations = sorted(
            violation_types.items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]

        return {
            "total_violations": total_violations,
            "violation_score": violation_score,
            "severity_breakdown": severity_counts,
            "top_violation_types": [
                {"type": vtype, "count": count} for vtype, count in top_violations
            ],
            "critical_violations": severity_counts["critical"],
            "high_violations": severity_counts["high"]
        }

    def _calculate_response_metrics(self, gdpr_requests: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate GDPR request response performance"""

        total_requests = len(gdpr_requests)

        if total_requests == 0:
            return {
                "total_requests": 0,
                "response_rate": 0,
                "avg_response_days": None,
                "on_time_rate": 0,
                "never_responded": 0
            }

        responded = 0
        total_response_days = 0
        on_time = 0
        never_responded = 0

        for request in gdpr_requests:
            status = request.get("status", "PENDING")

            if status in ["COMPLETED", "RESPONDED"]:
                responded += 1

                # Calculate response time
                sent_at = request.get("sent_at")
                responded_at = request.get("responded_at")

                if sent_at and responded_at:
                    try:
                        sent_date = datetime.fromisoformat(str(sent_at).replace('Z', '+00:00'))
                        response_date = datetime.fromisoformat(str(responded_at).replace('Z', '+00:00'))
                        response_days = (response_date - sent_date).days
                        total_response_days += response_days

                        # Check if on time (within 30 days)
                        if response_days <= 30:
                            on_time += 1
                    except Exception as e:
                        logger.warning(f"Error calculating response time: {e}")

            elif status in ["EXPIRED", "NO_RESPONSE"]:
                never_responded += 1

        response_rate = (responded / total_requests) * 100 if total_requests > 0 else 0
        avg_response_days = total_response_days / responded if responded > 0 else None
        on_time_rate = (on_time / total_requests) * 100 if total_requests > 0 else 0

        return {
            "total_requests": total_requests,
            "responded": responded,
            "response_rate": round(response_rate, 1),
            "avg_response_days": round(avg_response_days, 1) if avg_response_days else None,
            "on_time_rate": round(on_time_rate, 1),
            "never_responded": never_responded,
            "late_responses": responded - on_time if responded > on_time else 0
        }

    def _calculate_settlement_metrics(self, settlements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate settlement behavior metrics"""

        total_offers = len(settlements)

        if total_offers == 0:
            return {
                "total_offers": 0,
                "acceptance_rate": 0,
                "avg_reduction": 0,
                "negotiation_rounds": 0
            }

        accepted = 0
        total_reduction = 0
        total_rounds = 0

        for settlement in settlements:
            status = settlement.get("status", "pending")

            if status in ["accepted", "completed"]:
                accepted += 1

            # Calculate reduction percentage
            original_amount = settlement.get("original_amount", 0)
            settlement_amount = settlement.get("settlement_amount", 0)

            if original_amount > 0:
                reduction = ((original_amount - settlement_amount) / original_amount) * 100
                total_reduction += reduction

            # Count negotiation rounds
            rounds = settlement.get("negotiation_rounds", 1)
            total_rounds += rounds

        acceptance_rate = (accepted / total_offers) * 100 if total_offers > 0 else 0
        avg_reduction = total_reduction / total_offers if total_offers > 0 else 0
        avg_rounds = total_rounds / total_offers if total_offers > 0 else 0

        return {
            "total_offers": total_offers,
            "accepted": accepted,
            "acceptance_rate": round(acceptance_rate, 1),
            "avg_reduction_percentage": round(avg_reduction, 1),
            "avg_negotiation_rounds": round(avg_rounds, 1),
            "willing_to_negotiate": acceptance_rate > 0
        }

    def _calculate_complaint_metrics(self, complaints: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate Datatilsynet complaint metrics"""

        total_complaints = len(complaints)

        if total_complaints == 0:
            return {
                "total_complaints": 0,
                "pending_complaints": 0,
                "resolved_complaints": 0,
                "estimated_total_fines": 0
            }

        pending = 0
        resolved = 0
        total_fines = 0

        for complaint in complaints:
            status = complaint.get("status", "submitted")

            if status in ["submitted", "under_review"]:
                pending += 1
            elif status in ["resolved", "closed"]:
                resolved += 1

            # Sum estimated fines
            estimated_fine = complaint.get("estimated_fine", 0)
            total_fines += estimated_fine

        return {
            "total_complaints": total_complaints,
            "pending_complaints": pending,
            "resolved_complaints": resolved,
            "estimated_total_fines": total_fines,
            "avg_estimated_fine": round(total_fines / total_complaints) if total_complaints > 0 else 0
        }

    def _calculate_compliance_grade(
        self,
        violation_metrics: Dict[str, Any],
        response_metrics: Dict[str, Any],
        settlement_metrics: Dict[str, Any],
        complaint_metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate overall compliance grade (A-F)"""

        violation_score = violation_metrics.get("violation_score", 0)
        response_rate = response_metrics.get("response_rate", 0)
        avg_response_days = response_metrics.get("avg_response_days", 999)

        # Determine grade
        grade = "F"
        compliance_level = "failing"

        if violation_score <= 10 and response_rate >= 95 and (avg_response_days or 999) <= 15:
            grade = "A"
            compliance_level = "excellent"
        elif violation_score <= 25 and response_rate >= 85 and (avg_response_days or 999) <= 20:
            grade = "B"
            compliance_level = "good"
        elif violation_score <= 50 and response_rate >= 70 and (avg_response_days or 999) <= 25:
            grade = "C"
            compliance_level = "fair"
        elif violation_score <= 100 and response_rate >= 50 and (avg_response_days or 999) <= 30:
            grade = "D"
            compliance_level = "poor"

        # Automatic F grade for critical violations or Datatilsynet complaints
        if violation_metrics.get("critical_violations", 0) > 0:
            grade = "F"
            compliance_level = "failing"

        if complaint_metrics.get("total_complaints", 0) > 2:
            grade = "F"
            compliance_level = "failing"

        return {
            "grade": grade,
            "compliance_level": compliance_level,
            "compliance_level_norwegian": self.compliance_levels.get(compliance_level, "Ukjent"),
            "factors": {
                "violation_score": violation_score,
                "response_rate": response_rate,
                "avg_response_days": avg_response_days,
                "datatilsynet_complaints": complaint_metrics.get("total_complaints", 0)
            }
        }

    def _calculate_reputation_score(
        self,
        compliance_grade: Dict[str, Any],
        violation_metrics: Dict[str, Any],
        response_metrics: Dict[str, Any],
        settlement_metrics: Dict[str, Any],
        complaint_metrics: Dict[str, Any]
    ) -> int:
        """Calculate public reputation score (0-100)"""

        score = 100  # Start at perfect

        # Deduct for violations (heavily weighted)
        violation_score = violation_metrics.get("violation_score", 0)
        score -= min(violation_score, 50)  # Max 50 points deduction

        # Deduct for poor response rate
        response_rate = response_metrics.get("response_rate", 0)
        score -= (100 - response_rate) * 0.3  # Max 30 points deduction

        # Deduct for Datatilsynet complaints (severe penalty)
        complaints = complaint_metrics.get("total_complaints", 0)
        score -= min(complaints * 10, 30)  # Max 30 points deduction

        # Bonus for good settlement behavior
        acceptance_rate = settlement_metrics.get("acceptance_rate", 0)
        if acceptance_rate > 50:
            score += 5

        # Ensure score is within 0-100
        score = max(0, min(100, score))

        return round(score)

    def _generate_public_summary(
        self,
        creditor_data: Dict[str, Any],
        compliance_grade: Dict[str, Any],
        violation_metrics: Dict[str, Any],
        response_metrics: Dict[str, Any],
        complaint_metrics: Dict[str, Any]
    ) -> str:
        """Generate human-readable public summary in Norwegian"""

        creditor_name = creditor_data.get("name", "Ukjent kreditor")
        grade = compliance_grade.get("grade", "F")
        compliance_level = compliance_grade.get("compliance_level_norwegian", "Ukjent")

        total_violations = violation_metrics.get("total_violations", 0)
        response_rate = response_metrics.get("response_rate", 0)
        total_complaints = complaint_metrics.get("total_complaints", 0)

        summary = f"""
OFFENTLIG ETTERLEVELSESRAPPORT: {creditor_name}

KARAKTERGRAD: {grade} - {compliance_level}

{creditor_name} har {total_violations} registrerte GDPR-brudd i DAMOCLES-systemet.

Svarrate på GDPR-forespørsler: {response_rate}%
"""

        if response_rate < 50:
            summary += f"\n⚠️ ADVARSEL: Lav svarrate indikerer systematisk ignorering av personvernrettigheter."

        if total_complaints > 0:
            summary += f"\n⚠️ ADVARSEL: {total_complaints} klager sendt til Datatilsynet for GDPR-brudd."

        if compliance_grade.get("grade") == "F":
            summary += f"\n\n❌ IKKE ANBEFALT: Denne kreditoren har vist gjentatte brudd på GDPR-forordningen."

        if violation_metrics.get("critical_violations", 0) > 0:
            summary += f"\n\n🚨 KRITISK: Alvorlige personvernbrudd registrert."

        summary += f"\n\nRapport generert: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        summary += f"\nDatakilde: DAMOCLES Transparency Platform"

        return summary.strip()

    async def generate_leaderboard(
        self,
        creditor_reports: List[Dict[str, Any]],
        category: str = "all"
    ) -> Dict[str, Any]:
        """
        Generate public leaderboard ranking creditors by compliance.

        Categories: "all", "best", "worst"
        """

        # Sort by reputation score
        sorted_creditors = sorted(
            creditor_reports,
            key=lambda x: x.get("reputation_score", 0),
            reverse=True
        )

        # Filter by category
        if category == "best":
            # Top 10 best performers
            leaderboard = sorted_creditors[:10]
            title = "BESTE KREDITORER - GDPR-etterlevelse"
        elif category == "worst":
            # Bottom 10 worst performers
            leaderboard = sorted_creditors[-10:]
            leaderboard.reverse()  # Show worst first
            title = "DÅRLIGSTE KREDITORER - GDPR-brudd"
        else:
            # All creditors
            leaderboard = sorted_creditors
            title = "KREDITOR ETTERLEVELSE - Rangering"

        return {
            "title": title,
            "category": category,
            "total_creditors": len(creditor_reports),
            "leaderboard": [
                {
                    "rank": idx + 1,
                    "creditor_name": report["creditor"]["name"],
                    "org_number": report["creditor"]["org_number"],
                    "grade": report["compliance_grade"]["grade"],
                    "reputation_score": report["reputation_score"],
                    "total_violations": report["metrics"]["violations"]["total_violations"],
                    "datatilsynet_complaints": report["metrics"]["datatilsynet_complaints"]["total_complaints"]
                }
                for idx, report in enumerate(leaderboard)
            ],
            "generated_at": datetime.now().isoformat()
        }

    async def generate_industry_report(
        self,
        creditor_reports: List[Dict[str, Any]],
        industry: str = "INKASSO"
    ) -> Dict[str, Any]:
        """
        Generate industry-wide transparency report.

        Shows aggregate compliance statistics for entire industry.
        """

        # Filter by industry
        industry_reports = [
            r for r in creditor_reports
            if r["creditor"].get("type") == industry
        ]

        if not industry_reports:
            return {
                "industry": industry,
                "error": "No data available for this industry"
            }

        # Calculate industry averages
        total_creditors = len(industry_reports)
        total_violations = sum(
            r["metrics"]["violations"]["total_violations"]
            for r in industry_reports
        )
        total_complaints = sum(
            r["metrics"]["datatilsynet_complaints"]["total_complaints"]
            for r in industry_reports
        )
        avg_reputation = sum(
            r["reputation_score"]
            for r in industry_reports
        ) / total_creditors

        # Grade distribution
        grade_distribution = {}
        for report in industry_reports:
            grade = report["compliance_grade"]["grade"]
            grade_distribution[grade] = grade_distribution.get(grade, 0) + 1

        # Find worst offenders
        worst_offenders = sorted(
            industry_reports,
            key=lambda x: x["metrics"]["violations"]["violation_score"],
            reverse=True
        )[:5]

        return {
            "industry": industry,
            "industry_name": "Inkassobransjen" if industry == "INKASSO" else industry,
            "total_creditors": total_creditors,
            "aggregate_statistics": {
                "total_violations": total_violations,
                "avg_violations_per_creditor": round(total_violations / total_creditors, 1),
                "total_datatilsynet_complaints": total_complaints,
                "avg_reputation_score": round(avg_reputation, 1)
            },
            "grade_distribution": grade_distribution,
            "worst_offenders": [
                {
                    "name": r["creditor"]["name"],
                    "grade": r["compliance_grade"]["grade"],
                    "violations": r["metrics"]["violations"]["total_violations"],
                    "violation_score": r["metrics"]["violations"]["violation_score"]
                }
                for r in worst_offenders
            ],
            "generated_at": datetime.now().isoformat()
        }
