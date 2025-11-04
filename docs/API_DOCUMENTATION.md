# DAMOCLES API Documentation 🔧

> **Version:** 2.0.0 | **Status:** Production Ready | **Updated:** January 2025

## 🎯 **Overview**

DAMOCLES provides REST APIs for debt management, GDPR automation, and user authentication. All APIs use JSON for request/response and require authentication via JWT tokens.

**Base URLs:**
- **User Service:** `http://localhost:3001` (dev) | `https://api.damocles.no` (prod)
- **Payment Service:** `http://localhost:8009` (dev) | `https://payment.damocles.no` (prod)
- **GDPR Engine:** `http://localhost:8001` (dev) | `https://gdpr.damocles.no` (prod)
- **Trust Engine:** `http://localhost:8002` (dev) | `https://trust.damocles.no` (prod)

## 🔐 **Authentication**

### JWT Token Authentication
All protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Token Structure
```javascript
{
  "userId": "cuid_string",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1640995200,
  "exp": 1641081600
}
```

---

## 👤 **User Service API** (`/api`)

### 🔑 **Authentication Endpoints**

#### `POST /auth/register`
Register a new user with BankID verification.

**Request:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "+4712345678",
  "personalNumber": "12345678901",
  "bankIdToken": "dev_token_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "cm123456789",
    "email": "user@example.com",
    "phoneNumber": "+4712345678",
    "bankIdVerified": true,
    "swordBalance": 0,
    "createdAt": "2024-12-13T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Invalid input data
- `409` - User already exists

#### `POST /auth/login`
Authenticate existing user with BankID.

**Request:**
```json
{
  "email": "user@example.com",
  "bankIdToken": "dev_token_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "cm123456789",
    "email": "user@example.com",
    "swordBalance": 1500,
    "lastLogin": "2024-12-13T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials
- `404` - User not found

### 👤 **User Management**

#### `GET /users/profile`
Get current user profile information.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "cm123456789",
    "email": "user@example.com",
    "phoneNumber": "+4712345678",
    "bankIdVerified": true,
    "swordBalance": 1500,
    "createdAt": "2024-12-13T10:00:00Z",
    "stats": {
      "totalDebts": 3,
      "activeDebts": 2,
      "resolvedDebts": 1,
      "totalGdprRequests": 5,
      "totalViolations": 8
    }
  }
}
```

#### `PUT /users/profile`
Update user profile information.

**Request:**
```json
{
  "phoneNumber": "+4712345679",
  "notificationPreferences": {
    "email": true,
    "sms": false,
    "push": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "cm123456789",
    "phoneNumber": "+4712345679",
    "updatedAt": "2024-12-13T10:30:00Z"
  }
}
```

### 💳 **Debt Management**

#### `GET /debts`
List all debts for the authenticated user.

