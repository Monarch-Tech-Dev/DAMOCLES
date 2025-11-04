"""
Settlement Proposal Generation Service

This service analyzes GDPR violations and debt details to generate
settlement proposals that leverage documented violations as negotiating power.

Key Features:
- Calculates total violation damages (GDPR + Inkassoloven)
- Analyzes creditor risk profile
- Generates settlement offers based on leverage
- Creates settlement proposal templates
- Provides negotiation recommendations

Norwegian Law References:
- GDPR Article 82: Right to compensation for material/non-material damage
- Inkassoloven § 14: Maximum debt collection fees
- Inkassoloven § 17: Prohibition of excessive fees
- Datatilsynet Guidelines on GDPR damages (2019-2023)
"""

import re
from typing import Dict, List, Any, Optional
from datetime import datetime
from decimal import Decimal


class SettlementService:
    def __init__(self):
        # Inkassoloven § 14 - Maximum fees (2024 rates)
        self.inkasso_max_fees = {
            "claim_under_2500": {"fee": 142, "vat": 35.50},  # Total 177.50 NOK
            "claim_2500_to_5000": {"fee": 213, "vat": 53.25},  # Total 266.25 NOK
            "claim_5000_to_10000": {"fee": 284, "vat": 71.00},  # Total 355 NOK
            "claim_over_10000": {"fee": 355, "vat": 88.75},  # Total 443.75 NOK
        }

        # GDPR damage multipliers based on violation severity
        self.gdpr_damage_multipliers = {
            "critical": 3.0,  # Unauthorized data sharing, major breaches
            "high": 2.0,      # Excessive retention, delayed responses
            "medium": 1.5,    # Incomplete responses, missing consent
            "low": 1.0        # Minor violations
        }

    async def analyze_settlement_opportunity(
        self,
        debt_data: Dict[str, Any],
        violations: List[Dict[str, Any]],
        creditor_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Comprehensive settlement analysis combining GDPR violations,
        Inkassoloven violations, and creditor risk scoring.

        Args:
            debt_data: Debt details (amount, fees, original claim)
            violations: List of detected GDPR violations
            creditor_data: Creditor information and violation history

        Returns:
            Complete settlement analysis with offers and recommendations
        """

        # Step 1: Analyze GDPR violation damages
        gdpr_analysis = self._analyze_gdpr_damages(violations)

        # Step 2: Analyze Inkassoloven violations (fee analysis)
        inkasso_analysis = self._analyze_inkasso_fees(debt_data)

        # Step 3: Calculate creditor risk score
        creditor_risk = self._calculate_creditor_risk(creditor_data, violations)

        # Step 4: Calculate settlement leverage
        leverage = self._calculate_settlement_leverage(
            gdpr_analysis,
            inkasso_analysis,
            creditor_risk
        )

        # Step 5: Generate settlement offers (conservative, recommended, aggressive)
        settlement_offers = self._generate_settlement_offers(
            debt_data,
            leverage,
            gdpr_analysis,
            inkasso_analysis
        )

        # Step 6: Create settlement proposal template
        proposal_template = self._create_settlement_proposal(
            debt_data,
            violations,
            settlement_offers["recommended"],
            gdpr_analysis,
            inkasso_analysis
        )

        return {
            "gdpr_analysis": gdpr_analysis,
            "inkasso_analysis": inkasso_analysis,
            "creditor_risk": creditor_risk,
            "leverage": leverage,
            "settlement_offers": settlement_offers,
            "proposal_template": proposal_template,
            "negotiation_strategy": self._create_negotiation_strategy(leverage),
            "estimated_outcome": settlement_offers["recommended"],
            "analysis_timestamp": datetime.now().isoformat()
        }

    def _analyze_gdpr_damages(self, violations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze GDPR violations and calculate total compensable damages.

        Based on:
        - GDPR Article 82: Right to compensation
        - Datatilsynet guidance on damage calculations
        - Norwegian court precedents (2019-2024)
        """

        if not violations:
            return {
                "total_violations": 0,
                "total_damages": 0.0,
                "breakdown_by_severity": {},
                "strongest_claims": [],
                "legal_references": []
            }

        breakdown = {
            "critical": {"count": 0, "damages": 0.0, "violations": []},
            "high": {"count": 0, "damages": 0.0, "violations": []},
            "medium": {"count": 0, "damages": 0.0, "violations": []},
            "low": {"count": 0, "damages": 0.0, "violations": []}
        }

        total_damages = 0.0
        legal_references = set()

        for violation in violations:
            severity = violation.get("severity", "low")
            base_damage = violation.get("estimated_damage", 0.0)
            confidence = violation.get("confidence", 0.5)
            legal_ref = violation.get("legal_reference", "")

            # Apply confidence and multiplier
            multiplier = self.gdpr_damage_multipliers.get(severity, 1.0)
            adjusted_damage = base_damage * multiplier * confidence

            breakdown[severity]["count"] += 1
            breakdown[severity]["damages"] += adjusted_damage
            breakdown[severity]["violations"].append({
                "type": violation.get("type"),
                "damage": adjusted_damage,
                "evidence": violation.get("evidence"),
                "legal_reference": legal_ref
            })

            total_damages += adjusted_damage

            if legal_ref:
                legal_references.add(legal_ref)

        # Identify strongest claims (highest damages)
        all_violations = []
        for severity_violations in breakdown.values():
            all_violations.extend(severity_violations["violations"])

        strongest_claims = sorted(
            all_violations,
            key=lambda v: v["damage"],
            reverse=True
        )[:3]  # Top 3 strongest claims

        return {
            "total_violations": len(violations),
            "total_damages": round(total_damages, 2),
            "breakdown_by_severity": breakdown,
            "strongest_claims": strongest_claims,
            "legal_references": list(legal_references)
        }

    def _analyze_inkasso_fees(self, debt_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze debt collection fees for Inkassoloven violations.

        Based on:
        - Inkassoloven § 14: Maximum permissible fees
        - Inkassoloven § 17: Prohibition of excessive fees
        """

        original_claim = float(debt_data.get("originalAmount", 0))
        current_amount = float(debt_data.get("amount", 0))
        creditor_name = debt_data.get("creditorName", "Unknown")

        # Determine maximum legal fees based on claim amount
        if original_claim < 2500:
            max_fee_data = self.inkasso_max_fees["claim_under_2500"]
            bracket = "Under 2,500 NOK"
        elif original_claim < 5000:
            max_fee_data = self.inkasso_max_fees["claim_2500_to_5000"]
            bracket = "2,500 - 5,000 NOK"
        elif original_claim < 10000:
            max_fee_data = self.inkasso_max_fees["claim_5000_to_10000"]
            bracket = "5,000 - 10,000 NOK"
        else:
            max_fee_data = self.inkasso_max_fees["claim_over_10000"]
            bracket = "Over 10,000 NOK"

        max_legal_fee = max_fee_data["fee"]
        max_legal_vat = max_fee_data["vat"]
        max_legal_total = max_legal_fee + max_legal_vat

        # Calculate actual fees charged
        actual_fees = current_amount - original_claim

        # Determine if fees are excessive
        is_excessive = actual_fees > max_legal_total
        excessive_amount = max(0, actual_fees - max_legal_total)

        # Calculate legitimate debt (original claim + legal fees)
        legitimate_debt = original_claim + max_legal_total

        return {
            "original_claim": original_claim,
            "current_amount": current_amount,
            "actual_fees": round(actual_fees, 2),
            "max_legal_fees": {
                "fee": max_legal_fee,
                "vat": max_legal_vat,
                "total": max_legal_total,
                "bracket": bracket
            },
            "is_excessive": is_excessive,
            "excessive_amount": round(excessive_amount, 2) if is_excessive else 0.0,
            "legitimate_debt": round(legitimate_debt, 2),
            "violation_severity": "high" if excessive_amount > 500 else "medium" if is_excessive else "none",
            "legal_reference": "Inkassoloven § 14 og § 17" if is_excessive else None,
            "creditor_name": creditor_name
        }

    def _calculate_creditor_risk(
        self,
        creditor_data: Dict[str, Any],
        violations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate creditor risk score based on violation history and patterns.

        High risk = More likely to settle (fear of regulatory action)
        Low risk = Less pressure to settle
        """

        # Extract creditor metrics
        total_violations_count = creditor_data.get("totalViolations", 0)
        violation_score = creditor_data.get("violationScore", 0.0)
        creditor_type = creditor_data.get("type", "unknown")

        # Current case violation count and severity
        current_violations = len(violations)
        critical_violations = sum(1 for v in violations if v.get("severity") == "critical")
        high_violations = sum(1 for v in violations if v.get("severity") == "high")

        # Calculate risk components
        history_risk = min(total_violations_count / 10.0, 1.0)  # Scale to 0-1
        severity_risk = min((critical_violations * 0.4 + high_violations * 0.2), 1.0)
        pattern_risk = min(violation_score / 5.0, 1.0)  # Assuming violation_score is 0-5

        # Creditor type risk multipliers
        type_multipliers = {
            "DEBT_COLLECTOR": 1.5,  # More vulnerable to regulatory action
            "BANK": 1.3,            # Reputation-conscious
            "TELECOM": 1.2,         # Moderate risk
            "UTILITY": 1.1,         # Lower risk
            "OTHER": 1.0
        }

        type_multiplier = type_multipliers.get(creditor_type, 1.0)

        # Overall risk score (0-100)
        base_risk = (history_risk * 0.3 + severity_risk * 0.4 + pattern_risk * 0.3) * 100
        adjusted_risk = min(base_risk * type_multiplier, 100)

        # Risk level classification
        if adjusted_risk >= 70:
            risk_level = "CRITICAL"
            settlement_likelihood = "Very High"
        elif adjusted_risk >= 50:
            risk_level = "HIGH"
            settlement_likelihood = "High"
        elif adjusted_risk >= 30:
            risk_level = "MEDIUM"
            settlement_likelihood = "Moderate"
        else:
            risk_level = "LOW"
            settlement_likelihood = "Low"

        return {
            "risk_score": round(adjusted_risk, 2),
            "risk_level": risk_level,
            "settlement_likelihood": settlement_likelihood,
            "factors": {
                "violation_history": round(history_risk * 100, 2),
                "current_severity": round(severity_risk * 100, 2),
                "pattern_analysis": round(pattern_risk * 100, 2),
                "creditor_type_multiplier": type_multiplier
            },
            "recommendation": self._get_risk_recommendation(risk_level)
        }

    def _calculate_settlement_leverage(
        self,
        gdpr_analysis: Dict[str, Any],
        inkasso_analysis: Dict[str, Any],
        creditor_risk: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate overall settlement leverage based on all factors.

        Leverage determines how aggressive we can be in settlement offers.
        """

        gdpr_damages = gdpr_analysis.get("total_damages", 0.0)
        excessive_fees = inkasso_analysis.get("excessive_amount", 0.0)
        risk_score = creditor_risk.get("risk_score", 0.0)

        # Calculate leverage components
        financial_leverage = gdpr_damages + excessive_fees
        regulatory_leverage = risk_score / 100.0  # Normalize to 0-1

        # Combined leverage score (0-100)
        leverage_score = min(
            (financial_leverage / 500.0) * 50 +  # Financial component (max 50)
            regulatory_leverage * 50,             # Regulatory component (max 50)
            100
        )

        # Leverage level classification
        if leverage_score >= 75:
            leverage_level = "VERY_HIGH"
            reduction_range = "90-97%"
        elif leverage_score >= 50:
            leverage_level = "HIGH"
            reduction_range = "70-90%"
        elif leverage_score >= 30:
            leverage_level = "MEDIUM"
            reduction_range = "40-70%"
        else:
            leverage_level = "LOW"
            reduction_range = "10-40%"

        return {
            "leverage_score": round(leverage_score, 2),
            "leverage_level": leverage_level,
            "expected_reduction_range": reduction_range,
            "components": {
                "gdpr_damages": gdpr_damages,
                "inkasso_violations": excessive_fees,
                "creditor_risk": risk_score
            },
            "strength_assessment": self._assess_leverage_strength(leverage_score)
        }

    def _generate_settlement_offers(
        self,
        debt_data: Dict[str, Any],
        leverage: Dict[str, Any],
        gdpr_analysis: Dict[str, Any],
        inkasso_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate three settlement offer scenarios:
        1. Conservative (high chance of acceptance)
        2. Recommended (balanced)
        3. Aggressive (maximum reduction)
        """

        current_amount = float(debt_data.get("amount", 0))
        original_claim = float(debt_data.get("originalAmount", 0))
        legitimate_debt = inkasso_analysis.get("legitimate_debt", current_amount)

        gdpr_damages = gdpr_analysis.get("total_damages", 0.0)
        excessive_fees = inkasso_analysis.get("excessive_amount", 0.0)
        leverage_score = leverage.get("leverage_score", 0.0)

        # Platform fee (20% of settlement amount)
        platform_fee_rate = 0.20

        # Conservative offer (60-70% reduction)
        conservative_settlement = max(
            legitimate_debt * 0.40,  # 60% reduction from legitimate debt
            original_claim * 0.10    # At least 10% of original claim
        )
        conservative_reduction = current_amount - conservative_settlement
        conservative_platform_fee = conservative_settlement * platform_fee_rate

        # Recommended offer (70-90% reduction based on leverage)
        reduction_factor = 0.70 + (leverage_score / 100.0) * 0.20  # 70-90%
        recommended_settlement = max(
            current_amount * (1 - reduction_factor),
            original_claim * 0.05  # At least 5% of original claim
        )
        recommended_reduction = current_amount - recommended_settlement
        recommended_platform_fee = recommended_settlement * platform_fee_rate

        # Aggressive offer (90-97% reduction)
        aggressive_factor = 0.90 + min(leverage_score / 200.0, 0.07)  # 90-97%
        aggressive_settlement = max(
            current_amount * (1 - aggressive_factor),
            gdpr_damages * 0.50  # Offset by half of GDPR damages
        )
        aggressive_reduction = current_amount - aggressive_settlement
        aggressive_platform_fee = aggressive_settlement * platform_fee_rate

        return {
            "conservative": {
                "settlement_amount": round(conservative_settlement, 2),
                "reduction_amount": round(conservative_reduction, 2),
                "reduction_percentage": round((conservative_reduction / current_amount) * 100, 2),
                "platform_fee": round(conservative_platform_fee, 2),
                "user_payment": round(conservative_settlement + conservative_platform_fee, 2),
                "success_probability": "85-95%",
                "rationale": "High acceptance probability. Creditor avoids legal costs and regulatory risk."
            },
            "recommended": {
                "settlement_amount": round(recommended_settlement, 2),
                "reduction_amount": round(recommended_reduction, 2),
                "reduction_percentage": round((recommended_reduction / current_amount) * 100, 2),
                "platform_fee": round(recommended_platform_fee, 2),
                "user_payment": round(recommended_settlement + recommended_platform_fee, 2),
                "success_probability": "65-85%",
                "rationale": f"Balanced offer leveraging {len(gdpr_analysis.get('strongest_claims', []))} GDPR violations and Inkassoloven violations."
            },
            "aggressive": {
                "settlement_amount": round(aggressive_settlement, 2),
                "reduction_amount": round(aggressive_reduction, 2),
                "reduction_percentage": round((aggressive_reduction / current_amount) * 100, 2),
                "platform_fee": round(aggressive_platform_fee, 2),
                "user_payment": round(aggressive_settlement + aggressive_platform_fee, 2),
                "success_probability": "40-65%",
                "rationale": f"Maximum pressure. GDPR damages ({gdpr_damages:.2f} NOK) + excessive fees ({excessive_fees:.2f} NOK) exceed debt."
            },
            "comparison": {
                "original_debt": current_amount,
                "legitimate_debt": legitimate_debt,
                "savings_range": {
                    "min": round(conservative_reduction, 2),
                    "max": round(aggressive_reduction, 2)
                }
            }
        }

    def _create_settlement_proposal(
        self,
        debt_data: Dict[str, Any],
        violations: List[Dict[str, Any]],
        recommended_offer: Dict[str, Any],
        gdpr_analysis: Dict[str, Any],
        inkasso_analysis: Dict[str, Any]
    ) -> str:
        """
        Create a formal settlement proposal letter template.
        """

        creditor_name = debt_data.get("creditorName", "Unknown Creditor")
        debt_reference = debt_data.get("reference", "N/A")
        current_amount = debt_data.get("amount", 0)
        settlement_amount = recommended_offer.get("settlement_amount", 0)
        reduction_pct = recommended_offer.get("reduction_percentage", 0)

        strongest_claims = gdpr_analysis.get("strongest_claims", [])
        inkasso_violation = inkasso_analysis.get("is_excessive", False)

        template = f"""
SETTLEMENT PROPOSAL
{datetime.now().strftime("%B %d, %Y")}

To: {creditor_name}
Re: Debt Reference {debt_reference}

Dear Sir/Madam,

I am writing to propose a settlement for the above-referenced debt currently claimed at {current_amount:.2f} NOK.

LEGAL BASIS FOR SETTLEMENT

Following our GDPR Article 15 data access request, we have identified the following violations:

"""

        # Add GDPR violations
        for i, claim in enumerate(strongest_claims, 1):
            template += f"""{i}. {claim.get('type', 'Unknown violation')}
   Legal Reference: {claim.get('legal_reference', 'GDPR')}
   Estimated Damage: {claim.get('damage', 0):.2f} NOK
   Evidence: {claim.get('evidence', 'Documented in GDPR response')}

"""

        # Add Inkassoloven violation if present
        if inkasso_violation:
            excessive_amt = inkasso_analysis.get("excessive_amount", 0)
            template += f"""
Additionally, we have identified violations of Inkassoloven § 14:

- Excessive debt collection fees: {excessive_amt:.2f} NOK above legal maximum
- Legal Reference: Inkassoloven § 14 and § 17
- Maximum permissible fees: {inkasso_analysis['max_legal_fees']['total']:.2f} NOK
- Actual fees charged: {inkasso_analysis['actual_fees']:.2f} NOK

"""

        template += f"""
SETTLEMENT OFFER

In light of the documented violations and our right to compensation under GDPR Article 82, we propose the following settlement:

- Current Claimed Amount: {current_amount:.2f} NOK
- Proposed Settlement: {settlement_amount:.2f} NOK
- Reduction: {reduction_pct:.1f}%

This settlement offer:
1. Resolves all outstanding claims and counterclaims
2. Avoids regulatory complaints to Datatilsynet
3. Prevents public disclosure of violations
4. Eliminates legal costs for both parties

TERMS

- Payment upon acceptance via escrow
- Mutual release of all claims
- Removal of negative credit reporting
- Confidentiality agreement

This offer expires 14 days from the date above. If not accepted, we will proceed with:
1. Formal complaint to Datatilsynet regarding GDPR violations
2. Public disclosure of violations per transparency requirements
3. Legal action for GDPR damages under Article 82

We prefer an amicable resolution and believe this settlement serves both parties' interests.

Sincerely,
[User Name]
Via DAMOCLES Platform

---
Reference: {debt_reference}
Generated: {datetime.now().isoformat()}
"""

        return template.strip()

    def _create_negotiation_strategy(self, leverage: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create negotiation strategy recommendations.
        """

        leverage_level = leverage.get("leverage_level", "LOW")
        leverage_score = leverage.get("leverage_score", 0.0)

        if leverage_level == "VERY_HIGH":
            strategy = {
                "approach": "AGGRESSIVE",
                "initial_offer": "Start with aggressive offer (90-97% reduction)",
                "fallback_position": "Will accept recommended offer if needed",
                "timeline": "7-14 day deadline for response",
                "escalation_threat": "HIGH - Immediate Datatilsynet complaint and public disclosure",
                "negotiation_room": "Minimal - Strong position",
                "key_message": "GDPR violations exceed debt value. Settlement is creditor's best option."
            }
        elif leverage_level == "HIGH":
            strategy = {
                "approach": "FIRM",
                "initial_offer": "Start with recommended offer (70-90% reduction)",
                "fallback_position": "Can accept conservative offer if necessary",
                "timeline": "14-21 day deadline",
                "escalation_threat": "MEDIUM - Will file complaint if unreasonable counter-offer",
                "negotiation_room": "Moderate - Some flexibility",
                "key_message": "Multiple violations documented. Settlement avoids regulatory scrutiny."
            }
        else:
            strategy = {
                "approach": "COLLABORATIVE",
                "initial_offer": "Start with conservative offer (60-70% reduction)",
                "fallback_position": "Focus on removing excessive fees",
                "timeline": "21-30 days",
                "escalation_threat": "LOW - Emphasize mutual benefit",
                "negotiation_room": "High - Open to negotiation",
                "key_message": "Some violations detected. Settlement benefits both parties."
            }

        return strategy

    def _get_risk_recommendation(self, risk_level: str) -> str:
        """Get recommendation based on creditor risk level"""

        recommendations = {
            "CRITICAL": "Creditor is highly vulnerable to regulatory action. Proceed with aggressive settlement strategy.",
            "HIGH": "Creditor has significant exposure. Strong negotiating position. Recommend firm approach.",
            "MEDIUM": "Moderate leverage. Balanced settlement approach recommended.",
            "LOW": "Limited pressure on creditor. Focus on collaborative resolution."
        }

        return recommendations.get(risk_level, "Assess situation carefully before proceeding.")

    def _assess_leverage_strength(self, leverage_score: float) -> str:
        """Assess overall leverage strength"""

        if leverage_score >= 75:
            return "EXCELLENT - Strong leverage across all factors. High settlement likelihood."
        elif leverage_score >= 50:
            return "GOOD - Solid leverage. Favorable settlement position."
        elif leverage_score >= 30:
            return "MODERATE - Some leverage. Settlement possible with negotiation."
        else:
            return "LIMITED - Weak leverage. Focus on removing excessive fees only."
