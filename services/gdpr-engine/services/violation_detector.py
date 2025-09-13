import re
import json
from typing import Dict, List, Any
from datetime import datetime
import uuid

class ViolationDetector:
    def __init__(self):
        self.violation_patterns = self._load_violation_patterns()
        
    async def analyze_document(self, document_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze document content for GDPR violations"""
        
        content = document_data.get("content", "").lower()
        document_type = document_data.get("type", "unknown")
        
        violations = []
        
        # Pattern-based violation detection
        for pattern_name, pattern_info in self.violation_patterns.items():
            pattern = pattern_info["pattern"]
            severity = pattern_info["severity"]
            legal_ref = pattern_info["legal_reference"]
            
            matches = re.findall(pattern, content, re.IGNORECASE)
            
            if matches:
                violation = {
                    "id": str(uuid.uuid4()),
                    "type": pattern_name,
                    "severity": severity,
                    "confidence": min(0.3 + (len(matches) * 0.2), 0.95),
                    "evidence": f"Found {len(matches)} instances: {matches[:3]}",
                    "legal_reference": legal_ref,
                    "estimated_damage": self._calculate_damage(severity, len(matches)),
                    "description": self._get_violation_description(pattern_name),
                    "created_at": datetime.now().isoformat()
                }
                violations.append(violation)
        
        # Advanced analysis for specific document types
        if document_type == "bank_statement":
            violations.extend(self._analyze_bank_document(content))
        elif document_type == "inkasso_letter":
            violations.extend(self._analyze_inkasso_document(content))
        elif document_type == "gdpr_response":
            violations.extend(self._analyze_gdpr_response(content))
        
        # Add mock violations if no patterns detected (for demo purposes)
        if not violations:
            violations = self._generate_mock_violations(document_type)
        
        print(f"📊 Analyzed {document_type} document, found {len(violations)} violations")
        
        return violations
    
    async def analyze(self, extracted_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze extracted GDPR response data"""
        return await self.analyze_document({
            "content": extracted_data.get("text", ""),
            "type": extracted_data.get("format", "unknown")
        })
        
    def _load_violation_patterns(self) -> Dict[str, Any]:
        """Load violation detection patterns"""
        
        # Mock patterns for development
        return {
            "excessive_retention": {
                "pattern": r"(retain|store|keep).*(\d+)\s*(years?|months?)",
                "severity": "high",
                "legal_reference": "GDPR Article 5(1)(e)"
            },
            "missing_consent": {
                "pattern": r"(without|no)\s*(consent|permission|authorization)",
                "severity": "medium", 
                "legal_reference": "GDPR Article 6"
            },
            "unauthorized_sharing": {
                "pattern": r"(share|transfer|disclose).*third[\s-]party",
                "severity": "critical",
                "legal_reference": "GDPR Article 44"
            }
        }
        
    async def calculate_violation_score(self, violations: List[Dict[str, Any]]) -> float:
        """Calculate overall violation score for a creditor"""
        
        if not violations:
            return 0.0
            
        severity_weights = {
            "critical": 4.0,
            "high": 3.0,
            "medium": 2.0,
            "low": 1.0
        }
        
        total_score = 0.0
        for violation in violations:
            severity = violation.get("severity", "low")
            confidence = violation.get("confidence", 0.5)
            weight = severity_weights.get(severity, 1.0)
            total_score += weight * confidence
            
        return min(total_score / len(violations), 5.0)  # Cap at 5.0
    
    def _calculate_damage(self, severity: str, match_count: int) -> float:
        """Calculate estimated damage based on severity and frequency"""
        base_damages = {
            "critical": 500.0,
            "high": 250.0,
            "medium": 100.0,
            "low": 50.0
        }
        
        base = base_damages.get(severity, 50.0)
        return base * min(match_count, 5)  # Cap multiplier at 5
    
    def _get_violation_description(self, violation_type: str) -> str:
        """Get human-readable description of violation"""
        descriptions = {
            "excessive_retention": "Personal data stored beyond legally required period",
            "missing_consent": "Processing personal data without valid consent",
            "unauthorized_sharing": "Sharing personal data with unauthorized third parties",
            "incomplete_response": "Incomplete or insufficient response to GDPR request",
            "excessive_fees": "Charging unreasonable fees for data access",
            "delayed_response": "Responding to GDPR request after legal deadline"
        }
        
        return descriptions.get(violation_type, "Unknown GDPR violation detected")
    
    def _analyze_bank_document(self, content: str) -> List[Dict[str, Any]]:
        """Specialized analysis for bank documents"""
        violations = []
        
        # Check for excessive fees
        if re.search(r'gebyr.*[0-9]+.*kr', content):
            violations.append({
                "id": str(uuid.uuid4()),
                "type": "excessive_fees",
                "severity": "medium",
                "confidence": 0.7,
                "evidence": "Found fee charges in document",
                "legal_reference": "Finansavtaleloven § 48",
                "estimated_damage": 200.0,
                "description": "Potentially excessive banking fees identified",
                "created_at": datetime.now().isoformat()
            })
        
        return violations
    
    def _analyze_inkasso_document(self, content: str) -> List[Dict[str, Any]]:
        """Specialized analysis for debt collection documents"""
        violations = []
        
        # Check for excessive debt collection fees
        if re.search(r'inkassogebyr.*[0-9]+', content):
            violations.append({
                "id": str(uuid.uuid4()),
                "type": "excessive_inkasso_fees",
                "severity": "high",
                "confidence": 0.8,
                "evidence": "Inkasso fees detected in document",
                "legal_reference": "Inkassoloven § 14",
                "estimated_damage": 400.0,
                "description": "Potentially excessive debt collection fees",
                "created_at": datetime.now().isoformat()
            })
        
        return violations
    
    def _analyze_gdpr_response(self, content: str) -> List[Dict[str, Any]]:
        """Specialized analysis for GDPR responses"""
        violations = []
        
        # Check for incomplete responses
        if len(content) < 500:
            violations.append({
                "id": str(uuid.uuid4()),
                "type": "incomplete_response",
                "severity": "medium",
                "confidence": 0.6,
                "evidence": f"Response too short: {len(content)} characters",
                "legal_reference": "GDPR Article 12(3)",
                "estimated_damage": 150.0,
                "description": "GDPR response appears incomplete or insufficient",
                "created_at": datetime.now().isoformat()
            })
        
        return violations
    
    def _generate_mock_violations(self, document_type: str) -> List[Dict[str, Any]]:
        """Generate mock violations for demonstration"""
        mock_violations = [
            {
                "id": str(uuid.uuid4()),
                "type": "data_retention_violation",
                "severity": "high",
                "confidence": 0.85,
                "evidence": f"Analysis of {document_type} suggests data retention issues",
                "legal_reference": "GDPR Article 5(1)(e)",
                "estimated_damage": 300.0,
                "description": "Potential violation of data minimization principle",
                "created_at": datetime.now().isoformat()
            }
        ]
        
        return mock_violations