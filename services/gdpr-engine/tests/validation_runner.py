"""
GDPR Violation Detection Validation Runner

Calculates precision, recall, F1 score, and other performance metrics
by comparing algorithm outputs to ground truth labeled test data.
"""

import asyncio
import json
import os
from pathlib import Path
from typing import Dict, List, Any, Tuple
from collections import defaultdict
import sys

# Add parent directory to path to import violation_detector
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.violation_detector import ViolationDetector


class ValidationMetrics:
    """Calculate and store validation metrics"""

    def __init__(self):
        self.true_positives = 0
        self.false_positives = 0
        self.false_negatives = 0
        self.true_negatives = 0

        # Per-violation-type metrics
        self.per_type_metrics = defaultdict(lambda: {
            'tp': 0, 'fp': 0, 'fn': 0, 'tn': 0
        })

        # Confidence calibration
        self.confidence_bins = defaultdict(list)  # confidence -> [correct, correct, incorrect, ...]

        # Detailed results
        self.test_results = []

    def add_result(self, test_case_id: str, detected: List[Dict],
                   ground_truth: List[Dict], response_content: str):
        """Add a test case result"""

        # Extract violation types
        detected_types = {v['type']: v for v in detected}
        ground_truth_types = {v['type']: v for v in ground_truth}

        all_types = set(detected_types.keys()) | set(ground_truth_types.keys())

        result = {
            'test_case_id': test_case_id,
            'detected_count': len(detected),
            'ground_truth_count': len(ground_truth),
            'matches': [],
            'false_positives': [],
            'false_negatives': []
        }

        # Calculate matches and mismatches
        for vtype in all_types:
            in_detected = vtype in detected_types
            in_ground_truth = vtype in ground_truth_types

            if in_detected and in_ground_truth:
                # True positive
                self.true_positives += 1
                self.per_type_metrics[vtype]['tp'] += 1

                detected_conf = detected_types[vtype].get('confidence', 0.5)
                self.confidence_bins[self._get_confidence_bin(detected_conf)].append(True)

                result['matches'].append({
                    'type': vtype,
                    'detected_confidence': detected_conf,
                    'ground_truth_confidence': ground_truth_types[vtype].get('confidence', 1.0),
                    'severity_match': detected_types[vtype]['severity'] == ground_truth_types[vtype]['severity']
                })

            elif in_detected and not in_ground_truth:
                # False positive
                self.false_positives += 1
                self.per_type_metrics[vtype]['fp'] += 1

                detected_conf = detected_types[vtype].get('confidence', 0.5)
                self.confidence_bins[self._get_confidence_bin(detected_conf)].append(False)

                result['false_positives'].append({
                    'type': vtype,
                    'confidence': detected_conf,
                    'evidence': detected_types[vtype].get('evidence', 'N/A')
                })

            elif not in_detected and in_ground_truth:
                # False negative
                self.false_negatives += 1
                self.per_type_metrics[vtype]['fn'] += 1

                result['false_negatives'].append({
                    'type': vtype,
                    'expected_severity': ground_truth_types[vtype]['severity'],
                    'notes': ground_truth_types[vtype].get('notes', 'N/A')
                })

        # True negatives: when neither detected nor in ground truth
        # For simplicity, we'll count this as test cases with no violations on both sides
        if len(detected) == 0 and len(ground_truth) == 0:
            self.true_negatives += 1

        self.test_results.append(result)

    def _get_confidence_bin(self, confidence: float) -> str:
        """Get confidence bin for calibration analysis"""
        if confidence < 0.5:
            return "0.0-0.5"
        elif confidence < 0.7:
            return "0.5-0.7"
        elif confidence < 0.85:
            return "0.7-0.85"
        else:
            return "0.85-1.0"

    def calculate_metrics(self) -> Dict[str, Any]:
        """Calculate overall performance metrics"""

        # Precision: TP / (TP + FP)
        precision = self.true_positives / (self.true_positives + self.false_positives) \
                    if (self.true_positives + self.false_positives) > 0 else 0.0

        # Recall: TP / (TP + FN)
        recall = self.true_positives / (self.true_positives + self.false_negatives) \
                 if (self.true_positives + self.false_negatives) > 0 else 0.0

        # F1 Score: 2 * (Precision * Recall) / (Precision + Recall)
        f1_score = 2 * (precision * recall) / (precision + recall) \
                   if (precision + recall) > 0 else 0.0

        # Accuracy: (TP + TN) / Total
        total = self.true_positives + self.false_positives + \
                self.false_negatives + self.true_negatives
        accuracy = (self.true_positives + self.true_negatives) / total if total > 0 else 0.0

        # False Positive Rate: FP / (FP + TN)
        fpr = self.false_positives / (self.false_positives + self.true_negatives) \
              if (self.false_positives + self.true_negatives) > 0 else 0.0

        # Per-type metrics
        per_type_results = {}
        for vtype, counts in self.per_type_metrics.items():
            tp, fp, fn = counts['tp'], counts['fp'], counts['fn']
            type_precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            type_recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            type_f1 = 2 * (type_precision * type_recall) / (type_precision + type_recall) \
                      if (type_precision + type_recall) > 0 else 0.0

            per_type_results[vtype] = {
                'precision': type_precision,
                'recall': type_recall,
                'f1_score': type_f1,
                'true_positives': tp,
                'false_positives': fp,
                'false_negatives': fn
            }

        # Confidence calibration
        confidence_calibration = {}
        for bin_name, results in self.confidence_bins.items():
            if results:
                accuracy_in_bin = sum(results) / len(results)
                confidence_calibration[bin_name] = {
                    'accuracy': accuracy_in_bin,
                    'sample_count': len(results),
                    'correct': sum(results),
                    'incorrect': len(results) - sum(results)
                }

        return {
            'overall': {
                'precision': precision,
                'recall': recall,
                'f1_score': f1_score,
                'accuracy': accuracy,
                'false_positive_rate': fpr,
                'true_positives': self.true_positives,
                'false_positives': self.false_positives,
                'false_negatives': self.false_negatives,
                'true_negatives': self.true_negatives
            },
            'per_violation_type': per_type_results,
            'confidence_calibration': confidence_calibration,
            'test_results': self.test_results
        }


