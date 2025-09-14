# DAMOCLES API Documentation 🔧

> **Version:** 1.0.0 | **Status:** Production Ready | **Updated:** December 2024

## 🎯 **Overview**

DAMOCLES provides REST APIs for debt management, GDPR automation, and user authentication. All APIs use JSON for request/response and require authentication via JWT tokens.

**Base URLs:**
- **User Service:** `http://localhost:3000` (dev) | `https://api.damocles.no` (prod)
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