#!/usr/bin/env python3
"""
Escalation Scheduler Test - Real Convene Case

This script tests the automated escalation system using the real Convene case:
- User: king101@live.no
- Creditor: Convene Group (Credicare)
- GDPR Request Reference: GDPR-CREDICARE-20251006
- Sent: October 6, 2025
- Deadline: November 5, 2025 (30 days)
- Current Date: November 4, 2025 (Day 29)

Escalation Timeline:
- Day 25: Friendly reminder to creditor
- Day 30: Legal deadline passes → delayed_response violation created
- Day 35: Datatilsynet notification + formal notice
- Day 45: Legal proceedings initiated (forliksrådet)
- Day 60+: SWORD protocol triggered

This test demonstrates what will happen when the Nov 5 deadline passes.
"""

import asyncio
import aiohttp
import os
from datetime import datetime, timedelta
from database import Database
from escalation_scheduler import EscalationScheduler


async def test_convene_escalation():
    """Test escalation with real Convene case data"""

    print("=" * 80)
    print("DAMOCLES ESCALATION SCHEDULER TEST - Real Convene Case")
    print("=" * 80)
    print()

    # Case details
    print("📋 CASE DETAILS")
    print("   User: king101@live.no")
    print("   Creditor: Convene Group (Credicare)")
    print("   Reference: GDPR-CREDICARE-20251006")
    print("   Request Sent: October 6, 2025")
    print("   Legal Deadline: November 5, 2025 (30 days)")
    print("   Current Date: November 4, 2025")
    print()

    # Query database for real Convene GDPR request
    print("🔍 QUERYING DATABASE FOR CONVENE GDPR REQUEST...")
    print()

    db = Database()
    await db.connect()

    # Fetch pending requests from user-service
    user_service_url = os.getenv('USER_SERVICE_URL', 'http://localhost:3001')
    service_api_key = os.getenv('SERVICE_API_KEY', 'dev-service-key-12345')

    try:
        async with aiohttp.ClientSession() as session:
            url = f"{user_service_url}/api/internal/gdpr-requests/pending"
            headers = {'x-service-api-key': service_api_key}

            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    pending_requests = data.get('requests', [])

                    print(f"✅ Found {len(pending_requests)} pending GDPR requests")
                    print()

                    # Find Convene request
                    convene_request = None
                    for req in pending_requests:
                        ref_id = req.get('referenceId', '')
                        if 'CREDICARE' in ref_id or 'CONVENE' in ref_id.upper():
                            convene_request = req
                            break

                    if convene_request:
                        print("✅ FOUND CONVENE GDPR REQUEST IN DATABASE")
                        print()
                        print(f"   Request ID: {convene_request.get('id')}")
                        print(f"   Reference: {convene_request.get('referenceId')}")
                        print(f"   Status: {convene_request.get('status')}")
                        print(f"   Created: {convene_request.get('createdAt')}")
                        print(f"   Sent: {convene_request.get('sentAt')}")
                        print(f"   Response Due: {convene_request.get('responseDue')}")
                        print()

                        # Calculate days elapsed
                        sent_at_str = convene_request.get('sentAt')
                        if sent_at_str:
                            sent_at = datetime.fromisoformat(sent_at_str.replace('Z', '+00:00'))
                            now = datetime.now(sent_at.tzinfo)
                            days_elapsed = (now - sent_at).days

                            print(f"📊 TIMELINE ANALYSIS")
                            print(f"   Days Elapsed: {days_elapsed} days")
                            print(f"   Days Until Deadline: {30 - days_elapsed} days")
                            print()

                            # Show escalation status
                            print(f"⚖️  ESCALATION STATUS")
                            print()

                            if days_elapsed < 25:
                                print(f"   ⏰ Status: Waiting Period")
                                print(f"   ⏰ Next Checkpoint: Day 25 (friendly reminder)")
                                print(f"   ⏰ Days Until Next Action: {25 - days_elapsed} days")
                            elif days_elapsed == 25:
                                print(f"   📧 Status: READY FOR DAY 25 REMINDER")
                                print(f"   📧 Action: Send friendly reminder to Convene")
                                print(f"   📧 Message: 'We sent a GDPR request, please respond'")
                            elif days_elapsed < 30:
                                print(f"   ⏰ Status: Post-Reminder, Pre-Deadline")
                                print(f"   ⏰ Reminder sent on Day 25")
                                print(f"   ⏰ Waiting for legal deadline (Day 30)")
                                print(f"   ⏰ Days Until Deadline: {30 - days_elapsed} days")
                            elif days_elapsed == 30:
                                print(f"   ⚠️  STATUS: LEGAL DEADLINE PASSED")
                                print(f"   ⚠️  Violation: delayed_response (GDPR Article 12(3))")
                                print(f"   ⚠️  Estimated Damages: 150 NOK")
                                print(f"   ⚠️  Next Checkpoint: Day 35 (Datatilsynet notification)")
                            elif days_elapsed < 35:
                                print(f"   ⚠️  STATUS: VIOLATION DETECTED")
                                print(f"   ⚠️  Creditor missed 30-day deadline")
                                print(f"   ⚠️  Days overdue: {days_elapsed - 30} days")
                                print(f"   ⚠️  Next Checkpoint: Day 35 (in {35 - days_elapsed} days)")
                            elif days_elapsed == 35:
                                print(f"   🚨 STATUS: READY FOR DATATILSYNET NOTIFICATION")
                                print(f"   🚨 Action: File formal complaint with Datatilsynet")
                                print(f"   🚨 Action: Send formal notice to Convene")
                                print(f"   🚨 Next: Day 45 (legal proceedings)")
                            elif days_elapsed < 45:
                                print(f"   🚨 STATUS: DATATILSYNET NOTIFIED")
                                print(f"   🚨 Complaint filed with regulatory authority")
                                print(f"   🚨 Days since notification: {days_elapsed - 35} days")
                                print(f"   🚨 Next Checkpoint: Day 45 (in {45 - days_elapsed} days)")
                            elif days_elapsed == 45:
                                print(f"   ⚖️  STATUS: READY FOR LEGAL PROCEEDINGS")
                                print(f"   ⚖️  Action: Initiate forliksrådet (conciliation court)")
                                print(f"   ⚖️  Damages Claim: 3,000 NOK")
                                print(f"   ⚖️  Next: Day 60 (SWORD protocol)")
                            elif days_elapsed < 60:
                                print(f"   ⚖️  STATUS: LEGAL PROCEEDINGS ACTIVE")
                                print(f"   ⚖️  Conciliation court process initiated")
                                print(f"   ⚖️  Days since filing: {days_elapsed - 45} days")
                                print(f"   ⚖️  Next Checkpoint: Day 60 (in {60 - days_elapsed} days)")
                            else:
                                print(f"   🗡️  STATUS: SWORD PROTOCOL TRIGGERED")
                                print(f"   🗡️  Systematic non-compliance detected")
                                print(f"   🗡️  Violation NFT minting enabled")
                                print(f"   🗡️  Public transparency report activated")
                                print(f"   🗡️  Days since SWORD trigger: {days_elapsed - 60} days")

                            print()

                            # Show what happens next
                            print("=" * 80)
                            print("WHAT HAPPENS NEXT (Simulated)")
                            print("=" * 80)
                            print()

                            if days_elapsed >= 30:
                                print("🎯 SETTLEMENT OPPORTUNITY ACTIVATED")
                                print()
                                print("   When the deadline passes, the system automatically:")
                                print("   1. Creates delayed_response violation (150 NOK damages)")
                                print("   2. Analyzes debt for settlement opportunity")
                                print("   3. Generates settlement proposal (600 NOK for 6,000 NOK debt)")
                                print("   4. Presents user with three settlement options:")
                                print()
                                print("      💰 Conservative: 1,906 NOK (68% reduction)")
                                print("      ⭐ Recommended: 600 NOK (90% reduction)")
                                print("      🎯 Aggressive: 180 NOK (97% reduction)")
                                print()
                                print("   5. If user accepts, settlement proposal sent to Convene")
                                print("   6. 14-day deadline for creditor response")
                                print("   7. If rejected → Continue escalation to Day 35")
                                print()

                            if days_elapsed >= 35:
                                print("📢 DATATILSYNET NOTIFICATION (Day 35)")
                                print()
                                print("   Formal complaint filed with Norwegian Data Protection Authority:")
                                print("   - Creditor: Convene Group (Credicare)")
                                print("   - Org Number: [Creditor's organization number]")
                                print("   - Violation: Failed to respond to GDPR request within 30 days")
                                print("   - Evidence: Request sent Oct 6, no response by Nov 5")
                                print("   - User Protected: king101@live.no")
                                print()
                                print("   Datatilsynet can:")
                                print("   - Investigate Convene's data handling practices")
                                print("   - Issue administrative fines (up to 4% of global turnover)")
                                print("   - Order compliance within specified timeframe")
                                print("   - Impose corrective measures")
                                print()

                            if days_elapsed >= 45:
                                print("⚖️  LEGAL PROCEEDINGS (Day 45)")
                                print()
                                print("   Small claims court (forliksrådet) case initiated:")
                                print("   - Claim: 3,000 NOK in GDPR damages")
                                print("   - Evidence: Non-responsive to legally mandated request")
                                print("   - Court fees: Covered by DAMOCLES")
                                print("   - Timeline: 2-3 months to resolution")
                                print()

                            if days_elapsed >= 60:
                                print("🗡️  SWORD PROTOCOL (Day 60+)")
                                print()
                                print("   Systematic enforcement activated:")
                                print("   - Violation evidence minted as NFT on Cardano")
                                print("   - Public transparency report published")
                                print("   - Creditor violation score updated")
                                print("   - Pattern detection across all users")
                                print("   - If multiple users affected → Class action potential")
                                print()

                        # Test manual trigger
                        print("=" * 80)
                        print("ESCALATION SCHEDULER TEST")
                        print("=" * 80)
                        print()

                        print("🧪 Testing escalation scheduler with Convene case...")
                        print()

                        # Create scheduler instance
                        scheduler = EscalationScheduler()
                        await scheduler.db.connect()

                        # Manual trigger
                        print("▶️  Triggering manual escalation check...")
                        stats = await scheduler.check_now()

                        print()
                        print("✅ ESCALATION CHECK COMPLETE")
                        print()
                        print(f"   Checks Performed: {stats['checks_performed']}")
                        print(f"   Escalations Triggered: {stats['escalations_triggered']}")
                        print(f"   Status: {stats['status']}")
                        print(f"   Errors: {stats['errors']}")
                        print()

                        await scheduler.db.disconnect()

                    else:
                        print("⚠️  Convene GDPR request not found in pending requests")
                        print("   This might mean:")
                        print("   1. Request not yet sent (status: DRAFT or PENDING)")
                        print("   2. Already received response (status: RESPONDED)")
                        print("   3. Different reference ID pattern")
                        print()
                        print("   All pending requests:")
                        for req in pending_requests:
                            print(f"   - {req.get('referenceId')} (status: {req.get('status')})")
                        print()

                else:
                    print(f"❌ Failed to fetch pending requests: HTTP {response.status}")
                    print()

    except Exception as e:
        print(f"❌ Error: {e}")
        print()

    await db.disconnect()

    print("=" * 80)
    print()


if __name__ == "__main__":
    print()
    asyncio.run(test_convene_escalation())
    print("✅ Escalation test complete!")
    print()