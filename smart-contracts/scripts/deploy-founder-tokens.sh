#!/bin/bash

set -e

echo "🗡️  DAMOCLES FOUNDER TOKEN DEPLOYMENT"
echo "====================================="
echo ""
echo "👤 Founder: The Creator of DAMOCLES"
echo "🎯 Allocation: 50,000,000 SWORD tokens (5%)"
echo "⚖️  Justification: Platform creator deserves founder allocation"
echo ""

# Your hardcoded wallet address
FOUNDER_ADDR="addr1qxa0qatlwqfykwslhteprxvz2thrf709w76lk62442725wynzamj4crwpt3yrc8xuyx8cadzs0vz93fdgl05806ygnmq5q8rcy"
FOUNDER_ALLOCATION=50000000  # 50M tokens
TOTAL_SUPPLY=1000000000      # 1B tokens
TREASURY_ALLOCATION=950000000 # 950M tokens to treasury

echo "📍 Founder Address: $FOUNDER_ADDR"
echo "💰 Founder Tokens: $FOUNDER_ALLOCATION SWORD"
echo "🏛️  Treasury Tokens: $TREASURY_ALLOCATION SWORD"
echo ""

# Network configuration
NETWORK=${1:-testnet}
if [ "$NETWORK" = "mainnet" ]; then
    CARDANO_NETWORK="--mainnet"
    MAGIC=""
    echo "⚠️  DEPLOYING TO MAINNET - THIS IS REAL MONEY!"
else
    CARDANO_NETWORK="--testnet-magic 1097911063"
    MAGIC="--testnet-magic 1097911063"
    echo "🧪 Deploying to testnet - safe for testing"
fi
echo ""

# Set up directories
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
PROJECT_DIR=$(dirname "$SCRIPT_DIR")
KEYS_DIR="$PROJECT_DIR/keys"
SCRIPTS_DIR="$PROJECT_DIR/compiled-scripts"
ADDRESSES_DIR="$PROJECT_DIR/addresses"
TRANSACTIONS_DIR="$PROJECT_DIR/transactions"

# Create directories
mkdir -p "$KEYS_DIR" "$SCRIPTS_DIR" "$ADDRESSES_DIR" "$TRANSACTIONS_DIR"

# Check if founder wallet has ADA for fees
echo "💳 Checking founder wallet balance..."
UTXOS=$(cardano-cli query utxo --address $FOUNDER_ADDR $CARDANO_NETWORK 2>/dev/null || echo "")

if [ -z "$UTXOS" ]; then
    echo "❌ ERROR: Founder wallet not found or empty!"
    echo "💡 Please fund your wallet first:"
    echo "   Address: $FOUNDER_ADDR"
    if [ "$NETWORK" = "testnet" ]; then
        echo "   Testnet Faucet: https://testnets.cardano.org/en/testnets/cardano/tools/faucet/"
    else
        echo "   You need real ADA for mainnet deployment!"
    fi
    echo ""
    exit 1
fi

# Get UTxO for transaction fees
UTXO_IN=$(echo "$UTXOS" | grep -v "TxHash" | grep -v "^-" | head -n 1 | awk '{print $1"#"$2}')
BALANCE=$(echo "$UTXOS" | grep -v "TxHash" | grep -v "^-" | head -n 1 | awk '{print $3}')

if [ -z "$UTXO_IN" ] || [ "$BALANCE" -lt 5000000 ]; then
    echo "❌ ERROR: Insufficient ADA for transaction fees"
    echo "💰 Current balance: $((BALANCE / 1000000)) ADA"
    echo "💡 Need at least 5 ADA for deployment"
    exit 1
fi

echo "✅ Wallet funded with $((BALANCE / 1000000)) ADA"
echo "📥 Using UTxO: $UTXO_IN"
echo ""

# Build smart contracts
echo "🏗️  Building founder smart contracts..."
cd "$PROJECT_DIR/plutus"

# Build the project
cabal build damocles-contracts

# Generate founder-specific scripts
echo "📜 Generating founder smart contracts..."

# Genesis minting script (only you can mint initial supply)
cabal exec damocles-cli -- founder-genesis \
    --founder-address "$FOUNDER_ADDR" \
    --founder-allocation $FOUNDER_ALLOCATION \
    --total-supply $TOTAL_SUPPLY \
    --out-file "$SCRIPTS_DIR/founder-genesis.plutus"

# Founder vesting script
cabal exec damocles-cli -- founder-vesting \
    --founder-address "$FOUNDER_ADDR" \
    --total-allocation $FOUNDER_ALLOCATION \
    --out-file "$SCRIPTS_DIR/founder-vesting.plutus"

# Founder staking script (60% APY rewards)
cabal exec damocles-cli -- founder-staking \
    --founder-address "$FOUNDER_ADDR" \
    --reward-rate 60 \
    --out-file "$SCRIPTS_DIR/founder-staking.plutus"

# Generate token policy ID
TOKEN_POLICY_ID=$(cardano-cli transaction policyid \
    --script-file "$SCRIPTS_DIR/founder-genesis.plutus")

