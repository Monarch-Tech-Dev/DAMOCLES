"""
SWORD (Systematic Whistleblower-Organized Record of Damage) Token Service
Mints immutable NFT evidence of GDPR violations on Cardano blockchain

Sacred Architecture: Blockchain anchoring creates tamper-proof evidence for legal proceedings
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
import os

from services.cardano_client import CardanoClient

logger = logging.getLogger(__name__)


class SWORDService:
    """Service for minting SWORD tokens (violation evidence NFTs)"""

    def __init__(self):
        self.cardano_client = CardanoClient()

        # SWORD token configuration
        self.token_prefix = "SWORD"
        self.min_severity_for_minting = "medium"  # Only mint medium+ severity

        # Severity rankings for filtering
        self.severity_ranks = {
            "critical": 4,
            "high": 3,
            "medium": 2,
            "low": 1
        }

        # IPFS configuration for evidence storage (optional)
        self.ipfs_gateway = os.getenv("IPFS_GATEWAY", "https://ipfs.io/ipfs/")

    async def mint_violation_evidence(
        self,
        violation: Dict[str, Any],
        creditor_data: Dict[str, Any],
        gdpr_request: Dict[str, Any],
        evidence_package: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Mint a SWORD token for a GDPR violation.

        Creates immutable NFT evidence on Cardano blockchain with:
        - Violation details
        - Creditor information
        - Evidence hash (SHA-256)
        - Timestamps
        - Legal references

        Args:
            violation: Violation details (type, severity, description)
            creditor_data: Creditor information (name, org_number)
            gdpr_request: GDPR request details (if applicable)
            evidence_package: Complete evidence data

        Returns:
            SWORD token details including blockchain transaction hash
        """

        # Check if severity meets threshold
        violation_severity = violation.get("severity", "low")
        if not self._should_mint(violation_severity):
            logger.info(f"Violation severity '{violation_severity}' below minting threshold")
            return {
                "minted": False,
                "reason": f"Severity below threshold (minimum: {self.min_severity_for_minting})"
            }

        try:
            # Generate unique asset name
            asset_name = self._generate_asset_name(violation, creditor_data)

            # Compute evidence hash
            evidence_hash = CardanoClient.compute_evidence_hash(evidence_package)

            # Build NFT metadata (CIP-25 compliant)
            metadata = self._build_sword_metadata(
                violation=violation,
                creditor_data=creditor_data,
                gdpr_request=gdpr_request,
                evidence_hash=evidence_hash
            )

            # Mint NFT on Cardano
            mint_result = await self.cardano_client.mint_nft(
                asset_name=asset_name,
                metadata=metadata
            )

            # Create SWORD token record
            sword_token = {
                "asset_id": mint_result.get("asset_id"),
                "asset_name": asset_name,
                "token_type": "SWORD",
                "violation_id": violation.get("id"),
                "creditor_id": creditor_data.get("id"),
                "creditor_name": creditor_data.get("name"),
                "violation_type": violation.get("type"),
                "severity": violation_severity,
                "evidence_hash": evidence_hash,
                "blockchain_tx": mint_result.get("tx_hash"),
                "explorer_url": mint_result.get("explorer_url"),
                "network": mint_result.get("network"),
                "minted_at": datetime.now().isoformat(),
                "metadata": metadata,
                "evidence_package": evidence_package,
                "legal_status": "evidence_anchored",
                "immutable": True
            }

            logger.info(f"⚔️  SWORD token minted: {asset_name}")
            logger.info(f"   Creditor: {creditor_data.get('name')}")
            logger.info(f"   Violation: {violation.get('type')}")
            logger.info(f"   Severity: {violation_severity}")
            logger.info(f"   Evidence Hash: {evidence_hash[:16]}...")
            logger.info(f"   Blockchain TX: {mint_result.get('tx_hash')[:16]}...")

            return {
                "minted": True,
                "sword_token": sword_token
            }

        except Exception as e:
            logger.error(f"Error minting SWORD token: {e}")
            raise

    async def mint_batch_violations(
        self,
        violations: List[Dict[str, Any]],
        creditor_data: Dict[str, Any],
        gdpr_request: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Mint SWORD tokens for multiple violations in batch.

        Used when triggering SWORD protocol for systematic violators.

        Returns:
            Summary of minted tokens
        """

        minted_tokens = []
        skipped = []

        for violation in violations:
            try:
                # Create evidence package for this violation
                evidence_package = self._build_evidence_package(
                    violation=violation,
                    creditor_data=creditor_data,
                    gdpr_request=gdpr_request
                )

                # Mint SWORD token
                result = await self.mint_violation_evidence(
                    violation=violation,
                    creditor_data=creditor_data,
                    gdpr_request=gdpr_request or {},
                    evidence_package=evidence_package
                )

                if result.get("minted"):
                    minted_tokens.append(result["sword_token"])
                else:
                    skipped.append({
                        "violation_id": violation.get("id"),
                        "reason": result.get("reason")
                    })

            except Exception as e:
                logger.error(f"Error minting SWORD token for violation {violation.get('id')}: {e}")
                skipped.append({
                    "violation_id": violation.get("id"),
                    "error": str(e)
                })

        logger.info(f"⚔️  SWORD batch minting complete")
        logger.info(f"   Minted: {len(minted_tokens)} tokens")
        logger.info(f"   Skipped: {len(skipped)}")

        return {
            "total_violations": len(violations),
            "minted_count": len(minted_tokens),
            "skipped_count": len(skipped),
            "minted_tokens": minted_tokens,
            "skipped": skipped,
            "batch_completed_at": datetime.now().isoformat()
        }

    async def verify_sword_token(self, asset_id: str) -> Dict[str, Any]:
        """
        Verify a SWORD token exists on blockchain and retrieve its evidence.

        Used for legal proceedings to prove immutability and authenticity.

        Returns:
            Verification status and token metadata
        """

        try:
            # Verify on Cardano blockchain
            verification = await self.cardano_client.verify_nft(asset_id)

            if not verification.get("exists"):
                return {
                    "verified": False,
                    "asset_id": asset_id,
                    "error": "Token not found on blockchain"
                }

            # Extract SWORD metadata
            metadata = verification.get("metadata", {})

            return {
                "verified": True,
                "asset_id": asset_id,
                "token_type": "SWORD",
                "network": self.cardano_client.network,
                "blockchain_tx": verification.get("initial_mint_tx"),
                "explorer_url": self.cardano_client._get_explorer_url(
                    verification.get("initial_mint_tx", "")
                ),
                "metadata": metadata,
                "immutable": True,
                "legal_status": "blockchain_anchored",
                "verified_at": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Error verifying SWORD token: {e}")
            raise

    async def get_creditor_sword_tokens(
        self,
        creditor_id: str,
        sword_tokens_db: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Get all SWORD tokens minted for a specific creditor.

        Returns violation evidence history for legal proceedings.
        """

        # Filter tokens for this creditor
        creditor_tokens = [
            token for token in sword_tokens_db
            if token.get("creditor_id") == creditor_id
        ]

        # Calculate statistics
        total_tokens = len(creditor_tokens)

        severity_counts = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }

        violation_types = {}

        for token in creditor_tokens:
            severity = token.get("severity", "low")
            if severity in severity_counts:
                severity_counts[severity] += 1

            vtype = token.get("violation_type", "unknown")
            violation_types[vtype] = violation_types.get(vtype, 0) + 1

        return {
            "creditor_id": creditor_id,
            "total_sword_tokens": total_tokens,
            "severity_breakdown": severity_counts,
            "violation_types": violation_types,
            "tokens": creditor_tokens,
            "legal_summary": self._generate_legal_summary(creditor_tokens),
            "retrieved_at": datetime.now().isoformat()
        }

    def _should_mint(self, severity: str) -> bool:
        """Check if violation severity meets minting threshold"""

        violation_rank = self.severity_ranks.get(severity, 0)
        threshold_rank = self.severity_ranks.get(self.min_severity_for_minting, 2)

        return violation_rank >= threshold_rank

    def _generate_asset_name(
        self,
        violation: Dict[str, Any],
        creditor_data: Dict[str, Any]
    ) -> str:
        """
        Generate unique asset name for SWORD token.

        Format: SWORD_{CREDITOR}_{COUNT}_{TIMESTAMP}
        Example: SWORD_CONVENE_001_20241104
        """

        # Sanitize creditor name (remove spaces, special chars)
        creditor_name = creditor_data.get("name", "UNKNOWN")
        creditor_slug = ''.join(c for c in creditor_name.upper() if c.isalnum())[:10]

        # Generate timestamp
        timestamp = datetime.now().strftime("%Y%m%d")

        # Violation sequence (simplified - in production, query DB for count)
        violation_id = violation.get("id", "000")
        sequence = str(violation_id)[-3:].zfill(3)

        asset_name = f"{self.token_prefix}_{creditor_slug}_{sequence}_{timestamp}"

        return asset_name

    def _build_sword_metadata(
        self,
        violation: Dict[str, Any],
        creditor_data: Dict[str, Any],
        gdpr_request: Dict[str, Any],
        evidence_hash: str
    ) -> Dict[str, Any]:
        """Build CIP-25 compliant metadata for SWORD NFT"""

        violation_type = violation.get("type", "unknown")
        severity = violation.get("severity", "unknown")
        creditor_name = creditor_data.get("name", "Unknown Creditor")

        return {
            "name": f"SWORD Evidence: {creditor_name} - {violation_type}",
            "description": f"Immutable evidence of GDPR violation by {creditor_name}. "
                          f"Violation type: {violation_type}. Severity: {severity}. "
                          f"This NFT serves as tamper-proof legal evidence anchored on Cardano blockchain.",
            "image": "ipfs://QmSWORDTokenImage",  # Placeholder - would be actual IPFS hash
            "mediaType": "application/json",
            "violation_type": violation_type,
            "severity": severity,
            "creditor_name": creditor_name,
            "creditor_org_number": creditor_data.get("org_number", ""),
            "timestamp": datetime.now().isoformat(),
            "evidence_hash": evidence_hash,
            "legal_reference": violation.get("legal_reference", "GDPR Article 15"),
            "gdpr_request_id": gdpr_request.get("id", ""),
            "platform": "DAMOCLES",
            "token_type": "SWORD",
            "version": "1.0"
        }

    def _build_evidence_package(
        self,
        violation: Dict[str, Any],
        creditor_data: Dict[str, Any],
        gdpr_request: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Build complete evidence package for hashing"""

        return {
            "violation": {
                "id": violation.get("id"),
                "type": violation.get("type"),
                "severity": violation.get("severity"),
                "description": violation.get("description"),
                "legal_reference": violation.get("legal_reference"),
                "confidence": violation.get("confidence"),
                "detected_at": violation.get("detected_at")
            },
            "creditor": {
                "id": creditor_data.get("id"),
                "name": creditor_data.get("name"),
                "org_number": creditor_data.get("org_number"),
                "type": creditor_data.get("type")
            },
            "gdpr_request": {
                "id": gdpr_request.get("id") if gdpr_request else None,
                "sent_at": gdpr_request.get("sent_at") if gdpr_request else None,
                "deadline": gdpr_request.get("deadline") if gdpr_request else None,
                "status": gdpr_request.get("status") if gdpr_request else None
            },
            "platform": "DAMOCLES",
            "evidence_generated_at": datetime.now().isoformat()
        }

    def _generate_legal_summary(self, tokens: List[Dict[str, Any]]) -> str:
        """Generate legal summary of SWORD tokens for court proceedings"""

        if not tokens:
            return "No SWORD tokens found."

        total = len(tokens)
        critical = sum(1 for t in tokens if t.get("severity") == "critical")
        high = sum(1 for t in tokens if t.get("severity") == "high")

        summary = f"LEGAL EVIDENCE SUMMARY:\n\n"
        summary += f"Total blockchain-anchored violations: {total}\n"
        summary += f"Critical severity: {critical}\n"
        summary += f"High severity: {high}\n\n"
        summary += f"All evidence is immutably stored on Cardano blockchain.\n"
        summary += f"Each SWORD token contains:\n"
        summary += f"- SHA-256 hash of violation evidence\n"
        summary += f"- Timestamp of violation\n"
        summary += f"- Creditor identification\n"
        summary += f"- GDPR legal references\n\n"
        summary += f"Evidence cannot be altered, deleted, or disputed.\n"
        summary += f"Blockchain explorer verification available for all tokens."

        return summary
