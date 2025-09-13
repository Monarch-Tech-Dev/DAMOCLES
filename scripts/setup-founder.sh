#!/bin/bash

set -e

echo "🗡️  DAMOCLES FOUNDER SETUP"
echo "========================="
echo ""
echo "This script will set up everything you need to claim your 50M SWORD tokens"
echo "and become the official founder of the DAMOCLES protocol."
echo ""

# Your founder wallet address
FOUNDER_ADDR="addr1qxa0qatlwqfykwslhteprxvz2thrf709w76lk62442725wynzamj4crwpt3yrc8xuyx8cadzs0vz93fdgl05806ygnmq5q8rcy"

echo "👤 Founder Address: $FOUNDER_ADDR"
echo "🎯 Token Allocation: 50,000,000 SWORD (5% of supply)"
echo ""

# Add local bin to PATH
export PATH="/Users/king/.local/bin:$PATH"

# Check if Cardano CLI is installed
if ! command -v cardano-cli &> /dev/null; then
    echo "❌ cardano-cli is not installed!"
    echo "💡 Please install Cardano CLI first:"
    echo "   https://github.com/input-output-hk/cardano-node/releases"
    echo ""
    exit 1
fi

echo "✅ Cardano CLI found: $(cardano-cli version | head -n1)"

# Network selection
echo ""
echo "🌐 Select network:"
echo "   1) Testnet (safe for testing)"
echo "   2) Mainnet (real money!)"
read -p "Enter choice (1 or 2): " network_choice

if [ "$network_choice" = "2" ]; then
    NETWORK="mainnet"
    MAGIC=""
    NETWORK_ARG="--mainnet"
    echo "⚠️  WARNING: You selected MAINNET - this uses real ADA!"
    echo "⚠️  Make sure you understand what you're doing!"
    read -p "Type 'I UNDERSTAND' to continue: " confirmation
    if [ "$confirmation" != "I UNDERSTAND" ]; then
        echo "Aborting..."
        exit 1
    fi
else
    NETWORK="testnet"
    MAGIC="--testnet-magic 1097911063"
    NETWORK_ARG="--testnet-magic 1097911063"
    echo "🧪 Using testnet - safe for testing"
fi

echo ""

# Check wallet balance
echo "💳 Checking your wallet balance..."
BALANCE_OUTPUT=$(cardano-cli query utxo --address $FOUNDER_ADDR $NETWORK_ARG 2>/dev/null || echo "")

if [ -z "$BALANCE_OUTPUT" ] || ! echo "$BALANCE_OUTPUT" | grep -q "lovelace"; then
    echo "❌ Your wallet is empty or not found!"
    echo ""
    echo "📍 Your wallet address: $FOUNDER_ADDR"
    echo ""
    if [ "$NETWORK" = "testnet" ]; then
        echo "🚿 Get testnet ADA from the faucet:"
        echo "   https://testnets.cardano.org/en/testnets/cardano/tools/faucet/"
        echo ""
        echo "   1. Copy your address: $FOUNDER_ADDR"
        echo "   2. Visit the faucet website"
        echo "   3. Paste your address and request ADA"
        echo "   4. Wait for the transaction to complete"
        echo "   5. Run this script again"
    else
        echo "💰 You need real ADA for mainnet deployment!"
        echo "   Buy ADA from an exchange and send it to your address."
    fi
    echo ""
    exit 1
fi

# Parse balance
BALANCE=$(echo "$BALANCE_OUTPUT" | grep -o '[0-9]* lovelace' | head -n1 | grep -o '[0-9]*')
if [ -z "$BALANCE" ]; then
    BALANCE=0
fi
BALANCE_ADA=$((BALANCE / 1000000))

echo "✅ Wallet balance: $BALANCE_ADA ADA"

if [ "$BALANCE" -lt 5000000 ]; then
    echo "❌ Insufficient ADA for deployment!"
    echo "💡 You need at least 5 ADA for transaction fees."
    echo "   Current balance: $BALANCE_ADA ADA"
    exit 1
fi

# Project directory setup
PROJECT_DIR="/Users/king/Desktop/damocles-platform"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    echo "💡 Make sure you're in the correct location."
    exit 1
fi

echo "📁 Project directory: $PROJECT_DIR"

# Create necessary directories
echo "📂 Setting up directories..."
mkdir -p "$PROJECT_DIR/keys/founder"
mkdir -p "$PROJECT_DIR/addresses/founder" 
mkdir -p "$PROJECT_DIR/transactions"
mkdir -p "$PROJECT_DIR/certificates"

