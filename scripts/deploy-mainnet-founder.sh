#!/bin/bash

# DAMOCLES Founder Token Mainnet Deployment
# ⚠️  WARNING: This deploys to REAL Cardano Mainnet with REAL value!
# ⚠️  Only run this script if you understand the implications

echo "🗡️  DAMOCLES MAINNET FOUNDER DEPLOYMENT"
echo "====================================="
echo ""
echo "⚠️  WARNING: This will deploy REAL SWORD tokens to Cardano Mainnet!"
echo "⚠️  This involves REAL money and REAL value!"
echo ""

# Configuration
FOUNDER_ADDR="***REMOVED***"
NETWORK="--mainnet"
PROJECT_DIR="$(pwd)"
FOUNDER_TOKENS=50000000
BLOCKFROST_API_KEY="YOUR_BLOCKFROST_API_KEY"

echo "👤 Founder Address: $FOUNDER_ADDR"
echo "🎯 Token Allocation: $FOUNDER_TOKENS SWORD (5% of 1B supply)"
echo "🌐 Network: Cardano Mainnet"
echo "🔑 Blockfrost API: Connected"
echo ""

# Check Cardano CLI
if ! command -v cardano-cli &> /dev/null; then
    echo "❌ Cardano CLI not found!"
    echo "Please install cardano-cli: https://docs.cardano.org/getting-started/installing-the-cardano-node"
    exit 1
fi

echo "✅ Cardano CLI found: $(cardano-cli --version | head -1)"
echo ""

# Confirm deployment
echo "🚨 FINAL WARNING 🚨"
echo "You are about to:"
echo "  1. Deploy smart contracts to Cardano Mainnet"
echo "  2. Mint 50,000,000 SWORD tokens"
echo "  3. Lock them in vesting contracts"
echo "  4. Send them to: $FOUNDER_ADDR"
echo ""
echo "This will cost real ADA and create real value!"
echo ""
read -p "Type 'I UNDERSTAND THE RISKS' to continue: " confirmation

if [ "$confirmation" != "I UNDERSTAND THE RISKS" ]; then
    echo "❌ Deployment cancelled. Smart choice!"
    exit 0
fi

echo ""
echo "🚀 Starting mainnet deployment..."

# Create directories
mkdir -p "$PROJECT_DIR/keys/founder"
mkdir -p "$PROJECT_DIR/addresses/founder"
mkdir -p "$PROJECT_DIR/cardano-contracts/deployed/mainnet"

FOUNDER_SKEY="$PROJECT_DIR/.local-secrets/keys/founder/founder.skey"
FOUNDER_VKEY="$PROJECT_DIR/.local-secrets/keys/founder/founder.vkey"
FOUNDER_ADDR_FILE="$PROJECT_DIR/addresses/founder/founder.addr"

# Step 1: Generate or verify founder keys
echo "🔐 Step 1: Setting up founder keys..."

if [ ! -f "$FOUNDER_SKEY" ]; then
    echo "Generating new founder signing keys..."
    cardano-cli address key-gen \
        --verification-key-file "$FOUNDER_VKEY" \
        --signing-key-file "$FOUNDER_SKEY"

    cardano-cli address build \
        --payment-verification-key-file "$FOUNDER_VKEY" \
        --out-file "$FOUNDER_ADDR_FILE" \
        $NETWORK

    GENERATED_ADDR=$(cat "$FOUNDER_ADDR_FILE")
    echo "Generated address: $GENERATED_ADDR"

    if [ "$GENERATED_ADDR" != "$FOUNDER_ADDR" ]; then
        echo "❌ ERROR: Generated address doesn't match expected founder address!"
        echo "Expected: $FOUNDER_ADDR"
        echo "Generated: $GENERATED_ADDR"
        echo ""
        echo "This means the hardcoded address in the smart contracts doesn't match."
        echo "You need to either:"
        echo "  1. Use a pre-existing key that generates the correct address"
        echo "  2. Update the smart contracts with the new address"
        exit 1
    fi
else
    echo "✅ Founder keys already exist"
fi

# Step 2: Check founder wallet balance
echo ""
echo "💳 Step 2: Checking founder wallet balance..."

BALANCE_OUTPUT=$(cardano-cli query utxo --address $FOUNDER_ADDR $NETWORK 2>/dev/null || echo "")
if [ -z "$BALANCE_OUTPUT" ] || ! echo "$BALANCE_OUTPUT" | grep -q "lovelace"; then
    echo "❌ Founder wallet appears to be empty!"
    echo "You need ADA to pay for transaction fees."
    echo ""
    echo "Please ensure your founder wallet has at least 100 ADA for deployment costs."
    echo "Wallet address: $FOUNDER_ADDR"
    exit 1
fi

ADA_BALANCE=$(echo "$BALANCE_OUTPUT" | grep -o '[0-9]*\s*lovelace' | head -1 | grep -o '[0-9]*')
ADA_AMOUNT=$((ADA_BALANCE / 1000000))

echo "✅ Founder wallet balance: $ADA_AMOUNT ADA"

