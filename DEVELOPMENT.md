# DAMOCLES Platform - Development Guide

## 🗡️ Quick Start

### Prerequisites

Ensure you have the following installed:
- Node.js >= 18.0.0
- Python >= 3.10
- Rust >= 1.70.0
- Docker & Docker Compose
- PostgreSQL >= 14 (or use Docker)
- Redis >= 7.0 (or use Docker)

### Getting Started

1. **Clone and setup the project:**
   ```bash
   git clone https://github.com/damocles-dao/damocles-platform
   cd damocles-platform
   make quickstart
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development environment:**
   ```bash
   make dev
   ```

4. **Access the application:**
   - Web App: http://localhost:3001
   - User Service API: http://localhost:3000
   - GDPR Engine API: http://localhost:8001
   - Settlement Service API: http://localhost:8003
   - Grafana Dashboard: http://localhost:3002 (admin/admin)

## 🏗️ Architecture Overview

### Service Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend Layer                  │
├─────────────────────────────────────────────┤
│ Next.js Web App │ React Native Mobile       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│              API Gateway                     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            Microservices                    │
├─────────────────────────────────────────────┤
│ User Service │ GDPR Engine │ Settlement     │
│ (Node.js)    │ (Python)    │ (Rust)        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            Blockchain Layer                 │
├─────────────────────────────────────────────┤
│ Cardano Smart Contracts │ IPFS Storage     │
└─────────────────────────────────────────────┘
```

### Data Flow

1. **User Registration**: BankID authentication → User Service
2. **Debt Management**: Add debts → Database storage
3. **GDPR Automation**: Generate/send requests → GDPR Engine
4. **Violation Detection**: AI analysis → Evidence storage
5. **Settlement**: Negotiate → Smart contracts → Blockchain

## 🛠️ Development Commands

### Essential Commands

```bash
# Development
make dev          # Start all services in development mode
make build        # Build all services
make test         # Run all tests

# Docker Management  
make docker-up    # Start supporting services (DB, Redis, etc.)
make docker-down  # Stop all containers
make logs         # View container logs

# Database
make migrate      # Run database migrations
make seed         # Seed with test data

# Smart Contracts
make contracts    # Build Plutus contracts
make deploy-testnet # Deploy to Cardano testnet

# Code Quality
make format       # Format all code
make lint         # Run linters
make clean        # Clean build artifacts
```

### Service-Specific Commands

```bash
# User Service (Node.js/TypeScript)
cd services/user-service
npm run dev       # Start in development mode
npm run test      # Run tests
npx prisma studio # Database GUI

# GDPR Engine (Python/FastAPI)
cd services/gdpr-engine
python -m uvicorn main:app --reload --port 8001
pytest           # Run tests

# Settlement Service (Rust)
cd services/settlement-service  
cargo run        # Start service
cargo test       # Run tests

# Web Frontend (Next.js)
cd apps/web
npm run dev      # Start development server
npm run build    # Build for production
```

## 📁 Project Structure

```
damocles-platform/
├── apps/                       # Frontend applications
│   ├── web/                   # Next.js web app
│   ├── mobile/                # React Native app
│   └── admin/                 # Admin dashboard
├── services/                  # Backend microservices
│   ├── user-service/         # User management (Node.js)
│   ├── gdpr-engine/          # GDPR automation (Python)
│   ├── analysis-ai/          # AI violation detection
│   ├── settlement-service/    # Settlement processing (Rust)
│   ├── notification-service/  # Email/SMS notifications
│   └── blockchain-service/    # Cardano integration
├── smart-contracts/           # Blockchain contracts
│   ├── plutus/               # Cardano smart contracts
│   ├── marlowe/              # Financial contracts  
│   └── scripts/              # Deployment scripts
├── packages/                  # Shared libraries
│   ├── common/               # Shared TypeScript code
│   ├── ui/                   # UI components
│   └── sdk/                  # Platform SDK
├── infrastructure/            # DevOps configuration
│   ├── terraform/            # Infrastructure as Code
│   ├── kubernetes/           # K8s deployments
│   └── monitoring/           # Observability config
└── docs/                     # Documentation
```

