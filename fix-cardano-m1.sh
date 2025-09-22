#!/bin/bash
# Fix Cardano CLI for Apple Silicon (M1/M2)
echo "🗡️ Installing Cardano CLI for Apple Silicon"

# Try using Nix package manager (recommended for Apple Silicon)
if ! command -v nix &> /dev/null; then
    echo "📦 Installing Nix package manager..."
    sh <(curl -L https://nixos.org/nix/install) --daemon
    . ~/.nix-profile/etc/profile.d/nix.sh
fi

# Install Cardano CLI via Nix
echo "⬇️ Installing cardano-cli via Nix..."
nix-env -iA nixpkgs.cardano-cli

# Verify installation
if cardano-cli --version; then
    echo "✅ Cardano CLI installed successfully!"
    cardano-cli --version
else
    echo "❌ Installation failed, trying alternative..."

    # Alternative: Use cardano-cli JavaScript wrapper
    npm install -g @stricahq/cardano-cli-js
    echo "📦 Installed JavaScript Cardano CLI wrapper"
fi

echo "🎯 Ready for real testnet deployment!"