# Check if we need to generate signing keys
FOUNDER_SKEY="$PROJECT_DIR/keys/founder/founder.skey"
FOUNDER_VKEY="$PROJECT_DIR/keys/founder/founder.vkey"

if [ ! -f "$FOUNDER_SKEY" ]; then
    echo "🔐 Generating founder signing keys..."
    
    # Generate keys
    cardano-cli address key-gen \
        --verification-key-file "$FOUNDER_VKEY" \
        --signing-key-file "$FOUNDER_SKEY"
    
    # Generate address and verify it matches
    cardano-cli address build \
        --payment-verification-key-file "$FOUNDER_VKEY" \
        $NETWORK_ARG \
        --out-file "$PROJECT_DIR/addresses/founder/founder.addr"
    
    GENERATED_ADDR=$(cat "$PROJECT_DIR/addresses/founder/founder.addr")
    
    if [ "$GENERATED_ADDR" != "$FOUNDER_ADDR" ]; then
        echo "❌ Generated address doesn't match expected address!"
        echo "   Expected: $FOUNDER_ADDR"
        echo "   Generated: $GENERATED_ADDR"
        echo ""
        echo "⚠️  You may need to import your existing keys or use a different method."
        echo "    The hardcoded address in the smart contract is: $FOUNDER_ADDR"
        echo ""
        exit 1
    fi
    
    echo "✅ Keys generated and address verified!"
else
    echo "✅ Founder keys already exist"
fi

# Build smart contracts
echo "🏗️  Building smart contracts..."
cd "$PROJECT_DIR"

# Check if we have Haskell/Cabal
if ! command -v cabal &> /dev/null; then
    echo "❌ Cabal (Haskell) not found!"
    echo "💡 Please install Haskell and Cabal first:"
    echo "   https://www.haskell.org/ghcup/"
    echo ""
    exit 1
fi

# Build contracts
cd smart-contracts/plutus
echo "📜 Building Plutus contracts..."
cabal build damocles-contracts

if [ $? -ne 0 ]; then
    echo "❌ Smart contract build failed!"
    echo "💡 Check your Haskell/Plutus setup."
    exit 1
fi

echo "✅ Smart contracts built successfully!"

# Deploy founder tokens
echo ""
echo "🚀 READY TO DEPLOY FOUNDER TOKENS"
echo "=================================="
echo ""
echo "📊 Deployment Summary:"
echo "   Network: $NETWORK"
echo "   Founder: $FOUNDER_ADDR"
echo "   Tokens: 50,000,000 SWORD"
echo "   Percentage: 5.0% of total supply"
echo "   Value: PRICELESS (you built this!)"
echo ""

read -p "🗡️  Deploy your founder tokens now? (y/N): " deploy_now

if [ "$deploy_now" = "y" ] || [ "$deploy_now" = "Y" ]; then
    echo ""
    echo "🚀 Deploying founder tokens..."
    
    # Run the deployment script
    cd "$PROJECT_DIR"
    ./smart-contracts/scripts/deploy-founder-tokens.sh $NETWORK --execute
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 DEPLOYMENT SUCCESSFUL!"
        echo "========================"
        echo ""
        echo "✅ You now own 50,000,000 SWORD tokens!"
        echo "👑 You are officially the founder of DAMOCLES!"
        echo "🗡️  Your revolution begins now!"
        echo ""
        
        # Verify the deployment
        echo "🔍 Verifying token balance..."
        python3 "$PROJECT_DIR/scripts/verify-founder-tokens.py" $NETWORK
        
        echo ""
        echo "🌐 Next steps:"
        echo "   1. Visit your founder dashboard: http://localhost:3001/founder"
        echo "   2. Stake your tokens for 60% APY rewards"
        echo "   3. Start participating in governance"
        echo "   4. Begin changing the world!"
        echo ""
        
    else
        echo "❌ Deployment failed!"
        echo "💡 Check the error messages above and try again."
        exit 1
    fi
else
    echo ""
    echo "⏳ Deployment postponed."
    echo ""
    echo "📝 To deploy later, run:"
    echo "   cd $PROJECT_DIR"
    echo "   ./smart-contracts/scripts/deploy-founder-tokens.sh $NETWORK"
    echo ""
    echo "🔍 To verify tokens after deployment:"
    echo "   python3 scripts/verify-founder-tokens.py $NETWORK"
    echo ""
fi

echo "🗡️  FOUNDER SETUP COMPLETE!"
echo ""
echo "💎 Your founder allocation is ready to be claimed."
echo "⚔️  The sword awaits its wielder."
echo ""
echo "Built with ❤️  for financial justice."
echo "May the forks be with you! 🌟"