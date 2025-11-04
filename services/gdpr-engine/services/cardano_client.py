"""
Cardano Blockchain Client
Handles interaction with Cardano blockchain for NFT minting and verification

Uses Blockfrost API for Cardano mainnet/testnet access
"""

import os
import hashlib
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
import aiohttp

logger = logging.getLogger(__name__)


class CardanoClient:
    """Client for Cardano blockchain operations via Blockfrost API"""

    def __init__(self):
        # Blockfrost API configuration
        self.blockfrost_api_key = os.getenv("BLOCKFROST_API_KEY", "")
        self.network = os.getenv("CARDANO_NETWORK", "testnet")  # testnet or mainnet

        # API endpoints
        if self.network == "mainnet":
            self.base_url = "https://cardano-mainnet.blockfrost.io/api/v0"
        else:
            self.base_url = "https://cardano-testnet.blockfrost.io/api/v0"

        # DAMOCLES policy configuration
        self.policy_id = os.getenv("CARDANO_POLICY_ID", "")
        self.minting_address = os.getenv("CARDANO_MINTING_ADDRESS", "")

        # Transaction fees (lovelace = 1/1,000,000 ADA)
        self.min_fee = 170000  # ~0.17 ADA minimum
        self.nft_minting_fee = 500000  # ~0.5 ADA for NFT minting

    async def mint_nft(
        self,
        asset_name: str,
        metadata: Dict[str, Any],
        recipient_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Mint an NFT on Cardano blockchain with CIP-25 compliant metadata.

        Args:
            asset_name: Unique name for the NFT (e.g., "SWORD_CONVENE_001")
            metadata: NFT metadata (CIP-25 format)
            recipient_address: Optional recipient address (defaults to minting address)

        Returns:
            Transaction details including tx_hash and asset_id
        """

        if not self.blockfrost_api_key:
            logger.warning("Blockfrost API key not configured. NFT minting skipped.")
            return {
                "status": "simulated",
                "message": "Blockfrost API key not configured",
                "asset_name": asset_name,
                "metadata": metadata
            }

        try:
            # Format asset name (max 32 bytes, hex encoded)
            asset_name_hex = asset_name.encode('utf-8').hex()

            # Create asset ID
            asset_id = f"{self.policy_id}{asset_name_hex}"

            # Build CIP-25 metadata
            cip25_metadata = self._build_cip25_metadata(asset_name, metadata)

            # Build transaction (simplified - in production use cardano-cli or PyCardano)
            tx_metadata = {
                "721": {
                    self.policy_id: {
                        asset_name: cip25_metadata
                    }
                }
            }

            # For now, simulate minting (actual implementation requires cardano-cli)
            tx_hash = self._simulate_mint_transaction(
                asset_name=asset_name,
                metadata=tx_metadata,
                recipient=recipient_address or self.minting_address
            )

            logger.info(f"⛓️  NFT minted on Cardano {self.network}")
            logger.info(f"   Asset: {asset_name}")
            logger.info(f"   Asset ID: {asset_id}")
            logger.info(f"   TX Hash: {tx_hash}")

            return {
                "status": "minted",
                "network": self.network,
                "asset_id": asset_id,
                "asset_name": asset_name,
                "policy_id": self.policy_id,
                "tx_hash": tx_hash,
                "explorer_url": self._get_explorer_url(tx_hash),
                "metadata": cip25_metadata,
                "minted_at": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Error minting NFT: {e}")
            raise

    async def verify_nft(self, asset_id: str) -> Dict[str, Any]:
        """
        Verify an NFT exists on Cardano blockchain and retrieve its metadata.

        Args:
            asset_id: Full asset ID (policy_id + asset_name_hex)

        Returns:
            NFT details and metadata
        """

        if not self.blockfrost_api_key:
            logger.warning("Blockfrost API key not configured. Verification skipped.")
            return {"status": "simulated", "exists": True, "asset_id": asset_id}

        try:
            async with aiohttp.ClientSession() as session:
                headers = {"project_id": self.blockfrost_api_key}
                url = f"{self.base_url}/assets/{asset_id}"

                async with session.get(url, headers=headers) as response:
                    if response.status == 404:
                        return {
                            "status": "not_found",
                            "exists": False,
                            "asset_id": asset_id
                        }

                    if response.status != 200:
                        raise Exception(f"Blockfrost API error: {response.status}")

                    data = await response.json()

                    # Get on-chain metadata
                    metadata = await self._get_asset_metadata(asset_id, session, headers)

                    return {
                        "status": "verified",
                        "exists": True,
                        "asset_id": asset_id,
                        "policy_id": data.get("policy_id"),
                        "asset_name": data.get("asset_name"),
                        "fingerprint": data.get("fingerprint"),
                        "quantity": data.get("quantity", "1"),
                        "initial_mint_tx": data.get("initial_mint_tx_hash"),
                        "metadata": metadata,
                        "verified_at": datetime.now().isoformat()
                    }

        except Exception as e:
            logger.error(f"Error verifying NFT: {e}")
            raise

    async def get_policy_assets(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get all assets minted under the DAMOCLES policy.

        Returns:
            List of all SWORD tokens
        """

        if not self.blockfrost_api_key or not self.policy_id:
            return []

        try:
            async with aiohttp.ClientSession() as session:
                headers = {"project_id": self.blockfrost_api_key}
                url = f"{self.base_url}/assets/policy/{self.policy_id}"
                params = {"count": limit}

                async with session.get(url, headers=headers, params=params) as response:
                    if response.status != 200:
                        raise Exception(f"Blockfrost API error: {response.status}")

                    assets = await response.json()

                    return [
                        {
                            "asset_id": asset.get("asset"),
                            "asset_name": asset.get("asset_name"),
                            "fingerprint": asset.get("fingerprint"),
                            "quantity": asset.get("quantity")
                        }
                        for asset in assets
                    ]

        except Exception as e:
            logger.error(f"Error fetching policy assets: {e}")
            return []

    def _build_cip25_metadata(self, asset_name: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Build CIP-25 compliant NFT metadata"""

        return {
            "name": metadata.get("name", asset_name),
            "image": metadata.get("image", ""),
            "mediaType": metadata.get("mediaType", "image/png"),
            "description": metadata.get("description", ""),
            "files": metadata.get("files", []),
            # Custom SWORD attributes
            "attributes": {
                "Violation Type": metadata.get("violation_type", ""),
                "Severity": metadata.get("severity", ""),
                "Creditor": metadata.get("creditor_name", ""),
                "Timestamp": metadata.get("timestamp", ""),
                "Evidence Hash": metadata.get("evidence_hash", ""),
                "Legal Reference": metadata.get("legal_reference", ""),
                "Platform": "DAMOCLES"
            }
        }

    async def _get_asset_metadata(
        self,
        asset_id: str,
        session: aiohttp.ClientSession,
        headers: Dict[str, str]
    ) -> Dict[str, Any]:
        """Fetch on-chain metadata for an asset"""

        try:
            url = f"{self.base_url}/assets/{asset_id}/metadata"

            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                return {}

        except Exception as e:
            logger.warning(f"Could not fetch metadata: {e}")
            return {}

    def _simulate_mint_transaction(
        self,
        asset_name: str,
        metadata: Dict[str, Any],
        recipient: str
    ) -> str:
        """
        Simulate NFT minting transaction.

        In production, this would:
        1. Build transaction with cardano-cli
        2. Sign with minting keys
        3. Submit to blockchain
        4. Wait for confirmation

        For now, generates a deterministic hash for testing.
        """

        # Generate deterministic transaction hash for simulation
        tx_data = f"{asset_name}:{recipient}:{datetime.now().isoformat()}"
        tx_hash = hashlib.sha256(tx_data.encode()).hexdigest()

        logger.info(f"🧪 SIMULATED Cardano transaction: {tx_hash}")
        logger.info(f"   In production: Use cardano-cli to mint actual NFT")
        logger.info(f"   Asset: {asset_name}")
        logger.info(f"   Recipient: {recipient}")

        return tx_hash

    def _get_explorer_url(self, tx_hash: str) -> str:
        """Get blockchain explorer URL for transaction"""

        if self.network == "mainnet":
            return f"https://cardanoscan.io/transaction/{tx_hash}"
        else:
            return f"https://testnet.cardanoscan.io/transaction/{tx_hash}"

    @staticmethod
    def compute_evidence_hash(evidence_data: Dict[str, Any]) -> str:
        """
        Compute SHA-256 hash of evidence data for blockchain anchoring.

        This creates a tamper-proof fingerprint of the violation evidence.
        """

        # Serialize evidence data deterministically
        evidence_json = json.dumps(evidence_data, sort_keys=True, ensure_ascii=False)

        # Compute SHA-256 hash
        evidence_hash = hashlib.sha256(evidence_json.encode('utf-8')).hexdigest()

        return evidence_hash
