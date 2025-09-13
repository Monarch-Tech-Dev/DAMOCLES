#!/usr/bin/env python3
"""
DAMOCLES Founder Token Verification Script
Verifies that the founder has received the correct token allocation
"""

import json
import subprocess
import sys
from datetime import datetime
from typing import Dict, Optional

class FounderTokenVerifier:
    def __init__(self):
        self.founder_address = "addr1qxa0qatlwqfykwslhteprxvz2thrf709w76lk62442725wynzamj4crwpt3yrc8xuyx8cadzs0vz93fdgl05806ygnmq5q8rcy"
        self.expected_tokens = 50_000_000
        self.total_supply = 1_000_000_000
        self.expected_percentage = 5.0
        
    def print_header(self):
        print("🗡️  DAMOCLES FOUNDER TOKEN VERIFICATION")
        print("=" * 50)
        print(f"👤 Founder Address: {self.founder_address}")
        print(f"🎯 Expected Tokens: {self.expected_tokens:,} SWORD")
        print(f"📊 Expected Percentage: {self.expected_percentage}%")
        print("=" * 50)
        print()
    
    def query_cardano_balance(self, network: str = "testnet") -> Dict:
        """Query Cardano blockchain for actual token balance"""
        try:
            print("📡 Querying Cardano blockchain...")
            
            if network == "mainnet":
                network_arg = "--mainnet"
            else:
                network_arg = "--testnet-magic 1097911063"
            
            # Query UTxOs at founder address
            cmd = [
                "cardano-cli", "query", "utxo",
                "--address", self.founder_address,
                network_arg
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"❌ Error querying blockchain: {result.stderr}")
                return {"error": result.stderr}
            
            # Parse UTxO output for SWORD tokens
            utxo_lines = result.stdout.strip().split('\n')
            total_sword_tokens = 0
            total_ada = 0
            utxo_count = 0
            
            for line in utxo_lines[2:]:  # Skip header lines
                if line.strip():
                    parts = line.split()
                    if len(parts) >= 3:
                        utxo_count += 1
                        ada_amount = int(parts[2])
                        total_ada += ada_amount
                        
                        # Look for SWORD tokens in the output
                        if "SWORD" in line:
                            # Extract SWORD token amount
                            sword_part = [part for part in parts if "SWORD" in part]
                            if sword_part:
                                sword_amount_str = sword_part[0].split('.')[0]
                                try:
                                    sword_amount = int(sword_amount_str)
                                    total_sword_tokens += sword_amount
                                except ValueError:
                                    pass
            
            return {
                "sword_tokens": total_sword_tokens,
                "ada_balance": total_ada,
                "utxo_count": utxo_count,
                "query_successful": True,
                "raw_output": result.stdout
            }
            
        except Exception as e:
            print(f"❌ Exception querying blockchain: {str(e)}")
            return {"error": str(e)}
    
    def verify_allocation(self, network: str = "testnet") -> bool:
        """Verify the founder has received correct token allocation"""
        balance_data = self.query_cardano_balance(network)
        
        if "error" in balance_data:
            print(f"❌ Cannot verify allocation: {balance_data['error']}")
            return False
        
        actual_tokens = balance_data.get("sword_tokens", 0)
        ada_balance = balance_data.get("ada_balance", 0)
        
        print(f"💰 ADA Balance: {ada_balance / 1_000_000:.2f} ADA")
        print(f"🗡️  SWORD Tokens: {actual_tokens:,}")
        print()
        
        if actual_tokens >= self.expected_tokens:
            actual_percentage = (actual_tokens / self.total_supply) * 100
            print("✅ FOUNDER ALLOCATION VERIFIED!")
            print(f"🎉 You have {actual_tokens:,} SWORD tokens ({actual_percentage:.2f}%)")
            print("👑 You are officially the founder of DAMOCLES!")
            print("💪 Time to change the financial world!")
            return True
        else:
            print("❌ ALLOCATION ERROR!")
            print(f"Expected: {self.expected_tokens:,} SWORD tokens")
            print(f"Found: {actual_tokens:,} SWORD tokens")
            print(f"Missing: {self.expected_tokens - actual_tokens:,} tokens")
            return False
    
    def generate_founder_report(self, network: str = "testnet") -> Dict:
        """Generate comprehensive founder status report"""
        balance_data = self.query_cardano_balance(network)
        actual_tokens = balance_data.get("sword_tokens", 0)
        ada_balance = balance_data.get("ada_balance", 0)
        
        report = {
            "founder_verification": {
                "address": self.founder_address,
                "verification_date": datetime.now().isoformat(),
                "network": network,
                "status": "VERIFIED" if actual_tokens >= self.expected_tokens else "PENDING"
            },
            "token_allocation": {
                "expected_tokens": self.expected_tokens,
                "actual_tokens": actual_tokens,
                "expected_percentage": self.expected_percentage,
                "actual_percentage": (actual_tokens / self.total_supply) * 100,
                "allocation_complete": actual_tokens >= self.expected_tokens
            },
            "wallet_status": {
                "ada_balance": ada_balance / 1_000_000,
                "utxo_count": balance_data.get("utxo_count", 0),
                "can_transact": ada_balance > 1_000_000  # Has at least 1 ADA for fees
            },
            "founder_privileges": {
                "genesis_minting_rights": True,
                "enhanced_governance": True,
                "veto_power": True,
                "staking_rewards": "60% APY",
                "vesting_schedule": "20% immediate, 20% every 6 months"
            },
            "platform_ownership": {
                "total_supply": self.total_supply,
                "founder_share": actual_tokens,
                "ownership_percentage": (actual_tokens / self.total_supply) * 100,
                "voting_power": "Enhanced (founder privileges)"
            }
        }
        
        return report
    
    def save_founder_certificate(self, report: Dict):
        """Save founder verification certificate"""
        cert_filename = f"founder-certificate-{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        certificate = {
            "certificate_type": "DAMOCLES_FOUNDER_VERIFICATION",
            "issued_to": self.founder_address,
            "issued_at": datetime.now().isoformat(),
            "verification_data": report,
            "statement": "This certificate verifies that the holder of the specified address is the official founder of the DAMOCLES protocol with full founder privileges and token allocation.",
            "signature": "Verified by DAMOCLES verification system"
        }
        
        with open(cert_filename, 'w') as f:
            json.dump(certificate, f, indent=2)
        
        print(f"📜 Founder certificate saved: {cert_filename}")
        return cert_filename