**Query Parameters:**
- `status` - Filter by status: `ACTIVE`, `RESOLVED`, `DISPUTED`
- `creditorId` - Filter by specific creditor
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "debts": [
    {
      "id": "debt_123456789",
      "originalAmount": 5000,
      "currentAmount": 4500,
      "interestRate": 15.5,
      "dueDate": "2024-12-31T00:00:00Z",
      "status": "ACTIVE",
      "createdAt": "2024-11-01T10:00:00Z",
      "creditor": {
        "id": "creditor_123",
        "name": "Example Debt Collector AS",
        "type": "INKASSO",
        "violationScore": 45
      },
      "documents": [
        "uploads/debt_letter_001.pdf"
      ],
      "gdprRequestCount": 2
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

#### `POST /debts`
Create a new debt record.

**Request:**
```json
{
  "creditorId": "creditor_123",
  "originalAmount": 5000,
  "currentAmount": 5000,
  "interestRate": 15.5,
  "dueDate": "2024-12-31T00:00:00Z",
  "description": "Outstanding invoice for services",
  "documents": ["uploads/debt_letter_001.pdf"]
}
```

**Response:**
```json
{
  "success": true,
  "debt": {
    "id": "debt_123456789",
    "originalAmount": 5000,
    "currentAmount": 5000,
    "interestRate": 15.5,
    "dueDate": "2024-12-31T00:00:00Z",
    "status": "ACTIVE",
    "createdAt": "2024-12-13T10:00:00Z",
    "creditor": {
      "id": "creditor_123",
      "name": "Example Debt Collector AS",
      "violationScore": 45
    }
  }
}
```

#### `GET /debts/:id`
Get detailed information about a specific debt.

**Response:**
```json
{
  "success": true,
  "debt": {
    "id": "debt_123456789",
    "originalAmount": 5000,
    "currentAmount": 4500,
    "interestRate": 15.5,
    "dueDate": "2024-12-31T00:00:00Z",
    "status": "ACTIVE",
    "description": "Outstanding invoice for services",
    "createdAt": "2024-11-01T10:00:00Z",
    "updatedAt": "2024-12-01T15:30:00Z",
    "creditor": {
      "id": "creditor_123",
      "name": "Example Debt Collector AS",
      "organizationId": "987654321",
      "email": "contact@example-collector.no",
      "phone": "+4723456789",
      "address": "Collector Street 123, 0123 Oslo",
      "type": "INKASSO",
      "violationScore": 45,
      "lastViolationUpdate": "2024-12-01T10:00:00Z"
    },
    "documents": [
      "uploads/debt_letter_001.pdf",
      "uploads/payment_demand_002.pdf"
    ],
    "gdprRequests": [
      {
        "id": "gdpr_123",
        "referenceId": "GDPR-2024-001",
        "status": "SENT",
        "sentAt": "2024-11-15T10:00:00Z",
        "responseDue": "2024-12-15T10:00:00Z"
      }
    ],
    "timeline": [
      {
        "date": "2024-11-01T10:00:00Z",
        "event": "DEBT_CREATED",
        "description": "Debt record created"
      },
      {
        "date": "2024-11-15T10:00:00Z",
        "event": "GDPR_SENT",
        "description": "GDPR request sent to creditor"
      }
    ]
  }
}
```

#### `PUT /debts/:id`
Update debt information.

**Request:**
```json
{
  "currentAmount": 4000,
  "status": "DISPUTED",
  "notes": "Disputed excessive interest charges"
}
```

#### `DELETE /debts/:id`
Delete a debt record (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "Debt record deleted successfully"
}
```

### 🏢 **Creditor Management**

#### `GET /creditors`
List all creditors in the system.

**Query Parameters:**
- `search` - Search by name or organization ID
- `type` - Filter by creditor type: `BANK`, `BNPL`, `INKASSO`, `OTHER`
- `violationScore` - Filter by violation score range

**Response:**
```json
{
  "success": true,
  "creditors": [
    {
      "id": "creditor_123",
      "name": "Example Debt Collector AS",
      "organizationId": "987654321",
      "type": "INKASSO",
      "violationScore": 45,
      "email": "contact@example-collector.no",
      "phone": "+4723456789",
      "debtCount": 156,
      "avgViolationRate": 0.35
    }
  ]
}
```

#### `GET /creditors/search`
Search for creditors by name or organization ID.

**Query Parameters:**
- `q` - Search query
- `limit` - Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "creditor_123",
      "name": "Example Debt Collector AS",
      "organizationId": "987654321",
      "type": "INKASSO",
      "violationScore": 45
    }
  ]
}
```

#### `GET /creditors/types`
Get list of available creditor types.

**Response:**
```json
{
  "success": true,
  "types": [
    {
      "value": "BANK",
      "label": "Bank",
      "description": "Traditional banking institutions"
    },
    {
      "value": "BNPL",
      "label": "Buy Now Pay Later",
      "description": "BNPL service providers"
    },
    {
      "value": "INKASSO",
      "label": "Debt Collection Agency",
      "description": "Professional debt collectors"
    },
    {
      "value": "OTHER",
      "label": "Other",
      "description": "Other types of creditors"
    }
  ]
}
```

---

## 🤖 **GDPR Engine API** (`/gdpr`)

### 📧 **GDPR Request Management**

#### `POST /gdpr/generate`
Generate a new GDPR request for a specific creditor.

**Request:**
```json
{
  "user_id": "cm123456789",
  "creditor_id": "creditor_123",
  "request_type": "article_15",
  "language": "no"
}
```

**Response:**
```json
{
  "success": true,
  "request": {
    "id": "gdpr_req_123456789",
    "reference_id": "GDPR-2024-001",
    "user_id": "cm123456789",
    "creditor_id": "creditor_123",
    "request_type": "article_15",
    "status": "pending",
    "content": "<html>Professional GDPR request content...</html>",
    "created_at": "2024-12-13T10:00:00Z"
  }
}
```

#### `POST /gdpr/send/:request_id`
Send a generated GDPR request via email.

**Response:**
```json
{
  "success": true,
  "email_status": {
    "status": "sent_dev",
    "message_id": "dev-gdpr_req_123456789",
    "timestamp": "2024-12-13T10:05:00Z",
    "tracking_id": "track_123456789"
  },
  "request": {
    "id": "gdpr_req_123456789",
    "status": "sent",
    "sent_at": "2024-12-13T10:05:00Z",
    "response_due": "2024-01-12T10:05:00Z"
  }
}
```

#### `GET /gdpr/requests/:user_id`
Get all GDPR requests for a specific user.

**Response:**
```json
{
  "success": true,
  "requests": [
    {
      "id": "gdpr_req_123456789",
      "reference_id": "GDPR-2024-001",
      "creditor_name": "Example Debt Collector AS",
      "request_type": "article_15",
      "status": "sent",
      "created_at": "2024-12-13T10:00:00Z",
      "sent_at": "2024-12-13T10:05:00Z",
      "response_due": "2024-01-12T10:05:00Z",
      "violation_count": 0
    }
  ]
}
```

#### `GET /gdpr/requests/:id/status`
Get real-time status of a GDPR request.

**Response:**
```json
{
  "success": true,
  "status": {
    "current": "sent",
    "sent_at": "2024-12-13T10:05:00Z",
    "response_due": "2024-01-12T10:05:00Z",
    "days_remaining": 30,
    "tracking": {
      "email_opened": false,
      "links_clicked": 0,
      "last_activity": null
    }
  }
}
```

### 🎯 **Violation Detection**

#### `GET /gdpr/violations/:creditor_id`
Get violation analysis for a specific creditor.

**Response:**
```json
{
  "success": true,
  "violations": {
    "creditor_id": "creditor_123",
    "creditor_name": "Example Debt Collector AS",
    "violation_score": 45,
    "total_requests": 25,
    "violation_categories": {
      "late_response": 8,
      "incomplete_data": 5,
      "no_response": 2,
      "excessive_fees": 12,
      "data_sharing": 3
    },
    "last_updated": "2024-12-13T08:00:00Z",
    "trend": "increasing"
  }
}
```

#### `POST /gdpr/report-violation`
Report a new GDPR violation.

**Request:**
```json
{
  "gdpr_request_id": "gdpr_req_123456789",
  "violation_type": "late_response",
  "description": "Response received 5 days after deadline",
  "evidence": ["screenshot_001.png", "email_response.pdf"]
}
```

### ⚔️ **SWORD Protocol**

#### `GET /gdpr/sword/status/:creditor_id`
Check if creditor qualifies for collective action.

**Response:**
```json
{
  "success": true,
  "sword_status": {
    "creditor_id": "creditor_123",
    "violation_threshold": 50,
    "current_violations": 45,
    "affected_users": 23,
    "estimated_impact": 150000,
    "ready_for_action": false,
    "progress": 0.9
  }
}
```

#### `POST /gdpr/sword/trigger`
Trigger SWORD protocol for collective action.

**Request:**
```json
{
  "creditor_id": "creditor_123",
  "user_ids": ["user1", "user2", "user3"],
  "violation_evidence": ["evidence1.pdf", "evidence2.pdf"]
}
```

**Response:**
```json
{
  "success": true,
  "sword_action": {
    "id": "sword_action_123",
    "creditor_id": "creditor_123",
    "participants": 23,
    "total_debt_amount": 450000,
    "estimated_reduction": 0.65,
    "status": "initiated",
    "created_at": "2024-12-13T10:00:00Z"
  }
}
```

---

## 🧠 **Trust Engine API** (`/trust`)

The Sacred Architecture Trust Engine provides mathematical trust analysis using the formula:
`TrustScore = Σ(Authority_Weight × Authority_Score × Cross_Vector_Confidence) - Σ(Contradiction_Penalty × Authority_Differential)`

### 🎯 **Core Trust Analysis**

#### `POST /trust/analyze`
Analyze claims for trustworthiness and contradictions.

**Request:**
```json
{
  "claims": [
    {
      "content": "No settlement is possible for this debt",
      "source": "inkassoselskap",
      "timestamp": "2024-12-13T10:00:00Z",
      "metadata": {
        "creditor_id": "creditor_123",
        "debt_amount": 5000
      }
    },
    {
      "content": "We are willing to negotiate a 40% reduction",
      "source": "inkassoselskap",
      "timestamp": "2024-12-13T11:00:00Z",
      "metadata": {
        "creditor_id": "creditor_123",
        "debt_amount": 5000
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "trustScore": {
      "finalScore": 42.5,
      "confidence": 0.89,
      "calculation": {
        "authorityWeights": [0.30, 0.30],
        "crossVectorConfidence": 0.65,
        "contradictionPenalty": 15.2,
        "authorityDifferential": 0.0
      },
      "breakdown": [
        {
          "claimId": 0,
          "individualScore": 30.0,
          "authorityWeight": 0.30,
          "sourceReliability": 0.75
        },
        {
          "claimId": 1,
          "individualScore": 30.0,
          "authorityWeight": 0.30,
          "sourceReliability": 0.75
        }
      ]
    },
    "contradictions": [
      {
        "detected": true,
        "type": "SETTLEMENT_LOGIC",
        "confidence": 0.89,
        "claims": [0, 1],
        "explanation": "Source claims no settlement is possible while simultaneously offering settlement terms",
        "recommendation": "Request clarification about settlement availability",
        "kindnessMessage": "We noticed conflicting information about settlement options. This might be worth clarifying."
      }
    ],
    "kindnessResponse": {
      "message": "We noticed conflicting information about settlement options that might be worth a gentle look.",
      "tone": "gentle",
      "options": [
        {
          "label": "Learn more about this",
          "action": "show_educational_content",
          "consequence": "You'll see gentle explanation and context",
          "recommended": true,
          "difficulty": "easy"
        }
      ],
      "dismissible": true,
      "urgency": "suggestion",
      "visualStyle": {
        "color": "#3B82F6",
        "icon": "💡",
        "animation": "gentle-pulse"
      }
    }
  }
}
```

#### `POST /trust/damocles-analyze`
Specialized analysis for DAMOCLES debt collection patterns.

**Request:**
```json
{
  "debtData": {
    "originalAmount": 5000,
    "currentAmount": 6500,
    "interestRate": 25.0,
    "creditorType": "INKASSO",
    "communicationHistory": [
      {
        "content": "Payment must be made immediately",
        "timestamp": "2024-12-13T10:00:00Z",
        "type": "demand"
      }
    ]
  },
  "gdprResponses": [
    {
      "content": "We do not store personal data",
      "timestamp": "2024-12-13T11:00:00Z",
      "responseTime": 45
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "damoclesAnalysis": {
    "overallRisk": "HIGH",
    "trustScore": 25.3,
    "violations": [
      {
        "type": "GDPR_VIOLATION",
        "severity": "high",
        "description": "Claiming no data storage while actively pursuing debt collection",
        "evidence": ["Response contradicts debt collection activity"],
        "recommendation": "File GDPR complaint with Datatilsynet"
      }
    ],
    "swordEligibility": {
      "qualifies": true,
      "confidence": 0.92,
      "reasoning": "High violation score with clear evidence patterns",
      "estimatedParticipants": 15,
      "potentialImpact": 75000
    },
    "recommendations": [
      {
        "priority": "high",
        "action": "Challenge data processing claims",
        "reasoning": "GDPR response contradicts debt collection evidence",
        "kindnessApproach": "We want to help you understand your rights regarding data processing."
      }
    ]
  }
}
```

### 🏛️ **Authority Analysis**

#### `GET /trust/authorities`
List Norwegian legal authorities with their weights.

**Response:**
```json
{
  "success": true,
  "authorities": [
    {
      "source": "høyesterett",
      "weight": 1.00,
      "category": "SUPREME_COURT",
      "description": "Supreme Court of Norway - highest judicial authority",
      "country": "norway"
    },
    {
      "source": "finanstilsynet",
      "weight": 0.95,
      "category": "REGULATORY_BODY",
      "description": "Financial Supervisory Authority - banking and finance regulation",
      "country": "norway"
    }
  ]
}
```

#### `POST /trust/authorities/compare`
Compare authority levels between sources.

**Request:**
```json
{
  "source1": "høyesterett",
  "source2": "inkassoselskap"
}
```

**Response:**
```json
{
  "success": true,
  "comparison": {
    "higher": "høyesterett",
    "lower": "inkassoselskap",
    "differential": 0.70,
    "explanation": "Supreme Court of Norway (1.00) supersedes Debt Collection Company (0.30)"
  }
}
```

### 🔍 **Contradiction Detection**

#### `GET /trust/contradictions/types`
Get available contradiction types and their descriptions.

**Response:**
```json
{
  "success": true,
  "types": [
    {
      "type": "SETTLEMENT_LOGIC",
      "description": "Conflicting statements about settlement availability",
      "severity": "medium",
      "patterns": ["settlement contradiction", "negotiation availability"]
    },
    {
      "type": "DATA_CONTRADICTION",
      "description": "Inconsistent information about the same facts",
      "severity": "high",
      "patterns": ["data inconsistency", "fact contradiction"]
    },
    {
      "type": "AUTHORITY_HIERARCHY",
      "description": "Lower authority contradicting higher authority",
      "severity": "high",
      "patterns": ["hierarchy violation", "authority conflict"]
    }
  ]
}
```

### 💝 **Kindness Algorithm**

#### `POST /trust/kindness/response`
Generate kind response to contradiction detection.

**Request:**
```json
{
  "contradiction": {
    "detected": true,
    "type": "SETTLEMENT_LOGIC",
    "confidence": 0.89,
    "explanation": "Conflicting settlement statements detected"
  },
  "userContext": {
    "experienceLevel": "beginner",
    "emotionalState": "stressed"
  }
}
```

**Response:**
```json
{
  "success": true,
  "kindnessResponse": {
    "message": "We noticed something that might be worth a gentle look. There seems to be some conflicting information about settlement options.",
    "tone": "gentle",
    "options": [
      {
        "label": "Learn more about this",
        "action": "show_educational_content",
        "consequence": "You'll see gentle explanation and context",
        "recommended": true,
        "difficulty": "easy"
      },
      {
        "label": "I'll handle this myself",
        "action": "dismiss_gentle",
        "consequence": "No further action from our side",
        "recommended": false,
        "difficulty": "easy"
      }
    ],
    "dismissible": true,
    "urgency": "suggestion",
    "visualStyle": {
      "color": "#3B82F6",
      "icon": "💡",
      "animation": "gentle-pulse"
    },
    "educationalContent": [
      {
        "topic": "Understanding Information Reliability",
        "explanation": "When sources provide conflicting information, it helps to ask for clarification.",
        "analogies": ["Like a compass pointing in two directions - it suggests we need to recalibrate"],
        "visualAids": ["Authority hierarchy diagram"],
        "furtherReading": [
          {
            "title": "Critical Thinking Guide",
            "type": "guide",
            "description": "Gentle introduction to evaluating information quality"
          }
        ]
      }
    ]
  }
}
```

### 🎓 **Educational Endpoints**

#### `GET /trust/education/sources`
Learn about evaluating information sources.

**Response:**
```json
{
  "success": true,
  "education": {
    "title": "Understanding Authority and Trust",
    "content": {
      "overview": "Different sources have different levels of authority in legal matters",
      "hierarchy": [
        {
          "level": "Highest",
          "sources": ["Supreme Court", "EU Court of Justice"],
          "trustLevel": "Absolute",
          "description": "Final legal authority"
        },
        {
          "level": "High",
          "sources": ["Financial Supervisory Authority", "Data Protection Authority"],
          "trustLevel": "Very High",
          "description": "Regulatory oversight"
        }
      ],
      "tips": [
        "Check the source of claims",
        "Look for official documentation",
        "Be wary of conflicting information",
        "Ask for clarification when confused"
      ]
    }
  }
}
```

### 🧪 **Testing & Development**

#### `GET /trust/health`
Health check for Trust Engine service.

**Response:**
```json
{
  "success": true,
  "status": "operational",
  "version": "1.0.0",
  "timestamp": "2024-12-13T10:00:00Z",
  "components": {
    "trustScoreEngine": "operational",
    "kindnessAlgorithm": "operational",
    "authorityHierarchy": "operational",
    "contradictionDetection": "operational"
  }
}
```

#### `POST /trust/test`
Test endpoint with sample data.

**Response:**
```json
{
  "success": true,
  "testResult": {
    "trustScore": 72.3,
    "contradictions": 0,
    "message": "Trust Engine is functioning correctly with Sacred Architecture principles"
  }
}
```

---

## 💳 **Payment Service API** (`/api`)

**Base URL:** `http://localhost:8009` (dev) | `https://payment.damocles.no` (prod)

The Payment Service handles all financial transactions including SWORD token purchases, settlement payments, and escrow management.

### 💰 **Settlement Payment Management**

#### `POST /api/settlement/create`
Create a new settlement payment with escrow.

**Request:**
```json
{
  "userId": "user_123",
  "creditorId": "creditor_123",
  "settlementId": "settlement_123",
  "originalDebtAmount": 10000,
  "settlementAmount": 6000,
  "reductionPercentage": 40,
  "paymentMethod": "stripe",
  "userEmail": "user@example.com",
  "userPhoneNumber": "+4712345678",
  "creditorEmail": "creditor@example.no",
  "settlementTerms": {
    "validUntil": "2025-01-15T23:59:59Z",
    "conditions": ["Full payment within 14 days", "Written confirmation of debt removal"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "settlementPayment": {
    "id": "settlement_payment_123",
    "status": "PENDING_PAYMENT",
    "amountNOK": 6000,
    "escrowStatus": "NOT_FUNDED",
    "paymentLink": "https://payment.damocles.no/pay/settlement_123",
    "stripeSessionId": "cs_test_123...",
    "expiresAt": "2025-01-15T23:59:59Z"
  }
}
```

**Status Codes:**
- `201` - Settlement payment created
- `400` - Invalid input data
- `409` - Settlement already exists

#### `POST /api/settlement/:settlementPaymentId/pay`
Pay for a settlement (funds go to escrow).

**Request:**
```json
{
  "paymentMethod": "stripe",
  "returnUrl": "https://damocles.no/settlement/success"
}
```

**Response (Stripe):**
```json
{
  "success": true,
  "paymentProvider": "stripe",
  "sessionUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "sessionId": "cs_test_123..."
}
```

**Response (Vipps):**
```json
{
  "success": true,
  "paymentProvider": "vipps",
  "checkoutUrl": "https://vipps.no/checkout/v1/...",
  "orderId": "vipps_order_123"
}
```

#### `POST /api/settlement/:settlementPaymentId/release`
Release funds from escrow to creditor (after verification).

**Request:**
```json
{
  "verificationProof": "debt_removal_confirmation.pdf",
  "releaseReason": "Settlement terms fulfilled, debt removed from credit report"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Funds released to creditor",
  "settlement": {
    "id": "settlement_payment_123",
    "status": "COMPLETED",
    "escrowStatus": "RELEASED",
    "releaseDetails": {
      "releasedAt": "2025-01-10T15:30:00Z",
      "stripeTransferId": "tr_123...",
      "amountReleased": 5700,
      "platformFee": 300
    }
  }
}
```

#### `POST /api/settlement/:settlementPaymentId/refund`
Refund settlement payment to user (if terms not met).

**Request:**
```json
{
  "refundReason": "Creditor failed to provide debt removal confirmation within 30 days",
  "violationEvidence": ["email_thread.pdf", "deadline_notice.pdf"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settlement payment refunded",
  "settlement": {
    "id": "settlement_payment_123",
    "status": "REFUNDED",
    "escrowStatus": "REFUNDED",
    "refundDetails": {
      "refundedAt": "2025-01-20T10:00:00Z",
      "stripeRefundId": "re_123...",
      "amountRefunded": 6000,
      "refundReason": "Creditor non-compliance"
    }
  }
}
```

#### `GET /api/settlement/:settlementPaymentId`
Get settlement payment details and status.

**Response:**
```json
{
  "success": true,
  "settlement": {
    "id": "settlement_payment_123",
    "status": "ESCROWED",
    "userId": "user_123",
    "creditorId": "creditor_123",
    "originalDebtAmount": 10000,
    "settlementAmount": 6000,
    "reductionPercentage": 40,
    "paymentMethod": "stripe",
    "escrowStatus": "FUNDED",
    "timeline": {
      "createdAt": "2025-01-05T10:00:00Z",
      "paidAt": "2025-01-05T10:15:00Z",
      "expiresAt": "2025-01-15T23:59:59Z"
    },
    "settlementTerms": {
      "validUntil": "2025-01-15T23:59:59Z",
      "conditions": ["Full payment within 14 days"]
    }
  }
}
```

#### `GET /api/user/:userId/settlements`
Get all settlements for a user.

**Response:**
```json
{
  "success": true,
  "settlements": [
    {
      "id": "settlement_payment_123",
      "status": "COMPLETED",
      "creditorName": "Example Inkasso AS",
      "settlementAmount": 6000,
      "originalAmount": 10000,
      "savedAmount": 4000,
      "completedAt": "2025-01-10T15:30:00Z"
    }
  ],
  "summary": {
    "totalSettlements": 3,
    "totalSaved": 15000,
    "averageReduction": 45.5
  }
}
```

#### `POST /api/settlement/calculate`
Calculate settlement details including fees.

**Request:**
```json
{
  "originalAmount": 10000,
  "reductionPercentage": 40
}
```

**Response:**
```json
{
  "success": true,
  "calculation": {
    "originalDebtAmount": 10000,
    "reductionPercentage": 40,
    "reductionAmount": 4000,
    "settlementAmount": 6000,
    "platformFee": 300,
    "platformFeePercentage": 5,
    "creditorReceives": 5700,
    "totalUserSavings": 3700,
    "effectiveSavingsPercentage": 37
  }
}
```

### 💸 **Standard Payment Endpoints**

#### `POST /api/calculate-fee`
Calculate platform fee for a transaction.

**Request:**
```json
{
  "amount": 1000,
  "serviceType": "sword_purchase"
}
```

**Response:**
```json
{
  "amount": 1000,
  "fee": 50,
  "total": 1050,
  "feePercentage": 5
}
```

#### `POST /api/generate-invoice`
Generate invoice for services.

**Request:**
```json
{
  "userId": "user_123",
  "amount": 1000,
  "description": "SWORD token purchase (1000 tokens)",
  "serviceType": "sword_purchase"
}
```

#### `POST /api/process-payment`
Process a payment transaction.

**Request:**
```json
{
  "invoiceId": "invoice_123",
  "paymentMethod": "stripe",
  "stripeToken": "tok_visa_123"
}
```

#### `POST /api/webhook/stripe`
Webhook for Stripe payment events (internal use).

#### `POST /api/webhook/vipps`
Webhook for Vipps payment events (internal use).

---

## 🤝 **Settlement & Negotiation API** (`/gdpr`)

Extensions to the GDPR Engine for automated settlement negotiation.

### 📊 **Settlement Analysis**

#### `POST /settlement/analyze`
Analyze a debt for settlement potential.

**Request:**
```json
{
  "user_id": "user_123",
  "creditor_id": "creditor_123",
  "gdpr_request_id": "gdpr_req_123",
  "debt_details": {
    "original_amount": 10000,
    "current_amount": 12000,
    "debt_age_days": 180,
    "payment_history": []
  },
  "violations_detected": [
    {
      "type": "late_response",
      "severity": "medium",
      "detected_at": "2024-11-20T10:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "settlement_recommended": true,
    "confidence_score": 0.87,
    "recommended_reduction": 0.45,
    "estimated_settlement_amount": 6600,
    "leverage_factors": [
      {
        "factor": "GDPR violations detected",
        "weight": 0.35,
        "description": "Late response to GDPR request (Article 12.3)"
      },
      {
        "factor": "Debt age over 6 months",
        "weight": 0.20,
        "description": "Recovery likelihood decreases with age"
      }
    ],
    "settlement_proposal": {
      "initial_offer_percentage": 55,
      "initial_offer_amount": 6600,
      "minimum_acceptable": 50,
      "maximum_acceptable": 65,
      "deadline": "2025-01-15T23:59:59Z",
      "terms": [
        "Full and final settlement",
        "Debt removed from credit records",
        "No further collection activity",
        "Written confirmation within 14 days"
      ],
      "payment_structure": {
        "type": "lump_sum",
        "escrow_required": true,
        "payment_deadline_days": 14
      }
    },
    "negotiation_strategy": {
      "opening_position": "strong",
      "flexibility_range": [0.50, 0.65],
      "key_arguments": [
        "GDPR compliance violations reduce claim validity",
        "Extended collection period increases creditor costs",
        "Immediate lump-sum payment vs. uncertain recovery"
      ],
      "red_lines": [
        "Settlement must include credit record removal",
        "No admission of original debt validity",
        "Escrow protection required"
      ]
    }
  }
}
```

### 🔄 **Negotiation Engine**

#### `POST /negotiation/evaluate`
Evaluate a creditor counter-offer.

**Request:**
```json
{
  "settlement_id": "settlement_123",
  "original_proposal": {
    "reduction_percentage": 45,
    "settlement_amount": 6600
  },
  "creditor_counter_offer": {
    "reduction_percentage": 30,
    "settlement_amount": 8400,
    "terms_modifications": [
      "Payment required within 7 days (originally 14)"
    ],
    "additional_conditions": [
      "User must acknowledge debt validity"
    ]
  },
  "user_constraints": {
    "max_acceptable_amount": 7000,
    "acceptable_payment_timeframe_days": 10,
    "red_lines": [
      "Cannot acknowledge debt validity due to GDPR violations"
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "recommendation": "counter_again",
    "confidence": 0.82,
    "counter_offer_analysis": {
      "acceptable": false,
      "issues": [
        {
          "issue": "amount_too_high",
          "severity": "high",
          "details": "Counter-offer 8400 NOK exceeds user maximum 7000 NOK"
        },
        {
          "issue": "red_line_violated",
          "severity": "critical",
          "details": "Debt validity acknowledgment conflicts with GDPR violations"
        },
        {
          "issue": "timeline_tight",
          "severity": "medium",
          "details": "7-day payment window below user preference of 10 days"
        }
      ],
      "acceptable_aspects": [
        "Still offers meaningful reduction from original 12000 NOK"
      ]
    },
    "next_counter_offer": {
      "reduction_percentage": 38,
      "settlement_amount": 7440,
      "rationale": "Split the difference, accommodate timeline",
      "proposed_terms": [
        "Settlement amount: 7440 NOK (38% reduction)",
        "Payment within 10 days",
        "No debt validity acknowledgment required",
        "Full and final settlement with credit record removal"
      ],
      "negotiation_message": {
        "tone": "firm_but_collaborative",
        "key_points": [
          "Appreciate movement toward resolution",
          "Cannot exceed 7440 NOK given GDPR compliance concerns",
          "10-day payment timeline is reasonable for both parties",
          "Debt validity acknowledgment incompatible with documented violations"
        ],
        "closing": "This represents our final offer. We believe it balances fairness with the documented concerns."
      }
    },
    "alternative_strategies": [
      {
        "strategy": "escalate_to_legal",
        "when_to_use": "If creditor remains inflexible on amount or red-line terms",
        "expected_outcome": "Higher leverage but longer timeline"
      },
      {
        "strategy": "accept_with_modifications",
        "when_to_use": "If user willing to stretch to 8000 NOK with 14-day payment",
        "expected_outcome": "Quick resolution, moderate savings"
      }
    ],
    "negotiation_health": {
      "status": "productive",
      "progress_percentage": 65,
      "estimated_rounds_remaining": 1-2,
      "breakdown_risk": "low"
    }
  }
}
```

---

## 📢 **Datatilsynet Compliance API** (`/gdpr`)

Automated complaint generation for Norwegian Data Protection Authority escalations.

### ⚖️ **Complaint Management**

#### `POST /datatilsynet/generate-complaint`
Generate formal complaint to Datatilsynet (Norwegian DPA).

**Request:**
```json
{
  "user_id": "user_123",
  "creditor_id": "creditor_123",
  "gdpr_request_id": "gdpr_req_123",
  "violations": [
    {
      "type": "late_response",
      "severity": "high",
      "description": "Response received 45 days after GDPR deadline",
      "legal_reference": "GDPR Article 12(3)",
      "detected_at": "2024-12-20T10:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "complaint": {
    "complaint_reference": "DT-COMPLAINT-20250104-001",
    "status": "generated",
    "complaint_letter": "Datatilsynet\nPostboks 8177 Dep\n0034 Oslo\n\nKLAGE PÅ BRUDD PÅ PERSONVERNFORORDNINGEN (GDPR)\n\n...",
    "complaint_summary": {
      "complainant": {
        "name": "John Doe",
        "address": "Example Street 123, 0123 Oslo",
        "email": "john@example.com",
        "phone": "+4712345678"
      },
      "respondent": {
        "name": "Example Inkasso AS",
        "org_number": "987654321",
        "address": "Collector Street 1, 0456 Oslo",
        "email": "contact@example-inkasso.no"
      },
      "violations": [
        {
          "article": "GDPR Article 12(3)",
          "violation_type": "Deadline violation",
          "description": "Failed to respond to data access request within 30 days",
          "severity": "high",
          "date_occurred": "2024-12-20"
        }
      ]
    },
    "evidence_package": {
      "gdpr_request_sent": "2024-11-20T10:00:00Z",
      "response_deadline": "2024-12-20T10:00:00Z",
      "response_received": "2025-01-04T15:00:00Z",
      "days_overdue": 15,
      "email_proof": ["sent_email.pdf", "read_receipt.pdf"],
      "response_proof": ["late_response.pdf"]
    },
    "legal_analysis": {
      "primary_violations": ["GDPR Article 12(3)"],
      "aggravating_factors": [
        "Systematic delays across multiple data subjects",
        "No communication during extended delay",
        "Pattern of non-compliance"
      ],
      "applicable_remedies": [
        "Administrative fine (GDPR Article 83)",
        "Corrective measures (GDPR Article 58)",
        "Compensation for damages (GDPR Article 82)"
      ]
    },
    "fine_estimate": {
      "estimated_fine_nok": 500000,
      "basis": "First-tier violation: Up to 10M EUR or 2% of global turnover",
      "factors": [
        "Nature and severity of violation",
        "Intentional or negligent character",
        "Previous violations and compliance history"
      ],
      "range_low": 250000,
      "range_high": 1000000
    },
    "requested_actions": [
      "Formal investigation of GDPR compliance",
      "Immediate order to respond to data access request",
      "Assessment of administrative fines",
      "Corrective measures to prevent future violations",
      "Compensation for damages"
    ],
    "complaint_language": "norwegian",
    "generated_at": "2025-01-04T16:00:00Z"
  }
}
```

**Status Codes:**
- `200` - Complaint generated successfully
- `400` - Missing required information
- `404` - User, creditor, or GDPR request not found
- `409` - Complaint already filed for this request

---

## 🏆 **Transparency Reporting API** (`/transparency`)

Public creditor compliance tracking with A-F grading and reputation scoring.

### 📊 **Creditor Compliance Reports**

#### `POST /transparency/creditor/{creditor_id}`
Generate comprehensive transparency report for a creditor.

**Response:**
```json
{
  "success": true,
  "report": {
    "creditor_id": "creditor_123",
    "creditor_name": "Example Inkasso AS",
    "report_period": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2025-01-04T23:59:59Z",
      "days": 369
    },
    "compliance_grade": {
      "grade": "C",
      "grade_description": "Fair",
      "points": 52,
      "previous_grade": "D",
      "grade_trend": "improving"
    },
    "reputation_score": {
      "score": 58,
      "max_score": 100,
      "category": "Below Average",
      "previous_score": 45,
      "trend": "improving"
    },
    "violation_metrics": {
      "total_violations": 28,
      "critical_violations": 2,
      "high_violations": 8,
      "medium_violations": 12,
      "low_violations": 6,
      "violation_score": 68,
      "violation_rate": 0.28,
      "common_violations": [
        {
          "type": "late_response",
          "count": 12,
          "percentage": 43
        },
        {
          "type": "incomplete_data",
          "count": 8,
          "percentage": 29
        }
      ]
    },
    "response_metrics": {
      "total_requests": 100,
      "responses_received": 75,
      "response_rate": 75,
      "avg_response_time_days": 22,
      "on_time_responses": 58,
      "on_time_rate": 58,
      "no_response_count": 25
    },
    "settlement_metrics": {
      "total_settlements_offered": 45,
      "settlements_accepted": 32,
      "acceptance_rate": 71,
      "avg_reduction_offered": 38,
      "avg_reduction_accepted": 42,
      "total_amount_settled": 1250000
    },
    "complaint_metrics": {
      "total_complaints": 5,
      "datatilsynet_complaints": 2,
      "complaint_rate": 0.05,
      "resolved_complaints": 3,
      "pending_complaints": 2
    },
    "improvement_recommendations": [
      {
        "priority": "high",
        "category": "response_time",
        "issue": "Average response time 22 days (target: <20 days for grade B)",
        "recommendation": "Implement automated GDPR response system",
        "estimated_impact": "+15 reputation points"
      },
      {
        "priority": "medium",
        "category": "violation_reduction",
        "issue": "28 violations in past year",
        "recommendation": "Reduce violations to <25 for grade B qualification",
        "estimated_impact": "+10 reputation points"
      }
    ],
    "public_url": "https://damocles.no/transparency/creditor/creditor_123",
    "last_updated": "2025-01-04T20:00:00Z"
  }
}
```

#### `GET /transparency/leaderboard`
Get creditor compliance leaderboard.

**Query Parameters:**
- `country` - Filter by country (default: "norway")
- `industry` - Filter by industry type
- `limit` - Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "leaderboard": {
    "country": "norway",
    "generated_at": "2025-01-04T20:00:00Z",
    "creditors": [
      {
        "rank": 1,
        "creditor_id": "creditor_456",
        "creditor_name": "Best Practice Inkasso AS",
        "compliance_grade": "A",
        "reputation_score": 92,
        "response_rate": 98,
        "avg_response_days": 12,
        "total_violations": 3,
        "trend": "stable"
      },
      {
        "rank": 2,
        "creditor_id": "creditor_789",
        "creditor_name": "Good Compliance AS",
        "compliance_grade": "B",
        "reputation_score": 78,
        "response_rate": 88,
        "avg_response_days": 18,
        "total_violations": 15,
        "trend": "improving"
      }
    ],
    "statistics": {
      "total_creditors": 156,
      "avg_compliance_grade": "C",
      "avg_reputation_score": 54,
      "avg_response_rate": 68,
      "grade_distribution": {
        "A": 8,
        "B": 23,
        "C": 54,
        "D": 48,
        "F": 23
      }
    }
  }
}
```

#### `GET /transparency/industry/{industry}`
Get industry-specific compliance statistics.

**Response:**
```json
{
  "success": true,
  "industry_report": {
    "industry": "inkasso",
    "total_creditors": 87,
    "avg_compliance_grade": "C",
    "avg_reputation_score": 52,
    "best_performers": [...],
    "worst_performers": [...],
    "industry_trends": {
      "response_rate_trend": "improving",
      "violation_trend": "stable",
      "settlement_trend": "improving"
    }
  }
}
```

---

## ⚔️ **SWORD (Blockchain) API** (`/sword`)

NFT evidence anchoring on Cardano blockchain for immutable violation records.

### 🔗 **Token Minting**

#### `POST /sword/mint`
Mint SWORD token (violation evidence NFT) on Cardano blockchain.

**Request:**
```json
{
  "violation": {
    "id": "violation_123",
    "type": "gdpr_deadline_violation",
    "severity": "high",
    "description": "Failed to respond to GDPR request within 30-day deadline",
    "legal_reference": "GDPR Article 12(3)",
    "detected_at": "2024-12-20T10:00:00Z",
    "confidence": 0.95
  },
  "creditor_data": {
    "id": "creditor_123",
    "name": "Example Inkasso AS",
    "org_number": "987654321",
    "type": "inkasso"
  },
  "gdpr_request": {
    "id": "gdpr_req_123",
    "sent_at": "2024-11-20T10:00:00Z",
    "deadline": "2024-12-20T10:00:00Z",
    "response_received_at": "2025-01-04T15:00:00Z",
    "status": "violated"
  },
  "evidence_package": {
    "sent_email_proof": "email_123.pdf",
    "delivery_confirmation": "receipt_123.pdf",
    "late_response": "response_123.pdf",
    "timeline_documentation": "timeline.json"
  }
}
```

**Response:**
```json
{
  "success": true,
  "minted": true,
  "sword_token": {
    "asset_id": "policy_id_hex + asset_name_hex",
    "asset_name": "SWORD_EXAMPLEINKA_001_20250104",
    "token_type": "SWORD",
    "violation_id": "violation_123",
    "creditor_id": "creditor_123",
    "creditor_name": "Example Inkasso AS",
    "violation_type": "gdpr_deadline_violation",
    "severity": "high",
    "evidence_hash": "sha256_hash_of_evidence_package",
    "blockchain_tx": "cardano_transaction_hash",
    "explorer_url": "https://cardanoscan.io/transaction/...",
    "network": "mainnet",
    "minted_at": "2025-01-04T20:30:00Z",
    "metadata": {
      "name": "SWORD Evidence: Example Inkasso AS - GDPR Violation",
      "description": "Immutable evidence of GDPR violation...",
      "violation_type": "gdpr_deadline_violation",
      "severity": "high",
      "creditor_name": "Example Inkasso AS",
      "evidence_hash": "sha256_hash...",
      "legal_reference": "GDPR Article 12(3)",
      "platform": "DAMOCLES",
      "token_type": "SWORD",
      "version": "1.0"
    },
    "legal_status": "evidence_anchored",
    "immutable": true
  }
}
```

**Notes:**
- Only violations with severity `medium` or higher are minted
- Evidence hash is SHA-256 of complete evidence package
- Tokens are CIP-25 compliant NFTs
- Immutable blockchain anchoring for legal proceedings

### ✅ **Token Verification**

#### `GET /sword/verify/{asset_id}`
Verify SWORD token exists on blockchain and retrieve evidence.

**Response:**
```json
{
  "success": true,
  "verified": true,
  "asset_id": "policy_id + asset_name_hex",
  "token_type": "SWORD",
  "network": "mainnet",
  "blockchain_tx": "initial_mint_transaction_hash",
  "explorer_url": "https://cardanoscan.io/transaction/...",
  "metadata": {
    "name": "SWORD Evidence: Example Inkasso AS - GDPR Violation",
    "violation_type": "gdpr_deadline_violation",
    "severity": "high",
    "creditor_name": "Example Inkasso AS",
    "evidence_hash": "sha256_hash...",
    "timestamp": "2025-01-04T20:30:00Z"
  },
  "immutable": true,
  "legal_status": "blockchain_anchored",
  "verified_at": "2025-01-04T21:00:00Z"
}
```

#### `GET /sword/creditor/{creditor_id}`
Get all SWORD tokens minted for a specific creditor.

**Response:**
```json
{
  "success": true,
  "creditor_id": "creditor_123",
  "total_sword_tokens": 15,
  "severity_breakdown": {
    "critical": 2,
    "high": 5,
    "medium": 8,
    "low": 0
  },
  "violation_types": {
    "gdpr_deadline_violation": 8,
    "incomplete_response": 4,
    "data_breach": 2,
    "unlawful_processing": 1
  },
  "tokens": [
    {
      "asset_id": "...",
      "asset_name": "SWORD_EXAMPLEINKA_001_20250104",
      "violation_type": "gdpr_deadline_violation",
      "severity": "high",
      "minted_at": "2025-01-04T20:30:00Z",
      "blockchain_tx": "...",
      "explorer_url": "..."
    }
  ],
  "legal_summary": "LEGAL EVIDENCE SUMMARY:\n\nTotal blockchain-anchored violations: 15\nCritical severity: 2\nHigh severity: 5\n\nAll evidence is immutably stored on Cardano blockchain...",
  "retrieved_at": "2025-01-04T21:00:00Z"
}
```

---

## 🏢 **Creditor Portal API** (`/creditor-portal`)

Two-way transparency portal for creditors to view violations and improve compliance.

### 📊 **Dashboard & Analytics**

#### `GET /creditor-portal/dashboard/{creditor_id}`
Get creditor compliance dashboard.

**Headers:**
```http
Authorization: Bearer <creditor_portal_token>
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "creditor_info": {
      "id": "creditor_123",
      "name": "Example Inkasso AS",
      "org_number": "987654321",
      "last_login": "2025-01-04T19:00:00Z"
    },
    "compliance_summary": {
      "grade": "C",
      "grade_description": "Fair",
      "reputation_score": 58,
      "total_violations": 28,
      "pending_gdpr_requests": 5,
      "datatilsynet_complaints": 2,
      "sword_tokens_minted": 8
    },
    "urgent_actions": [
      {
        "type": "overdue_gdpr_response",
        "priority": "critical",
        "count": 2,
        "description": "2 GDPR requests overdue (>30 days)",
        "action_required": "Respond immediately to avoid Datatilsynet escalation",
        "deadline": "2025-01-05T23:59:59Z"
      },
      {
        "type": "pending_settlement",
        "priority": "high",
        "count": 3,
        "description": "3 settlement proposals awaiting response",
        "action_required": "Review and respond within 7 days",
        "deadline": "2025-01-11T23:59:59Z"
      }
    ],
    "trends": {
      "grade_trend": "stable",
      "violation_trend": "decreasing",
      "response_time_trend": "improving"
    },
    "recent_activity": [
      {
        "type": "gdpr_request_received",
        "description": "New GDPR request from User #456",
        "timestamp": "2025-01-04T18:00:00Z",
        "status": "pending_response"
      }
    ]
  }
}
```

### 📝 **Response Management**

#### `POST /creditor-portal/gdpr-response/{gdpr_request_id}`
Submit response to GDPR request.

**Request:**
```json
{
  "creditor_id": "creditor_123",
  "response_type": "full_compliance",
  "response_data": {
    "personal_data_provided": true,
    "data_categories": ["contact_info", "transaction_history", "debt_records"],
    "data_sources": ["internal_crm", "third_party_collectors"],
    "retention_period": "5 years from debt resolution",
    "data_recipients": ["internal_departments", "legal_advisors"]
  },
  "attachments": ["data_export.pdf", "privacy_notice.pdf"],
  "additional_notes": "Complete data export attached. All processing is based on legitimate interest for debt collection."
}
```

**Response:**
```json
{
  "success": true,
  "message": "GDPR response submitted successfully",
  "response": {
    "gdpr_request_id": "gdpr_req_123",
    "status": "responded",
    "responded_at": "2025-01-04T20:45:00Z",
    "response_time_days": 12,
    "compliance_status": "on_time",
    "auto_analysis": {
      "completeness_score": 0.95,
      "compliance_issues": [],
      "positive_aspects": [
        "Response within deadline",
        "All requested data categories addressed",
        "Clear retention policy stated"
      ]
    }
  }
}
```

#### `POST /creditor-portal/settlement-response/{settlement_id}`
Respond to settlement proposal.

**Request:**
```json
{
  "creditor_id": "creditor_123",
  "response_type": "counter_offer",
  "counter_offer": {
    "reduction_percentage": 30,
    "settlement_amount": 8400,
    "payment_deadline_days": 7,
    "terms_modifications": ["Require payment within 7 days"],
    "rationale": "Proposal too aggressive given debt validity"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Counter-offer submitted",
  "settlement": {
    "settlement_id": "settlement_123",
    "status": "under_negotiation",
    "negotiation_round": 2,
    "auto_evaluation": {
      "counter_offer_reasonable": true,
      "likely_acceptance": 0.65,
      "recommendation": "User likely to counter again at 35-38% reduction"
    }
  }
}
```

### 📈 **Improvement Planning**

#### `POST /creditor-portal/improvement-plan/{creditor_id}`
Request improvement plan to increase compliance grade.

**Request:**
```json
{
  "current_grade": "C",
  "target_grade": "A",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "improvement_plan": {
    "creditor_id": "creditor_123",
    "current_grade": "C",
    "current_score": 58,
    "target_grade": "A",
    "target_requirements": {
      "response_rate": 95,
      "avg_response_days": 15,
      "max_violations": 10,
      "max_violation_score": 20
    },
    "gaps": {
      "response_rate": "Current 75% → Target 95% (gap: 20%)",
      "avg_response_days": "Current 22 → Target 15 (gap: 7 days)",
      "total_violations": "Current 28 → Target 10 (gap: 18)"
    },
    "action_items": [
      {
        "priority": "critical",
        "category": "response_rate",
        "action": "Responder på 5 utestående GDPR-forespørsler",
        "impact": "Vil øke svarrate fra 75% til 80%",
        "deadline": "7 dager",
        "estimated_score_gain": 5
      },
      {
        "priority": "high",
        "category": "response_time",
        "action": "Implementer automatisert varslingssystem for nye forespørsler",
        "impact": "Reduser svartid fra 22 til ~15 dager",
        "deadline": "30 dager",
        "estimated_score_gain": 10
      },
      {
        "priority": "high",
        "category": "violations",
        "action": "Reduser overtredelser med 18 ved å forbedre prosesser",
        "impact": "Oppfyll overtredelseskrav for A-grad",
        "deadline": "90 dager",
        "estimated_score_gain": 15
      }
    ],
    "estimated_timeline": "21-42 dager",
    "projected_score": 88,
    "success_probability": 0.78
  }
}
```

#### `GET /creditor-portal/violations/{creditor_id}`
View all violations with dispute options.

**Response:**
```json
{
  "success": true,
  "violations": [
    {
      "id": "violation_123",
      "type": "late_response",
      "severity": "high",
      "description": "GDPR response 15 days overdue",
      "detected_at": "2024-12-20T10:00:00Z",
      "evidence": ["email_proof.pdf", "timeline.json"],
      "status": "confirmed",
      "disputable": true,
      "dispute_deadline": "2025-01-20T23:59:59Z"
    }
  ],
  "summary": {
    "total": 28,
    "by_severity": {"critical": 2, "high": 8, "medium": 12, "low": 6},
    "disputable": 12,
    "sword_anchored": 8
  }
}
```

---

## 📊 **Monitoring & Health API** (`/monitoring`)

Production monitoring for system health, performance, and alerting.

### 🏥 **System Health**

#### `GET /monitoring/health`
Get comprehensive system health status.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-01-04T20:00:00Z",
  "system_resources": {
    "status": "healthy",
    "cpu_percent": 45.2,
    "memory_percent": 62.8,
    "memory_available_gb": 12.5,
    "disk_percent": 58.3,
    "disk_free_gb": 156.7,
    "alerts": []
  },
  "services": {
    "user_service": {
      "status": "healthy",
      "response_time_ms": 125,
      "service_data": {"status": "operational"}
    },
    "payment_service": {
      "status": "healthy",
      "response_time_ms": 98,
      "service_data": {"status": "operational"}
    },
    "gdpr_engine": {
      "status": "healthy",
      "response_time_ms": 156,
      "service_data": {"status": "operational"}
    }
  },
  "database": {
    "status": "healthy",
    "response_time_ms": 12.5,
    "connection_pool": {
      "active": 5,
      "idle": 10,
      "max": 20
    }
  },
  "external_services": {
    "stripe": {
      "status": "healthy"
    },
    "vipps": {
      "status": "assumed_healthy",
      "note": "OAuth check not implemented"
    },
    "blockfrost": {
      "status": "healthy",
      "network": "mainnet"
    }
  },
  "metrics": {
    "total_requests": 15847,
    "total_errors": 23,
    "error_rate_percent": 0.15,
    "response_times_ms": {
      "average": 143.5,
      "min": 45.2,
      "max": 892.1
    },
    "last_health_check": "2025-01-04T20:00:00Z"
  },
  "recent_alerts": []
}
```

**Status Values:**
- `healthy` - All systems operational
- `degraded` - Some non-critical issues detected
- `unhealthy` - Critical systems down

#### `GET /monitoring/metrics`
Get performance metrics.

**Response:**
```json
{
  "success": true,
  "metrics": {
    "total_requests": 15847,
    "total_errors": 23,
    "error_rate_percent": 0.15,
    "response_times_ms": {
      "average": 143.5,
      "min": 45.2,
      "max": 892.1
    },
    "last_health_check": "2025-01-04T20:00:00Z"
  }
}
```

#### `GET /monitoring/alerts`
Get recent system alerts.

**Query Parameters:**
- `limit` - Number of alerts to return (default: 50)

**Response:**
```json
{
  "success": true,
  "alerts": [
    {
      "type": "high_cpu",
      "message": "CPU usage at 85%",
      "severity": "warning",
      "timestamp": "2025-01-04T19:30:00Z"
    },
    {
      "type": "payment_service_slow",
      "message": "payment_service response time: 1250ms",
      "severity": "warning",
      "timestamp": "2025-01-04T19:25:00Z"
    }
  ],
  "total_alerts": 2
}
```

**Alert Severities:**
- `critical` - Immediate action required
- `warning` - Should be addressed soon
- `info` - Informational only

---

## 📊 **Analytics Endpoints**

#### `GET /analytics/dashboard`
Get user dashboard statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "user": {
      "total_debts": 3,
      "total_amount": 15000,
      "resolved_amount": 5000,
      "sword_balance": 1500
    },
    "platform": {
      "total_users": 2500,
      "total_gdpr_requests": 15000,
      "violation_detection_rate": 0.78,
      "avg_settlement_reduction": 0.62
    },
    "trends": {
      "weekly_registrations": [45, 52, 38, 67],
      "gdpr_success_rate": [0.82, 0.85, 0.78, 0.87],
      "violation_reports": [23, 31, 28, 42]
    }
  }
}
```

---

## ⚠️ **Error Handling**

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Must be a valid email address"
    }
  }
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED` (401) - Missing or invalid token
- `AUTHORIZATION_FAILED` (403) - Insufficient permissions
- `VALIDATION_ERROR` (400) - Invalid input data
- `RESOURCE_NOT_FOUND` (404) - Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

