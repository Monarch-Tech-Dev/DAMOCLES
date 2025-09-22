# Official SWORD Token Minting Process
## Following Cardano Developer Documentation

### Prerequisites (From Official Docs)
- ✅ Testnet wallet with test ADA (Lace/Eternl/Yoroi Nightly)
- ✅ Cardano CLI (we'll use web-based alternative)
- ✅ Policy script for SWORD token

### SWORD Token Specifications
```json
{
  "tokenName": "SWORD",
  "symbol": "SWORD",
  "decimals": 6,
  "totalSupply": "1000000000000000",
  "founderAllocation": "50000000000000",
  "policy": "time-locked with multi-signature",
  "network": "cardano-testnet-preview"
}
```

### Official Minting Steps

#### 1. Create Policy Script
```bash
# Policy allows minting until specific slot
# Founder keys required for minting
{
  "type": "all",
  "scripts": [
    {
      "type": "before",
      "slot": 999999999
    },
    {
      "type": "sig",
      "keyHash": "founder_key_hash"
    }
  ]
}
```

#### 2. Generate Token Name (Base16)
```bash
# SWORD in hex
echo -n "SWORD" | xxd -p
# Output: 53574f5244
```

#### 3. Build Minting Transaction
```bash
cardano-cli transaction build \
  --testnet-magic 2 \
  --tx-in $utxo \
  --tx-out $address+$amount+"50000000 $policyid.53574f5244" \
  --mint="50000000 $policyid.53574f5244" \
  --mint-script-file policy.script \
  --change-address $address \
  --protocol-params-file protocol.json \
  --out-file tx.raw
```

#### 4. Sign and Submit
```bash
cardano-cli transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file founder.skey \
  --testnet-magic 2 \
  --out-file tx.signed

cardano-cli transaction submit \
  --testnet-magic 2 \
  --tx-file tx.signed
```

### Web-Based Alternative (Easier)

Since CLI setup is complex on Apple Silicon, use:

1. **Cardano Token Builder**: https://cardano-native-token.com/
2. **AdaHandle Token Tools**: Web-based minting interface
3. **MuesliSwap Token Creator**: User-friendly interface

### Expected Result
- 50,000,000 SWORD tokens in your testnet wallet
- Policy ID for future reference
- Transaction hash for verification
- Tokens visible in Lace/Eternl wallet

### Verification
- Check wallet: Should show SWORD tokens
- Explorer: https://explorer.cardano.org/preview
- Search transaction hash to confirm minting

---

**Sacred Architecture Note**: These tokens represent utility in consumer protection, not speculation. Use responsibly.