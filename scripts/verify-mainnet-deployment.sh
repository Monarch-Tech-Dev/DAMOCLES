#!/bin/bash

# DAMOCLES Mainnet Deployment Verification Script
# Checks the status of SWORD token deployment on Cardano Mainnet

echo "🔍 DAMOCLES MAINNET DEPLOYMENT VERIFICATION"
echo "==========================================="
echo ""

# Configuration
CARDANO_CLI="$HOME/cardano-cli/cardano-cli"
FOUNDER_ADDR="***REMOVED***"
EXPECTED_POLICY_ID="cae53ee2a22456a80af1a288d84d4db196f3a453d66f30f290f6a7eb"
EXPECTED_TOKEN_NAME="53574f5244"  # SWORD in hex
EXPECTED_AMOUNT=50000000
NETWORK="--mainnet"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Cardano CLI
if [ ! -f "$CARDANO_CLI" ]; then
    echo -e "${RED}❌ Cardano CLI not found at $CARDANO_CLI${NC}"
    exit 1
fi

echo "✅ Using Cardano CLI: $($CARDANO_CLI --version | head -1)"
echo ""

# Step 1: Check ADA Balance
echo "💰 Checking ADA Balance..."
echo "=========================="

UTXO_OUTPUT=$($CARDANO_CLI query utxo --address $FOUNDER_ADDR $NETWORK 2>/dev/null)

if [ -z "$UTXO_OUTPUT" ]; then
    echo -e "${RED}❌ Failed to query wallet. Check network connection.${NC}"
    exit 1
fi

# Parse ADA balance
ADA_LOVELACE=$(echo "$UTXO_OUTPUT" | grep -o '[0-9]* lovelace' | awk '{sum+=$1} END {print sum}')
if [ -z "$ADA_LOVELACE" ]; then
    ADA_LOVELACE=0
fi
ADA_AMOUNT=$(echo "scale=6; $ADA_LOVELACE / 1000000" | bc)

echo "Founder Address: $FOUNDER_ADDR"
echo -e "ADA Balance: ${GREEN}$ADA_AMOUNT ADA${NC} ($ADA_LOVELACE lovelace)"
echo ""

# Step 2: Check SWORD Token Balance
echo "🗡️  Checking SWORD Token Balance..."
echo "================================="

# Look for SWORD tokens in UTxOs
SWORD_FOUND=false
SWORD_AMOUNT=0

while IFS= read -r line; do
    if echo "$line" | grep -q "$EXPECTED_POLICY_ID.$EXPECTED_TOKEN_NAME"; then
        SWORD_FOUND=true
        # Extract token amount
        SWORD_AMOUNT=$(echo "$line" | grep -oE "[0-9]+.*$EXPECTED_POLICY_ID" | cut -d' ' -f1)
        break
    fi
done <<< "$UTXO_OUTPUT"

if [ "$SWORD_FOUND" = true ]; then
    echo -e "${GREEN}✅ SWORD TOKENS FOUND!${NC}"
    echo "Policy ID: $EXPECTED_POLICY_ID"
    echo "Token Name: SWORD (hex: $EXPECTED_TOKEN_NAME)"
    echo -e "Amount: ${GREEN}$SWORD_AMOUNT SWORD${NC}"

    if [ "$SWORD_AMOUNT" -eq "$EXPECTED_AMOUNT" ]; then
        echo -e "${GREEN}✅ Token amount matches expected: $EXPECTED_AMOUNT${NC}"
    else
        echo -e "${YELLOW}⚠️  Token amount differs from expected:${NC}"
        echo "  Expected: $EXPECTED_AMOUNT"
        echo "  Found: $SWORD_AMOUNT"
    fi
else
    echo -e "${RED}❌ NO SWORD TOKENS FOUND${NC}"
    echo "Expected Policy ID: $EXPECTED_POLICY_ID"
    echo "Expected Token Name: SWORD"
    echo ""
    echo "This could mean:"
    echo "  1. Tokens have not been minted yet"
    echo "  2. Tokens were sent to a different address"
    echo "  3. Transaction is still pending confirmation"
fi

echo ""

# Step 3: Show all tokens in wallet
echo "📊 All Tokens in Wallet..."
echo "========================="

TOKEN_COUNT=0
while IFS= read -r line; do
    if echo "$line" | grep -q "+"; then
        # Check if line contains a token (has a dot separator for policy.name)
        if echo "$line" | grep -q "\."; then
            TOKEN_INFO=$(echo "$line" | grep -oE "[0-9]+.*\.[a-f0-9]+")
            if [ ! -z "$TOKEN_INFO" ]; then
                TOKEN_COUNT=$((TOKEN_COUNT + 1))
                echo "  - $TOKEN_INFO"
            fi
        fi
    fi
done <<< "$UTXO_OUTPUT"

if [ $TOKEN_COUNT -eq 0 ]; then
    echo "  No tokens found in wallet"
fi

echo ""

# Step 4: Deployment Status Summary
echo "📈 DEPLOYMENT STATUS SUMMARY"
echo "============================"

if [ "$SWORD_FOUND" = true ] && [ "$SWORD_AMOUNT" -eq "$EXPECTED_AMOUNT" ]; then
    echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
    echo ""
    echo "🎉 Congratulations! DAMOCLES SWORD tokens are deployed!"
    echo "  - 50,000,000 SWORD tokens minted"
    echo "  - Policy ID verified: $EXPECTED_POLICY_ID"
    echo "  - Founder allocation secured"
    echo ""
    echo "Next steps:"
    echo "  1. Update production environment with confirmed policy ID"
    echo "  2. Deploy web platform to production"
    echo "  3. Announce token deployment to community"
else
    echo -e "${YELLOW}⚠️  DEPLOYMENT PENDING OR INCOMPLETE${NC}"
    echo ""
    echo "Checklist:"
    if [ "$ADA_LOVELACE" -gt 0 ]; then
        echo "  ✅ Wallet has ADA for fees"
    else
        echo "  ❌ Wallet needs ADA funding"
    fi

    if [ "$SWORD_FOUND" = true ]; then
        echo "  ✅ SWORD tokens found (but amount differs)"
    else
        echo "  ❌ SWORD tokens not yet minted"
    fi

    echo ""
    echo "To complete deployment:"
    echo "  1. Ensure wallet has 100+ ADA"
    echo "  2. Run: ./scripts/deploy-mainnet-founder.sh"
    echo "  3. Wait for confirmation (2-3 blocks)"
    echo "  4. Run this script again to verify"
fi

echo ""
echo "🔗 Verify on Cardanoscan:"
echo "https://cardanoscan.io/address/$FOUNDER_ADDR"
echo ""

# Step 5: Export results for automation
if [ "$SWORD_FOUND" = true ]; then
    cat > deployment-status.json << EOF
{
  "deployed": true,
  "network": "mainnet",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "founder_address": "$FOUNDER_ADDR",
  "ada_balance": $ADA_AMOUNT,
  "sword_tokens": $SWORD_AMOUNT,
  "policy_id": "$EXPECTED_POLICY_ID",
  "verification": "SUCCESS"
}
EOF
    echo "✅ Status exported to: deployment-status.json"
else
    cat > deployment-status.json << EOF
{
  "deployed": false,
  "network": "mainnet",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "founder_address": "$FOUNDER_ADDR",
  "ada_balance": $ADA_AMOUNT,
  "sword_tokens": 0,
  "policy_id": "$EXPECTED_POLICY_ID",
  "verification": "PENDING"
}
EOF
    echo "⚠️  Status exported to: deployment-status.json"
fi

echo ""
echo "========================================="
echo "Verification complete at $(date)"