## 🗄️ Database Schema

### Core Entities

```sql
-- Users (Norwegian citizens using BankID)
users (id, personal_number_hash, email, phone_number, 
       risk_score, shield_tier, token_balance, ...)

-- Creditors (debt collection agencies, banks, etc.)
creditors (id, name, organization_number, type, 
          privacy_email, violation_score, ...)

-- Debts (user's debt relationships)  
debts (id, user_id, creditor_id, original_amount, 
       current_amount, status, ...)

-- GDPR Requests (automated data requests)
gdpr_requests (id, user_id, creditor_id, reference_id,
               content, status, sent_at, response_due, ...)

-- Violations (detected GDPR/fee violations)
violations (id, gdpr_request_id, creditor_id, type, 
           severity, evidence, legal_reference, ...)

-- Settlements (negotiated debt reductions)
settlements (id, user_id, debt_id, original_amount,
            settled_amount, saved_amount, status, ...)
```

## 🔐 Authentication & Security

### BankID Integration

```typescript
// Norwegian BankID authentication flow
const authResponse = await bankId.authenticate(personalNumber)
const userToken = jwt.sign({ userId, email }, JWT_SECRET)
```

### API Security

- JWT tokens with 15-minute expiry
- Refresh tokens via secure HTTP-only cookies
- Rate limiting (100 requests/minute per user)
- CORS restrictions
- Input validation with Zod schemas

### Data Protection

- Personal numbers encrypted with bcrypt
- PII encrypted at rest (AES-256-GCM)
- TLS 1.3 for data in transit
- GDPR-compliant data retention

## ⛓️ Blockchain Integration

### Smart Contracts

```haskell
-- Evidence Registry (Plutus)
data Evidence = Evidence
    { evCreditor      :: PubKeyHash
    , evDebtor        :: PubKeyHash  
    , evIpfsHash      :: BuiltinByteString
    , evTimestamp     :: POSIXTime
    , evViolationType :: Integer
    , evAmount        :: Integer
    }
```

### Token Economics ($SWORD)

- **Total Supply**: 1,000,000,000 SWORD
- **Evidence Mining**: 40% (reward users for violations)
- **Settlement Treasury**: 25% (fund negotiations)
- **Staking Rewards**: 20% (governance participation)
- **Development**: 15% (platform development)

### Deployment

```bash
# Deploy to testnet
make deploy-testnet

# Deploy to mainnet (production)
make deploy-mainnet
```

## 🤖 AI/ML Pipeline

### Violation Detection

```python
# GDPR response analysis
violations = await violation_detector.analyze(gdpr_response)

# Types detected:
# - Excessive fees (>100% markup)
# - Undisclosed data collection  
# - GDPR violations
# - Discriminatory practices
```

### Settlement Optimization

```rust
// AI-powered settlement calculation
let optimal_settlement = ai_client
    .calculate_optimal_settlement(
        debt.current_amount,
        leverage_score,
        violation_count,
    )
    .await?;
```

## 📊 Monitoring & Observability

### Metrics (Prometheus)

- Business: GDPR requests sent, violations detected, debt reduced
- Technical: API latency, error rates, blockchain transactions
- User: Active users, engagement, settlement success rate

### Dashboards (Grafana)

- Real-time system health
- Business KPI tracking  
- User behavior analytics
- Blockchain transaction monitoring

### Logging

```typescript
// Structured logging with correlation IDs
logger.info('GDPR request generated', {
  userId: user.id,
  creditorId: creditor.id,
  requestId: gdpr.referenceId,
  correlationId: req.correlationId
})
```

## 🧪 Testing Strategy

### Test Pyramid

