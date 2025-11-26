# DAMOCLES

**Decentralized Automated MOney CLaims Enforcement System**

---

## Sacred Architecture Covenant

This platform is built under the [Developer Vow of Use](VOW.md) — a commitment to build technology that serves consciousness and preserves human dignity.

Read our [Manifesto](docs/MANIFESTO.md).

---

## The Core Idea

GDPR gives you a legal right to request all data a creditor holds about you. They must comply or face penalties.

This is powerful leverage in debt disputes:

1. **Request your data** — Send a GDPR Subject Access Request to any creditor
2. **They must respond** — Non-compliance is itself a violation with real consequences
3. **Their response reveals weaknesses:**
   - Missing documentation → their claim is weak
   - Contradictions between documents → basis for challenge
   - Procedural violations → leverage for negotiation or dismissal
4. **Build your case** — Every response (or non-response) becomes evidence

DAMOCLES automates this process: generates the legal letters, tracks deadlines, detects contradictions, stores evidence immutably, and learns from outcomes to improve success rates for everyone.

---

## How It Works

### For Users

1. **Add your debt** — Enter creditor details and claim information
2. **Generate GDPR request** — Platform creates compliant legal letter (Norwegian templates)
3. **Send and track** — Monitor response deadlines automatically
4. **Analyze response** — AI detects contradictions and violations
5. **Build leverage** — Use findings to negotiate fair resolution

### What the Platform Detects

- **Missing documentation** — Creditor can't produce original agreement
- **Calculation errors** — Interest or fees don't match claimed amounts
- **Procedural violations** — Missed notification requirements, wrong processes
- **Data inconsistencies** — Contradictions across their own documents
- **GDPR non-compliance** — Late response, incomplete data, unlawful processing

---

## Platform Architecture

### Core Services

| Service | Description |
|---------|-------------|
| **Web App** | Next.js 14 dashboard for case management |
| **User Service** | Fastify API with JWT authentication |
| **GDPR Engine** | Python automation with Norwegian legal templates |
| **Trust Engine** | Contradiction detection with legal authority weighting |
| **PDI Engine** | Personal Debt Index with vulnerability protections |
| **Learning Engine** | Collective intelligence — templates improve from outcomes |
| **Communication Hub** | Email management with response parsing |

### Collective Learning

Every case outcome feeds back into the system:
- Which letter variations get better responses from specific creditors
- Common violation patterns by institution
- Optimal negotiation strategies based on debt type

Success rates improve as the user base grows. Early data shows template effectiveness improving from ~20% to ~85% with optimization.

---

## Token Economics (SWORD)

The token layer incentivizes participation and development. It's not the product — GDPR automation is.

### Distribution (1B total supply)

| Allocation | Amount | Purpose |
|------------|--------|---------|
| Evidence Mining | 250M (25%) | Rewards for users submitting cases |
| Developer Incentives | 200M (20%) | Bounties for contributions |
| Settlement Treasury | 150M (15%) | Funds for legal actions |
| Legal Reserve | 120M (12%) | Class action and defense fund |
| Staking Rewards | 100M (10%) | Platform participation |
| Development Team | 80M (8%) | 2-year vesting |
| Founder | 50M (5%) | 36-month vesting |
| Community Airdrops | 30M (3%) | User acquisition |
| Liquidity | 20M (2%) | Exchange liquidity |

### Earning

**Users:** Submit GDPR issues (100-1,000 SWORD), identify violations (500-10,000 SWORD), successful settlements (10% of resolved amount)

**Developers:** Bug fixes (100-10,000 SWORD), features (500-20,000 SWORD), security findings (up to 250,000 SWORD)

---

## Quick Start

```bash
# Clone
git clone https://github.com/Monarch-Tech-Dev/DAMOCLES.git
cd DAMOCLES

# Install and run
npm install && npm run dev

# Open dashboard
open http://localhost:3001
```

### Prerequisites

Node.js 18+ | Python 3.9+ | SQLite (dev) | Redis 6+

### Development Commands

```bash
npm run dev           # Full platform
npm run dev:web       # Web interface (port 3001)
npm run dev:user      # User API (port 3000)
npm run dev:gdpr      # GDPR engine (port 8001)
```

---

## Current Status

**What's working:**
- Debt management dashboard
- GDPR letter generation (Norwegian templates)
- Violation detection engine
- Trust scoring with contradiction analysis
- Learning system for template optimization
- Email automation with response parsing

**In progress:**
- BankID integration (Norwegian identity verification)
- Production deployment
- Smart contract infrastructure

**Target:** Q1 2025 beta

---

## Contributing

```bash
# Fork and clone
git fork https://github.com/Monarch-Tech-Dev/DAMOCLES.git

# Pick an issue, build, submit PR
# Earn SWORD based on contribution impact
```

### Bounties

- Platform enhancement: 50,000 SWORD
- Service integration: 25,000 SWORD
- UI components: 10,000 SWORD
- Documentation: 1,000 SWORD

---

## Security

- **AGPL-3.0 License** — Platform stays open source; forks must also be open
- **Bug bounty** — Up to 250,000 SWORD for security findings
- **Multi-layer audits** — Smart contracts, infrastructure, legal review
- **Distributed governance** — No single point of control

---

## Legal Notice

DAMOCLES provides automated tools for exercising your legal rights under GDPR. It does not provide legal advice. For complex situations, consult a qualified lawyer.

The platform is designed for compliance with Norwegian financial regulations and GDPR.

---

## Support the Project

**Founder wallet (Cardano):**
```
addr1q82l2xf222f965h247nqrd6luhplqw9770r6sed7thlc4srlv4gzct3njfv8z2lnh540s0vngk4gnquxghxp835nn74szyuu2a
```

---

## License

**AGPL-3.0** — If you fork this, your fork must also be open source.

---

## Links

- **GitHub:** [Monarch-Tech-Dev/DAMOCLES](https://github.com/Monarch-Tech-Dev/DAMOCLES)
- **Discord:** Coming soon
