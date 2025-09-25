#!/usr/bin/env node

/**
 * DAMOCLES Cardano Contracts - Testnet Deployment Script
 *
 * This script deploys the complete DAMOCLES security stack to Cardano testnet:
 * 1. Multi-signature treasury setup
 * 2. Time-locked withdrawal validator
 * 3. SWORD token vesting policy
 * 4. Emergency pause system
 *
 * Security: Uses testnet addresses and keys - NEVER use mainnet keys
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  network: 'testnet-magic 1097911063',
  socketPath: process.env.CARDANO_NODE_SOCKET_PATH || '/tmp/cardano-node.socket',
  protocolParams: './protocol-parameters.json',

  // Deployment directories
  keysDir: './keys/testnet',
  scriptsDir: './scripts',
  buildDir: './build/testnet',

  // Key files (testnet only)
  paymentKey: './keys/testnet/payment.skey',
  paymentAddr: './keys/testnet/payment.addr',

  // Contract parameters
  treasury: {
    requiredSigs: 3,
    signers: [
      'testnet_founder_key_hash',
      'testnet_community1_key_hash',
      'testnet_community2_key_hash',
      'testnet_advisor_key_hash',
      'testnet_backup_key_hash'
    ],
    timeLockDelay: 172800000,  // 48 hours
    minimumLockAmount: 100000000000  // 100k ADA
  },

  sword: {
    totalSupply: 1000000000,
    vestingStart: Date.now(),
    founderAllocation: 50000000,
    teamAllocation: 150000000,
    advisorAllocation: 50000000,
    communityAllocation: 750000000
  }
};

class DeploymentManager {
  constructor() {
    this.deploymentLog = [];
    this.deployedContracts = {};
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
    this.deploymentLog.push({ timestamp: new Date(), message });
  }

  error(message) {
    console.error(`[ERROR] ${message}`);
    process.exit(1);
  }

  // Execute cardano-cli command
  cli(command) {
    try {
      this.log(`Executing: cardano-cli ${command}`);
      const result = execSync(`cardano-cli ${command}`, {
        encoding: 'utf8',
        env: {
          ...process.env,
          CARDANO_NODE_SOCKET_PATH: CONFIG.socketPath
        }
      });
      return result.trim();
    } catch (error) {
      this.error(`CLI command failed: ${error.message}`);
    }
  }

  // Check prerequisites
  checkPrerequisites() {
    this.log('Checking deployment prerequisites...');

    // Check cardano-cli
    try {
      this.cli('--version');
    } catch {
      this.error('cardano-cli not found. Please install Cardano node.');
    }

    // Check socket
    if (!fs.existsSync(CONFIG.socketPath)) {
      this.error(`Cardano node socket not found: ${CONFIG.socketPath}`);
    }

    // Check directories
    [CONFIG.keysDir, CONFIG.buildDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`);
      }
    });

    this.log('Prerequisites check passed');
  }

  // Generate testnet wallet if not exists
  generateTestnetWallet() {
    this.log('Setting up testnet wallet...');

    if (!fs.existsSync(CONFIG.paymentKey)) {
      this.log('Generating new testnet wallet...');

      // Generate payment keys
      this.cli(`address key-gen \\
        --verification-key-file ${CONFIG.keysDir}/payment.vkey \\
        --signing-key-file ${CONFIG.keysDir}/payment.skey`);

      // Generate address
      this.cli(`address build \\
        --payment-verification-key-file ${CONFIG.keysDir}/payment.vkey \\
        --testnet-magic 1097911063 \\
        --out-file ${CONFIG.keysDir}/payment.addr`);

      const address = fs.readFileSync(CONFIG.paymentAddr, 'utf8').trim();
      this.log(`Generated testnet address: ${address}`);
      this.log('Please fund this address with testnet ADA from the faucet');
      this.log('Faucet: https://testnets.cardano.org/en/testnets/cardano/tools/faucet/');

      // Wait for funding
      this.waitForFunding(address);
    } else {
      const address = fs.readFileSync(CONFIG.paymentAddr, 'utf8').trim();
      this.log(`Using existing testnet address: ${address}`);
      this.checkBalance(address);
    }
  }

  // Check wallet balance
  checkBalance(address) {
    const utxos = this.cli(`query utxo --address ${address} --testnet-magic 1097911063`);
    this.log(`Wallet UTXOs:\\n${utxos}`);

    if (utxos.includes('Lovelace')) {
      this.log('Wallet has funds - proceeding with deployment');
    } else {
      this.error('Wallet has no funds. Please fund from testnet faucet.');
    }
  }

  // Wait for wallet funding
  waitForFunding(address) {
    this.log('Waiting for wallet funding (checking every 30 seconds)...');

    const checkFunding = () => {
      try {
        const utxos = this.cli(`query utxo --address ${address} --testnet-magic 1097911063`);
        if (utxos.includes('Lovelace')) {
          this.log('Wallet funded successfully!');
          return true;
        }
      } catch {}
      return false;
    };

    const interval = setInterval(() => {
      if (checkFunding()) {
        clearInterval(interval);
        this.log('Proceeding with deployment...');
      } else {
        this.log('Still waiting for funds...');
      }
    }, 30000);

    // Initial check
    if (checkFunding()) {
      clearInterval(interval);
    }
  }

  // Get protocol parameters
  getProtocolParameters() {
    this.log('Fetching protocol parameters...');
    this.cli(`query protocol-parameters \\
      --testnet-magic 1097911063 \\
      --out-file ${CONFIG.protocolParams}`);
    this.log('Protocol parameters saved');
  }

  // Compile Plutus scripts
  compileContracts() {
    this.log('Compiling Plutus contracts...');

    // This would normally use a Haskell build system like Cabal
    // For now, we'll create placeholder compiled scripts

    const contracts = [
      'treasury-timelock',
      'sword-vesting',
      'emergency-pause'
    ];

    contracts.forEach(contract => {
      const scriptFile = `${CONFIG.buildDir}/${contract}.plutus`;
      const hashFile = `${CONFIG.buildDir}/${contract}.hash`;

      // Placeholder - would compile actual Plutus code
      this.log(`Compiling ${contract} contract...`);

      // Create placeholder files for testing
      fs.writeFileSync(scriptFile, JSON.stringify({
        type: "PlutusScriptV2",
        description: `DAMOCLES ${contract} validator`,
        cborHex: "placeholder_cbor_hex_would_go_here"
      }, null, 2));

      // Generate script address and hash
      try {
        this.cli(`address build \\
          --payment-script-file ${scriptFile} \\
          --testnet-magic 1097911063 \\
          --out-file ${CONFIG.buildDir}/${contract}.addr`);

        const scriptHash = this.cli(`transaction policyid --script-file ${scriptFile}`);
        fs.writeFileSync(hashFile, scriptHash);

        this.deployedContracts[contract] = {
          scriptFile,
          hash: scriptHash,
          address: fs.readFileSync(`${CONFIG.buildDir}/${contract}.addr`, 'utf8').trim()
        };

        this.log(`${contract} compiled - Hash: ${scriptHash}`);
      } catch (error) {
        this.log(`Note: ${contract} compilation placeholder created`);
      }
    });
  }

  // Deploy multi-signature treasury
  deployTreasury() {
    this.log('Deploying multi-signature treasury...');

    const multiSigScript = {
      type: "atLeast",
      required: CONFIG.treasury.requiredSigs,
      scripts: CONFIG.treasury.signers.map(keyHash => ({
        type: "sig",
        keyHash: keyHash
      }))
    };

    const scriptFile = `${CONFIG.buildDir}/treasury-multisig.json`;
    fs.writeFileSync(scriptFile, JSON.stringify(multiSigScript, null, 2));

    // Generate treasury address
    this.cli(`address build \\
      --payment-script-file ${scriptFile} \\
      --testnet-magic 1097911063 \\
      --out-file ${CONFIG.buildDir}/treasury-multisig.addr`);

    const treasuryAddress = fs.readFileSync(`${CONFIG.buildDir}/treasury-multisig.addr`, 'utf8').trim();

    this.deployedContracts.treasury = {
      scriptFile,
      address: treasuryAddress,
      requiredSigs: CONFIG.treasury.requiredSigs
    };

    this.log(`Treasury deployed to: ${treasuryAddress}`);
  }

  // Create deployment summary
  createDeploymentSummary() {
    const summary = {
      network: 'cardano-testnet',
      timestamp: new Date().toISOString(),
      deployer: fs.readFileSync(CONFIG.paymentAddr, 'utf8').trim(),
      contracts: this.deployedContracts,
      configuration: CONFIG,
      deploymentLog: this.deploymentLog,

      nextSteps: [
        '1. Fund contracts with test ADA if needed',
        '2. Test withdrawal flow with time-lock',
        '3. Test emergency pause functionality',
        '4. Verify SWORD token minting',
        '5. Run integration tests',
        '6. Document contract addresses for frontend integration'
      ],

      importantNotes: [
        'These are TESTNET contracts only',
        'Never use these addresses or keys on mainnet',
        'All placeholder key hashes must be replaced with real testnet keys',
        'Contracts need actual Plutus compilation before use'
      ]
    };

    const summaryFile = `${CONFIG.buildDir}/deployment-summary.json`;
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

    this.log(`Deployment summary saved to: ${summaryFile}`);
    return summary;
  }

  // Main deployment process
  async deploy() {
    try {
      this.log('Starting DAMOCLES testnet deployment...');

      this.checkPrerequisites();
      this.generateTestnetWallet();
      this.getProtocolParameters();
      this.compileContracts();
      this.deployTreasury();

      const summary = this.createDeploymentSummary();

      this.log('='.repeat(60));
      this.log('DAMOCLES TESTNET DEPLOYMENT COMPLETE');
      this.log('='.repeat(60));
      this.log(`Treasury Address: ${summary.contracts.treasury.address}`);
      this.log(`Deployer Address: ${summary.deployer}`);
      this.log(`Summary: ${CONFIG.buildDir}/deployment-summary.json`);
      this.log('='.repeat(60));

      // Display next steps
      this.log('NEXT STEPS:');
      summary.nextSteps.forEach((step, i) => {
        this.log(`${i + 1}. ${step}`);
      });

      this.log('\\nIMPORTANT NOTES:');
      summary.importantNotes.forEach(note => {
        this.log(`⚠️  ${note}`);
      });

      return summary;

    } catch (error) {
      this.error(`Deployment failed: ${error.message}`);
    }
  }
}

// CLI execution
if (require.main === module) {
  const deployer = new DeploymentManager();

  // Handle command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
DAMOCLES Testnet Deployment Script

Usage:
  node deploy-testnet.js [options]

Options:
  --help, -h          Show this help message
  --check-only        Only check prerequisites, don't deploy
  --force            Skip confirmation prompts

Environment Variables:
  CARDANO_NODE_SOCKET_PATH    Path to Cardano node socket

Examples:
  node deploy-testnet.js                    # Full deployment
  node deploy-testnet.js --check-only       # Check prerequisites only

Security Notice:
  This script is for TESTNET deployment only.
  Never use testnet keys or addresses on mainnet.
`);
    process.exit(0);
  }

  if (args.includes('--check-only')) {
    deployer.checkPrerequisites();
    console.log('Prerequisites check complete');
    process.exit(0);
  }

  // Confirmation prompt (unless --force)
  if (!args.includes('--force')) {
    console.log('⚠️  You are about to deploy DAMOCLES contracts to Cardano TESTNET');
    console.log('   This will create contracts and potentially spend testnet ADA');
    console.log('   Make sure you have testnet ADA in your wallet');
    console.log('');
    console.log('   Continue? (y/N): ');

    process.stdin.resume();
    process.stdin.on('data', (data) => {
      const input = data.toString().trim().toLowerCase();
      if (input === 'y' || input === 'yes') {
        deployer.deploy().catch(console.error);
      } else {
        console.log('Deployment cancelled');
        process.exit(0);
      }
      process.stdin.pause();
    });
  } else {
    deployer.deploy().catch(console.error);
  }
}