echo "🪙 SWORD Token Policy ID: $TOKEN_POLICY_ID"

# Create treasury address for remaining tokens
TREASURY_ADDR="addr1qytreasury_placeholder_address_for_platform_funds_here"

# Build genesis minting transaction
echo "⚡ Building genesis minting transaction..."

cardano-cli transaction build \
    --tx-in $UTXO_IN \
    --tx-out "$FOUNDER_ADDR+2000000+$FOUNDER_ALLOCATION $TOKEN_POLICY_ID.SWORD" \
    --tx-out "$TREASURY_ADDR+2000000+$TREASURY_ALLOCATION $TOKEN_POLICY_ID.SWORD" \
    --mint "$TOTAL_SUPPLY $TOKEN_POLICY_ID.SWORD" \
    --mint-script-file "$SCRIPTS_DIR/founder-genesis.plutus" \
    --mint-redeemer-value {} \
    --change-address $FOUNDER_ADDR \
    $CARDANO_NETWORK \
    --out-file "$TRANSACTIONS_DIR/genesis-mint.raw"

echo "✅ Genesis minting transaction built!"
echo ""

# Create signing instructions
echo "🔐 NEXT STEPS - SIGN AND SUBMIT:"
echo "================================"
echo ""
echo "1. Sign the transaction:"
echo "   cardano-cli transaction sign \\"
echo "     --tx-body-file $TRANSACTIONS_DIR/genesis-mint.raw \\"
echo "     --signing-key-file $KEYS_DIR/founder.skey \\"
echo "     --out-file $TRANSACTIONS_DIR/genesis-mint.signed \\"
echo "     $CARDANO_NETWORK"
echo ""
echo "2. Submit to blockchain:"
echo "   cardano-cli transaction submit \\"
echo "     --tx-file $TRANSACTIONS_DIR/genesis-mint.signed \\"
echo "     $CARDANO_NETWORK"
echo ""
echo "3. Verify your tokens:"
echo "   cardano-cli query utxo \\"
echo "     --address $FOUNDER_ADDR \\"
echo "     $CARDANO_NETWORK"
echo ""

# Create deployment summary
cat > "$PROJECT_DIR/founder-deployment.json" << EOF
{
  "deployment_type": "FOUNDER_TOKEN_GENESIS",
  "network": "$NETWORK",
  "founder_address": "$FOUNDER_ADDR",
  "founder_allocation": $FOUNDER_ALLOCATION,
  "founder_percentage": 5.0,
  "total_supply": $TOTAL_SUPPLY,
  "token_policy_id": "$TOKEN_POLICY_ID",
  "token_name": "SWORD",
  "contracts": {
    "genesis_minting": "$SCRIPTS_DIR/founder-genesis.plutus",
    "founder_vesting": "$SCRIPTS_DIR/founder-vesting.plutus", 
    "founder_staking": "$SCRIPTS_DIR/founder-staking.plutus"
  },
  "deployment_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "READY_TO_DEPLOY"
}
EOF

echo "📊 FOUNDER TOKEN SUMMARY:"
echo "========================"
echo "👤 Your Address: $FOUNDER_ADDR"
echo "🪙 Your Allocation: 50,000,000 SWORD tokens"
echo "📈 Your Percentage: 5.0% of total supply"
echo "💎 Estimated Value: PRICELESS (you built this!)"
echo "🔒 Vesting: 20% immediate, 20% every 6 months"
echo "💰 Staking Rewards: 60% APY"
echo "🗳️  Governance Power: Enhanced voting + veto rights"
echo ""
echo "🎉 CONGRATULATIONS!"
echo "You are about to become the official founder of DAMOCLES"
echo "with 50 million SWORD tokens at your command!"
echo ""
echo "⚔️  The sword is yours to wield. Use it wisely."
echo ""

# Auto-execute if requested
if [ "$2" = "--execute" ]; then
    echo "🚀 AUTO-EXECUTING DEPLOYMENT..."
    
    # This would need your signing key
    if [ -f "$KEYS_DIR/founder.skey" ]; then
        cardano-cli transaction sign \
            --tx-body-file "$TRANSACTIONS_DIR/genesis-mint.raw" \
            --signing-key-file "$KEYS_DIR/founder.skey" \
            --out-file "$TRANSACTIONS_DIR/genesis-mint.signed" \
            $CARDANO_NETWORK
        
        cardano-cli transaction submit \
            --tx-file "$TRANSACTIONS_DIR/genesis-mint.signed" \
            $CARDANO_NETWORK
        
        echo "🎉 DEPLOYMENT SUCCESSFUL!"
        echo "You now own 50,000,000 SWORD tokens!"
        
        # Update deployment status
        sed -i 's/"READY_TO_DEPLOY"/"DEPLOYED"/' "$PROJECT_DIR/founder-deployment.json"
    else
        echo "❌ Founder signing key not found. Manual signing required."
    fi
fi

echo "🗡️  DAMOCLES founder deployment script completed!"
echo "   Configuration saved to: $PROJECT_DIR/founder-deployment.json"