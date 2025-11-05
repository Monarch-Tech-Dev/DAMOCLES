# GDPR Response Test Dataset

This directory contains labeled GDPR responses for validation and testing of the violation detection algorithm.

## Dataset Structure

Each test case follows this schema:

```json
{
  "id": "unique_test_case_id",
  "metadata": {
    "creditor_name": "Example Creditor AS",
    "creditor_type": "inkasso|bank|bnpl|default",
    "jurisdiction": "norway|sweden|denmark|finland|eu_general",
    "response_date": "2025-01-15",
    "language": "no|sv|da|fi|en",
    "document_length": 1234,
    "data_source": "synthetic|anonymized_real|public_record"
  },
  "response_content": "Full text of the GDPR response...",
  "ground_truth": {
    "violations": [
      {
        "type": "incomplete_response|excessive_retention|missing_consent|unauthorized_sharing|excessive_fees|delayed_response",
        "severity": "low|medium|high|critical",
        "confidence": 0.95,
        "legal_reference": "GDPR Article X",
        "evidence": "Specific text or reason",
        "estimated_damage": 300.0,
        "notes": "Human annotator notes"
      }
    ],
    "completeness_score": 0.65,
    "overall_quality": "poor|fair|good|excellent",
    "is_legitimate_no_data": false,
    "annotator": "human|ai_assisted",
    "annotation_date": "2025-01-15",
    "review_status": "single_review|peer_reviewed|expert_validated"
  }
}
```

## Test Categories

### 1. Complete, High-Quality Responses (20 cases)
- Proper GDPR Article 15 responses
- All required elements present
- Should produce **zero violations**
- Used to test false positive rate

### 2. Incomplete Responses (30 cases)
- Missing required elements
- Vague or evasive language
- Should detect **incomplete_response** violations

### 3. Excessive Retention (15 cases)
- States data kept beyond legal requirements
- Should detect **excessive_retention** violations

### 4. Missing Consent (15 cases)
- Processing without legal basis
- Should detect **missing_consent** violations

### 5. Unauthorized Sharing (10 cases)
- Mentions third-party data sharing without consent
- Should detect **unauthorized_sharing** violations

### 6. Excessive Fees (10 cases)
- Unreasonable fees for data access
- Should detect **excessive_fees** violations

### 7. Legitimate "No Data" Responses (10 cases)
- Creditor genuinely has no data
- Should produce **zero violations** (edge case test)

### 8. Multi-Violation Cases (10 cases)
- Multiple violations in single response
- Tests algorithm's ability to detect compound issues

### 9. Edge Cases (10 cases)
- Borderline cases
- Ambiguous language
- Tests confidence scoring

## Performance Metrics

The dataset enables calculation of:

- **Precision**: TP / (TP + FP) - % of detected violations that are real
- **Recall**: TP / (TP + FN) - % of real violations that are detected
- **F1 Score**: 2 * (Precision * Recall) / (Precision + Recall)
- **Accuracy**: (TP + TN) / Total
- **False Positive Rate**: FP / (FP + TN)
- **Confidence Calibration**: How well confidence scores match actual accuracy

## Adding New Test Cases

1. Create a new JSON file in the appropriate category directory
2. Ensure all required fields are present
3. Get peer review for ground truth labels
4. Update the test runner to include the new case

## Data Privacy

- All test data must be either:
  - Synthetically generated
  - Anonymized real responses (all PII removed)
  - Publicly available records

- NEVER include actual user data or identifiable information

## Current Status

- Total test cases: 0 (To be populated)
- Peer-reviewed cases: 0
- Expert-validated cases: 0
- Last updated: 2025-01-15
