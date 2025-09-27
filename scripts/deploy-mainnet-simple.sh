#!/bin/bash

# DAMOCLES Simple Mainnet Deployment
# Uses cardano-cli build-raw (no node required)

echo "🗡️  DAMOCLES SIMPLE MAINNET DEPLOYMENT"
echo "====================================="

# Configuration
FOUNDER_ADDR="addr1v9nq9a5s58kv079zxsp2ukv2qw0rx4j8lxjs0y2wjt46auc3zkmjq"
PROJECT_DIR="$(pwd)"
FOUNDER_TOKENS=50000000
BLOCKFROST_API_KEY="mainnetLsZLdLUxJGdYdRaV7A8kZ8D5zFLYBXU6"
BLOCKFROST_URL="https://cardano-mainnet.blockfrost.io/api/v0"
CARDANO_CLI="$HOME/cardano-cli/cardano-cli"

FOUNDER_SKEY="$PROJECT_DIR/.local-secrets/keys/founder/founder.skey"
FOUNDER_VKEY="$PROJECT_DIR/.local-secrets/keys/founder/founder.vkey"
POLICY_SCRIPT="$PROJECT_DIR/cardano-contracts/deployed/mainnet/sword-policy.script"

echo "👤 Founder Address: $FOUNDER_ADDR"
echo "🔑 Policy Script: $(cat $POLICY_SCRIPT)"

# Get policy ID
POLICY_ID=$($CARDANO_CLI transaction policyid --script-file "$POLICY_SCRIPT")
echo "🎯 SWORD Policy ID: $POLICY_ID"

# Get UTxO
UTXOS_RESPONSE=$(curl -s -H "project_id: $BLOCKFROST_API_KEY" "$BLOCKFROST_URL/addresses/$FOUNDER_ADDR/utxos")
UTXO_HASH=$(echo "$UTXOS_RESPONSE" | jq -r '.[0].tx_hash')
UTXO_INDEX=$(echo "$UTXOS_RESPONSE" | jq -r '.[0].output_index')
UTXO_AMOUNT=$(echo "$UTXOS_RESPONSE" | jq -r '.[0].amount[] | select(.unit=="lovelace") | .quantity')

echo "📍 Using UTxO: $UTXO_HASH#$UTXO_INDEX ($((UTXO_AMOUNT / 1000000)) ADA)"

# Get protocol parameters
curl -s -H "project_id: $BLOCKFROST_API_KEY" "$BLOCKFROST_URL/epochs/latest/parameters" > /tmp/protocol-params.json

# Token name in hex
TOKEN_NAME=$(echo -n "SWORD" | xxd -ps | tr -d '\n')
FULL_TOKEN_NAME="$POLICY_ID.$TOKEN_NAME"

# Calculate outputs (estimate fees)
MIN_ADA=2000000
ESTIMATED_FEE=200000
CHANGE_ADA=$((UTXO_AMOUNT - MIN_ADA - ESTIMATED_FEE))

echo "💰 Transaction breakdown:"
echo "  Input: $((UTXO_AMOUNT / 1000000)) ADA"
echo "  Output: $((MIN_ADA / 1000000)) ADA + $FOUNDER_TOKENS SWORD"
echo "  Change: $((CHANGE_ADA / 1000000)) ADA"
echo "  Fee: ~$((ESTIMATED_FEE / 1000000)) ADA"

# Build raw transaction
TX_FILE="$PROJECT_DIR/cardano-contracts/deployed/mainnet/mint-tx.raw"
TX_SIGNED="$PROJECT_DIR/cardano-contracts/deployed/mainnet/mint-tx.signed"

echo ""
echo "🔨 Building raw transaction..."

$CARDANO_CLI transaction build-raw \
    --tx-in "$UTXO_HASH#$UTXO_INDEX" \
    --tx-out "$FOUNDER_ADDR+$MIN_ADA+$FOUNDER_TOKENS $FULL_TOKEN_NAME" \
    --tx-out "$FOUNDER_ADDR+$CHANGE_ADA" \
    --mint "$FOUNDER_TOKENS $FULL_TOKEN_NAME" \
    --minting-script-file "$POLICY_SCRIPT" \
    --fee $ESTIMATED_FEE \
    --out-file "$TX_FILE"

if [ $? -ne 0 ]; then
    echo "❌ Transaction build failed"
    exit 1
fi

echo "✅ Transaction built successfully"

# Sign transaction
echo "🔏 Signing transaction..."
$CARDANO_CLI transaction sign \
    --tx-body-file "$TX_FILE" \
    --signing-key-file "$FOUNDER_SKEY" \
    --mainnet \
    --out-file "$TX_SIGNED"

if [ $? -ne 0 ]; then
    echo "❌ Transaction signing failed"
    exit 1
fi

echo "✅ Transaction signed successfully"

# Submit via Blockfrost
echo ""
echo "📡 Submitting to Cardano Mainnet via Blockfrost..."

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

# Update config
cat > "$PROJECT_DIR/apps/web/.env.local" << EOF
# DAMOCLES Mainnet Environment - Production Deployment
NEXT_PUBLIC_BLOCKFROST_API_KEY="$BLOCKFROST_API_KEY"
NEXT_PUBLIC_CARDANO_NETWORK="mainnet"
FOUNDER_ADDRESS="$FOUNDER_ADDR"
NEXT_PUBLIC_SWORD_POLICY_MAINNET="$POLICY_ID"
NODE_ENV="production"
LOG_LEVEL="info"
EOF

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "✅ 50,000,000 SWORD tokens minted to mainnet"
echo "✅ Policy ID: $POLICY_ID"
echo "✅ Transaction: $TX_HASH"
echo ""
echo "🔗 Track: https://cardanoscan.io/transaction/$TX_HASH"
echo "👛 Wallet: https://cardanoscan.io/address/$FOUNDER_ADDR"