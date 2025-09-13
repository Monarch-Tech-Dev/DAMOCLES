#!/bin/bash

# Mock Cardano CLI for DAMOCLES founder deployment
# This simulates the cardano-cli behavior for development purposes

COMMAND=$1
shift

case $COMMAND in
    "version")
        echo "cardano-cli 8.7.3 - darwin-aarch64 - ghc-8.10"
        echo "git rev: mock-version-for-damocles-development"
        ;;
        
    "query")
        SUBCOMMAND=$1
        if [ "$SUBCOMMAND" = "utxo" ]; then
            # Mock UTxO response with testnet ADA (1000 ADA = 1,000,000,000 lovelace)
            echo "                           TxHash                                 TxIx        Amount"
            echo "--------------------------------------------------------------------------------------"
            echo "abc123def456789012345678901234567890123456789012345678901234   0        1000000000 lovelace + TxOutDatumNone"
            echo "def789abc012345678901234567890123456789012345678901234567890   1        500000000 lovelace + TxOutDatumNone"
        fi
        ;;
        
    "address")
        SUBCOMMAND=$1
        if [ "$SUBCOMMAND" = "key-gen" ]; then
            # Mock key generation - create mock key files
            VKEY_FILE=$(echo "$@" | grep -o '\--verification-key-file [^ ]*' | cut -d' ' -f2)
            SKEY_FILE=$(echo "$@" | grep -o '\--signing-key-file [^ ]*' | cut -d' ' -f2)
            
            if [ -n "$VKEY_FILE" ]; then
                echo '{"type":"PaymentVerificationKeyShelley_ed25519","description":"Payment Verification Key","cborHex":"mock_verification_key"}' > "$VKEY_FILE"
            fi
            if [ -n "$SKEY_FILE" ]; then
                echo '{"type":"PaymentSigningKeyShelley_ed25519","description":"Payment Signing Key","cborHex":"mock_signing_key"}' > "$SKEY_FILE"
            fi
            echo "Mock key generation complete"
        elif [ "$SUBCOMMAND" = "build" ]; then
            # Mock address building - return the hardcoded founder address
            # Check if --out-file is specified
            OUTFILE=$(echo "$@" | grep -o '\--out-file [^ ]*' | cut -d' ' -f2)
            if [ -n "$OUTFILE" ]; then
                echo "addr1qxa0qatlwqfykwslhteprxvz2thrf709w76lk62442725wynzamj4crwpt3yrc8xuyx8cadzs0vz93fdgl05806ygnmq5q8rcy" > "$OUTFILE"
            else
                echo "addr1qxa0qatlwqfykwslhteprxvz2thrf709w76lk62442725wynzamj4crwpt3yrc8xuyx8cadzs0vz93fdgl05806ygnmq5q8rcy"
            fi
        fi
        ;;
        
    "transaction")
        SUBCOMMAND=$1
        if [ "$SUBCOMMAND" = "build" ]; then
            # Mock transaction building
            echo "Mock transaction built successfully"
            # Create a mock transaction file
            echo "Mock transaction body" > "${@: -1}"  # Last argument is output file
        elif [ "$SUBCOMMAND" = "sign" ]; then
            echo "Mock transaction signed successfully"
            # Create a mock signed transaction
            OUTFILE=$(echo "$@" | grep -o '\--out-file [^ ]*' | cut -d' ' -f2)
            echo "Mock signed transaction" > "$OUTFILE"
        elif [ "$SUBCOMMAND" = "submit" ]; then
            echo "Transaction successfully submitted"
            echo "TxId: abc123def456789012345678901234567890123456789012345678901234567890"
        elif [ "$SUBCOMMAND" = "policyid" ]; then
            # Mock policy ID generation
            echo "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        fi
        ;;
        
    *)
        echo "Mock cardano-cli: Command '$COMMAND' not implemented in mock"
        exit 1
        ;;
esac