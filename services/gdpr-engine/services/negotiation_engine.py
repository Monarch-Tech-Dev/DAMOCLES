"""
Automated Negotiation Engine

This service handles creditor counter-offers and automates the negotiation process
for debt settlements based on GDPR violations.

Key Features:
- Evaluates creditor counter-offers against settlement analysis
- Makes automatic counter-counter-offers using game theory
- Knows when to accept vs. continue negotiating vs. escalate
- Tracks negotiation history and applies learning
- Protects user's interests while maximizing settlement probability

Negotiation Strategies:
- Tit-for-tat: Mirror creditor's concession rate
- Anchoring: Hold firm near aggressive offer initially
- Strategic concessions: Small moves toward recommended settlement
- Deadline pressure: Escalation threat increases over time
- BATNA (Best Alternative): Always ready to escalate to Datatilsynet

Based on:
- Game theory (Nash equilibrium, iterated prisoner's dilemma)
- Behavioral economics (loss aversion, anchoring effects)
- Settlement negotiation best practices
"""

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class NegotiationEngine:
    def __init__(self):
        # Negotiation parameters
        self.max_negotiation_rounds = 5  # Maximum back-and-forth exchanges
        self.concession_rate = 0.15  # How much we concede each round (15%)
        self.minimum_concession = 50.0  # Minimum NOK concession to show good faith
        self.maximum_from_aggressive = 1.5  # Max 150% of aggressive offer

        # Time pressure parameters
        self.negotiation_deadline_days = 14  # Standard deadline for response
        self.urgency_multiplier_start = 0.9  # Day 1-7: 90% leverage
        self.urgency_multiplier_end = 1.1  # Day 14: 110% leverage

        # Strategy thresholds
        self.auto_accept_threshold = 0.95  # Auto-accept if within 95% of recommended
        self.escalation_threshold = 1.5  # Escalate if creditor wants >150% of recommended

    async def evaluate_counter_offer(
        self,
        counter_offer_amount: float,
        original_settlement_analysis: Dict[str, Any],
        negotiation_history: List[Dict[str, Any]],
        days_since_initial_offer: int = 0
    ) -> Dict[str, Any]:
        """
        Evaluate a creditor's counter-offer and determine response strategy.

        Args:
            counter_offer_amount: Creditor's proposed settlement amount
            original_settlement_analysis: Initial settlement analysis
            negotiation_history: List of previous offers/counter-offers
            days_since_initial_offer: Days elapsed since initial proposal

        Returns:
            Evaluation with recommended action and response offer
        """

        # Extract key data from original analysis
        settlement_offers = original_settlement_analysis["settlement_offers"]
        leverage = original_settlement_analysis["leverage"]

        aggressive = settlement_offers["aggressive"]["settlement_amount"]
        recommended = settlement_offers["recommended"]["settlement_amount"]
        conservative = settlement_offers["conservative"]["settlement_amount"]

        original_debt = settlement_offers["comparison"]["original_debt"]

        # Calculate evaluation metrics
        evaluation = {
            "counter_offer_amount": counter_offer_amount,
            "offer_evaluation": self._evaluate_offer_quality(
                counter_offer_amount,
                aggressive,
                recommended,
                conservative
            ),
            "creditor_concession": self._calculate_creditor_concession(
                counter_offer_amount,
                original_debt,
                negotiation_history
            ),
            "negotiation_round": len(negotiation_history) + 1,
            "time_pressure": self._calculate_time_pressure(days_since_initial_offer),
            "recommended_action": None,  # Will be determined below
            "response_offer": None,  # Will be calculated if continuing negotiation
            "rationale": None,
            "escalation_recommended": False
        }

        # Decision logic based on offer quality
        offer_quality = evaluation["offer_evaluation"]["quality"]
        distance_from_recommended = evaluation["offer_evaluation"]["distance_from_recommended_pct"]

        # AUTO-ACCEPT: Counter-offer is very close to our recommended amount
        if distance_from_recommended <= (1 - self.auto_accept_threshold):  # Within 5%
            evaluation["recommended_action"] = "ACCEPT"
            evaluation["rationale"] = (
                f"Counter-offer ({counter_offer_amount:.2f} NOK) is within 5% of "
                f"recommended settlement ({recommended:.2f} NOK). Excellent outcome."
            )
            logger.info(f"✅ AUTO-ACCEPT: Counter-offer {counter_offer_amount:.2f} NOK "
                       f"within 5% of recommended {recommended:.2f} NOK")
            return evaluation

        # ACCEPT: Counter-offer is reasonable (between aggressive and conservative)
        if offer_quality == "EXCELLENT" or offer_quality == "GOOD":
            evaluation["recommended_action"] = "ACCEPT"
            evaluation["rationale"] = (
                f"Counter-offer ({counter_offer_amount:.2f} NOK) represents a fair settlement. "
                f"Quality: {offer_quality}. User saves {original_debt - counter_offer_amount:.2f} NOK "
                f"({(1 - counter_offer_amount/original_debt) * 100:.1f}% reduction)."
            )
            logger.info(f"✅ ACCEPT: Counter-offer {counter_offer_amount:.2f} NOK is {offer_quality}")
            return evaluation

        # ESCALATE: Creditor is unreasonable (asking too much)
        if offer_quality == "UNACCEPTABLE" and evaluation["negotiation_round"] >= 3:
            evaluation["recommended_action"] = "ESCALATE"
            evaluation["escalation_recommended"] = True
            evaluation["rationale"] = (
                f"After {evaluation['negotiation_round']} rounds, creditor remains unreasonable. "
                f"Counter-offer ({counter_offer_amount:.2f} NOK) exceeds threshold. "
                f"Recommend escalation to Datatilsynet."
            )
            logger.warning(f"⚠️ ESCALATE: Counter-offer {counter_offer_amount:.2f} NOK unacceptable after 3 rounds")
            return evaluation

        # COUNTER: Continue negotiating
        if evaluation["negotiation_round"] < self.max_negotiation_rounds:
            # Calculate our counter-counter-offer
            response_offer = self._calculate_response_offer(
                counter_offer_amount=counter_offer_amount,
                aggressive=aggressive,
                recommended=recommended,
                conservative=conservative,
                negotiation_round=evaluation["negotiation_round"],
                creditor_concession_pct=evaluation["creditor_concession"]["concession_percentage"],
                time_pressure=evaluation["time_pressure"]
            )

            evaluation["recommended_action"] = "COUNTER"
            evaluation["response_offer"] = response_offer
            evaluation["rationale"] = (
                f"Counter-offer ({counter_offer_amount:.2f} NOK) is {offer_quality}. "
                f"Continue negotiating. Our counter: {response_offer['amount']:.2f} NOK. "
                f"Strategy: {response_offer['strategy']}."
            )
            logger.info(f"🔄 COUNTER: Responding to {counter_offer_amount:.2f} NOK "
                       f"with {response_offer['amount']:.2f} NOK")
            return evaluation

        # FINAL OFFER: Maximum rounds reached
        else:
            evaluation["recommended_action"] = "FINAL_OFFER"
            evaluation["response_offer"] = {
                "amount": recommended,
                "is_final": True,
                "deadline_days": 3,
                "strategy": "FINAL_ULTIMATUM",
                "message": f"This is our final offer. Accept within 3 days or we proceed with Datatilsynet complaint."
            }
            evaluation["rationale"] = (
                f"Maximum negotiation rounds ({self.max_negotiation_rounds}) reached. "
                f"Final offer: {recommended:.2f} NOK. Creditor must accept or face escalation."
            )
            logger.warning(f"⏰ FINAL_OFFER: Round {evaluation['negotiation_round']}, "
                          f"offering {recommended:.2f} NOK as ultimatum")
            return evaluation

    def _evaluate_offer_quality(
        self,
        counter_offer: float,
        aggressive: float,
        recommended: float,
        conservative: float
    ) -> Dict[str, Any]:
        """Evaluate the quality of creditor's counter-offer"""

        # Calculate position relative to our offers
        if counter_offer <= aggressive * 1.05:  # Within 5% of aggressive
            quality = "EXCELLENT"
            score = 100
        elif counter_offer <= recommended:
            quality = "GOOD"
            score = 80
        elif counter_offer <= conservative:
            quality = "ACCEPTABLE"
            score = 60
        elif counter_offer <= conservative * 1.2:
            quality = "MARGINAL"
            score = 40
        elif counter_offer <= conservative * 1.5:
            quality = "POOR"
            score = 20
        else:
            quality = "UNACCEPTABLE"
            score = 0

        # Calculate distances
        distance_from_aggressive_pct = (counter_offer - aggressive) / aggressive if aggressive > 0 else 999
        distance_from_recommended_pct = abs(counter_offer - recommended) / recommended if recommended > 0 else 999
        distance_from_conservative_pct = (counter_offer - conservative) / conservative if conservative > 0 else 999

        return {
            "quality": quality,
            "score": score,
            "distance_from_aggressive_pct": distance_from_aggressive_pct,
            "distance_from_recommended_pct": distance_from_recommended_pct,
            "distance_from_conservative_pct": distance_from_conservative_pct,
            "within_acceptable_range": counter_offer <= conservative * 1.2
        }

    def _calculate_creditor_concession(
        self,
        counter_offer: float,
        original_debt: float,
        negotiation_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate how much the creditor has conceded"""

        # Total concession from original debt
        total_concession = original_debt - counter_offer
        total_concession_pct = (total_concession / original_debt * 100) if original_debt > 0 else 0

        # Incremental concession from previous offer
        incremental_concession = 0.0
        incremental_concession_pct = 0.0

        if negotiation_history:
            last_creditor_offer = None
            # Find most recent creditor offer
            for entry in reversed(negotiation_history):
                if entry.get("party") == "creditor":
                    last_creditor_offer = entry.get("amount")
                    break

            if last_creditor_offer:
                incremental_concession = last_creditor_offer - counter_offer
                incremental_concession_pct = (incremental_concession / last_creditor_offer * 100) if last_creditor_offer > 0 else 0

        return {
            "total_concession": total_concession,
            "total_concession_percentage": round(total_concession_pct, 2),
            "incremental_concession": incremental_concession,
            "concession_percentage": round(incremental_concession_pct, 2),
            "is_moving": incremental_concession > 0
        }

    def _calculate_time_pressure(self, days_since_initial: int) -> Dict[str, Any]:
        """Calculate time pressure factor (increases as deadline approaches)"""

        days_remaining = max(0, self.negotiation_deadline_days - days_since_initial)
        urgency_factor = 1.0

        if days_since_initial > 0:
            # Linear increase in urgency
            progress = min(1.0, days_since_initial / self.negotiation_deadline_days)
            urgency_factor = self.urgency_multiplier_start + (
                (self.urgency_multiplier_end - self.urgency_multiplier_start) * progress
            )

        if days_remaining <= 3:
            pressure_level = "CRITICAL"
        elif days_remaining <= 7:
            pressure_level = "HIGH"
        elif days_remaining <= 10:
            pressure_level = "MEDIUM"
        else:
            pressure_level = "LOW"

        return {
            "days_elapsed": days_since_initial,
            "days_remaining": days_remaining,
            "urgency_factor": round(urgency_factor, 2),
            "pressure_level": pressure_level,
            "deadline_approaching": days_remaining <= 3
        }

    def _calculate_response_offer(
        self,
        counter_offer_amount: float,
        aggressive: float,
        recommended: float,
        conservative: float,
        negotiation_round: int,
        creditor_concession_pct: float,
        time_pressure: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate our counter-counter-offer using game theory principles.

        Strategy:
        1. Start near aggressive offer (anchor low)
        2. Make small concessions each round (tit-for-tat)
        3. Mirror creditor's concession rate
        4. Apply time pressure adjustments
        5. Never exceed conservative offer
        """

        # Base: Start from recommended, adjust based on round
        base_offer = aggressive + (recommended - aggressive) * (negotiation_round / self.max_negotiation_rounds)

        # TIT-FOR-TAT: Mirror creditor's concession rate
        if creditor_concession_pct > 0:
            # If creditor is conceding, we concede proportionally
            our_concession_rate = min(creditor_concession_pct * 0.8, self.concession_rate)  # Match 80% of their concession
        else:
            # If creditor not moving, we hold firm or move minimally
            our_concession_rate = self.concession_rate * 0.5  # Half normal concession

        # Calculate concession amount
        gap = counter_offer_amount - base_offer
        concession_amount = max(self.minimum_concession, gap * our_concession_rate)

        response_amount = base_offer + concession_amount

        # Time pressure adjustment: Move faster as deadline approaches
        if time_pressure["pressure_level"] in ["HIGH", "CRITICAL"]:
            urgency_adjustment = (recommended - response_amount) * 0.2  # Move 20% closer to recommended
            response_amount += urgency_adjustment

        # Boundary checks
        response_amount = max(aggressive, response_amount)  # Never go below aggressive
        response_amount = min(conservative, response_amount)  # Never exceed conservative

        # Meet halfway strategy on final rounds
        if negotiation_round >= self.max_negotiation_rounds - 1:
            # Last chance negotiation: Split the difference
            response_amount = (response_amount + counter_offer_amount) / 2
            response_amount = min(recommended, response_amount)  # Cap at recommended

        # Determine strategy description
        if negotiation_round == 1:
            strategy = "ANCHOR_LOW"
            message = "Initial counter-offer. We're holding firm near our analysis."
        elif creditor_concession_pct > 5:
            strategy = "TIT_FOR_TAT"
            message = f"Matching creditor's {creditor_concession_pct:.1f}% concession with our own movement."
        elif time_pressure["pressure_level"] == "CRITICAL":
            strategy = "DEADLINE_PRESSURE"
            message = "Deadline approaching. Making final concession to close deal."
        elif negotiation_round >= self.max_negotiation_rounds - 1:
            strategy = "SPLIT_DIFFERENCE"
            message = "Final round. Splitting the difference to reach agreement."
        else:
            strategy = "GRADUAL_CONCESSION"
            message = "Strategic concession toward mutually acceptable settlement."

        return {
            "amount": round(response_amount, 2),
            "concession_from_previous": round(concession_amount, 2),
            "distance_to_counter_offer": round(counter_offer_amount - response_amount, 2),
            "strategy": strategy,
            "message": message,
            "is_final": False,
            "deadline_days": max(3, time_pressure["days_remaining"]),
            "rationale": self._generate_rationale(
                response_amount,
                counter_offer_amount,
                recommended,
                strategy
            )
        }

    def _generate_rationale(
        self,
        our_offer: float,
        their_offer: float,
        recommended: float,
        strategy: str
    ) -> str:
        """Generate human-readable rationale for counter-offer"""

        gap = their_offer - our_offer
        gap_pct = (gap / their_offer * 100) if their_offer > 0 else 0

        rationale = f"We're offering {our_offer:.2f} NOK, which is {gap:.2f} NOK ({gap_pct:.1f}%) below their counter-offer. "

        if strategy == "ANCHOR_LOW":
            rationale += "Starting strong with offer close to our aggressive analysis."
        elif strategy == "TIT_FOR_TAT":
            rationale += "Mirroring their concession rate to show good faith while maintaining position."
        elif strategy == "DEADLINE_PRESSURE":
            rationale += "Deadline approaching - making strategic concession to close deal."
        elif strategy == "SPLIT_DIFFERENCE":
            rationale += "Final round - splitting difference for mutual agreement."
        else:
            rationale += "Making gradual concession toward recommended settlement."

        return rationale

    async def create_negotiation_response(
        self,
        evaluation: Dict[str, Any],
        settlement_analysis: Dict[str, Any],
        debt_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create complete negotiation response package.

        Returns response object ready to send to creditor including:
        - Response offer amount (if countering)
        - Formal response letter
        - Supporting evidence/justification
        - Deadline for response
        """

        action = evaluation["recommended_action"]
        counter_offer = evaluation["counter_offer_amount"]

        if action == "ACCEPT":
            return {
                "action": "ACCEPT",
                "accepted_amount": counter_offer,
                "message": f"We accept your settlement offer of {counter_offer:.2f} NOK.",
                "next_steps": "Proceed to payment escrow.",
                "requires_user_approval": False  # Auto-accept good offers
            }

        elif action == "COUNTER":
            response_offer = evaluation["response_offer"]
            return {
                "action": "COUNTER",
                "counter_amount": response_offer["amount"],
                "message": self._create_counter_offer_letter(
                    response_offer,
                    counter_offer,
                    settlement_analysis,
                    debt_data
                ),
                "deadline_days": response_offer["deadline_days"],
                "strategy": response_offer["strategy"],
                "requires_user_approval": True  # User confirms counter-offers
            }

        elif action == "FINAL_OFFER":
            response_offer = evaluation["response_offer"]
            return {
                "action": "FINAL_OFFER",
                "final_amount": response_offer["amount"],
                "message": self._create_final_offer_letter(
                    response_offer,
                    settlement_analysis,
                    debt_data
                ),
                "deadline_days": response_offer["deadline_days"],
                "escalation_warning": True,
                "requires_user_approval": True
            }

        elif action == "ESCALATE":
            return {
                "action": "ESCALATE",
                "message": "Negotiation unsuccessful. Proceeding with Datatilsynet complaint.",
                "escalation_reason": evaluation["rationale"],
                "next_steps": "File formal complaint with Norwegian Data Protection Authority.",
                "requires_user_approval": True  # User confirms escalation
            }

        else:
            return {
                "action": "ERROR",
                "message": "Unable to determine negotiation response."
            }

    def _create_counter_offer_letter(
        self,
        response_offer: Dict[str, Any],
        their_counter: float,
        settlement_analysis: Dict[str, Any],
        debt_data: Dict[str, Any]
    ) -> str:
        """Create formal counter-offer letter"""

        template = f"""
COUNTER-OFFER RESPONSE
{datetime.now().strftime("%B %d, %Y")}

Re: Settlement Negotiation - Debt Reference {debt_data.get('reference', 'N/A')}

Dear Sir/Madam,

Thank you for your counter-offer of {their_counter:.2f} NOK.

After careful review, we propose a revised settlement of {response_offer['amount']:.2f} NOK.

JUSTIFICATION

This counter-offer reflects:
1. Documented GDPR violations totaling {settlement_analysis['gdpr_analysis']['total_damages']:.2f} NOK in damages
2. Inkassoloven violations: {settlement_analysis['inkasso_analysis']['excessive_amount']:.2f} NOK in excessive fees
3. Our settlement analysis showing VERY HIGH leverage
4. Good faith effort to reach mutual agreement

{response_offer['message']}

TERMS

- Settlement Amount: {response_offer['amount']:.2f} NOK
- Payment via escrow upon acceptance
- Mutual release of all claims
- Removal of negative credit reporting
- Deadline for response: {response_offer['deadline_days']} days

If this offer is not acceptable, we maintain our right to escalate to Datatilsynet as previously stated.

Sincerely,
[User Name]
Via DAMOCLES Platform

---
Generated: {datetime.now().isoformat()}
Strategy: {response_offer['strategy']}
"""
        return template.strip()

    def _create_final_offer_letter(
        self,
        response_offer: Dict[str, Any],
        settlement_analysis: Dict[str, Any],
        debt_data: Dict[str, Any]
    ) -> str:
        """Create final ultimatum letter"""

        template = f"""
FINAL SETTLEMENT OFFER
{datetime.now().strftime("%B %d, %Y")}

Re: Final Settlement Proposal - Debt Reference {debt_data.get('reference', 'N/A')}

Dear Sir/Madam,

After multiple rounds of negotiation, we present our final settlement offer.

FINAL OFFER: {response_offer['amount']:.2f} NOK

This represents our maximum settlement amount based on:
- GDPR violations: {settlement_analysis['gdpr_analysis']['total_damages']:.2f} NOK damages
- Inkassoloven violations: {settlement_analysis['inkasso_analysis']['excessive_amount']:.2f} NOK excessive fees
- Good faith negotiation efforts

DEADLINE: {response_offer['deadline_days']} days from date above

This is our final offer. If not accepted by the deadline, we will proceed with:
1. Formal complaint to Datatilsynet
2. Public disclosure of violations
3. Legal proceedings for GDPR damages

We believe this settlement serves both parties' interests and avoids costly litigation.

Sincerely,
[User Name]
Via DAMOCLES Platform

---
Generated: {datetime.now().isoformat()}
FINAL ULTIMATUM - No further negotiation possible
"""
        return template.strip()