---

## 🔧 **Rate Limiting**

### Default Limits
- **Authenticated Users:** 1000 requests/hour
- **GDPR Generation:** 10 requests/hour per user
- **Email Sending:** 5 requests/hour per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1640995200
```

---

## 📚 **SDK & Examples**

### JavaScript/Node.js Example
```javascript
const DamoclesAPI = require('@damocles/api-client');

const client = new DamoclesAPI({
  baseURL: 'https://api.damocles.no',
  token: 'your_jwt_token_here'
});

// Create a new debt
const debt = await client.debts.create({
  creditorId: 'creditor_123',
  originalAmount: 5000,
  description: 'Outstanding invoice'
});

// Generate GDPR request
const gdprRequest = await client.gdpr.generate({
  creditorId: 'creditor_123',
  requestType: 'article_15'
});

// Send GDPR request
await client.gdpr.send(gdprRequest.id);
```

### Python Example
```python
import damocles

client = damocles.Client(
    base_url='https://api.damocles.no',
    token='your_jwt_token_here'
)

# Create debt
debt = client.debts.create(
    creditor_id='creditor_123',
    original_amount=5000,
    description='Outstanding invoice'
)

# Generate and send GDPR request
gdpr_request = client.gdpr.generate(
    creditor_id='creditor_123',
    request_type='article_15'
)

client.gdpr.send(gdpr_request['id'])
```

---

*API built for justice, designed for developers.* ⚔️