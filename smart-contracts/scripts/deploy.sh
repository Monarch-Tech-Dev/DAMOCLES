#!/bin/bash

set -e

# DAMOCLES Smart Contract Deployment Script
# Usage: ./deploy.sh [testnet|mainnet]

NETWORK=${1:-testnet}
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
PROJECT_DIR=$(dirname "$SCRIPT_DIR")

echo "🗡️  DAMOCLES Smart Contract Deployment"
echo "Network: $NETWORK"
echo "----------------------------------------"

# Configuration
if [ "$NETWORK" = "mainnet" ]; then
    CARDANO_NETWORK="--mainnet"
    MAGIC=""
    NODE_SOCKET_PATH=${CARDANO_NODE_SOCKET_PATH:-"/opt/cardano/cnode/sockets/node0.socket"}
else
    CARDANO_NETWORK="--testnet-magic 1097911063"
    MAGIC="--testnet-magic 1097911063"
    NODE_SOCKET_PATH=${CARDANO_NODE_SOCKET_PATH:-"/opt/cardano/testnet/db/node.socket"}
fi

export CARDANO_NODE_SOCKET_PATH=$NODE_SOCKET_PATH

# Directories
KEYS_DIR="$PROJECT_DIR/keys"
SCRIPTS_DIR="$PROJECT_DIR/compiled-scripts"
ADDRESSES_DIR="$PROJECT_DIR/addresses"

# Create directories
mkdir -p "$KEYS_DIR" "$SCRIPTS_DIR" "$ADDRESSES_DIR"

echo "📁 Directories created"

# Generate DAO keys if they don't exist
DAO_SKEY="$KEYS_DIR/dao.skey"
DAO_VKEY="$KEYS_DIR/dao.vkey"

if [ ! -f "$DAO_SKEY" ]; then
    echo "🔐 Generating DAO keys..."
    cardano-cli address key-gen \
        --verification-key-file "$DAO_VKEY" \
        --signing-key-file "$DAO_SKEY"
fi

# Generate DAO address
cardano-cli address build \
    --payment-verification-key-file "$DAO_VKEY" \
    $CARDANO_NETWORK \
    --out-file "$ADDRESSES_DIR/dao.addr"

DAO_ADDR=$(cat "$ADDRESSES_DIR/dao.addr")
echo "📍 DAO Address: $DAO_ADDR"

# Build smart contracts
echo "🏗️  Building smart contracts..."
cd "$PROJECT_DIR/plutus"

# Build the Cabal project
cabal build damocles-contracts

# Generate Plutus scripts
echo "📜 Generating Plutus scripts..."

# Evidence Registry Validator
cabal exec damocles-cli -- evidence-validator \
    --out-file "$SCRIPTS_DIR/evidence-validator.plutus"

# Token Minting Policy
cabal exec damocles-cli -- token-policy \
    --dao-key-file "$DAO_VKEY" \
    --out-file "$SCRIPTS_DIR/token-policy.plutus"

# Staking Validator
cabal exec damocles-cli -- staking-validator \
    --out-file "$SCRIPTS_DIR/staking-validator.plutus"

# Generate script addresses
echo "📍 Generating script addresses..."

# Evidence Registry Address
cardano-cli address build \
    --payment-script-file "$SCRIPTS_DIR/evidence-validator.plutus" \
    $CARDANO_NETWORK \
    --out-file "$ADDRESSES_DIR/evidence-registry.addr"

# Staking Address
cardano-cli address build \
    --payment-script-file "$SCRIPTS_DIR/staking-validator.plutus" \
    $CARDANO_NETWORK \
    --out-file "$ADDRESSES_DIR/staking.addr"

EVIDENCE_ADDR=$(cat "$ADDRESSES_DIR/evidence-registry.addr")
STAKING_ADDR=$(cat "$ADDRESSES_DIR/staking.addr")

echo "📍 Evidence Registry: $EVIDENCE_ADDR"
echo "📍 Staking Contract: $STAKING_ADDR"

# Generate token policy ID
TOKEN_POLICY_ID=$(cardano-cli transaction policyid \
    --script-file "$SCRIPTS_DIR/token-policy.plutus")

echo "🪙 Token Policy ID: $TOKEN_POLICY_ID"

# Create deployment configuration
cat > "$PROJECT_DIR/deployment-config.json" << EOF
{
  "network": "$NETWORK",
  "daoAddress": "$DAO_ADDR",
  "evidenceRegistryAddress": "$EVIDENCE_ADDR",
  "stakingAddress": "$STAKING_ADDR",
  "tokenPolicyId": "$TOKEN_POLICY_ID",
  "contracts": {
    "evidenceValidator": "$SCRIPTS_DIR/evidence-validator.plutus",
    "tokenPolicy": "$SCRIPTS_DIR/token-policy.plutus", 
    "stakingValidator": "$SCRIPTS_DIR/staking-validator.plutus"
  },
  "deploymentDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo "✅ Smart contracts deployed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   Network: $NETWORK"
echo "   DAO Address: $DAO_ADDR"
echo "   Evidence Registry: $EVIDENCE_ADDR"
echo "   Staking Contract: $STAKING_ADDR"
echo "   Token Policy: $TOKEN_POLICY_ID"
echo ""
echo "📄 Configuration saved to: $PROJECT_DIR/deployment-config.json"
echo ""

# Fund contracts on testnet
if [ "$NETWORK" = "testnet" ]; then
    echo "💰 To fund your contracts on testnet, visit:"
    echo "   https://testnets.cardano.org/en/testnets/cardano/tools/faucet/"
    echo ""
    echo "   Fund these addresses:"
    echo "   DAO: $DAO_ADDR"
    echo "   Evidence Registry: $EVIDENCE_ADDR"
    echo "   Staking: $STAKING_ADDR"
fi

echo "🗡️  DAMOCLES deployment complete!"