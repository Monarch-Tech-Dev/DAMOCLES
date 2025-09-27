#!/bin/bash

# DAMOCLES Founder Token Mainnet Deployment via Blockfrost
# ⚠️  WARNING: This deploys to REAL Cardano Mainnet with REAL value!
# Uses Blockfrost API instead of full node - much lighter weight!

echo "🗡️  DAMOCLES MAINNET FOUNDER DEPLOYMENT (Blockfrost)"
echo "================================================="
echo ""
echo "⚠️  WARNING: This will deploy REAL SWORD tokens to Cardano Mainnet!"
echo "⚠️  This involves REAL money and REAL value!"
echo ""

# Configuration
FOUNDER_ADDR="addr1v9nq9a5s58kv079zxsp2ukv2qw0rx4j8lxjs0y2wjt46auc3zkmjq"
PROJECT_DIR="$(pwd)"
FOUNDER_TOKENS=50000000
BLOCKFROST_API_KEY="mainnetLsZLdLUxJGdYdRaV7A8kZ8D5zFLYBXU6"
BLOCKFROST_URL="https://cardano-mainnet.blockfrost.io/api/v0"

echo "👤 Founder Address: $FOUNDER_ADDR"
echo "🎯 Token Allocation: $FOUNDER_TOKENS SWORD (5% of 1B supply)"
echo "🌐 Network: Cardano Mainnet via Blockfrost"
echo "🔑 API Connection: $BLOCKFROST_URL"
echo ""

# Check dependencies
CARDANO_CLI="$HOME/cardano-cli/cardano-cli"
if [ ! -f "$CARDANO_CLI" ]; then
    echo "❌ Cardano CLI not found at $CARDANO_CLI"
    echo "Installing from GitHub releases..."

    # Download and install cardano-cli
    mkdir -p "$HOME/cardano-cli"
    cd "$HOME/cardano-cli"

    # Get latest release URL for macOS
    LATEST_URL=$(curl -s https://api.github.com/repos/IntersectMBO/cardano-node/releases/latest | \
        grep "browser_download_url.*cardano-node.*darwin" | \
        head -1 | cut -d'"' -f4)

    if [ -z "$LATEST_URL" ]; then
        echo "❌ Could not find cardano-cli download for macOS"
        echo "Please install manually from: https://github.com/IntersectMBO/cardano-node/releases"
        exit 1
    fi

    echo "📥 Downloading cardano-cli..."
    curl -L "$LATEST_URL" -o cardano-node.tar.gz
    tar -xzf cardano-node.tar.gz

    # Find and copy binaries
    find . -name "cardano-cli" -type f -exec cp {} ./cardano-cli \;
    chmod +x ./cardano-cli

    if [ ! -f "./cardano-cli" ]; then
        echo "❌ Failed to install cardano-cli"
        exit 1
    fi

    cd "$PROJECT_DIR"
fi

echo "✅ Cardano CLI found: $($CARDANO_CLI --version | head -1)"
echo ""

# Test Blockfrost connection
echo "🔗 Testing Blockfrost connection..."
BLOCKFROST_TEST=$(curl -s -H "project_id: $BLOCKFROST_API_KEY" "$BLOCKFROST_URL/health")
if echo "$BLOCKFROST_TEST" | grep -q "healthy"; then
    echo "✅ Blockfrost API connected successfully"
else
    echo "❌ Blockfrost API connection failed"
    echo "Response: $BLOCKFROST_TEST"
    exit 1
fi
echo ""

# Confirm deployment
echo "🚨 FINAL WARNING 🚨"
echo "You are about to:"
echo "  1. Create SWORD token policy via Blockfrost"
echo "  2. Mint 50,000,000 SWORD tokens"
echo "  3. Send them to: $FOUNDER_ADDR"
echo ""
echo "This will cost real ADA and create real value!"
echo ""
read -p "Type 'I UNDERSTAND THE RISKS' to continue: " confirmation

