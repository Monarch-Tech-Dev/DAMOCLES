#!/usr/bin/env python3
"""
Settlement Analysis Test Script

This script demonstrates the settlement proposal generation system
using the real Convene case data.

User: king101@live.no
Debt: 6,000 NOK (Convene Group / Credicare)
GDPR Request: Sent October 6, 2025
Violation: delayed_response (DETECTED)

Expected Result: 93-97% debt reduction using GDPR violations as leverage
"""

import asyncio
from services.settlement_service import SettlementService


async def test_convene_settlement():
    """Test settlement analysis with real Convene case"""

    print("=" * 80)
    print("DAMOCLES SETTLEMENT ANALYSIS - Real Case Demonstration")
    print("=" * 80)
    print()

    # Initialize settlement service
    settlement_service = SettlementService()

    # Real Convene case data
    debt_data = {
        "amount": 6000.0,  # Current claimed amount
        "originalAmount": 4500.0,  # Original claim (estimated)
        "creditorName": "Convene Group (Credicare)",
        "reference": "GDPR-CREDICARE-20251006"
    }

    # GDPR violation detected (from real case)
    violations = [
        {
            "id": "violation-001",
            "type": "delayed_response",
            "severity": "high",
            "confidence": 0.9,
            "evidence": "No response received within 30-day legal deadline (GDPR Article 12(3))",
            "legal_reference": "GDPR Article 12(3)",
            "estimated_damage": 150.0,  # Conservative estimate
            "description": "Responding to GDPR request after legal deadline",
            "created_at": "2025-10-06T00:00:00Z"
        }
    ]

    # Creditor data (Convene Group)
    creditor_data = {
        "totalViolations": 1,  # Currently documented
        "violationScore": 2.5,  # Medium-high
        "type": "DEBT_COLLECTOR"  # High vulnerability to regulatory action
    }

    print("📋 CASE DETAILS")
    print(f"   Creditor: {debt_data['creditorName']}")
    print(f"   Reference: {debt_data['reference']}")
    print(f"   Current Debt: {debt_data['amount']:,.2f} NOK")
    print(f"   Original Claim: {debt_data['originalAmount']:,.2f} NOK")
    print(f"   Violations: {len(violations)}")
    print()

    # Perform settlement analysis
    print("🔍 ANALYZING SETTLEMENT OPPORTUNITY...")
    print()

    analysis = await settlement_service.analyze_settlement_opportunity(
        debt_data=debt_data,
        violations=violations,
        creditor_data=creditor_data
    )

    # Display results
    print("=" * 80)
    print("ANALYSIS RESULTS")
    print("=" * 80)
    print()

    # GDPR Analysis
    print("1️⃣  GDPR VIOLATION ANALYSIS")
    gdpr = analysis["gdpr_analysis"]
    print(f"   Total Violations: {gdpr['total_violations']}")
    print(f"   Total Damages: {gdpr['total_damages']:,.2f} NOK")
    print(f"   Legal References: {', '.join(gdpr['legal_references'])}")
    print()

    # Inkassoloven Analysis
    print("2️⃣  INKASSOLOVEN COMPLIANCE ANALYSIS")
    inkasso = analysis["inkasso_analysis"]
    print(f"   Original Claim: {inkasso['original_claim']:,.2f} NOK")
    print(f"   Current Amount: {inkasso['current_amount']:,.2f} NOK")
    print(f"   Actual Fees: {inkasso['actual_fees']:,.2f} NOK")
    print(f"   Max Legal Fees: {inkasso['max_legal_fees']['total']:,.2f} NOK ({inkasso['max_legal_fees']['bracket']})")
    print(f"   Excessive Fees: {inkasso['is_excessive']}")
    if inkasso['is_excessive']:
        print(f"   Excessive Amount: {inkasso['excessive_amount']:,.2f} NOK")
        print(f"   Violation Severity: {inkasso['violation_severity']}")
    print(f"   Legitimate Debt: {inkasso['legitimate_debt']:,.2f} NOK")
    print()

    # Creditor Risk
    print("3️⃣  CREDITOR RISK ASSESSMENT")
    risk = analysis["creditor_risk"]
    print(f"   Risk Score: {risk['risk_score']:.2f}/100")
    print(f"   Risk Level: {risk['risk_level']}")
    print(f"   Settlement Likelihood: {risk['settlement_likelihood']}")
    print(f"   Recommendation: {risk['recommendation']}")
    print()

    # Settlement Leverage
    print("4️⃣  SETTLEMENT LEVERAGE")
    leverage = analysis["leverage"]
    print(f"   Leverage Score: {leverage['leverage_score']:.2f}/100")
    print(f"   Leverage Level: {leverage['leverage_level']}")
    print(f"   Expected Reduction: {leverage['expected_reduction_range']}")
    print(f"   Assessment: {leverage['strength_assessment']}")
    print()

    # Settlement Offers
    print("5️⃣  SETTLEMENT OFFERS")
    offers = analysis["settlement_offers"]

    print("\n   💰 CONSERVATIVE OFFER (High Acceptance Probability)")
    conservative = offers["conservative"]
    print(f"      Settlement: {conservative['settlement_amount']:,.2f} NOK")
    print(f"      Reduction: {conservative['reduction_amount']:,.2f} NOK ({conservative['reduction_percentage']:.1f}%)")
    print(f"      Platform Fee (20%): {conservative['platform_fee']:,.2f} NOK")
    print(f"      User Payment: {conservative['user_payment']:,.2f} NOK")
    print(f"      Success Rate: {conservative['success_probability']}")
    print(f"      Rationale: {conservative['rationale']}")

    print("\n   ⭐ RECOMMENDED OFFER (Balanced Approach)")
    recommended = offers["recommended"]
    print(f"      Settlement: {recommended['settlement_amount']:,.2f} NOK")
    print(f"      Reduction: {recommended['reduction_amount']:,.2f} NOK ({recommended['reduction_percentage']:.1f}%)")
    print(f"      Platform Fee (20%): {recommended['platform_fee']:,.2f} NOK")
    print(f"      User Payment: {recommended['user_payment']:,.2f} NOK")
    print(f"      Success Rate: {recommended['success_probability']}")
    print(f"      Rationale: {recommended['rationale']}")

    print("\n   🎯 AGGRESSIVE OFFER (Maximum Reduction)")
    aggressive = offers["aggressive"]
    print(f"      Settlement: {aggressive['settlement_amount']:,.2f} NOK")
    print(f"      Reduction: {aggressive['reduction_amount']:,.2f} NOK ({aggressive['reduction_percentage']:.1f}%)")
    print(f"      Platform Fee (20%): {aggressive['platform_fee']:,.2f} NOK")
    print(f"      User Payment: {aggressive['user_payment']:,.2f} NOK")
    print(f"      Success Rate: {aggressive['success_probability']}")
    print(f"      Rationale: {aggressive['rationale']}")

    print()

    # Negotiation Strategy
    print("6️⃣  NEGOTIATION STRATEGY")
    strategy = analysis["negotiation_strategy"]
    print(f"   Approach: {strategy['approach']}")
    print(f"   Initial Offer: {strategy['initial_offer']}")
    print(f"   Fallback Position: {strategy['fallback_position']}")
    print(f"   Timeline: {strategy['timeline']}")
    print(f"   Escalation Threat: {strategy['escalation_threat']}")
    print(f"   Negotiation Room: {strategy['negotiation_room']}")
    print(f"   Key Message: {strategy['key_message']}")
    print()

    # Settlement Proposal Template
    print("=" * 80)
    print("SETTLEMENT PROPOSAL TEMPLATE")
    print("=" * 80)
    print()
    print(analysis["proposal_template"])
    print()

    # Summary
    print("=" * 80)
    print("EXECUTIVE SUMMARY")
    print("=" * 80)
    print()
    print(f"✅ Original Debt: {debt_data['amount']:,.2f} NOK")
    print(f"✅ Recommended Settlement: {recommended['settlement_amount']:,.2f} NOK")
    print(f"✅ Total Reduction: {recommended['reduction_amount']:,.2f} NOK ({recommended['reduction_percentage']:.1f}%)")
    print(f"✅ User Saves: {recommended['reduction_amount'] - recommended['platform_fee']:,.2f} NOK (after platform fee)")
    print(f"✅ Leverage Level: {leverage['leverage_level']}")
    print(f"✅ Success Probability: {recommended['success_probability']}")
    print()
    print("=" * 80)
    print()


if __name__ == "__main__":
    print()
    asyncio.run(test_convene_settlement())
    print("✅ Settlement analysis demonstration complete!")
    print()
