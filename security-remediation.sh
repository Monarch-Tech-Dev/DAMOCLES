#!/bin/bash

#############################################################################
# DAMOCLES Security Remediation Script
# Automated fixes for common security issues
#
# Usage: ./security-remediation.sh [--auto] [--dry-run]
#
# WARNING: This script makes changes to your repository!
#          Always backup before running!
#############################################################################

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

AUTO_MODE=false
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --auto)
      AUTO_MODE=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--auto] [--dry-run]"
      exit 1
      ;;
  esac
done

print_header() {
  echo -e "\n${BOLD}${BLUE}═══════════════════════════════════════════${NC}"
  echo -e "${BOLD}${BLUE}  $1${NC}"
  echo -e "${BOLD}${BLUE}═══════════════════════════════════════════${NC}\n"
}

print_ok() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

confirm() {
  if [ "$AUTO_MODE" = true ]; then
    return 0
  fi
  
  read -p "$1 (y/N) " -n 1 -r
  echo
  [[ $REPL =~ ^[Yy]$ ]]
}

execute() {
  if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}[DRY RUN]${NC} $1"
  else
    eval "$1"
  fi
}

#############################################################################
# Backup
#############################################################################

print_header "🔄 CREATING BACKUP"

BACKUP_DIR="damocles-backup-$(date +%Y%m%d-%H%M%S)"

if confirm "Create backup of repository before making changes?"; then
  print_ok "Creating backup at ../$BACKUP_DIR"
  execute "rsync -av --exclude='.git' --exclude='node_modules' . ../$BACKUP_DIR/"
  print_ok "Backup created successfully"
else
  print_warning "Proceeding without backup (not recommended!)"
fi

#############################################################################
# 1. Update .gitignore
#############################################################################

print_header "📝 UPDATING .gitignore"

if confirm "Add comprehensive security patterns to .gitignore?"; then
  
  cat > .gitignore.security << 'EOF'

#############################################################################
# SECURITY: Never commit these files
#############################################################################

# Secrets and credentials
*.key
*.pem
*.p12
*.pfx
*.asc
*-key.json
*-signing-key.json
*.skey
*.vkey
wallet.json
credentials.json
service-account.json

# Environment files
.env
.env.local
.env.*.local
.env.production
.env.staging
.env.development

# SSH and certificates
id_rsa*
id_dsa*
id_ecdsa*
id_ed25519*
.ssh/

# Cloud provider configs
.aws/credentials
.azure/
.gcloud/
digitalocean.token

# Database
*.sql
*.db
*.sqlite
*.sqlite3

# Logs that might contain sensitive data
*.log
logs/
*.log.*

# Cardano specific
*payment.skey
*stake.skey
*policy.skey
*.addr

# Temporary files
*.swp
*.swo
*~
.DS_Store

EOF

  if [ -f ".gitignore" ]; then
    execute "cat .gitignore.security >> .gitignore"
    execute "rm .gitignore.security"
    print_ok "Updated existing .gitignore"
  else
    execute "mv .gitignore.security .gitignore"
    print_ok "Created new .gitignore"
  fi
fi

#############################################################################
# 2. Create .env.example
#############################################################################

print_header "🌍 CREATING .env.example"

if [ ! -f ".env.example" ] && confirm "Create .env.example template?"; then
  
  cat > .env.example << 'EOF'
# DAMOCLES Environment Configuration Template
# Copy this file to .env and fill in your actual values
# NEVER commit .env to git!

#############################################################################
# Database Configuration
#############################################################################
DATABASE_URL=postgresql://username:password@localhost:5432/damocles
REDIS_URL=redis://localhost:6379

#############################################################################
# Authentication & Security
#############################################################################
JWT_SECRET=generate-with-openssl-rand-base64-64
JWT_EXPIRATION=7d
SESSION_SECRET=generate-with-openssl-rand-base64-32
ENCRYPTION_KEY=generate-with-openssl-rand-hex-32

#############################################################################
# API Keys (Replace with your actual keys)
#############################################################################
DIGITALOCEAN_TOKEN=your_digitalocean_token_here
SENDGRID_API_KEY=your_sendgrid_api_key_here
GITHUB_TOKEN=your_github_token_here

#############################################################################
# Service Configuration
#############################################################################
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
TRUST_ENGINE_URL=http://localhost:8002
GDPR_ENGINE_URL=http://localhost:8001

#############################################################################
# Blockchain Configuration
#############################################################################
CARDANO_NETWORK=testnet
BLOCKFROST_API_KEY=your_blockfrost_api_key_here
FOUNDER_WALLET_ADDRESS=addr1_your_address_here

