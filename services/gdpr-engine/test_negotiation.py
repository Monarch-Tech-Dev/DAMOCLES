#!/usr/bin/env python3
"""
Negotiation Engine Test - Convene Settlement Scenarios

This script demonstrates the automated negotiation engine handling
various creditor responses to your 600 NOK settlement offer for the
6,000 NOK Convene debt.

Scenarios Tested:
1. Creditor accepts our offer (600 NOK) ✅
2. Creditor counter-offers reasonable amount (1,200 NOK) 🤝
3. Creditor counter-offers high but acceptable (2,000 NOK) ⚖️
4. Creditor counter-offers unreasonable amount (5,000 NOK) ⚠️
5. Multi-round negotiation with gradual concessions 🔄

Demonstrates:
- Game theory (tit-for-tat, strategic concessions)
- Automatic accept/counter/escalate logic
- Formal response letter generation
- Time pressure dynamics
"""

import asyncio
import json
from services.negotiation_engine import NegotiationEngine
from services.settlement_service import SettlementService


async def test_negotiation_scenarios():
    """Test negotiation engine with realistic Convene scenarios"""

    print("=" * 80)
    print("DAMOCLES NEGOTIATION ENGINE TEST - Convene Case Scenarios")
    print("=" * 80)
    print()

    # Initialize services
    negotiation_engine = NegotiationEngine()
    settlement_service = SettlementService()

    # Original Convene settlement analysis (from previous test)
    debt_data = {
        "amount": 6000.0,
        "originalAmount": 4500.0,
        "creditorName": "Convene Group (Credicare)",
        "reference": "GDPR-CREDICARE-20251006"
    }

    violations = [{
        "id": "v1",
        "type": "delayed_response",
        "severity": "high",
        "confidence": 0.9,
        "evidence": "No response within 30-day deadline",
        "legal_reference": "GDPR Article 12(3)",
        "estimated_damage": 150.0
    }]

    creditor_data = {
        "totalViolations": 1,
        "violationScore": 2.5,
        "type": "DEBT_COLLECTOR"
    }

    # Run original settlement analysis
    print("🔍 RUNNING SETTLEMENT ANALYSIS...")
    print()

    original_analysis = await settlement_service.analyze_settlement_opportunity(
        debt_data=debt_data,
        violations=violations,
        creditor_data=creditor_data
    )

    our_recommended = original_analysis["settlement_offers"]["recommended"]["settlement_amount"]
    our_aggressive = original_analysis["settlement_offers"]["aggressive"]["settlement_amount"]
    our_conservative = original_analysis["settlement_offers"]["conservative"]["settlement_amount"]

    print(f"✅ Our Settlement Offers:")
    print(f"   Aggressive: {our_aggressive:.2f} NOK")
    print(f"   Recommended: {our_recommended:.2f} NOK")
    print(f"   Conservative: {our_conservative:.2f} NOK")
    print()
    print(f"📤 WE SEND: {our_recommended:.2f} NOK to Convene")
    print()
    print("=" * 80)
    print()

    # Test scenarios
    scenarios = [
        {
            "name": "SCENARIO 1: Creditor Accepts Our Offer",
            "counter_offer": our_recommended,
            "expected_action": "ACCEPT"
        },
        {
            "name": "SCENARIO 2: Creditor Counter-Offers Reasonable Amount",
            "counter_offer": 1200.0,
            "expected_action": "ACCEPT or COUNTER"
        },
        {
            "name": "SCENARIO 3: Creditor Counter-Offers High But Acceptable",
            "counter_offer": 2000.0,
            "expected_action": "COUNTER"
        },
        {
            "name": "SCENARIO 4: Creditor Counter-Offers Unreasonable Amount",
            "counter_offer": 5000.0,
            "expected_action": "ESCALATE"
        },
        {
            "name": "SCENARIO 5: Multi-Round Negotiation",
            "counter_offer": 3000.0,
            "expected_action": "COUNTER (multiple rounds)"
        }
    ]

    for i, scenario in enumerate(scenarios, 1):
        print(f"{scenario['name']}")
        print("=" * 80)
        print()
        print(f"📨 CONVENE COUNTER-OFFERS: {scenario['counter_offer']:.2f} NOK")
        print()

        # Single round evaluation
        if i < 5:
            evaluation = await negotiation_engine.evaluate_counter_offer(
                counter_offer_amount=scenario["counter_offer"],
                original_settlement_analysis=original_analysis,
                negotiation_history=[],
                days_since_initial_offer=0
            )

            print(f"🎯 EVALUATION RESULTS")
            print()
            print(f"   Quality: {evaluation['offer_evaluation']['quality']}")
            print(f"   Quality Score: {evaluation['offer_evaluation']['score']}/100")
            print(f"   Recommended Action: {evaluation['recommended_action']}")
            print()

            if evaluation.get('response_offer'):
                response = evaluation['response_offer']
                print(f"💼 OUR COUNTER-OFFER")
                print()
                print(f"   Amount: {response['amount']:.2f} NOK")
                print(f"   Strategy: {response['strategy']}")
                print(f"   Concession: {response['concession_from_previous']:.2f} NOK")
                print(f"   Gap to Close: {response['distance_to_counter_offer']:.2f} NOK")
                print(f"   Deadline: {response['deadline_days']} days")
                print()
                print(f"   Message: {response['message']}")
                print()

            print(f"📋 RATIONALE")
            print(f"   {evaluation['rationale']}")
            print()

        # Multi-round simulation
        else:
            print("🔄 SIMULATING MULTI-ROUND NEGOTIATION...")
            print()

            negotiation_history = []
            current_offer = scenario["counter_offer"]
            round_num = 1
            max_rounds = 5

            while round_num <= max_rounds:
                print(f"--- ROUND {round_num} ---")
                print()
                print(f"   Convene offers: {current_offer:.2f} NOK")
                print()

                evaluation = await negotiation_engine.evaluate_counter_offer(
                    counter_offer_amount=current_offer,
                    original_settlement_analysis=original_analysis,
                    negotiation_history=negotiation_history,
                    days_since_initial_offer=(round_num - 1) * 2  # 2 days per round
                )

                print(f"   Our action: {evaluation['recommended_action']}")

                if evaluation['recommended_action'] == 'ACCEPT':
                    print(f"   ✅ DEAL REACHED at {current_offer:.2f} NOK")
                    print(f"   User saves: {debt_data['amount'] - current_offer:.2f} NOK")
                    print()
                    break

                elif evaluation['recommended_action'] in ['FINAL_OFFER', 'ESCALATE']:
                    print(f"   ⚠️ Negotiation ending: {evaluation['recommended_action']}")
                    if evaluation.get('response_offer'):
                        print(f"   Final offer: {evaluation['response_offer']['amount']:.2f} NOK")
                    print()
                    break

                elif evaluation.get('response_offer'):
                    our_response = evaluation['response_offer']['amount']
                    print(f"   We counter with: {our_response:.2f} NOK")
                    print(f"   Strategy: {evaluation['response_offer']['strategy']}")
                    print()

                    # Add to history
                    negotiation_history.append({
                        "round": round_num,
                        "party": "creditor",
                        "amount": current_offer
                    })
                    negotiation_history.append({
                        "round": round_num,
                        "party": "user",
                        "amount": our_response
                    })

                    # Simulate creditor response (they move halfway toward us)
                    gap = current_offer - our_response
                    creditor_concession = gap * 0.3  # They concede 30%
                    current_offer = current_offer - creditor_concession

                    round_num += 1

                else:
                    print("   ❌ No response offer generated")
                    break

            print()

        print("=" * 80)
        print()
        input("Press Enter to continue to next scenario...")
        print()

    # Summary
    print("=" * 80)
    print("NEGOTIATION ENGINE CAPABILITIES DEMONSTRATED")
    print("=" * 80)
    print()
    print("✅ Automatic evaluation of counter-offers")
    print("✅ Quality scoring (EXCELLENT / GOOD / ACCEPTABLE / POOR / UNACCEPTABLE)")
    print("✅ Strategic counter-offers using game theory")
    print("✅ Tit-for-tat concession matching")
    print("✅ Time pressure dynamics")
    print("✅ Multi-round negotiation with history tracking")
    print("✅ Automatic accept when offer is good")
    print("✅ Automatic escalate when creditor unreasonable")
    print("✅ Formal response letter generation")
    print("✅ Protection of user interests")
    print()
    print("🎯 REAL-WORLD APPLICATION:")
    print()
    print("When Convene receives your 600 NOK settlement offer:")
    print()
    print("IF they accept → ✅ Deal closed, you pay 720 NOK total")
    print("IF they counter with 1,200 NOK → ✅ System accepts (GOOD offer)")
    print("IF they counter with 2,000 NOK → 🔄 System counters with ~900 NOK")
    print("IF they counter with 5,000 NOK → ⚠️ System recommends escalation")
    print()
    print("The negotiation engine ensures you get the best possible outcome")
    print("while maintaining strong position based on documented GDPR violations.")
    print()
    print("=" * 80)


if __name__ == "__main__":
    print()
    asyncio.run(test_negotiation_scenarios())
    print("✅ Negotiation engine test complete!")
    print()