if [ "$confirmation" != "I UNDERSTAND THE RISKS" ]; then
    echo "❌ Deployment cancelled. Smart choice!"
    exit 0
fi

echo ""
echo "🚀 Starting mainnet deployment via Blockfrost..."

# Create directories
mkdir -p "$PROJECT_DIR/.local-secrets/keys/founder"
mkdir -p "$PROJECT_DIR/addresses/founder"
mkdir -p "$PROJECT_DIR/cardano-contracts/deployed/mainnet"

FOUNDER_SKEY="$PROJECT_DIR/.local-secrets/keys/founder/founder.skey"
FOUNDER_VKEY="$PROJECT_DIR/.local-secrets/keys/founder/founder.vkey"
FOUNDER_ADDR_FILE="$PROJECT_DIR/addresses/founder/founder.addr"

# Step 1: Generate or verify founder keys
echo "🔐 Step 1: Setting up founder keys..."

if [ ! -f "$FOUNDER_SKEY" ]; then
    echo "Generating new founder signing keys..."
    $CARDANO_CLI address key-gen \
        --verification-key-file "$FOUNDER_VKEY" \
        --signing-key-file "$FOUNDER_SKEY"

    $CARDANO_CLI address build \
        --payment-verification-key-file "$FOUNDER_VKEY" \
        --out-file "$FOUNDER_ADDR_FILE" \
        --mainnet

    GENERATED_ADDR=$(cat "$FOUNDER_ADDR_FILE")
    echo "Generated address: $GENERATED_ADDR"

    if [ "$GENERATED_ADDR" != "$FOUNDER_ADDR" ]; then
        echo "❌ ERROR: Generated address doesn't match expected founder address!"
        echo "Expected: $FOUNDER_ADDR"
        echo "Generated: $GENERATED_ADDR"
        echo ""
        echo "You need to either:"
        echo "  1. Use pre-existing keys that generate the correct address"
        echo "  2. Update the founder address in your configuration"
        exit 1
    fi
else
    echo "✅ Founder keys already exist"
fi

# Step 2: Check founder wallet balance
echo ""
echo "💳 Step 2: Checking founder wallet balance..."

BALANCE_RESPONSE=$(curl -s -H "project_id: $BLOCKFROST_API_KEY" \
  "$BLOCKFROST_URL/addresses/$FOUNDER_ADDR")

if echo "$BALANCE_RESPONSE" | grep -q "error"; then
    echo "❌ Error querying wallet balance: $BALANCE_RESPONSE"
    exit 1
fi

# Parse ADA balance from Blockfrost response
ADA_BALANCE=$(echo "$BALANCE_RESPONSE" | jq -r '.amount[] | select(.unit=="lovelace") | .quantity')
if [ -z "$ADA_BALANCE" ] || [ "$ADA_BALANCE" = "null" ]; then
    echo "❌ Founder wallet appears to be empty!"
    echo "You need ADA to pay for transaction fees."
    echo ""
    echo "Please ensure your founder wallet has at least 100 ADA for deployment costs."
    echo "Wallet address: $FOUNDER_ADDR"
    exit 1
fi

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
echo "🔨 Step 3: Creating SWORD Token Policy..."

# Create the token minting policy script
POLICY_SCRIPT="$PROJECT_DIR/cardano-contracts/deployed/mainnet/sword-policy.script"
cat > "$POLICY_SCRIPT" << EOF
{
    "type": "all",
    "scripts": [
        {
            "type": "sig",
            "keyHash": "$($CARDANO_CLI address key-hash --payment-verification-key-file $FOUNDER_VKEY)"
        }
    ]
}
EOF

# Calculate policy ID
POLICY_ID=$($CARDANO_CLI transaction policyid --script-file "$POLICY_SCRIPT")
echo "🎯 SWORD Policy ID: $POLICY_ID"

# Step 4: Get UTxO for transaction input
echo ""
echo "🔍 Step 4: Getting UTxO for transaction..."