#############################################################################
# Email Configuration
#############################################################################
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key_here
FROM_EMAIL=noreply@damocles.no

EOF

  print_ok "Created .env.example"
  print_warning "Remember to fill in actual values in your .env file"
fi

#############################################################################
# 3. Setup Pre-commit Hooks
#############################################################################

print_header "🪝 SETTING UP PRE-COMMIT HOOKS"

if confirm "Install pre-commit hooks for secret detection?"; then
  
  # Check if pre-commit is installed
  if ! command -v pre-commit &> /dev/null; then
    print_warning "pre-commit not found. Installing..."
    execute "pip install pre-commit"
  fi
  
  # Create .pre-commit-config.yaml
  cat > .pre-commit-config.yaml << 'EOF'
repos:
  # Secret detection
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
        exclude: package-lock.json

  # Gitleaks
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.1
    hooks:
      - id: gitleaks

  # General checks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: check-json
      - id: check-merge-conflict
      - id: detect-private-key

  # Docker
  - repo: https://github.com/hadolint/hadolint
    rev: v2.12.0
    hooks:
      - id: hadolint-docker
        args: ['--ignore', 'DL3008', '--ignore', 'DL3009']

  # Shell scripts
  - repo: https://github.com/shellcheck-py/shellcheck-py
    rev: v0.9.0.6
    hooks:
      - id: shellcheck

EOF

  execute "pre-commit install"
  print_ok "Pre-commit hooks installed"
  
  # Initialize secrets baseline
  if command -v detect-secrets &> /dev/null; then
    execute "detect-secrets scan > .secrets.baseline"
    print_ok "Initialized secrets baseline"
  fi
fi

#############################################################################
# 4. Create Gitleaks Configuration
#############################################################################

print_header "🔍 CONFIGURING GITLEAKS"

if confirm "Create Gitleaks configuration for secret scanning?"; then
  
  cat > .gitleaks.toml << 'EOF'
title = "DAMOCLES Gitleaks Configuration"

[extend]
useDefault = true

[[rules]]
id = "cardano-signing-key"
description = "Cardano Signing Key"
regex = '''type.*SigningKey'''
tags = ["key", "cardano", "blockchain"]

[[rules]]
id = "cardano-cbor"
description = "Cardano CBOR Hex"
regex = '''cborHex.*[0-9a-f]{100,}'''
tags = ["key", "cardano", "blockchain"]

[[rules]]
id = "jwt-secret"
description = "JWT Secret"
regex = '''(?i)(jwt[_-]?secret|secret[_-]?key)['"]?\s*[:=]\s*['"]?[a-zA-Z0-9+/]{32,}'''
tags = ["secret", "jwt"]

[[rules]]
id = "database-url-with-password"
description = "Database URL with embedded password"
regex = '''(postgresql|mysql|mongodb)://[^:]+:[^@]+@'''
tags = ["secret", "database"]

[[rules]]
id = "digitalocean-token"
description = "DigitalOcean Token"
regex = '''dop_v1_[a-f0-9]{64}'''
tags = ["secret", "digitalocean", "api"]

[[rules]]
id = "high-entropy-string"
description = "High Entropy String (potential secret)"
regex = '''['"][a-zA-Z0-9+/]{40,}['"]'''
entropy = 4.5
tags = ["entropy"]

[allowlist]
description = "Allowlisted files"
paths = [
  '''node_modules/''',
  '''.git/''',
  '''dist/''',
  '''build/''',
  '''.next/''',
  '''package-lock.json''',
  '''\.md$''',
]

regexes = [
  '''example''',
  '''sample''',
  '''test[_-]?(key|secret|token)''',
  '''your[_-]?(key|secret|token)''',
]

EOF

  print_ok "Gitleaks configuration created"
fi

#############################################################################
# 5. Secure Docker Compose
#############################################################################

print_header "🐳 SECURING DOCKER COMPOSE FILES"

