#!/bin/bash

#############################################################################
# Git History Secrets Removal Script
# DANGEROUS: This rewrites git history!
#
# Usage: ./git-history-cleaner.sh
#
# This script helps remove secrets from git history safely
#############################################################################

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

print_header() {
  echo -e "\n${BOLD}${RED}═══════════════════════════════════════════${NC}"
  echo -e "${BOLD}${RED}  $1${NC}"
  echo -e "${BOLD}${RED}═══════════════════════════════════════════${NC}\n"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_ok() {
  echo -e "${GREEN}✓${NC} $1"
}

#############################################################################
# Safety Checks
#############################################################################

print_header "🚨 GIT HISTORY REWRITING - DANGER ZONE"

cat << 'WARNING'
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                       ⚠️  WARNING ⚠️                            ║
║                                                               ║
║  This script will REWRITE your git history!                  ║
║                                                               ║
║  CONSEQUENCES:                                                ║
║  • All commit SHAs will change                                ║
║  • All collaborators MUST re-clone the repository             ║
║  • Pull requests will break                                   ║
║  • Cannot be easily undone                                    ║
║                                                               ║
║  ONLY use this if secrets were committed to git!              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

WARNING

read -p "Do you understand the risks? Type 'YES I UNDERSTAND' to continue: " confirm
if [ "$confirm" != "YES I UNDERSTAND" ]; then
  echo "Aborting for safety."
  exit 1
fi

echo ""
print_warning "Last chance to abort!"
read -p "Are you ABSOLUTELY sure you want to rewrite git history? (yes/no): " final_confirm
if [ "$final_confirm" != "yes" ]; then
  echo "Aborting."
  exit 0
fi

#############################################################################
# Pre-flight Checks
#############################################################################

print_header "✈️  PRE-FLIGHT CHECKS"

# Check if we're in a git repo
if [ ! -d ".git" ]; then
  print_error "Not a git repository!"
  exit 1
fi
print_ok "Git repository detected"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  print_error "You have uncommitted changes!"
  echo ""
  echo "Please commit or stash your changes first:"
  echo "  git stash"
  echo "  OR"
  echo "  git add . && git commit -m 'Save work before history rewrite'"
  exit 1
fi
print_ok "No uncommitted changes"

# Check for untracked files
if [ -n "$(git status --porcelain)" ]; then
  print_warning "You have untracked files. Consider committing them first."
fi

# Check remote
if git remote -v | grep -q origin; then
  REMOTE_URL=$(git remote get-url origin)
  print_ok "Remote detected: $REMOTE_URL"
  print_warning "After rewriting history, you'll need to force push!"
else
  print_warning "No remote configured"
fi

#############################################################################
# Backup
#############################################################################

print_header "💾 CREATING BACKUP"

BACKUP_NAME="git-backup-$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="../${BACKUP_NAME}"

print_ok "Creating full repository backup..."
cd ..
if [ -d "$BACKUP_NAME" ]; then
  rm -rf "$BACKUP_NAME"
fi

REPO_NAME=$(basename "$(pwd)")
tar -czf "${BACKUP_NAME}.tar.gz" "$REPO_NAME"
print_ok "Backup created: ${BACKUP_DIR}.tar.gz"

cd - > /dev/null

#############################################################################
# Tool Selection
#############################################################################

print_header "🔧 SELECT CLEANUP METHOD"

echo "Available methods:"
echo "1) BFG Repo-Cleaner (Recommended - Fast and safe)"
echo "2) git-filter-repo (Python-based, very thorough)"
echo "3) git filter-branch (Built-in, slower)"
echo ""
read -p "Choose method (1-3): " method_choice

case $method_choice in
  1)
    METHOD="bfg"
    ;;
  2)
    METHOD="filter-repo"
    ;;
  3)
    METHOD="filter-branch"
    ;;
  *)
    print_error "Invalid choice"
    exit 1
    ;;
esac

#############################################################################
# Scan for Secrets
#############################################################################

print_header "🔍 SCANNING FOR SECRETS"

echo "Scanning git history for sensitive files and patterns..."
echo ""

# Create temp file for patterns
PATTERNS_FILE=$(mktemp)

# Find sensitive file patterns in history
echo "Files to potentially remove:"
git log --all --pretty=format: --name-only --diff-filter=A | \
  grep -E '\.(key|pem|p12|pfx|skey|vkey)$|\.env$|credentials|secret' | \
  sort -u > sensitive_files.txt

if [ -s sensitive_files.txt ]; then
  cat sensitive_files.txt
  echo ""
  print_warning "Found $(wc -l < sensitive_files.txt) sensitive files in history"
else
  print_ok "No obvious sensitive files found"
fi

# Create patterns file for text replacement
cat > patterns.txt << 'PATTERNS'
# Common secret patterns to replace
PASSWORD==>***REMOVED***
SECRET==>***REMOVED***
TOKEN==>***REMOVED***
API_KEY==>***REMOVED***
PRIVATE_KEY==>***REMOVED***
PATTERNS

echo ""
echo "Secret patterns to be replaced:"
cat patterns.txt
echo ""

read -p "Continue with cleanup? (yes/no): " continue_cleanup
if [ "$continue_cleanup" != "yes" ]; then
  echo "Aborting."
  rm -f sensitive_files.txt patterns.txt
  exit 0
fi

#############################################################################
# Execute Cleanup
#############################################################################

print_header "🧹 EXECUTING CLEANUP"

