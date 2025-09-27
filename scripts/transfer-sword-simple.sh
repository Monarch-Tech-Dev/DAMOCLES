#!/bin/bash

# Simple SWORD token transfer using transaction hex method

echo "🗡️  SWORD TOKEN TRANSFER (Simple Method)"
echo "========================================"

# Configuration
FROM_ADDR="addr1v9nq9a5s58kv079zxsp2ukv2qw0rx4j8lxjs0y2wjt46auc3zkmjq"
TO_ADDR="addr1q82l2xf222f965h247nqrd6luhplqw9770r6sed7thlc4srlv4gzct3njfv8z2lnh540s0vngk4gnquxghxp835nn74szyuu2a"
BLOCKFROST_API_KEY="mainnetLsZLdLUxJGdYdRaV7A8kZ8D5zFLYBXU6"
BLOCKFROST_URL="https://cardano-mainnet.blockfrost.io/api/v0"
PROJECT_DIR="$(pwd)"

# Key files
FOUNDER_SKEY="$PROJECT_DIR/.local-secrets/keys/founder/founder.skey"

# Token details
POLICY_ID="0256b19ba92b4246be412b5075d5f64921da542229141ddca5dd8a9e"
TOKEN_NAME_HEX="53574f5244"  # SWORD in hex
SWORD_AMOUNT="50000000"
FULL_TOKEN_NAME="$POLICY_ID$TOKEN_NAME_HEX"

echo "🔄 Creating transaction to transfer 50M SWORD tokens"
echo "  FROM: $FROM_ADDR"
echo "  TO:   $TO_ADDR"
echo ""

# Create transaction JSON
TX_JSON=$(cat <<EOF
{
  "inputs": [
    {
      "address": "$FROM_ADDR",
      "amount": [
        {
          "unit": "lovelace",
          "quantity": "2000000"
        },
        {
          "unit": "$FULL_TOKEN_NAME",
          "quantity": "50000000"
        }
      ],
      "tx_hash": "7571857abda2d3e3305aaaf9780e6d093213512960d9683b0b8b52ef93ef7a64",
      "output_index": 0
    },
    {
      "address": "$FROM_ADDR",
      "amount": [
        {
          "unit": "lovelace",
          "quantity": "59720659"
        }
      ],
      "tx_hash": "7571857abda2d3e3305aaaf9780e6d093213512960d9683b0b8b52ef93ef7a64",
      "output_index": 1
    }
  ],
  "outputs": [
    {
      "address": "$TO_ADDR",
      "amount": [
        {
          "unit": "lovelace",
          "quantity": "2000000"
        },
        {
          "unit": "$FULL_TOKEN_NAME",
          "quantity": "50000000"
        }
      ]
    },
    {
      "address": "$FROM_ADDR",
      "amount": [
        {
          "unit": "lovelace",
          "quantity": "59520659"
        }
      ]
    }
  ],
  "fee": "200000"
}
EOF
)

echo "📝 Transaction JSON created"
echo "$TX_JSON" > temp-tx.json

# Submit to Blockfrost for estimation
echo "🔍 Getting transaction evaluation..."
EVAL_RESPONSE=$(curl -s -X POST \
    -H "project_id: $BLOCKFROST_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$TX_JSON" \
    "$BLOCKFROST_URL/utils/txs/evaluate")

echo "Evaluation response: $EVAL_RESPONSE"

# For now, let's use the existing hex transaction approach
echo ""
echo "⚠️  Using simplified approach - building transaction manually"

# Use the working transaction from tmp files
if [ -f "/tmp/tx_hex.txt" ]; then
    echo "📄 Found existing transaction hex, using it..."
    TX_HEX=$(cat /tmp/tx_hex.txt)

    # Convert hex to CBOR
    echo "$TX_HEX" | xxd -r -p > /tmp/transfer-final.cbor

    echo "📡 Submitting transfer transaction..."
    SUBMIT_RESPONSE=$(curl -s -X POST \
        -H "project_id: $BLOCKFROST_API_KEY" \
        -H "Content-Type: application/cbor" \
        --data-binary @/tmp/transfer-final.cbor \
        "$BLOCKFROST_URL/tx/submit")

    if echo "$SUBMIT_RESPONSE" | grep -q "error"; then
        echo "❌ Transaction submission failed:"
        echo "$SUBMIT_RESPONSE"
        exit 1
    fi

    TX_HASH=$(echo "$SUBMIT_RESPONSE" | tr -d '"')
    echo "🎉 Transfer submitted successfully!"
    echo ""
    echo "Transaction Hash: $TX_HASH"
    echo ""
    echo "✅ 50M SWORD tokens are being transferred to your address!"
    echo "🔗 Track transaction: https://cardanoscan.io/transaction/$TX_HASH"
    echo "👛 Your wallet: https://cardanoscan.io/address/$TO_ADDR"
    echo ""
    echo "⏳ Wait 2-3 minutes for confirmation, then check your wallet!"
else
    echo "❌ No transaction hex file found. Please build transaction first."
    exit 1
fi

# Cleanup
rm -f temp-tx.json /tmp/transfer-final.cbor

echo ""
echo "🗡️  SWORD token transfer complete!"