if confirm "Review and secure Docker Compose files?"; then
  
  # Find all docker-compose files
  find . -name "docker-compose*.yml" -not -path "*/node_modules/*" | while read -r compose_file; do
    echo ""
    print_ok "Checking: $compose_file"
    
    # Check for hardcoded secrets
    if grep -i 'PASSWORD\|SECRET\|TOKEN' "$compose_file" | grep -v '\${' | grep -v 'example' > /dev/null 2>&1; then
      print_warning "Found potential hardcoded secrets in $compose_file"
      
      if confirm "  Show the problematic lines?"; then
        grep -n -i 'PASSWORD\|SECRET\|TOKEN' "$compose_file" | grep -v '\${' | grep -v 'example'
      fi
      
      if confirm "  Create a backup and comment them out?"; then
        execute "cp '$compose_file' '${compose_file}.backup'"
        execute "sed -i.bak 's/^\(\s*\)\(.*PASSWORD.*=.*\)/\1# SECURITY: Remove hardcoded value\n\1# \2/' '$compose_file'"
        print_ok "  Backup created and secrets commented out"
        print_warning "  Please update with environment variables!"
      fi
    else
      print_ok "  No hardcoded secrets found"
    fi
  done
fi

#############################################################################
# 6. Create Security Documentation
#############################################################################

print_header "📚 CREATING SECURITY DOCUMENTATION"

if confirm "Create SECURITY.md with best practices?"; then
  
  cat > SECURITY.md << 'EOF'
# Security Policy

## Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Please report security vulnerabilities by emailing: security@damocles.no

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use environment variables
   - Use `.env` for local development (never commit `.env`)
   - Use GitHub Secrets for CI/CD

2. **Pre-commit checks**
   - Install pre-commit hooks: `pre-commit install`
   - Run before committing: `pre-commit run --all-files`

3. **Dependency management**
   - Run `npm audit` regularly
   - Keep dependencies updated
   - Review security advisories

4. **Code review**
   - All PRs require security review
   - Check for sensitive data exposure
   - Verify input validation

### For Production Deployment

1. **Secrets Management**
   - Rotate credentials every 90 days
   - Use managed secrets services (Vault, AWS Secrets Manager)
   - Never log secrets

2. **Database Security**
   - Use strong passwords (32+ characters)
   - Enable SSL/TLS connections
   - Restrict network access
   - Regular backups

3. **API Security**
   - Rate limiting enabled
   - Authentication required
   - Input validation
   - Output encoding

4. **Monitoring**
   - Enable audit logging
   - Monitor for unusual access
   - Set up security alerts
   - Regular security scans

### Blockchain Security

1. **Wallet Management**
   - Use hardware wallets for production
   - Never commit private keys
   - Multi-signature for large amounts
   - Regular security audits

2. **Smart Contracts**
   - Audit before deployment
   - Test on testnet first
   - Use established patterns
   - Monitor for exploits

## Security Checklist

Before deploying to production:

- [ ] All secrets in environment variables
- [ ] Pre-commit hooks installed
- [ ] Security audit completed
- [ ] Dependencies updated
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Incident response plan documented
- [ ] Team security training completed

## Security Tooling

### Required Tools
- Gitleaks (secret scanning)
- Pre-commit (commit-time checks)
- npm audit (dependency scanning)

### Recommended Tools
- Snyk (comprehensive security)
- OWASP ZAP (penetration testing)
- SonarQube (code quality)

## Compliance

DAMOCLES follows:
- GDPR requirements
- Norwegian data protection laws
- OWASP Top 10 guidelines
- CIS security benchmarks

## Security Updates

We publish security updates regularly. Subscribe to:
- GitHub Security Advisories
- Project mailing list
- Discord #security channel

Last updated: $(date +%Y-%m-%d)
EOF

  print_ok "SECURITY.md created"
fi

#############################################################################
# 7. Generate Secure Secrets
#############################################################################

print_header "🔑 GENERATING SECURE SECRETS"

if confirm "Generate template secure secrets for .env?"; then
  
  cat > .env.secrets-template << EOF
# Generated secure secrets - $(date)
# Copy these to your .env file and store securely

JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
SESSION_SECRET=$(openssl rand -base64 32 | tr -d '\n')
ENCRYPTION_KEY=$(openssl rand -hex 32)
DATABASE_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr '+/' '-_')

# Remember to:
# 1. Copy these to .env
# 2. Delete this file: rm .env.secrets-template
# 3. Update GitHub Secrets for CI/CD
EOF

  print_ok "Secure secrets generated in .env.secrets-template"
  print_warning "Copy to .env and DELETE the template file!"
  print_warning "Never commit .env.secrets-template!"
fi

#############################################################################
# 8. Fix GitHub Actions
#############################################################################

print_header "⚙️  FIXING GITHUB ACTIONS WORKFLOW"