case $METHOD in
  bfg)
    print_ok "Using BFG Repo-Cleaner"
    
    # Check if BFG is installed
    if ! command -v bfg &> /dev/null; then
      print_error "BFG not installed!"
      echo ""
      echo "Install with:"
      echo "  macOS:   brew install bfg"
      echo "  Linux:   apt-get install bfg"
      echo "  Manual:  Download from https://rtyley.github.io/bfg-repo-cleaner/"
      exit 1
    fi
    
    # Clone mirror for BFG
    print_ok "Creating mirror clone for BFG..."
    git clone --mirror . ../repo-mirror.git
    cd ../repo-mirror.git
    
    # Remove sensitive files
    if [ -s ../DAMOCLES/sensitive_files.txt ]; then
      while read -r file; do
        print_ok "Removing: $file"
        bfg --delete-files "$(basename "$file")" .
      done < ../DAMOCLES/sensitive_files.txt
    fi
    
    # Replace text patterns
    print_ok "Replacing secret patterns..."
    bfg --replace-text ../DAMOCLES/patterns.txt .
    
    # Cleanup
    print_ok "Cleaning up references..."
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    
    # Push back to original repo
    print_ok "Updating original repository..."
    cd ../DAMOCLES
    git remote add mirror ../repo-mirror.git
    git fetch mirror
    git reset --hard mirror/main || git reset --hard mirror/master
    git remote remove mirror
    
    # Cleanup mirror
    rm -rf ../repo-mirror.git
    ;;
    
  filter-repo)
    print_ok "Using git-filter-repo"
    
    # Check if git-filter-repo is installed
    if ! command -v git-filter-repo &> /dev/null; then
      print_error "git-filter-repo not installed!"
      echo ""
      echo "Install with:"
      echo "  pip install git-filter-repo"
      exit 1
    fi
    
    # Remove sensitive files
    if [ -s sensitive_files.txt ]; then
      while read -r file; do
        print_ok "Removing: $file"
        git-filter-repo --path "$file" --invert-paths --force
      done < sensitive_files.txt
    fi
    
    # Replace patterns
    print_ok "Replacing secret patterns..."
    git-filter-repo --replace-text patterns.txt --force
    ;;
    
  filter-branch)
    print_ok "Using git filter-branch"
    print_warning "This method is slower but built into git"
    
    # Remove sensitive files
    if [ -s sensitive_files.txt ]; then
      while read -r file; do
        print_ok "Removing: $file"
        git filter-branch --force --index-filter \
          "git rm --cached --ignore-unmatch '$file'" \
          --prune-empty --tag-name-filter cat -- --all
      done < sensitive_files.txt
    fi
    
    # Cleanup
    rm -rf .git/refs/original/
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    ;;
esac

print_ok "Cleanup complete!"

#############################################################################
# Post-cleanup
#############################################################################

print_header "🔬 VERIFICATION"

echo "Repository size before/after:"
du -sh ../git-backup-*.tar.gz 2>/dev/null | tail -1 || echo "Backup size: N/A"
du -sh .git

echo ""
echo "Remaining large files in history:"
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '$1 == "blob" && $3 > 1048576 {print $3/1048576 " MB", $4}' | \
  sort -rn | head -10

echo ""
print_ok "Running gitleaks to verify secrets are removed..."
if command -v gitleaks &> /dev/null; then
  if gitleaks detect --source=. --verbose; then
    print_ok "No secrets detected in repository!"
  else
    print_error "Secrets still found! Review the output above."
  fi
else
  print_warning "Gitleaks not installed - cannot verify secrets removed"
fi

#############################################################################
# Push Instructions
#############################################################################

print_header "📤 NEXT STEPS"

cat << 'NEXTSTEPS'
✅ Git history has been rewritten!

CRITICAL: You must now force push to remote:

1. Review the changes:
   git log --oneline -20

2. Force push to remote (THIS CANNOT BE UNDONE!):
   git push origin --force --all
   git push origin --force --tags

3. Notify ALL collaborators:
   - They must delete their local clones
   - They must re-clone the repository
   - Open PRs will break and need to be recreated

4. Verify on GitHub/GitLab:
   - Check commit history
   - Verify secrets are gone
   - Update any CI/CD that caches the repo

5. Rotate compromised credentials:
   - Even though removed from git, assume they're compromised
   - Generate new secrets
   - Update all systems using old credentials

6. Enable secret scanning:
   - GitHub: Enable "Secret scanning" in Settings
   - Install pre-commit hooks: pre-commit install

NEXTSTEPS

echo ""
print_warning "Backup location: ${BACKUP_DIR}.tar.gz"
print_warning "Keep this backup until you verify everything works!"

echo ""
read -p "Do you want to force push now? (yes/no): " push_now

if [ "$push_now" == "yes" ]; then
  print_warning "Force pushing to remote..."
  git push origin --force --all
  git push origin --force --tags
  print_ok "Force push complete!"
  
  echo ""
  print_ok "Don't forget to:"
  echo "  1. Notify all collaborators"
  echo "  2. Rotate all exposed credentials"
  echo "  3. Enable secret scanning"
else
  print_warning "Remember to force push when ready:"
  echo "  git push origin --force --all"
  echo "  git push origin --force --tags"
fi

# Cleanup temp files
rm -f sensitive_files.txt patterns.txt

echo ""
print_ok "All done! Remember to rotate compromised credentials! 🔐"
echo ""
