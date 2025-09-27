# DAMOCLES PRODUCTION SECURITY CHECKLIST

## 🔐 CRITICAL BACKUPS REQUIRED

### ✅ Private Keys (HIGHEST PRIORITY)
- [ ] **Founder Keys Backed Up**
  - File: `.local-secrets/keys/founder/founder.skey`
  - File: `.local-secrets/keys/founder/founder.vkey`
  - **Action Required:** Copy to secure offline storage (USB, hardware wallet, etc.)
  - **Risk:** Losing these = losing 50M SWORD tokens forever

### ✅ Token Information
- [ ] **Policy ID Documented:** `0256b19ba92b4246be412b5075d5f64921da542229141ddca5dd8a9e`
- [ ] **Founder Address Saved:** `addr1v9nq9a5s58kv079zxsp2ukv2qw0rx4j8lxjs0y2wjt46auc3zkmjq`
- [ ] **Deployment TX Hash:** `7571857abda2d3e3305aaaf9780e6d093213512960d9683b0b8b52ef93ef7a64`

### ✅ API Credentials
- [ ] **Blockfrost Mainnet Key:** Store in secure environment variables
- [ ] **Never commit API keys to git**
- [ ] **Rotate keys periodically**

### ✅ Smart Contract Files
- [ ] **Policy Script:** `cardano-contracts/deployed/mainnet/sword-policy.script`
- [ ] **Deployment Record:** `cardano-contracts/deployed/mainnet/deployment.json`

## 🏭 PRODUCTION DEPLOYMENT REQUIREMENTS

### Environment Setup
- [ ] **Production .env.local configured**
- [ ] **Blockfrost API key in environment**
- [ ] **SSL certificates for HTTPS**
- [ ] **Domain configured**

### Security Measures
- [ ] **Private keys moved to hardware wallet**
- [ ] **Multi-signature setup for treasury**
- [ ] **Rate limiting on API endpoints**
- [ ] **CORS properly configured**

### Monitoring
- [ ] **Transaction monitoring setup**
- [ ] **Token balance alerts**
- [ ] **Error logging and alerting**
- [ ] **Uptime monitoring**

## 🚨 EMERGENCY PROCEDURES

### If Private Keys Are Lost
- **Result:** 50M SWORD tokens are permanently inaccessible
- **Prevention:** Multiple secure backups in different locations

### If API Keys Are Compromised
- **Action:** Immediately rotate Blockfrost API key
- **Update:** Environment variables and restart services

### If Smart Contract Issues
- **Reference:** Policy ID `0256b19ba92b4246be412b5075d5f64921da542229141ddca5dd8a9e`
- **Backup:** Contract files in `cardano-contracts/deployed/mainnet/`

## 📁 BACKUP LOCATIONS

### Primary Backup (Recommended)
- [ ] **Hardware wallet** (Ledger, Trezor)
- [ ] **Encrypted USB drive**
- [ ] **Secure cloud storage** (encrypted)

### Secondary Backup
- [ ] **Physical paper wallet**
- [ ] **Safety deposit box**
- [ ] **Trusted secondary location**

## 🔄 REGULAR MAINTENANCE

### Monthly
- [ ] **Verify backup integrity**
- [ ] **Check token balances**
- [ ] **Review security logs**

### Quarterly
- [ ] **Rotate API keys**
- [ ] **Update dependencies**
- [ ] **Security audit**

## 📞 EMERGENCY CONTACTS

### Technical Support
- **Blockfrost:** support@blockfrost.io
- **Cardano:** https://forum.cardano.org/

### Legal/Compliance
- **Document:** All transactions and token operations
- **Compliance:** Ensure regulatory compliance in your jurisdiction

---

**⚠️ WARNING:** The private key file `founder.skey` is the ONLY way to access your 50M SWORD tokens. If lost, they are gone forever. Create multiple secure backups immediately!