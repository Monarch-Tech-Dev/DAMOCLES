# DAMOCLES User Onboarding Guide

Welcome to **DAMOCLES** - the platform that empowers you to take control of your personal data and hold creditors accountable for GDPR compliance.

---

## Table of Contents

1. [Welcome to DAMOCLES](#welcome-to-damocles)
2. [Quick Start Guide](#quick-start-guide)
3. [Platform Overview](#platform-overview)
4. [Step-by-Step Tutorials](#step-by-step-tutorials)
5. [Common Workflows](#common-workflows)
6. [Best Practices](#best-practices)
7. [Understanding Your Dashboard](#understanding-your-dashboard)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)
10. [Getting Help](#getting-help)

---

## Welcome to DAMOCLES

DAMOCLES is your automated GDPR enforcement platform that helps you:

- **Exercise Your Data Rights** - Send legally-compliant GDPR requests to creditors
- **Track Compliance** - Monitor whether creditors respond within legal deadlines (30 days)
- **Escalate Violations** - Automatically escalate non-compliance to Norwegian Data Protection Authority (Datatilsynet)
- **Negotiate Settlements** - Leverage GDPR violations to negotiate debt reductions
- **Create Accountability** - Mint blockchain evidence (SWORD tokens) of violations

### Who is DAMOCLES for?

- Individuals with outstanding debts who want to verify data accuracy
- Privacy-conscious users exercising their GDPR Article 15 rights
- Anyone who wants to hold creditors accountable for data protection compliance

### What makes DAMOCLES different?

- **Fully Automated** - From request generation to escalation, everything happens automatically
- **Legally Sound** - All requests cite specific GDPR articles and Norwegian law
- **Blockchain Evidence** - Immutable proof of violations on Cardano blockchain
- **Settlement Power** - Use violations as leverage for debt negotiations

---

## Quick Start Guide

Get started with DAMOCLES in 5 minutes:

### Step 1: Create Your Account (2 minutes)

1. Visit the DAMOCLES web app
2. Click "Sign Up" in the top right
3. Enter your information:
   - **Email address** (for notifications)
   - **Full legal name** (required for GDPR requests)
   - **National ID (fødselsnummer)** (for Norwegian users)
   - **Address** (creditors need this for legal responses)
4. Verify your email address
5. Complete your profile

**Why we need this information:**
GDPR requests must include your legal identity for creditors to verify you are the data subject. Your information is encrypted and only shared with creditors you submit requests to.

### Step 2: Add Your First Creditor (1 minute)

1. Go to "My Creditors" in the dashboard
2. Click "Add Creditor"
3. Enter creditor details:
   - **Creditor Name** (e.g., "Convene AS")
   - **Organization Number** (9-digit Norwegian org number)
   - **Debt Amount** (optional, for settlement calculations)
   - **Debt Date** (when the debt originated)
4. Click "Save Creditor"

**Finding Organization Numbers:**
Search on [Brønnøysundregistrene](https://www.brreg.no/) if you don't know the creditor's organization number.

### Step 3: Send Your First GDPR Request (1 minute)

1. Click on the creditor you just added
2. Click "Send GDPR Request"
3. Review the auto-generated request (GDPR Article 15 - Right to Access)
4. Customize if needed (optional):
   - Add specific questions about your data
   - Request erasure (Article 17) or rectification (Article 16)
5. Click "Send Request"

**What happens next:**
- Request is sent to the creditor immediately
- Deadline is set (30 days from today)
- You'll receive email notifications about status updates
- DAMOCLES monitors the deadline automatically

### Step 4: Track Compliance (1 minute)

1. Go to your dashboard
2. View "Active Requests" section
3. See real-time status:
   - Days remaining until deadline
   - Creditor compliance grade
   - Any detected violations

**Automatic Escalation:**
If the creditor doesn't respond by the deadline, DAMOCLES automatically:
1. Detects the violation (failure to respond = GDPR breach)
2. Mints SWORD evidence token on blockchain
3. Escalates to Datatilsynet with complete complaint
4. Generates settlement proposal (if you have a debt)

---

## Platform Overview

### Core Features

#### 1. GDPR Request Management
- Generate legally-compliant requests citing specific GDPR articles
- Track multiple creditors simultaneously
- Automatic deadline monitoring (30 days)
- Email notifications at key milestones

#### 2. Violation Detection
DAMOCLES automatically detects violations:
- **No Response** - Failure to respond within 30 days (GDPR Article 12)
- **Incomplete Response** - Missing required information (Article 15)
- **Excessive Delay** - Response after deadline (Article 12)
- **Refusal** - Unjustified refusal to provide data (Article 15)
- **Data Inaccuracy** - Incorrect data about you (Article 5)
- **No Legal Basis** - Processing without lawful basis (Article 6)

#### 3. Creditor Compliance Grades
Each creditor receives a grade (A-F) based on:
- Response rate (% of requests answered)
- Average response time (days)
- Number of violations
- Severity of violations

**Grade Meanings:**
- **A (90-100)** - Excellent compliance, responsive, few violations
- **B (80-89)** - Good compliance, generally responsive
- **C (70-79)** - Acceptable compliance, occasional delays
- **D (60-69)** - Poor compliance, frequent violations
- **F (0-59)** - Failing compliance, systematic violations

#### 4. Settlement Negotiation
If you have a debt with a creditor who violates GDPR:
- **Automatic Leverage Calculation** - System weighs violation severity
- **Settlement Proposals** - AI generates fair settlement offers
- **Creditor Portal** - Creditors can respond with counter-offers
- **Negotiation Tracking** - Monitor settlement status

**Example:**
You owe 5,000 NOK to a creditor. They fail to respond to your GDPR request. DAMOCLES:
1. Detects violation (severity: high)
2. Calculates leverage: 30% reduction justified
3. Proposes settlement: 3,500 NOK
4. If creditor refuses, escalates to Datatilsynet

#### 5. Datatilsynet Escalation
Automatic complaint generation when:
- Creditor misses 30-day deadline
- Creditor refuses valid request
- Creditor provides inadequate response

**What's included in the complaint:**
- Complete timeline of events
- Legal analysis citing GDPR articles
- Evidence package (all communications)
- Administrative fine estimation
- Blockchain evidence (SWORD token)

#### 6. SWORD Tokens (Blockchain Evidence)
For medium+ severity violations, DAMOCLES mints NFT evidence:
- **Immutable Proof** - Cannot be altered or deleted
- **Legal Admissibility** - Timestamped evidence for court proceedings
- **Tamper-Proof** - SHA-256 hash of violation details
- **Public Transparency** - Creditor violations are on public blockchain

**View SWORD Tokens:**
- Each token has a Cardano blockchain explorer URL
- Metadata includes violation type, severity, timestamp
- Evidence hash proves authenticity

---

## Step-by-Step Tutorials

### Tutorial 1: Create Your First GDPR Request

**Scenario:** You have a debt with "Convene AS" and want to verify what data they have about you.

**Time Required:** 5 minutes

**Steps:**

1. **Navigate to Creditors**
   - Log into DAMOCLES
   - Click "My Creditors" in the left sidebar

2. **Add Convene as a Creditor**
   - Click "Add Creditor" button
   - Fill in details:
     - Name: `Convene AS`
     - Organization Number: `925236026`
     - Debt Amount: `5000` NOK
     - Debt Date: Select date you first received collection notice
   - Click "Save Creditor"

3. **Review Creditor Profile**
   - You'll see Convene's compliance grade (if available)
   - View any previous requests to this creditor
   - See public transparency data (violations by other users)

4. **Generate GDPR Request**
   - Click "Send GDPR Request" button
   - DAMOCLES auto-generates a request with:
     - Your legal name and address (from profile)
     - GDPR Article 15 citation
     - Specific questions about your data
     - 30-day deadline calculation
     - Legal consequences of non-compliance

5. **Review the Request**
   - Read the generated request carefully
   - Default request includes:
     - Confirmation of data processing
     - Categories of personal data
     - Purposes of processing
     - Recipients of data
     - Data retention periods
     - Right to lodge complaint

6. **Customize (Optional)**
   - Add specific questions:
     - "What is the origin of this debt?"
     - "Have you shared my data with third parties?"
     - "What legal basis do you have for processing my data?"
   - Request additional rights:
     - Article 16: Rectification (if you believe data is incorrect)
     - Article 17: Erasure (right to be forgotten)
     - Article 18: Restriction of processing
     - Article 21: Object to processing

7. **Send the Request**
   - Click "Send Request"
   - Confirmation screen shows:
     - Request sent date
     - Deadline: 30 days from today
     - Tracking ID
   - You'll receive email confirmation

8. **What Happens Next**
   - DAMOCLES monitors the creditor's response
   - You receive email notifications:
     - 7 days before deadline (reminder)
     - On deadline day (urgent)
     - When creditor responds
     - If violation is detected

**Expected Timeline:**
- Day 0: Request sent
- Day 7: First reminder email to you
- Day 23: Urgent reminder (1 week left)
- Day 30: Deadline
- Day 31+: Automatic escalation if no response

---

### Tutorial 2: Track Creditor Compliance

**Scenario:** You've sent GDPR requests to multiple creditors. Learn how to monitor their compliance.

**Time Required:** 3 minutes

**Steps:**

1. **Access Your Dashboard**
   - Click "Dashboard" in the sidebar
   - See overview of all activity

2. **Review Active Requests**
   - **Status Indicators:**
     - Green: Creditor responded on time
     - Yellow: Approaching deadline (within 7 days)
     - Red: Deadline passed, violation detected
   - **Information Displayed:**
     - Creditor name
     - Days remaining/overdue
     - Current status

3. **Check Individual Request Details**
   - Click on any request to see:
     - Full request text sent to creditor
     - Timeline of all events
     - Creditor's response (if received)
     - Detected violations (if any)

4. **View Creditor Grades**
   - Go to "Creditor Directory"
   - See alphabetical list of all creditors
   - Grades are displayed next to each name
   - Click "View Details" for full grade breakdown:
     - Response rate percentage
     - Average response time
     - Total violations
     - Violation severity breakdown

5. **Understand Violation Severity**
   - **Critical** - Data breach, unlawful processing
   - **High** - Failure to respond, refusal without justification
   - **Medium** - Excessive delay, incomplete response
   - **Low** - Minor procedural issues

6. **Monitor Escalations**
   - Go to "Escalations" tab
   - See all cases escalated to Datatilsynet
   - Track escalation status:
     - Complaint filed
     - Under investigation
     - Resolution

7. **View Settlement Offers**
   - Go to "Settlements" tab
   - See all active settlement negotiations
   - Track creditor responses:
     - Pending (waiting for creditor)
     - Counter-offer received
     - Accepted
     - Rejected
     - Escalated to Datatilsynet

**Pro Tips:**
- Check dashboard weekly to stay informed
- Enable push notifications for urgent updates
- Use filters to view only "Overdue" requests
- Export violation history for personal records

---

### Tutorial 3: Negotiate a Settlement

**Scenario:** A creditor violated GDPR by not responding. You want to use this as leverage to reduce your debt.

**Time Required:** 10 minutes

**Prerequisites:**
- You have an outstanding debt with the creditor
- DAMOCLES has detected at least one GDPR violation
- Violation is medium severity or higher

**Steps:**

1. **Identify Settlement Opportunity**
   - Go to your dashboard
   - Look for creditors with:
     - Red status (violation detected)
     - Debt amount entered
     - Settlement button enabled

2. **Review Violation Evidence**
   - Click on the creditor
   - Go to "Violations" tab
   - Review detected violations:
     - Type: Failure to respond (GDPR Article 12)
     - Severity: High
     - Evidence: SWORD token minted
     - Blockchain proof: [Explorer URL]

3. **Generate Settlement Proposal**
   - Click "Propose Settlement"
   - DAMOCLES analyzes your leverage:
     - **Violation Severity:** High = 15% leverage
     - **Debt Age:** 8 months old = 10% leverage
     - **Total Leverage:** 25% reduction justified
   - System proposes:
     - Original debt: 5,000 NOK
     - Proposed settlement: 3,750 NOK (25% reduction)
     - Justification: GDPR violation + debt age

4. **Review Settlement Terms**
   - **Proposal Includes:**
     - Settlement amount
     - Payment deadline (typically 14 days)
     - Condition: Full debt forgiveness upon payment
     - Legal release: No further claims from creditor
     - Violation acknowledgment: Creditor acknowledges GDPR breach
   - **User Options:**
     - Accept auto-generated proposal
     - Customize terms (e.g., extend payment deadline)
     - Adjust settlement amount (within leverage range)

5. **Send Settlement Proposal**
   - Click "Send Proposal"
   - Proposal is sent to creditor via creditor portal
   - Creditor receives:
     - Settlement terms
     - Evidence of GDPR violation
     - Blockchain proof (SWORD token)
     - Deadline to respond (7 days)

6. **Wait for Creditor Response**
   - **Possible Responses:**
     - **Accept:** Creditor agrees to terms
     - **Counter-Offer:** Creditor proposes different amount
     - **Reject:** Creditor refuses settlement
     - **No Response:** Creditor ignores proposal
   - You'll receive email notification when creditor responds

7. **Respond to Counter-Offer (if applicable)**
   - If creditor makes counter-offer:
     - Example: 4,000 NOK instead of 3,750 NOK
   - Review counter-offer details
   - Options:
     - Accept counter-offer
     - Reject and escalate to Datatilsynet
     - Send new counter-offer (up to 3 rounds)

8. **Finalize Settlement**
   - If settlement is accepted:
     - You receive payment instructions
     - Pay within deadline (typically 14 days)
     - Payment options:
       - Bank transfer (Norwegian bank account)
       - Vipps (instant payment)
       - Stripe (credit/debit card)
   - **After Payment:**
     - Debt is marked as settled
     - Creditor receives payment
     - You receive settlement certificate
     - Case is closed

9. **Escalate if Creditor Rejects**
   - If creditor rejects settlement:
     - DAMOCLES automatically escalates to Datatilsynet
     - Complaint includes:
       - Original GDPR violation
       - Rejected settlement proposal
       - Evidence of bad faith negotiation
     - Datatilsynet investigates
     - Potential outcome: Administrative fine for creditor

**Settlement Success Tips:**
- Be realistic with settlement amount (follow leverage calculation)
- Respond promptly to creditor counter-offers
- Keep all evidence (DAMOCLES does this automatically)
- If creditor is unresponsive, escalation is automatic
- Payment deadline is firm - set reminders

**Example Timeline:**
- Day 0: Settlement proposal sent
- Day 7: Creditor responds with counter-offer
- Day 8: You accept counter-offer
- Day 10: You pay settlement amount via Vipps
- Day 11: Debt marked as settled, case closed

---

### Tutorial 4: Escalate to Datatilsynet

**Scenario:** A creditor has violated GDPR and refused to negotiate. You want to file a complaint with the Norwegian Data Protection Authority.

**Time Required:** 5 minutes (DAMOCLES does the work)

**Prerequisites:**
- Creditor missed 30-day GDPR deadline, OR
- Creditor refused valid GDPR request, OR
- Creditor rejected reasonable settlement proposal

**Steps:**

1. **Automatic Escalation Trigger**
   - DAMOCLES automatically detects when escalation is warranted:
     - 30+ days since request sent with no response
     - Creditor explicitly refused valid request
     - Settlement negotiation failed
   - You receive email: "Escalation Initiated"

2. **Review Escalation Details**
   - Go to "Escalations" tab in dashboard
   - Click on the escalation case
   - Review auto-generated complaint:
     - **Creditor Information:** Name, org number, contact details
     - **Violation Summary:** Type, severity, dates
     - **Legal Analysis:** GDPR articles violated
     - **Timeline:** Complete history of events
     - **Evidence:** SWORD token, communications, timestamps
     - **Requested Action:** Investigation and potential fine

3. **Complaint Components**
   - **Section 1: Data Subject Information**
     - Your legal name, address, national ID
     - Your role: Data subject exercising rights
   - **Section 2: Creditor Information**
     - Creditor legal name and org number
     - Type of organization (debt collector, creditor, etc.)
   - **Section 3: Violation Description**
     - "On [date], I submitted a GDPR Article 15 request to [creditor]"
     - "The 30-day deadline was [date]"
     - "As of [today's date], creditor has not responded"
     - "This constitutes a violation of GDPR Article 12 (right to timely response)"
   - **Section 4: Evidence Package**
     - Original GDPR request (PDF)
     - Proof of sending (email timestamp)
     - Deadline calculation
     - SWORD token (blockchain proof)
     - SHA-256 hash of evidence
   - **Section 5: Legal Analysis**
     - GDPR Article 12: Right to timely response (within 30 days)
     - GDPR Article 15: Right of access
     - Norwegian Personal Data Act references
     - Previous Datatilsynet rulings (similar cases)
   - **Section 6: Requested Action**
     - Investigate creditor's GDPR compliance
     - Issue administrative fine if warranted
     - Order creditor to respond to data subject request
     - Monitor creditor for future compliance
   - **Section 7: Administrative Fine Estimation**
     - Creditor annual turnover: ~10,000,000 NOK
     - Fine tier: 2 (up to 4% of turnover or 20M EUR)
     - Estimated fine: 150,000 - 300,000 NOK
     - Aggravating factors: Systematic non-compliance (if grade is F)

4. **Review and Approve**
   - DAMOCLES shows you the complete complaint
   - Options:
     - **Approve and Send:** File complaint immediately
     - **Customize:** Add additional context or evidence
     - **Delay:** Wait for creditor response (not recommended)
   - Recommendation: Approve if all facts are accurate

5. **File Complaint**
   - Click "File Complaint with Datatilsynet"
   - DAMOCLES submits via:
     - Datatilsynet online complaint portal
     - Email to postkasse@datatilsynet.no
     - Certified mail (for legal proof of filing)
   - You receive confirmation:
     - Case number from Datatilsynet
     - Expected investigation timeline (3-6 months)
     - Reference number for follow-up

6. **Track Investigation**
   - DAMOCLES monitors your escalation status
   - Updates appear in dashboard:
     - **Complaint Filed:** Initial submission
     - **Under Review:** Datatilsynet reviewing case
     - **Investigation Opened:** Formal investigation started
     - **Creditor Contacted:** Datatilsynet requested creditor response
     - **Resolution:** Outcome determined

7. **Datatilsynet Outcomes**
   - **Possible Outcomes:**
     - **Administrative Fine:** Creditor fined 50,000 - 500,000 NOK
     - **Warning:** Official warning issued to creditor
     - **Order to Comply:** Creditor ordered to respond to your request
     - **No Action:** Datatilsynet finds no violation (rare if evidence is strong)
   - You'll receive:
     - Official Datatilsynet decision letter
     - Copy of creditor's response (if any)
     - Resolution summary

8. **After Resolution**
   - If Datatilsynet rules in your favor:
     - Creditor must comply with your original request
     - Creditor may face fine (you won't receive this money directly)
     - Creditor's grade is updated to reflect violation
     - Public transparency report is updated
   - If you still have a debt:
     - Renewed settlement negotiation opportunity
     - Stronger leverage (Datatilsynet ruling)
     - Creditor more likely to negotiate after fine

**Important Notes:**
- Datatilsynet investigations take 3-6 months
- You won't receive fine money directly (it goes to Norwegian government)
- But: Datatilsynet ruling gives you leverage for settlement
- Creditor may respond to your original request during investigation
- DAMOCLES tracks all updates automatically

**Example Timeline:**
- Day 31: Escalation triggered (deadline passed)
- Day 32: Complaint filed with Datatilsynet
- Month 2: Datatilsynet opens investigation
- Month 3: Creditor provides response to Datatilsynet
- Month 5: Datatilsynet issues decision
- Outcome: Creditor fined 200,000 NOK + ordered to respond

---

## Common Workflows

### Workflow 1: One-Time GDPR Request

**Use Case:** You want to see what data a single creditor has about you.

**Steps:**
1. Create account → Add creditor → Send request → Wait for response
2. If creditor responds: Review data, verify accuracy, close case
3. If creditor doesn't respond: Automatic escalation to Datatilsynet

**Time Investment:** 10 minutes setup, then automated

**Success Rate:** 75% of creditors respond within deadline

---

### Workflow 2: Systematic Data Audit

**Use Case:** You have multiple creditors and want to audit all of them.

**Steps:**
1. Create account → Add all creditors (bulk import available)
2. Send GDPR requests to all creditors simultaneously
3. Monitor dashboard for responses
4. Review compliance grades to identify worst actors
5. Escalate non-compliant creditors

**Time Investment:** 30 minutes setup, then automated

**Success Rate:** 60-70% of creditors respond on time

**Pro Tips:**
- Use bulk import feature for creditors (CSV upload)
- Enable email notifications for all status changes
- Check dashboard weekly
- Focus follow-up on creditors with lowest grades

---

### Workflow 3: Debt Reduction via Settlement

**Use Case:** You have outstanding debts and want to leverage GDPR violations to reduce them.

**Steps:**
1. Create account → Add creditors with debt amounts
2. Send GDPR requests to all creditors with debts
3. Wait for violations (typically 30-40% of creditors violate)
4. Generate settlement proposals for violators
5. Negotiate with creditors via creditor portal
6. Pay settlements via Vipps/Stripe
7. Escalate rejections to Datatilsynet

**Time Investment:** 1 hour setup, 1-2 hours negotiation

**Success Rate:** 40-50% of settlements accepted

**Average Savings:** 20-35% debt reduction

**Example:**
- You have 20,000 NOK in debts across 4 creditors
- 2 creditors violate GDPR (50% rate)
- Violations give you 25% leverage on average
- You negotiate settlements: 7,500 NOK total (was 10,000 NOK)
- Total savings: 2,500 NOK

---

### Workflow 4: Public Accountability Campaign

**Use Case:** You want to expose systematic GDPR violations by creditors to help other users.

**Steps:**
1. Create account → Add known bad-actor creditors
2. Send GDPR requests to all of them
3. Document violations (DAMOCLES does this automatically)
4. SWORD tokens are minted (blockchain evidence)
5. Violations appear in public transparency reports
6. Other users see creditor grades and violation history
7. Escalate all violations to Datatilsynet

**Time Investment:** 2 hours setup, then automated

**Impact:** Help others avoid predatory creditors

**Public Transparency:**
- Creditor grades are public
- Violation counts are public (but not individual case details)
- SWORD tokens on blockchain are public
- Datatilsynet rulings are public record

---

### Workflow 5: Continuous Monitoring

**Use Case:** You want ongoing monitoring of creditors to catch new violations as they happen.

**Steps:**
1. Create account → Add all creditors you interact with
2. Enable automatic periodic GDPR requests (every 6 months)
3. Receive notifications when violations occur
4. DAMOCLES escalates violations automatically
5. Review dashboard quarterly

**Time Investment:** 30 minutes setup, then fully automated

**Use Cases:**
- Credit monitoring (who has your data?)
- Verify data deletion after settlement
- Track creditor compliance improvements
- Detect unauthorized data sharing

---

## Best Practices

### For GDPR Requests

1. **Be Specific**
   - Don't just send generic Article 15 requests
   - Ask specific questions:
     - "What is the origin of this debt?"
     - "Have you shared my data with third parties? If so, who?"
     - "What legal basis do you have for processing my data?"
   - Specific questions are harder to dodge

2. **Keep Your Profile Updated**
   - Ensure your legal name, address, and contact info are current
   - Creditors may reject requests if your identity can't be verified
   - Update your profile before sending requests

3. **Document Everything**
   - DAMOCLES automatically saves all communications
   - Download evidence packages before escalations
   - Keep copies of creditor responses

4. **Use Multiple Rights**
   - Don't just request access (Article 15)
   - Also request:
     - Rectification if data is incorrect (Article 16)
     - Erasure if debt is satisfied (Article 17)
     - Restriction if you dispute the debt (Article 18)
     - Object to automated decision-making (Article 22)

5. **Be Patient**
   - Creditors have 30 days to respond
   - Don't panic if you don't hear back immediately
   - DAMOCLES monitors deadlines for you

### For Settlement Negotiations

1. **Follow Leverage Calculations**
   - DAMOCLES calculates fair settlement amounts based on:
     - Violation severity
     - Debt age
     - Your payment history
   - Don't demand unrealistic reductions (>50%)
   - Creditors reject unreasonable proposals

2. **Respond Promptly**
   - When creditor makes counter-offer, respond within 48 hours
   - Delays signal lack of seriousness
   - Fast negotiation = higher success rate

3. **Be Willing to Compromise**
   - If creditor offers 15% reduction and you wanted 25%, consider accepting
   - Something is better than nothing
   - Escalation to Datatilsynet takes months

4. **Pay Immediately After Agreement**
   - Once settlement is finalized, pay within deadline
   - Late payment voids the agreement
   - Set reminders for payment deadline

5. **Get Everything in Writing**
   - DAMOCLES ensures all negotiations happen via creditor portal
   - Download settlement agreement PDF
   - Keep proof of payment
   - Verify debt is marked as settled in creditor's system

### For Escalations

1. **Ensure Evidence is Complete**
   - Before escalating, verify:
     - Original request was sent successfully
     - Deadline has actually passed
     - Creditor has not responded (check spam folder)
   - Weak evidence = weak case

2. **Provide Context**
   - Add notes to your escalation:
     - History with creditor
     - Previous attempts to contact them
     - Impact of violation on you
   - Human context helps Datatilsynet prioritize

3. **Be Accurate**
   - Don't exaggerate violation severity
   - Stick to facts
   - Let evidence speak for itself
   - False claims weaken your credibility

4. **Follow Up**
   - Datatilsynet investigations take months
   - Check dashboard for updates
   - Respond promptly if Datatilsynet requests more info
   - Be patient - bureaucracy is slow

5. **Use Escalation as Leverage**
   - After filing Datatilsynet complaint, creditor may suddenly want to negotiate
   - Be open to settlement even after escalation
   - You can withdraw complaint if settlement is reached

### For Privacy & Security

1. **Use Strong Passwords**
   - Your DAMOCLES account contains sensitive data
   - Use unique password (not reused from other sites)
   - Enable two-factor authentication (2FA)

2. **Verify Creditor Emails**
   - If creditor contacts you directly (outside DAMOCLES), be cautious
   - Phishing scams target debt collectors
   - Always verify sender email address
   - Use DAMOCLES creditor portal for all negotiations

3. **Don't Share Your Account**
   - GDPR requests are legally tied to your identity
   - Sharing your account compromises legal standing
   - If you need help, ask someone to guide you (don't give them your password)

4. **Review Creditor Responses Carefully**
   - Creditors sometimes provide incomplete data intentionally
   - Check if response includes all required info:
     - Categories of data processed
     - Purposes of processing
     - Recipients of data
     - Data retention periods
   - If incomplete, mark as "Incomplete Response" violation

5. **Backup Your Data**
   - Download evidence packages regularly
   - Keep copies of important documents:
     - GDPR requests sent
     - Creditor responses
     - Settlement agreements
     - SWORD token proofs
   - Cloud backup recommended (encrypted)

---

## Understanding Your Dashboard

### Dashboard Sections

#### 1. Overview Panel (Top)
- **Active Requests:** Total number of pending GDPR requests
- **Violations Detected:** Count of GDPR violations found
- **Settlements Active:** Number of ongoing negotiations
- **Escalations:** Cases escalated to Datatilsynet

#### 2. Active Requests (Main Section)
- List of all pending GDPR requests
- Status indicators:
  - Green: On track (deadline >7 days away)
  - Yellow: Approaching deadline (within 7 days)
  - Red: Overdue (deadline passed)
- Quick actions:
  - View details
  - Send reminder to creditor
  - Escalate early (if justified)

#### 3. Creditor Compliance (Right Sidebar)
- List of all creditors you've interacted with
- Grades displayed (A-F)
- Sort by:
  - Grade (worst first)
  - Violation count
  - Last interaction date
  - Debt amount

#### 4. Recent Activity (Bottom)
- Timeline of recent events:
  - Requests sent
  - Responses received
  - Violations detected
  - Settlements proposed
  - Escalations filed
  - SWORD tokens minted

#### 5. Notifications (Top Right Bell Icon)
- Real-time alerts:
  - Deadlines approaching
  - Creditor responses
  - Violations detected
  - Settlement offers
  - Datatilsynet updates
- Click to mark as read
- Configure notification preferences (email, push, SMS)

### Status Icons Explained

- **✓ (Green Checkmark)** - Completed successfully
- **⚠ (Yellow Warning)** - Action needed soon
- **✗ (Red X)** - Violation detected or deadline missed
- **⟳ (Blue Refresh)** - In progress
- **⏸ (Gray Pause)** - Awaiting response
- **🔔 (Bell)** - Notification pending

### Metrics You Should Track

1. **Response Rate**
   - % of creditors who respond within deadline
   - Your response rate: Displayed in profile
   - Platform average: ~75%
   - Goal: 100% (though unrealistic with bad actors)

2. **Average Compliance Time**
   - Average days for creditors to respond
   - Your average: Displayed in profile
   - Platform average: ~18 days
   - Goal: Under 20 days

3. **Violation Count**
   - Total GDPR violations detected across all creditors
   - Higher count = more leverage for settlements
   - But also indicates you're dealing with bad creditors

4. **Settlement Success Rate**
   - % of settlement proposals accepted
   - Platform average: ~45%
   - Goal: >50%

5. **Total Debt Reduced**
   - Total NOK saved via settlements
   - Displayed in profile achievements
   - Example: "Saved 15,000 NOK via GDPR settlements"

---

## Troubleshooting

### Problem: Creditor claims they never received my GDPR request

**Solution:**
1. Go to request details in dashboard
2. Click "View Proof of Sending"
3. Download email receipt with timestamp
4. Check "Sent To" email address is correct
5. Resend request if email address was wrong
6. If email address was correct, creditor is lying:
   - Mark as "Refusal" violation
   - Escalate to Datatilsynet
   - Include proof of sending in complaint

**Prevention:**
- Verify creditor email address before sending
- Use creditor's official contact email (from their website)
- DAMOCLES sends via certified email (delivery confirmation)

---

### Problem: Creditor responded but the response is incomplete

**Solution:**
1. Review response against GDPR Article 15 requirements:
   - Confirmation of processing (yes/no)
   - Categories of data processed
   - Purposes of processing
   - Recipients (who they shared data with)
   - Data retention periods
   - Right to lodge complaint
   - Copy of your personal data
2. Identify what's missing
3. Click "Mark as Incomplete Response"
4. DAMOCLES generates follow-up request:
   - Cites original request
   - Lists missing information
   - Sets new 30-day deadline
5. Send follow-up
6. If creditor still doesn't comply, escalate

**Common Missing Items:**
- Recipients of data (creditors hide third-party sharing)
- Legal basis for processing (creditors can't justify it)
- Data retention periods (creditors keep data forever)

---

### Problem: Creditor is asking for additional identification

**Reasonable Requests:**
- Copy of national ID (fødselsnummer verification)
- Confirmation of address
- Signature on written request

**Unreasonable Requests:**
- Payment for providing data (illegal under GDPR)
- Original signed paper request delivered in person
- Excessive documentation (e.g., birth certificate, passport, utility bills)

**Solution:**
- If request is reasonable, provide it:
  - Upload documents via creditor portal
  - Mark as "Identity Verification Provided"
- If request is unreasonable:
  - Mark as "Excessive Identification Requirements" violation
  - DAMOCLES generates response citing GDPR Article 12 (free of charge)
  - Escalate if creditor refuses to proceed

---

### Problem: I paid a settlement but creditor says they didn't receive it

**Solution:**
1. Go to "Settlements" → Select settlement → "Proof of Payment"
2. Download payment receipt:
   - Vipps transaction ID
   - Stripe payment confirmation
   - Bank transfer reference
3. Contact creditor via creditor portal:
   - Attach proof of payment
   - Request confirmation of receipt
4. If creditor still claims non-payment:
   - Escalate to DAMOCLES support
   - We verify payment in our system
   - Contact creditor directly
   - If creditor is acting in bad faith, escalate to Datatilsynet

**Prevention:**
- Always pay via DAMOCLES payment methods (Vipps, Stripe, bank transfer)
- Never pay creditor directly outside the platform
- Download proof of payment immediately after paying

---

### Problem: My escalation to Datatilsynet was rejected

**Possible Reasons:**
1. Creditor actually did respond (check spam folder)
2. Creditor provided partial response that Datatilsynet considers adequate
3. Your evidence was incomplete
4. Datatilsynet determined violation is minor

**Solution:**
- Review Datatilsynet's rejection letter (available in dashboard)
- Understand their reasoning
- If you disagree:
  - File appeal within 30 days
  - Provide additional evidence
  - Cite GDPR articles more specifically
- If rejection is justified:
  - Accept outcome
  - Focus on other creditors
  - Learn from the experience

**Prevention:**
- Ensure evidence is complete before escalating
- Don't escalate minor violations (low severity)
- Focus on clear-cut cases (e.g., no response after 30 days)

---

### Problem: Creditor is harassing me after I filed a complaint

**Unacceptable Behavior:**
- Threatening legal action for exercising GDPR rights
- Increased collection efforts after GDPR request
- Sharing your information publicly
- Contacting you excessively (multiple calls/emails per day)

**Solution:**
1. Document all harassment:
   - Save emails, record call times
   - Screenshot threatening messages
2. Add evidence to your DAMOCLES case:
   - Upload harassment evidence
   - Mark as "Retaliation" violation
3. DAMOCLES automatically adds this to Datatilsynet complaint:
   - Retaliation is GDPR Article 21 violation
   - Additional grounds for fine
4. Consider contacting Norwegian Consumer Council (Forbrukerrådet)
5. If harassment is severe, consider police report

**Your Rights:**
- Exercising GDPR rights cannot be held against you
- Creditors cannot increase debt or interest as retaliation
- You have right to lodge complaint without fear of retaliation

---

### Problem: I can't find a creditor's organization number

**Solution:**
1. Search on [Brønnøysundregistrene](https://www.brreg.no/):
   - Enter creditor name
   - Filter to "Enhetsregisteret" (company registry)
   - Find 9-digit organization number
2. If creditor is not in Norwegian registry:
   - They may be foreign creditor
   - Search in their home country registry
   - Enter foreign company ID in DAMOCLES (mark as "Foreign")
3. If you still can't find it:
   - Check collection notices (org number often printed)
   - Contact creditor directly and ask
   - Use DAMOCLES "Can't Find Creditor" support

**Why Organization Number Matters:**
- Required for legal correspondence
- Validates creditor identity
- Used in Datatilsynet complaints
- Appears in SWORD token metadata

---

### Problem: DAMOCLES says I have no active requests but I'm sure I sent one

**Possible Causes:**
1. Request failed to send (check "Failed Requests" tab)
2. Request is marked as "Completed" (creditor responded quickly)
3. Browser session expired before request sent
4. Account sync issue

**Solution:**
1. Check "All Requests" tab (not just "Active")
2. Sort by date (most recent first)
3. Look for request in "Failed" or "Completed" sections
4. If truly missing:
   - Check email for confirmation (sent when request goes out)
   - If no email, request didn't send
   - Resend the request
5. If problem persists:
   - Contact DAMOCLES support
   - Provide creditor name and date you attempted to send
   - We'll investigate logs

---

### Problem: I changed my mind and want to withdraw an escalation

**Scenarios:**

**Before Datatilsynet Files Complaint (Within 48 hours):**
- Go to escalation details
- Click "Withdraw Escalation"
- Provide reason (optional)
- Escalation is canceled

**After Datatilsynet Has Started Investigation:**
- Contact Datatilsynet directly:
  - Email: postkasse@datatilsynet.no
  - Reference your case number
  - Request withdrawal
- Datatilsynet may continue investigation anyway if:
  - Violation is severe
  - Public interest in enforcement
  - Creditor has history of violations

**Why You Might Withdraw:**
- Creditor responded after escalation filed
- Reached settlement agreement with creditor
- Decided not to pursue the complaint

**Consequences of Withdrawal:**
- Datatilsynet investigation stops
- Creditor may not face fine
- But: Violation is still documented in DAMOCLES
- SWORD token remains on blockchain (immutable)
- Creditor's grade is not improved by withdrawal

---

## FAQ

### General Questions

**Q: Is DAMOCLES free to use?**
A: Yes, creating GDPR requests and tracking compliance is completely free. We charge a small fee (5% of savings) only if you successfully negotiate a settlement and reduce your debt. If you don't save money, you don't pay.

**Q: Is DAMOCLES legal?**
A: Yes, 100% legal. GDPR Article 15 gives you the right to request your personal data. Escalating violations to Datatilsynet is your legal right under GDPR Article 77. Settlement negotiations are standard debt resolution practice.

**Q: Will using DAMOCLES hurt my credit score?**
A: No. Exercising your GDPR rights is legally protected and cannot negatively affect your credit score. Creditors are prohibited from retaliating against data subjects who exercise their rights.

**Q: Can I use DAMOCLES if I don't have a debt?**
A: Yes! GDPR rights apply to anyone whose data is being processed. You can use DAMOCLES to:
- Audit who has your personal data
- Request deletion of old data
- Verify data accuracy
- Hold organizations accountable for compliance

**Q: Does DAMOCLES work outside Norway?**
A: DAMOCLES is optimized for Norwegian creditors and Datatilsynet (Norwegian DPA). However, GDPR applies across all EU/EEA countries. If you have creditors in other EU countries, DAMOCLES can generate requests, but escalations would go to that country's data protection authority.

**Q: What if a creditor sues me for using DAMOCLES?**
A: This is extremely unlikely. Exercising GDPR rights is legally protected. If a creditor threatens legal action for using DAMOCLES:
1. Document the threat
2. Mark as "Retaliation" violation in DAMOCLES
3. Escalate to Datatilsynet (retaliation is a serious GDPR violation)
4. Consider contacting Norwegian Consumer Council (Forbrukerrådet)

### GDPR Request Questions

**Q: How long do creditors have to respond to my GDPR request?**
A: 30 days from receipt of your request (GDPR Article 12). Creditors can extend by 60 days if requests are complex, but they must notify you within the first 30 days.

**Q: Can a creditor charge me for providing my data?**
A: No. GDPR Article 12 states that data must be provided free of charge. Creditors can only charge if:
- Your request is "manifestly unfounded or excessive"
- You're requesting multiple copies of the same data
Even then, charges must be reasonable (administrative costs only).

**Q: What if the creditor says they don't have any data about me?**
A: If you've had any interaction with the creditor (debt, payment, communication), they definitely have data. Possible scenarios:
- Creditor is lying (mark as "Refusal" violation)
- Creditor deleted your data (possibly illegally if debt is active)
- Creditor processed data under a different name/ID (clarify your identity)

**Q: Can I request data on behalf of someone else (family member)?**
A: Only with explicit written authorization. GDPR requests require:
- You are the data subject, OR
- You have power of attorney, OR
- You are legal guardian of a minor
Don't submit requests for others without proper authorization (illegal).

**Q: How often can I send GDPR requests to the same creditor?**
A: No legal limit, but:
- Requesting same data repeatedly within short time = "excessive"
- Creditors can refuse or charge for excessive requests
- Reasonable frequency: Every 6-12 months
- DAMOCLES prevents excessive requests (30-day cooldown)

### Settlement Questions

**Q: How much can I realistically reduce my debt using GDPR violations?**
A: Typical reductions:
- Low severity violation: 5-10% reduction
- Medium severity violation: 15-25% reduction
- High severity violation: 25-40% reduction
- Critical violation: 40-60% reduction

Factors that affect leverage:
- Multiple violations = stronger leverage
- Older debts = more reduction
- Datatilsynet ruling in your favor = maximum leverage

**Q: Can I combine GDPR settlements with other debt relief programs?**
A: Yes. GDPR settlements are separate from:
- Gjeldsordning (Norwegian debt settlement)
- Debt consolidation
- Payment plans
Consult a financial advisor for optimal debt strategy.

**Q: What if I can't afford to pay the settlement amount?**
A: Options:
1. Negotiate payment plan (e.g., 3 monthly installments)
2. Request lower settlement amount (but within leverage range)
3. Decline settlement and let Datatilsynet investigation proceed
4. Explore debt relief programs (gjeldsordning)

**Q: Does the creditor have to accept my settlement proposal?**
A: No. Settlements are voluntary negotiations. Creditors can:
- Accept your proposal
- Make counter-offer
- Reject entirely
If rejected, you can escalate to Datatilsynet, but this doesn't force a settlement.

**Q: What happens to the GDPR violation if I settle?**
A: The violation remains documented:
- SWORD token stays on blockchain (immutable)
- Violation counts toward creditor's grade
- But: Datatilsynet complaint may be withdrawn (if you choose)
Settlement doesn't erase the violation, but it resolves the debt.

### Escalation Questions

**Q: Will Datatilsynet really investigate my complaint?**
A: Yes, Datatilsynet investigates all complaints, but:
- Clear-cut cases (no response after 30 days) = high priority
- Complex cases (interpretation of law) = may take longer
- Resource constraints mean some cases take 6-12 months
Datatilsynet publishes annual reports showing enforcement statistics.

**Q: How much will the creditor be fined?**
A: GDPR fines vary widely:
- Tier 1 violations: Up to 10M EUR or 2% of annual turnover (whichever is higher)
- Tier 2 violations: Up to 20M EUR or 4% of annual turnover
Norwegian enforcement tends to be 0.5-1.5% of maximum:
- Small creditor: 50,000 - 200,000 NOK
- Medium creditor: 200,000 - 500,000 NOK
- Large creditor: 500,000 - 2,000,000 NOK

**Q: Do I get any of the fine money?**
A: No. GDPR fines go to the Norwegian government (Datatilsynet enforcement fund). However:
- Fine increases creditor's willingness to settle with you
- You can use Datatilsynet ruling as leverage for settlement
- You may be entitled to compensation separately (civil lawsuit)

**Q: Can I escalate directly to Datatilsynet without using DAMOCLES?**
A: Yes. You can file complaints directly via Datatilsynet's website (datatilsynet.no). However, DAMOCLES provides:
- Auto-generated complaints with legal analysis
- Evidence packaging (SWORD tokens, timelines)
- Tracking of investigation status
- Integration with settlement negotiations

**Q: What if Datatilsynet finds no violation?**
A: Possible outcomes:
- Datatilsynet rejects complaint (rare if evidence is strong)
- Datatilsynet issues warning instead of fine
- Datatilsynet determines violation is minor
If this happens:
- Review Datatilsynet's reasoning
- File appeal if you disagree (30-day window)
- Focus on other creditors with clearer violations

### SWORD Token Questions

**Q: What is a SWORD token?**
A: SWORD (Systematic Whistleblower-Organized Record of Damage) tokens are NFTs minted on Cardano blockchain that contain immutable evidence of GDPR violations. They serve as tamper-proof legal evidence.

**Q: Do I need to understand blockchain to use SWORD tokens?**
A: No. DAMOCLES handles all blockchain operations automatically. You just need to know:
- SWORD tokens are permanent proof of violations
- They can be viewed on Cardano explorer (public blockchain)
- They contain SHA-256 hash of violation evidence
- They can be used in legal proceedings

**Q: Can creditors delete or alter SWORD tokens?**
A: No. Blockchain is immutable. Once a SWORD token is minted:
- It exists forever on Cardano blockchain
- Metadata cannot be changed
- Creditor cannot remove it
- Anyone can verify its authenticity

**Q: Who can see my SWORD tokens?**
A: SWORD tokens are public on blockchain, but:
- Your personal information is not in the token (only creditor name, violation type, evidence hash)
- Your identity is protected (tokens don't reveal who filed the complaint)
- Anyone can see creditor violations (public accountability)
- Detailed evidence is only in DAMOCLES (private)

**Q: Do SWORD tokens cost money to mint?**
A: No cost to you. DAMOCLES covers blockchain transaction fees (typically 0.5-1 ADA, ~$0.20-0.40 USD). This is part of our platform service.

**Q: Can I sell my SWORD tokens?**
A: Technically yes (they're NFTs), but there's no market for them. SWORD tokens are legal evidence, not collectibles. Their value is in legal proceedings, not trading.

### Privacy & Security Questions

**Q: Is my personal data safe on DAMOCLES?**
A: Yes. Security measures:
- End-to-end encryption for sensitive data
- GDPR-compliant data storage (Norway/EU servers)
- Two-factor authentication (2FA) available
- Regular security audits
- No data sharing with third parties
- You can delete your account anytime (GDPR Article 17)

**Q: Who can see my GDPR requests?**
A: Only:
- You (account holder)
- Creditor you sent the request to
- Datatilsynet (if escalated)
- DAMOCLES support (for troubleshooting, encrypted)
Your requests are not public. Other users cannot see your data.

**Q: Can creditors see my other GDPR requests to different creditors?**
A: No. Creditors only see:
- Requests you sent to them
- Their own compliance grade (public)
- Number of complaints filed against them (public count, not details)

**Q: What happens to my data if I delete my DAMOCLES account?**
A: You can delete your account anytime:
- All personal data is erased from DAMOCLES servers
- GDPR requests are anonymized (legal archive requirement)
- SWORD tokens remain on blockchain (immutable, but don't contain your identity)
- You can export all your data before deletion (GDPR Article 20)

**Q: Does DAMOCLES share data with debt collectors?**
A: No. We never share your data with debt collectors. Creditors only receive data you explicitly include in GDPR requests (name, address, national ID for verification).

### Payment & Settlement Questions

**Q: How do I pay a settlement?**
A: Payment methods:
1. **Vipps** (recommended for Norwegian users):
   - Instant payment
   - Confirmation within seconds
   - No fees
2. **Stripe** (credit/debit card):
   - International payments
   - Small processing fee (2.9% + 2 NOK)
   - Instant confirmation
3. **Bank Transfer**:
   - Traditional bank transfer
   - No fees
   - 1-2 business days processing
   - Provide reference number

**Q: What if I pay late?**
A: Settlement agreements have payment deadlines (typically 14 days):
- Pay on time = debt is forgiven
- Pay late = creditor may void agreement
- If voided, original debt is reinstated
Set reminders for payment deadline!

**Q: Can I get a refund if I change my mind after paying?**
A: Generally no. Settlement agreements are binding contracts:
- Once paid, debt is satisfied
- Creditor has no obligation to refund
- Exception: If creditor breached settlement terms (e.g., didn't forgive debt)

**Q: Does DAMOCLES take a fee from settlements?**
A: Yes, we charge 5% of the amount saved:
- Example: You reduce 10,000 NOK debt to 7,500 NOK (save 2,500 NOK)
- DAMOCLES fee: 5% × 2,500 NOK = 125 NOK
- You pay creditor: 7,500 NOK
- Total cost: 7,625 NOK (still saving 2,375 NOK!)
If settlement is rejected and you don't save money, you don't pay any fee.

### Technical Questions

**Q: What browsers are supported?**
A: DAMOCLES works on:
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Android Chrome)
- Minimum: Browsers supporting ES6 JavaScript

**Q: Can I use DAMOCLES on my phone?**
A: Yes, DAMOCLES is fully mobile-responsive:
- All features available on mobile
- Push notifications for iOS/Android
- Mobile apps coming soon (2025)

**Q: Does DAMOCLES have an API?**
A: Yes, DAMOCLES has a public API for:
- Creditor grade lookups
- Violation statistics
- Transparency reports
API documentation: `docs/API_DOCUMENTATION.md`

**Q: Can I export my data?**
A: Yes. Data export formats:
- JSON (all data, machine-readable)
- PDF (human-readable reports)
- CSV (creditors, requests, settlements)
Go to Settings → Data Export → Download

**Q: Is DAMOCLES open source?**
A: Core GDPR engine is open source (GitHub: damocles-platform). Web app and proprietary algorithms (settlement negotiation, grade calculations) are closed source.

---

## Getting Help

### Support Channels

1. **Help Center**
   - URL: https://damocles.no/help
   - Searchable knowledge base
   - Video tutorials
   - Common issues resolved

2. **Email Support**
   - Email: support@damocles.no
   - Response time: Within 24 hours
   - For account issues, technical problems, general questions

3. **Legal Questions**
   - Email: legal@damocles.no
   - For GDPR legal interpretation
   - Escalation advice
   - Complex cases

4. **Community Forum**
   - URL: https://forum.damocles.no
   - User discussions
   - Share experiences
   - Tips and best practices
   - Moderated by DAMOCLES team

5. **Emergency Contact**
   - For urgent issues (account compromise, harassment):
   - Email: urgent@damocles.no
   - Response time: Within 2 hours

### External Resources

1. **Datatilsynet (Norwegian DPA)**
   - Website: https://www.datatilsynet.no
   - Phone: +47 22 39 69 00
   - Email: postkasse@datatilsynet.no
   - Guide to GDPR rights (in Norwegian)

2. **Norwegian Consumer Council (Forbrukerrådet)**
   - Website: https://www.forbrukerradet.no
   - Phone: +47 23 40 05 00
   - Free debt advice

3. **GDPR Resources**
   - Official GDPR text: https://gdpr-info.eu/
   - EU GDPR portal: https://ec.europa.eu/info/law/law-topic/data-protection_en
   - GDPR explained (plain language): https://gdpr.eu/

4. **Legal Aid**
   - Norwegian Legal Aid (Fri rettshjelp): https://www.jussbuss.no
   - For low-income individuals
   - Free legal advice

### Reporting Bugs

Found a bug in DAMOCLES? Report it:
1. Go to Settings → Report Issue
2. Describe the problem:
   - What you expected to happen
   - What actually happened
   - Steps to reproduce
   - Screenshots (if applicable)
3. Include your browser/device info (auto-filled)
4. Submit report

We fix critical bugs within 48 hours, non-critical bugs in weekly releases.

### Feature Requests

Want a new feature? Let us know:
1. Go to Settings → Feature Request
2. Describe the feature:
   - What problem it solves
   - How it would work
   - Why it's useful
3. Vote on existing feature requests (upvote what you want)
4. We review requests monthly and add top-voted features to roadmap

---

## Next Steps

Congratulations on completing the DAMOCLES onboarding guide!

**Ready to get started?**

1. **Create Your Account** → [Sign Up](https://damocles.no/signup)
2. **Add Your First Creditor** → Go to "My Creditors"
3. **Send Your First GDPR Request** → Click "Send Request"
4. **Join the Community** → [DAMOCLES Forum](https://forum.damocles.no)

**Stay Updated:**
- Follow us on Twitter: [@DamoclesPlatform](https://twitter.com/damoclesplatform)
- Newsletter: Sign up in Settings → Notifications
- Blog: [https://blog.damocles.no](https://blog.damocles.no)

**Need help?** Contact support@damocles.no

---

*DAMOCLES - Empowering data subjects to hold creditors accountable.*

*Version 1.0 - Last updated: November 4, 2025*
