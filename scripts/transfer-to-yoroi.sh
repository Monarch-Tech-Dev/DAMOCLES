#!/bin/bash

echo "🗡️  Transferring SWORD Tokens to Yoroi Wallet"
echo "============================================"

# Configuration
FROM_ADDR="addr1v9nq9a5s58kv079zxsp2ukv2qw0rx4j8lxjs0y2wjt46auc3zkmjq"
TO_ADDR="addr1q94dvlg6zd8h23d0a7hwgmc92t0h78gfpae4d9zyzfupfz5t3h8t0vvwn8fss90vsmeshuzm3g6m9lj8clceafw8l8vsrljnya"
CARDANO_CLI="$HOME/cardano-cli/cardano-cli"
PROJECT_DIR="$(pwd)"

# Key files
FOUNDER_SKEY="$PROJECT_DIR/.local-secrets/keys/founder/founder.skey"

# Token details
POLICY_ID="0256b19ba92b4246be412b5075d5f64921da542229141ddca5dd8a9e"
TOKEN_HEX="53574f5244"  # SWORD in hex

echo "FROM: $FROM_ADDR"
echo "TO:   $TO_ADDR (Your Yoroi wallet)"
echo ""

# Build the transaction using Cardano-CLI format
echo "Building transaction..."

# Create a simple transaction that sends all tokens and most ADA to the new address
$CARDANO_CLI transaction build-raw \
    --tx-in "7571857abda2d3e3305aaaf9780e6d093213512960d9683b0b8b52ef93ef7a64#0" \
    --tx-in "7571857abda2d3e3305aaaf9780e6d093213512960d9683b0b8b52ef93ef7a64#1" \
    --tx-out "$TO_ADDR+61520659+50000000 $POLICY_ID.$TOKEN_HEX" \
    --fee 200000 \
    --out-file transfer-tx.raw

if [ $? -eq 0 ]; then
    echo "✅ Transaction built successfully"

    # Sign the transaction
    echo "Signing transaction..."
    $CARDANO_CLI transaction sign \
        --tx-body-file transfer-tx.raw \
        --signing-key-file "$FOUNDER_SKEY" \
        --mainnet \
        --out-file transfer-tx.signed

    if [ $? -eq 0 ]; then
        echo "✅ Transaction signed successfully"

        # Submit via Blockfrost
        echo "Submitting to Cardano mainnet..."

        # Extract CBOR from signed transaction
        TX_CBOR=$(jq -r '.cborHex' transfer-tx.signed)
        echo "$TX_CBOR" | xxd -r -p > transfer-tx.cbor

        # Submit to Blockfrost
        BLOCKFROST_API_KEY="mainnetLsZLdLUxJGdYdRaV7A8kZ8D5zFLYBXU6"
        SUBMIT_RESPONSE=$(curl -s -X POST \
            -H "project_id: $BLOCKFROST_API_KEY" \
            -H "Content-Type: application/cbor" \
            --data-binary @transfer-tx.cbor \
            "https://cardano-mainnet.blockfrost.io/api/v0/tx/submit")

        if echo "$SUBMIT_RESPONSE" | grep -q "error"; then
            echo "❌ Transaction submission failed:"
            echo "$SUBMIT_RESPONSE"
        else
            TX_HASH=$(echo "$SUBMIT_RESPONSE" | tr -d '"')
            echo ""
            echo "🎉 SUCCESS! Your SWORD tokens are being transferred!"
            echo "=================================================="
            echo "Transaction Hash: $TX_HASH"
            echo ""
            echo "📱 Check your Yoroi wallet in 2-3 minutes!"
            echo "🔗 Track on Cardanoscan: https://cardanoscan.io/transaction/$TX_HASH"
            echo ""
            echo "You will receive:"
            echo "  • 50,000,000 SWORD tokens"
            echo "  • ~61.52 ADA"
        fi
    else
        echo "❌ Transaction signing failed"
    fi
else
    echo "❌ Transaction build failed"
fi

# Cleanup
rm -f transfer-tx.raw transfer-tx.signed transfer-tx.cbor

echo ""
echo "Done!"