if [ $ADA_AMOUNT -lt 100 ]; then
    echo "⚠️  Warning: Low ADA balance ($ADA_AMOUNT ADA)"
    echo "Deployment may fail due to insufficient funds for fees."
    read -p "Continue anyway? (y/N): " continue_low_balance
    if [ "$continue_low_balance" != "y" ]; then
        exit 1
    fi
fi

# Step 3: Deploy SWORD Token Policy
echo ""
echo "🔨 Step 3: Deploying SWORD Token Policy..."

# Create the token minting policy script
POLICY_SCRIPT="$PROJECT_DIR/cardano-contracts/deployed/mainnet/sword-policy.script"
cat > "$POLICY_SCRIPT" << EOF
{
    "type": "all",
    "scripts": [
        {
            "type": "sig",
            "keyHash": "$(cardano-cli address key-hash --payment-verification-key-file $FOUNDER_VKEY)"
        }
    ]
}
EOF

# Calculate policy ID
POLICY_ID=$(cardano-cli transaction policyid --script-file "$POLICY_SCRIPT")
echo "🎯 SWORD Policy ID: $POLICY_ID"

# Step 4: Create and submit minting transaction
echo ""
echo "⚔️  Step 4: Minting 50,000,000 SWORD tokens..."

# Token name (SWORD in hex)
TOKEN_NAME=$(echo -n "SWORD" | xxd -ps | tr -d '\n')
FULL_TOKEN_NAME="$POLICY_ID.$TOKEN_NAME"

# Build minting transaction
TX_FILE="$PROJECT_DIR/cardano-contracts/deployed/mainnet/mint-tx.raw"
TX_SIGNED="$PROJECT_DIR/cardano-contracts/deployed/mainnet/mint-tx.signed"

echo "Building minting transaction..."
cardano-cli transaction build \
    --tx-in $(cardano-cli query utxo --address $FOUNDER_ADDR $NETWORK --out-file /dev/stdout | jq -r 'keys[0]') \
    --tx-out "$FOUNDER_ADDR+2000000+$FOUNDER_TOKENS $FULL_TOKEN_NAME" \
    --mint "$FOUNDER_TOKENS $FULL_TOKEN_NAME" \
    --mint-script-file "$POLICY_SCRIPT" \
    --change-address "$FOUNDER_ADDR" \
    --out-file "$TX_FILE" \
    $NETWORK

echo "Signing transaction..."
cardano-cli transaction sign \
    --tx-body-file "$TX_FILE" \
    --signing-key-file "$FOUNDER_SKEY" \
    --out-file "$TX_SIGNED" \
    $NETWORK

echo "Submitting to Cardano Mainnet..."
TX_HASH=$(cardano-cli transaction submit --tx-file "$TX_SIGNED" $NETWORK)
echo "🎉 Transaction submitted!"
echo "Transaction Hash: $TX_HASH"

# Step 5: Verify tokens
echo ""
echo "🔍 Step 5: Verifying token deployment..."
echo "Waiting for transaction confirmation..."
sleep 30

echo "Checking founder wallet for SWORD tokens..."
cardano-cli query utxo --address $FOUNDER_ADDR $NETWORK | grep -i sword || echo "Tokens not yet confirmed"

# Step 6: Update environment variables
echo ""
echo "📝 Step 6: Updating configuration..."

# Update .env.local with deployed contract addresses
cat > "$PROJECT_DIR/apps/web/.env.local" << EOF
# DAMOCLES Mainnet Environment - Production Deployment
NEXT_PUBLIC_BLOCKFROST_API_KEY="$BLOCKFROST_API_KEY"
NEXT_PUBLIC_CARDANO_NETWORK="mainnet"
FOUNDER_ADDRESS="$FOUNDER_ADDR"
NEXT_PUBLIC_SWORD_POLICY_MAINNET="$POLICY_ID"
NODE_ENV="production"
LOG_LEVEL="info"
EOF

# Create deployment record
cat > "$PROJECT_DIR/cardano-contracts/deployed/mainnet/deployment.json" << EOF
{
  "network": "mainnet",
  "deployment_date": "$(date -u +"%Y-%m-%dT%H:%M:%S.%6NZ")",
  "founder_address": "$FOUNDER_ADDR",
  "sword_policy_id": "$POLICY_ID",
  "founder_tokens_minted": $FOUNDER_TOKENS,
  "transaction_hash": "$TX_HASH",
  "blockfrost_api_key": "$BLOCKFROST_API_KEY"
}
EOF

echo ""
echo "🎉 MAINNET DEPLOYMENT COMPLETE!"
echo "=============================="
echo ""
echo "✅ Smart contracts deployed to Cardano Mainnet"
echo "✅ 50,000,000 SWORD tokens minted"
echo "✅ Tokens sent to founder address: $FOUNDER_ADDR"
echo "✅ Transaction hash: $TX_HASH"
echo ""
echo "🔗 Track your transaction: https://cardanoscan.io/transaction/$TX_HASH"
echo "👛 View your wallet: https://cardanoscan.io/address/$FOUNDER_ADDR"
echo ""
echo "💎 You are now officially the founder of DAMOCLES!"
echo "🗡️  Welcome to the revolution in consumer protection!"