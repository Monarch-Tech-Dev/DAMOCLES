# 🛡️ DAMOCLES Security Audit - Quick Start Guide

## 📋 What You've Received

Three comprehensive security scripts:

1. **`security-audit.sh`** - Comprehensive vulnerability scanner
2. **`security-remediation.sh`** - Automated fixes
3. **`git-history-cleaner.sh`** - Remove secrets from git history

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Make Scripts Executable

```bash
chmod +x security-audit.sh
chmod +x security-remediation.sh
chmod +x git-history-cleaner.sh
```

### Step 2: Run Initial Scan

```bash
# Quick scan
./security-audit.sh

# Deep scan with full report
./security-audit.sh --deep --output security-report.txt
```

### Step 3: Review Results

The script will show:
- 🔴 **CRITICAL** - Fix immediately
- 🟠 **HIGH** - Fix soon
- 🟡 **MEDIUM** - Fix when possible
- 🔵 **LOW** - Consider fixing

---

## 🔥 If Secrets Were Found

### IMMEDIATE ACTIONS (Do this NOW!)

```bash
# 1. Rotate ALL exposed credentials immediately
# Examples:

# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate new API key
openssl rand -base64 32

# Update in:
# - .env file (local)
# - GitHub Secrets (CI/CD)
# - DigitalOcean (production)
# - Any other systems using these credentials
```

### THEN: Apply Automated Fixes

```bash
# Dry run to see what will change
./security-remediation.sh --dry-run

# Apply fixes
./security-remediation.sh

# Auto-apply all fixes without prompts
./security-remediation.sh --auto
```

---

## 🧹 Clean Git History (DANGEROUS!)

**⚠️ Only if secrets were committed to git!**

```bash
# This rewrites git history - read the warnings!
./git-history-cleaner.sh
```

**Consequences:**
- All commit SHAs change
- All collaborators must re-clone
- Pull requests will break
- Cannot be easily undone

---

## 📊 What Each Script Does

### security-audit.sh

**Scans for:**
- ✓ Exposed secrets (AWS keys, API tokens, passwords)
- ✓ Private keys (SSH, blockchain, certificates)
- ✓ Database connection strings with passwords
- ✓ JWT secrets and encryption keys
- ✓ Cardano wallet private keys
- ✓ DigitalOcean and cloud provider tokens
- ✓ Hardcoded credentials in Docker/deployment files
- ✓ Environment files (.env) in git
- ✓ CI/CD security issues
- ✓ Fake test passes in GitHub Actions
- ✓ Git history for secrets (deep scan)
- ✓ Dependency vulnerabilities (deep scan)

**Output:**
- Issues categorized by severity
- File locations of problems
- Line numbers for easy fixing
- Remediation recommendations

### security-remediation.sh

**Automatically fixes:**
- ✓ Updates .gitignore with security patterns
- ✓ Creates .env.example template
- ✓ Installs pre-commit hooks (secret detection)
- ✓ Configures Gitleaks for secret scanning
- ✓ Secures Docker Compose files
- ✓ Generates secure secrets
- ✓ Fixes GitHub Actions workflow issues
- ✓ Creates SECURITY.md documentation
- ✓ Adds security scripts to package.json

### git-history-cleaner.sh

**Removes secrets from git history using:**
- BFG Repo-Cleaner (recommended)
- git-filter-repo (thorough)
- git filter-branch (built-in)

**Includes:**
- Pre-flight safety checks
- Automatic backup creation
- Secret pattern detection
- Verification with gitleaks
- Force push instructions

---

## 🎯 Recommended Workflow

### First Time Setup

```bash
# 1. Initial scan
./security-audit.sh --deep --output initial-scan.txt

# 2. Apply automated fixes
./security-remediation.sh

# 3. Install security tools
npm install
pip install pre-commit gitleaks detect-secrets

# 4. Configure pre-commit hooks
pre-commit install
pre-commit run --all-files

# 5. Verify no secrets remain
./security-audit.sh --output post-remediation.txt
```

### Regular Maintenance

```bash
# Weekly
npm audit
pre-commit run --all-files

# Monthly
./security-audit.sh --output monthly-$(date +%Y-%m).txt
npm update
pip list --outdated

# Quarterly
./security-audit.sh --deep --output quarterly-$(date +%Y-Q%q).txt
```

---

## 🔧 Tool Installation

### Required Tools

```bash
# macOS
brew install gitleaks pre-commit bfg

# Linux
pip install pre-commit gitleaks
apt-get install bfg

# Universal (Python)
pip install pre-commit detect-secrets safety
```

### Optional But Recommended

```bash
# Additional security tools
npm install -g snyk
brew install trivy
pip install bandit  # Python security
```

---

## 📝 Post-Scan Checklist

### If NO Secrets Found ✅