class ValidationRunner:
    """Run validation tests on the violation detection algorithm"""

    def __init__(self, test_data_dir: str = "tests/test_data"):
        self.test_data_dir = Path(test_data_dir)
        self.detector = ViolationDetector()
        self.metrics = ValidationMetrics()

    async def load_test_cases(self) -> List[Dict[str, Any]]:
        """Load all test cases from JSON files"""
        test_cases = []

        # Recursively find all .json files in test_data directory
        for json_file in self.test_data_dir.rglob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    test_case = json.load(f)
                    test_cases.append(test_case)
            except Exception as e:
                print(f"❌ Error loading {json_file}: {e}")

        print(f"📊 Loaded {len(test_cases)} test cases")
        return test_cases

    async def run_validation(self) -> Dict[str, Any]:
        """Run validation on all test cases"""

        test_cases = await self.load_test_cases()

        if not test_cases:
            print("⚠️  No test cases found. Please add test cases to tests/test_data/")
            return None

        print(f"\n🔍 Running validation on {len(test_cases)} test cases...\n")

        for i, test_case in enumerate(test_cases, 1):
            test_id = test_case['id']
            content = test_case['response_content']
            ground_truth = test_case['ground_truth']['violations']

            # Run detector
            detected_violations = await self.detector.analyze_document({
                'content': content,
                'type': 'gdpr_response'
            })

            # Add result to metrics
            self.metrics.add_result(test_id, detected_violations, ground_truth, content)

            # Print progress
            status = "✅" if len(detected_violations) == len(ground_truth) else "⚠️"
            print(f"{status} [{i}/{len(test_cases)}] {test_id}: "
                  f"Detected {len(detected_violations)}, Expected {len(ground_truth)}")

        # Calculate final metrics
        results = self.metrics.calculate_metrics()

        return results

    def generate_report(self, results: Dict[str, Any], output_file: str = "validation_report.json"):
        """Generate detailed validation report"""

        if not results:
            return

        overall = results['overall']

        print("\n" + "="*80)
        print("📊 VALIDATION RESULTS")
        print("="*80)

        print(f"\n🎯 OVERALL PERFORMANCE:")
        print(f"  Precision:          {overall['precision']:.2%} ({overall['true_positives']} TP / {overall['true_positives'] + overall['false_positives']} detected)")
        print(f"  Recall:             {overall['recall']:.2%} ({overall['true_positives']} TP / {overall['true_positives'] + overall['false_negatives']} actual)")
        print(f"  F1 Score:           {overall['f1_score']:.2%}")
        print(f"  Accuracy:           {overall['accuracy']:.2%}")
        print(f"  False Positive Rate: {overall['false_positive_rate']:.2%}")

        print(f"\n📈 CONFUSION MATRIX:")
        print(f"  True Positives:     {overall['true_positives']}")
        print(f"  False Positives:    {overall['false_positives']}")
        print(f"  False Negatives:    {overall['false_negatives']}")
        print(f"  True Negatives:     {overall['true_negatives']}")

        print(f"\n🔍 PER-VIOLATION-TYPE PERFORMANCE:")
        for vtype, metrics in results['per_violation_type'].items():
            print(f"\n  {vtype}:")
            print(f"    Precision: {metrics['precision']:.2%}  Recall: {metrics['recall']:.2%}  F1: {metrics['f1_score']:.2%}")
            print(f"    TP: {metrics['true_positives']}  FP: {metrics['false_positives']}  FN: {metrics['false_negatives']}")

        print(f"\n📊 CONFIDENCE CALIBRATION:")
        for bin_name, calib in sorted(results['confidence_calibration'].items()):
            print(f"  {bin_name}: {calib['accuracy']:.2%} accuracy ({calib['correct']}/{calib['sample_count']} correct)")

        # Save detailed report
        output_path = self.test_data_dir.parent / output_file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Detailed report saved to: {output_path}")
        print("="*80 + "\n")

        # Recommendations based on results
        self._print_recommendations(overall)

    def _print_recommendations(self, overall: Dict[str, float]):
        """Print recommendations based on validation results"""

        print("💡 RECOMMENDATIONS:\n")

        if overall['precision'] < 0.7:
            print("  ⚠️  LOW PRECISION: Many false positives detected")
            print("     → Increase confidence thresholds")
            print("     → Refine pattern matching rules")
            print("     → Add more context-aware detection")

        if overall['recall'] < 0.7:
            print("  ⚠️  LOW RECALL: Missing many real violations")
            print("     → Add more detection patterns")
            print("     → Reduce confidence thresholds")
            print("     → Expand violation type coverage")

        if overall['false_positive_rate'] > 0.3:
            print("  ⚠️  HIGH FALSE POSITIVE RATE")
            print("     → Add negative examples to training")
            print("     → Improve legitimate response detection")

        if overall['f1_score'] >= 0.8:
            print("  ✅ EXCELLENT PERFORMANCE: Algorithm performing well!")
        elif overall['f1_score'] >= 0.6:
            print("  ✓  GOOD PERFORMANCE: Room for improvement")
        else:
            print("  ❌ POOR PERFORMANCE: Significant improvements needed")

        print()


async def main():
    """Main validation runner"""

    # Get script directory
    script_dir = Path(__file__).parent
    test_data_dir = script_dir / "test_data"

    runner = ValidationRunner(test_data_dir=str(test_data_dir))
    results = await runner.run_validation()

    if results:
        runner.generate_report(results)


if __name__ == "__main__":
    asyncio.run(main())
