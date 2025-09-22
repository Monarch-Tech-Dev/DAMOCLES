#!/bin/bash
# Install Cardano CLI on macOS
# Sacred Architecture - SWORD Token Deployment Setup

echo "🗡️ Installing Cardano CLI for SWORD Token Deployment"
echo "==================================================="

# Create directories
mkdir -p ~/cardano-testnet
cd ~/cardano-testnet

echo "📁 Created cardano-testnet directory"

# Download Cardano Node and CLI
echo "⬇️ Downloading Cardano CLI..."
curl -L https://github.com/IntersectMBO/cardano-node/releases/download/8.7.3/cardano-node-8.7.3-macos.tar.gz -o cardano-node.tar.gz

if [ $? -eq 0 ]; then
    echo "✅ Download completed"

    # Extract the archive
    echo "📦 Extracting Cardano CLI..."
    tar -xzf cardano-node.tar.gz

    # Make CLI executable and move to local bin
    chmod +x cardano-cli
    mkdir -p ~/bin
    mv cardano-cli ~/bin/

    # Add to PATH if not already there
    if ! echo $PATH | grep -q "$HOME/bin"; then
        echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
        echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bash_profile
        export PATH="$HOME/bin:$PATH"
    fi

    echo "✅ Cardano CLI installed successfully!"
    echo "📍 Location: ~/bin/cardano-cli"

    # Verify installation
    if ~/bin/cardano-cli --version; then
        echo "🎉 Installation verified!"
    else
        echo "⚠️ Installation verification failed"
    fi

    # Clean up
    rm cardano-node.tar.gz

    echo ""
    echo "🎯 Next Steps:"
    echo "1. Reload your shell: source ~/.zshrc"
    echo "2. Create testnet wallet: cd ~/cardano-testnet"
    echo "3. Run: cardano-cli address key-gen --verification-key-file payment.vkey --signing-key-file payment.skey"

else
    echo "❌ Download failed. Please check your internet connection."
    exit 1
fi

echo ""
echo "⚔️ Sacred Architecture: Technology serving consciousness"