- [ ] Run remediation script anyway for preventive measures
- [ ] Set up pre-commit hooks
- [ ] Enable GitHub secret scanning
- [ ] Schedule regular scans (monthly)
- [ ] Update team security guidelines

### If Secrets Found 🚨

#### CRITICAL Priority (Do TODAY)

- [ ] Rotate ALL exposed credentials
- [ ] Update production systems with new credentials
- [ ] Update GitHub Secrets
- [ ] Check logs for unauthorized access
- [ ] Notify security team/stakeholders

#### HIGH Priority (Do This Week)

- [ ] Clean git history with git-history-cleaner.sh
- [ ] Force push cleaned history
- [ ] Notify all collaborators to re-clone
- [ ] Run post-cleanup verification scan
- [ ] Enable secret scanning on GitHub
- [ ] Install pre-commit hooks

#### MEDIUM Priority (Do This Month)

- [ ] Implement proper secrets management (Vault/AWS)
- [ ] Set up automated security scanning in CI/CD
- [ ] Create incident response documentation
- [ ] Conduct security training for team
- [ ] Review and update security policies

---

## 🎓 Security Best Practices

### For Development

```bash
# NEVER do this ❌
const apiKey = "abc123xyz789";
const dbUrl = "postgresql://user:pass@localhost/db";

# ALWAYS do this ✅
const apiKey = process.env.API_KEY;
const dbUrl = process.env.DATABASE_URL;
```

### For Environment Files

```bash
# File structure
.env                    # Your secrets (NEVER commit)
.env.example            # Template (SAFE to commit)
.env.local              # Local overrides (NEVER commit)
.env.production         # Production (NEVER commit)

# .gitignore should have:
.env
.env.local
.env.*.local
```

### For Blockchain

```bash
# NEVER commit these files
*.skey                  # Signing keys
*.vkey                  # Verification keys  
wallet.json             # Wallet data
*payment.skey           # Payment keys
*stake.skey             # Staking keys

# Storage options (in order of security):
1. Hardware wallet (Ledger/Trezor)
2. Encrypted USB drive (offline)
3. Cloud HSM (AWS CloudHSM)
4. Encrypted file with strong passphrase
```

---

## 🆘 Emergency Response

### If Secrets Are Publicly Exposed

**Immediate (Within 1 Hour):**

1. **Revoke credentials** in all systems
2. **Check access logs** for unauthorized use
3. **Generate new credentials**
4. **Update all systems** with new credentials
5. **Document the incident**

**Same Day:**

6. **Clean git history** (if applicable)
7. **Force push cleaned repo**
8. **Notify collaborators**
9. **Enable secret scanning**
10. **Review security policies**

**Within Week:**

11. **Incident post-mortem**
12. **Update security training**
13. **Implement preventive measures**
14. **Consider security audit**

### Contact Information

- **GitHub Issues:** For non-sensitive questions
- **Email:** security@damocles.no (for sensitive issues)
- **Discord:** #security channel

---

## 📚 Additional Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security](https://docs.github.com/en/code-security)
- [Gitleaks Docs](https://github.com/gitleaks/gitleaks)
- [Pre-commit Hooks](https://pre-commit.com/)

### Tools
- [Gitleaks](https://github.com/gitleaks/gitleaks) - Secret scanning
- [TruffleHog](https://github.com/trufflesecurity/trufflehog) - Find secrets
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) - Clean history
- [Snyk](https://snyk.io/) - Dependency scanning

### Cardano Security
- [Cardano Security Best Practices](https://docs.cardano.org/)
- [Hardware Wallet Guide](https://www.ledger.com/)

---

## 💡 Pro Tips

1. **Run scans before every release**
   ```bash
   ./security-audit.sh && npm test && git push
   ```

2. **Add to git pre-push hook**
   ```bash
   echo "./security-audit.sh --quick || exit 1" >> .git/hooks/pre-push
   chmod +x .git/hooks/pre-push
   ```

3. **Integrate with CI/CD**
   ```yaml
   - name: Security Scan
     run: |
       ./security-audit.sh
       gitleaks detect --source=. --verbose
   ```

4. **Regular credential rotation**
   ```bash
   # Add to calendar: First Monday of every quarter
   - Rotate all API keys
   - Update database passwords
   - Regenerate JWT secrets
   ```

---

## ✅ Success Criteria

You're secure when:

- ✅ Security audit shows 0 critical issues
- ✅ Pre-commit hooks are installed and working
- ✅ All secrets are in environment variables
- ✅ GitHub secret scanning is enabled
- ✅ Regular scans are scheduled
- ✅ Team is trained on security practices
- ✅ Incident response plan is documented

---

## 🎉 You're All Set!

Run the security audit now and make your codebase fortress-level secure! 🛡️

```bash
./security-audit.sh --deep --output security-report.txt
```

Remember: **Security is a journey, not a destination.** Regular scans and vigilance keep your project safe! 

Stay secure! 🔐