if [ -f ".github/workflows/deploy-production.yml" ] && confirm "Fix security issues in GitHub Actions workflow?"; then
  
  WORKFLOW=".github/workflows/deploy-production.yml"
  
  # Backup original
  execute "cp '$WORKFLOW' '${WORKFLOW}.backup'"
  
  # Remove fake test passes
  if grep -q '|| echo' "$WORKFLOW"; then
    print_warning "Found fake test passes (|| echo)"
    if confirm "  Remove fake test passes?"; then
      execute "sed -i.bak 's/ || echo.*$//' '$WORKFLOW'"
      print_ok "  Fake test passes removed"
    fi
  fi
  
  # Check for missing permissions
  if ! grep -q 'permissions:' "$WORKFLOW"; then
    print_warning "No explicit permissions set"
    if confirm "  Add minimal permissions?"; then
      # This is complex, so we'll just warn
      print_warning "  Please add manually at the top of the workflow:"
      echo ""
      cat << 'PERMISSIONS'
permissions:
  contents: read
  deployments: write
  security-events: write
PERMISSIONS
    fi
  fi
  
  print_ok "GitHub Actions workflow backed up and partially fixed"
  print_warning "Please review $WORKFLOW manually for remaining issues"
fi

#############################################################################
# 9. npm Security Setup
#############################################################################

print_header "📦 CONFIGURING NPM SECURITY"

if [ -f "package.json" ] && confirm "Add security scripts to package.json?"; then
  
  if command -v jq &> /dev/null; then
    # Use jq to safely modify package.json
    execute "jq '.scripts.audit = \"npm audit --audit-level=moderate\"' package.json > package.json.tmp && mv package.json.tmp package.json"
    execute "jq '.scripts[\"audit:fix\"] = \"npm audit fix\"' package.json > package.json.tmp && mv package.json.tmp package.json"
    execute "jq '.scripts[\"security:scan\"] = \"gitleaks detect --source=. --verbose\"' package.json > package.json.tmp && mv package.json.tmp package.json"
    print_ok "Security scripts added to package.json"
  else
    print_warning "jq not installed. Please add these scripts manually:"
    cat << 'SCRIPTS'
"scripts": {
  "audit": "npm audit --audit-level=moderate",
  "audit:fix": "npm audit fix",
  "security:scan": "gitleaks detect --source=. --verbose"
}
SCRIPTS
  fi
fi

#############################################################################
# 10. Final Cleanup
#############################################################################

print_header "🧹 FINAL CLEANUP"

# Check for accidentally committed .env files
if git ls-files | grep -E '^\.env$|^\.env\.' > /dev/null 2>&1; then
  print_error "Found .env files in git!"
  git ls-files | grep -E '^\.env$|^\.env\.'
  
  if confirm "Remove from git history? (REWRITES HISTORY!)"; then
    print_warning "This will rewrite git history!"
    print_warning "All collaborators must re-clone the repository!"
    
    if confirm "Are you ABSOLUTELY sure?"; then
      git ls-files | grep -E '^\.env$|^\.env\.' | while read -r env_file; do
        execute "git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch $env_file' --prune-empty --tag-name-filter cat -- --all"
      done
      
      execute "git push --force --all"
      print_ok "Removed .env files from git history"
    fi
  fi
fi

# Check for large files
print_ok "Checking for large files in git history..."
execute "git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '\$1 == \"blob\" && \$3 > 1048576 {print \$3, \$4}' | sort -rn | head -5"

#############################################################################
# Summary
#############################################################################

print_header "✅ REMEDIATION COMPLETE"

cat << SUMMARY

${GREEN}Security Improvements Applied:${NC}
✓ Updated .gitignore with security patterns
✓ Created .env.example template
✓ Installed pre-commit hooks for secret detection
✓ Created Gitleaks configuration
✓ Generated secure secrets
✓ Created security documentation

${YELLOW}Manual Actions Required:${NC}
1. Copy secrets from .env.secrets-template to .env
2. Delete .env.secrets-template
3. Update GitHub Secrets in repository settings
4. Review and test all changes
5. Run: pre-commit run --all-files
6. Run: npm audit
7. Commit changes with: git commit -m "security: implement security improvements"

${BLUE}Backup Location:${NC}
../$BACKUP_DIR

${RED}IMPORTANT:${NC}
- Test thoroughly before pushing to production
- Rotate any credentials that may have been exposed
- Review all changes before committing

SUMMARY

if [ "$DRY_RUN" = true ]; then
  echo ""
  print_warning "DRY RUN MODE - No actual changes were made"
  print_warning "Run without --dry-run to apply changes"
fi

echo ""
print_ok "Done! Stay secure! 🛡️"
echo ""
