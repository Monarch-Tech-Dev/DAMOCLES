# 🔒 SECURITY NOTICE

## Blockchain Credentials Security

This repository has been secured against accidental exposure of sensitive blockchain data.

### Protected Information
- ❌ Cardano signing keys (*.skey)
- ❌ Verification keys (*.vkey)
- ❌ Wallet private keys
- ❌ Policy IDs and minting policies
- ❌ Address files (*.addr)
- ❌ Deployment transaction data

### Security Measures Implemented
- ✅ Comprehensive .gitignore for blockchain files
- ✅ Local secrets moved to .local-secrets/ directory
- ✅ Cardano data isolated from public repository
- ✅ Environment variables protected
- ✅ Private keys secured offline

### Developer Guidelines
1. **Never commit** private keys, signing keys, or wallet files
2. **Always verify** .gitignore includes blockchain file patterns
3. **Use environment variables** for sensitive configuration
4. **Store secrets locally** in .local-secrets/ or .private/
5. **Regenerate keys** if accidentally committed

### Emergency Response
If sensitive data is accidentally committed:
1. Immediately regenerate all affected keys
2. Update .gitignore patterns
3. Remove from git history using `git filter-branch`
4. Rotate any compromised credentials
5. Review all recent commits for other exposures

## Contact
For security concerns, contact the development team immediately.

---
*This notice is part of DAMOCLES' commitment to blockchain security best practices.*