UTXOS_RESPONSE=$(curl -s -H "project_id: $BLOCKFROST_API_KEY" \
  "$BLOCKFROST_URL/addresses/$FOUNDER_ADDR/utxos")

# Get the first UTxO
UTXO_HASH=$(echo "$UTXOS_RESPONSE" | jq -r '.[0].tx_hash')
UTXO_INDEX=$(echo "$UTXOS_RESPONSE" | jq -r '.[0].output_index')
UTXO_AMOUNT=$(echo "$UTXOS_RESPONSE" | jq -r '.[0].amount[] | select(.unit=="lovelace") | .quantity')

if [ -z "$UTXO_HASH" ] || [ "$UTXO_HASH" = "null" ]; then
    echo "❌ No UTxOs found in wallet"
    exit 1
fi

echo "Using UTxO: $UTXO_HASH#$UTXO_INDEX ($((UTXO_AMOUNT / 1000000)) ADA)"

# Step 5: Create and submit minting transaction
echo ""
echo "⚔️  Step 5: Building minting transaction..."

# Token name (SWORD in hex)
TOKEN_NAME=$(echo -n "SWORD" | xxd -ps | tr -d '\n')
FULL_TOKEN_NAME="$POLICY_ID.$TOKEN_NAME"

# Build minting transaction
TX_FILE="$PROJECT_DIR/cardano-contracts/deployed/mainnet/mint-tx.raw"
TX_SIGNED="$PROJECT_DIR/cardano-contracts/deployed/mainnet/mint-tx.signed"

echo "Building transaction..."
$CARDANO_CLI transaction build \
    --tx-in "$UTXO_HASH#$UTXO_INDEX" \
    --tx-out "$FOUNDER_ADDR+2000000+$FOUNDER_TOKENS $FULL_TOKEN_NAME" \
    --mint "$FOUNDER_TOKENS $FULL_TOKEN_NAME" \
    --mint-script-file "$POLICY_SCRIPT" \
    --change-address "$FOUNDER_ADDR" \
    --out-file "$TX_FILE" \
    --mainnet

echo "Signing transaction..."
$CARDANO_CLI transaction sign \
    --tx-body-file "$TX_FILE" \
    --signing-key-file "$FOUNDER_SKEY" \
    --out-file "$TX_SIGNED" \
    --mainnet

# Step 6: Submit via Blockfrost
echo ""
echo "📡 Step 6: Submitting to Cardano Mainnet via Blockfrost..."

# Submit transaction using Blockfrost
TX_CBOR=$(cat "$TX_SIGNED" | jq -r '.cborHex')
SUBMIT_RESPONSE=$(curl -s -X POST \
    -H "project_id: $BLOCKFROST_API_KEY" \
    -H "Content-Type: application/cbor" \
    --data-binary "@$TX_SIGNED" \
    "$BLOCKFROST_URL/tx/submit")

if echo "$SUBMIT_RESPONSE" | grep -q "error"; then
    echo "❌ Transaction submission failed:"
    echo "$SUBMIT_RESPONSE"
    exit 1
fi

TX_HASH=$(echo "$SUBMIT_RESPONSE" | tr -d '"')
echo "🎉 Transaction submitted successfully!"
echo "Transaction Hash: $TX_HASH"

# Step 7: Update environment variables
echo ""
echo "📝 Step 7: Updating configuration..."

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
  "blockfrost_api_key": "$BLOCKFROST_API_KEY",
  "deployment_method": "blockfrost_api"
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
echo "✅ Used Blockfrost API (no full node required)"
echo ""
echo "🔗 Track your transaction: https://cardanoscan.io/transaction/$TX_HASH"
echo "👛 View your wallet: https://cardanoscan.io/address/$FOUNDER_ADDR"
echo ""
echo "💎 You are now officially the founder of DAMOCLES!"
echo "🗡️  Welcome to the revolution in consumer protection!"