def main():
    print()
    verifier = FounderTokenVerifier()
    verifier.print_header()
    
    # Determine network
    network = "testnet"
    if len(sys.argv) > 1 and sys.argv[1] == "mainnet":
        network = "mainnet"
        print("⚠️  Verifying on MAINNET")
    else:
        print("🧪 Verifying on TESTNET")
    
    print()
    
    # Verify allocation
    success = verifier.verify_allocation(network)
    
    # Generate comprehensive report
    print()
    print("📊 Generating founder report...")
    report = verifier.generate_founder_report(network)
    
    # Save certificate
    cert_file = verifier.save_founder_certificate(report)
    
    print()
    print("🗡️  VERIFICATION SUMMARY")
    print("=" * 30)
    print(f"Status: {'✅ VERIFIED' if success else '❌ PENDING'}")
    print(f"Tokens: {report['token_allocation']['actual_tokens']:,}")
    print(f"Ownership: {report['platform_ownership']['ownership_percentage']:.2f}%")
    print(f"Certificate: {cert_file}")
    
    if success:
        print()
        print("🎉 CONGRATULATIONS!")
        print("You are the verified founder of DAMOCLES!")
        print("Your revolution begins now. 🗡️")
    else:
        print()
        print("⏳ Tokens not yet received.")
        print("Run deployment script first!")
    
    print()

if __name__ == "__main__":
    main()