```bash
# Unit tests (fast, isolated)
npm run test:unit

# Integration tests (API endpoints)
npm run test:integration

# E2E tests (full user flows)
npm run test:e2e

# Smart contract tests
cd smart-contracts && cabal test

# Load testing
npm run test:load
```

### Test Data

```sql
-- Seeded Norwegian creditors
INSERT INTO creditors (name, type) VALUES 
('Lindorff AS', 'inkasso'),
('B2 Impact AS', 'inkasso'),
('DNB Bank ASA', 'bank'),
('Klarna Bank AB', 'bnpl');
```

## 🚀 Deployment

### Development

```bash
make dev  # Local development with hot reload
```

### Staging

```bash
# Docker Compose with production-like setup
docker-compose -f docker-compose.staging.yml up
```

### Production (Azure)

```bash
# Terraform infrastructure
cd infrastructure/terraform
terraform apply -var-file=prod.tfvars

# Kubernetes deployment
kubectl apply -f infrastructure/kubernetes/
```

## 📚 API Documentation

### Core Endpoints

```yaml
# Authentication
POST /api/auth/register    # Register with BankID
POST /api/auth/login       # Login
POST /api/auth/refresh     # Refresh token

# User Management  
GET  /api/users/profile    # Get user profile
GET  /api/users/stats      # Get user statistics

# Debt Management
POST /api/debts            # Add new debt
GET  /api/debts            # List user's debts
GET  /api/debts/:id        # Get specific debt

# GDPR Automation
POST /api/gdpr/generate    # Generate GDPR request
POST /api/gdpr/send/:id    # Send GDPR request
GET  /api/gdpr/requests    # List GDPR requests

# Violations
GET  /api/violations       # List detected violations
POST /api/violations/verify # Verify violation

# Settlements
POST /api/settlements/propose # Propose settlement
POST /api/settlements/accept  # Accept settlement
```

## 🛡️ GDPR Compliance

### Data Rights Implementation

- **Right to Access**: Automated data export
- **Right to Rectification**: Profile update APIs
- **Right to Erasure**: Account deletion with crypto proof
- **Right to Portability**: JSON export functionality
- **Right to Object**: Opt-out mechanisms

### Privacy by Design

- Data minimization (only collect necessary data)
- Purpose limitation (clear use cases)
- Storage limitation (automatic deletion)
- Pseudonymization (hash personal identifiers)

## 🌍 Norwegian Market Context

### Regulatory Environment

- **Inkassoloven**: Debt collection regulations
- **Finanstilsynet**: Financial supervision
- **Datatilsynet**: Data protection authority
- **Forbrukertilsynet**: Consumer protection

### Target Market

- **500,000+** Norwegians in debt situations
- **30-70%** illegal fees above actual costs
- **€2.3B** annual debt collection market
- **High digital adoption** (BankID usage: 95%+)

## 🤝 Contributing

### Development Workflow

1. **Fork & Branch**: Create feature branch from `develop`
2. **Develop**: Write code with tests
3. **Quality**: Run `make lint` and `make test`
4. **PR**: Submit pull request with description
5. **Review**: Address feedback from maintainers
6. **Merge**: Squash merge to `develop`

### Code Standards

- **TypeScript**: Strict mode, explicit types
- **Python**: Black formatting, type hints
- **Rust**: Clippy linting, comprehensive tests
- **Haskell**: HLint compliance, documentation

### Commit Convention

```
feat: add GDPR request automation
fix: resolve settlement calculation bug
docs: update API documentation
test: add integration tests for violations
```

## 📞 Support & Community

- **Documentation**: https://docs.damocles.no
- **Issues**: GitHub Issues
- **Discord**: https://discord.gg/damocles
- **Email**: support@damocles.no

---

**"Every User Protected. Every Violation Recorded. Every Sword Ready."**

Built with ❤️ for Norwegian consumer justice.