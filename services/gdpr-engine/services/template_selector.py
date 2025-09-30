"""
DAMOCLES Template Selector Service
Intelligent multi-jurisdiction template selection with Schufa ruling integration
"""
import os
from typing import Dict, List, Optional, Tuple
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class Jurisdiction(Enum):
    NORWAY = "norway"
    SWEDEN = "sweden"
    DENMARK = "denmark"
    FINLAND = "finland"
    EU_GENERAL = "eu_general"
    UNKNOWN = "unknown"

class Language(Enum):
    NORWEGIAN = "no"
    SWEDISH = "sv"
    DANISH = "da"
    FINNISH = "fi"
    ENGLISH = "en"

class CreditorType(Enum):
    INKASSO = "inkasso"
    BANK = "bank"
    BNPL = "bnpl"
    DEFAULT = "default"

class TemplateSelector:
    """
    Intelligent template selector for multi-jurisdiction GDPR requests
    with integrated Article 22 Schufa ruling support
    """

    def __init__(self, templates_dir: str = "templates"):
        self.templates_dir = templates_dir
        self.template_mapping = self._build_template_mapping()

    def _build_template_mapping(self) -> Dict[str, Dict[str, str]]:
        """Build the template mapping with jurisdiction and language support"""
        return {
            # Norwegian templates
            "norway": {
                "no": {
                    "inkasso": "gdpr_inkasso.html",
                    "bank": "gdpr_bank.html",
                    "bnpl": "gdpr_bnpl.html",
                    "default": "gdpr_default.html"
                },
                "en": {
                    "inkasso": "gdpr_inkasso_en.html",
                    "bank": "gdpr_bank_en.html",
                    "bnpl": "gdpr_bnpl_en.html",
                    "default": "gdpr_default_en.html"
                }
            },
            # Swedish templates
            "sweden": {
                "sv": {
                    "inkasso": "gdpr_inkasso_sv.html",
                    "bank": "gdpr_bank_sv.html",
                    "bnpl": "gdpr_bnpl_sv.html",
                    "default": "gdpr_default_sv.html"
                },
                "en": {
                    "inkasso": "gdpr_inkasso_en.html",
                    "bank": "gdpr_bank_en.html",
                    "bnpl": "gdpr_bnpl_en.html",
                    "default": "gdpr_default_en.html"
                }
            },
            # EU general templates (fallback)
            "eu_general": {
                "en": {
                    "inkasso": "gdpr_inkasso_en.html",
                    "bank": "gdpr_bank_en.html",
                    "bnpl": "gdpr_bnpl_en.html",
                    "default": "gdpr_default_en.html"
                }
            }
        }

    def detect_jurisdiction(self, user_data: Dict) -> Jurisdiction:
        """
        Detect jurisdiction based on user data
        """
        # Check explicit jurisdiction preference
        if 'jurisdiction' in user_data:
            jurisdiction_str = user_data['jurisdiction'].lower()
            for jur in Jurisdiction:
                if jur.value == jurisdiction_str:
                    return jur

        # Check user location/country
        if 'country' in user_data:
            country = user_data['country'].lower()
            country_mapping = {
                'norway': Jurisdiction.NORWAY,
                'norge': Jurisdiction.NORWAY,
                'no': Jurisdiction.NORWAY,
                'sweden': Jurisdiction.SWEDEN,
                'sverige': Jurisdiction.SWEDEN,
                'se': Jurisdiction.SWEDEN,
                'denmark': Jurisdiction.DENMARK,
                'danmark': Jurisdiction.DENMARK,
                'dk': Jurisdiction.DENMARK,
                'finland': Jurisdiction.FINLAND,
                'suomi': Jurisdiction.FINLAND,
                'fi': Jurisdiction.FINLAND
            }
            if country in country_mapping:
                return country_mapping[country]

        # Check user email domain for Nordic patterns
        if 'user_email' in user_data:
            email = user_data['user_email'].lower()
            if any(domain in email for domain in ['.no', '.se', '.dk', '.fi']):
                domain_mapping = {
                    '.no': Jurisdiction.NORWAY,
                    '.se': Jurisdiction.SWEDEN,
                    '.dk': Jurisdiction.DENMARK,
                    '.fi': Jurisdiction.FINLAND
                }
                for domain, jurisdiction in domain_mapping.items():
                    if domain in email:
                        return jurisdiction

        # Check creditor information for jurisdiction hints
        if 'creditor_name' in user_data:
            creditor = user_data['creditor_name'].lower()
            # Norwegian creditor patterns
            if any(pattern in creditor for pattern in ['inkasso', 'as', 'asa', '.no']):
                return Jurisdiction.NORWAY
            # Swedish creditor patterns
            elif any(pattern in creditor for pattern in ['ab', '.se', 'aktiebolag']):
                return Jurisdiction.SWEDEN
            # Danish creditor patterns
            elif any(pattern in creditor for pattern in ['a/s', '.dk', 'aktieselskab']):
                return Jurisdiction.DENMARK
            # Finnish creditor patterns
            elif any(pattern in creditor for pattern in ['oy', 'oyj', '.fi']):
                return Jurisdiction.FINLAND

        logger.warning("Could not detect jurisdiction, defaulting to EU_GENERAL")
        return Jurisdiction.EU_GENERAL

    def detect_language(self, user_data: Dict, jurisdiction: Jurisdiction) -> Language:
        """
        Detect preferred language based on user data and jurisdiction
        """
        # Check explicit language preference
        if 'language' in user_data:
            lang_str = user_data['language'].lower()
            for lang in Language:
                if lang.value == lang_str or lang.name.lower() == lang_str:
                    return lang

        # Default language based on jurisdiction
        jurisdiction_defaults = {
            Jurisdiction.NORWAY: Language.NORWEGIAN,
            Jurisdiction.SWEDEN: Language.SWEDISH,
            Jurisdiction.DENMARK: Language.DANISH,
            Jurisdiction.FINLAND: Language.FINNISH,
            Jurisdiction.EU_GENERAL: Language.ENGLISH,
            Jurisdiction.UNKNOWN: Language.ENGLISH
        }

        return jurisdiction_defaults.get(jurisdiction, Language.ENGLISH)

    def detect_creditor_type(self, user_data: Dict) -> CreditorType:
        """
        Detect creditor type based on user data
        """
        # Check explicit creditor type
        if 'creditor_type' in user_data:
            creditor_type_str = user_data['creditor_type'].lower()
            for cred_type in CreditorType:
                if cred_type.value == creditor_type_str:
                    return cred_type

        # Analyze creditor name for type hints
        if 'creditor_name' in user_data:
            creditor_name = user_data['creditor_name'].lower()

            # Inkasso/debt collection patterns
            inkasso_patterns = [
                'inkasso', 'debt', 'collection', 'collector', 'fordring',
                'kravhantering', 'perintä', 'gældsinddrivelse'
            ]
            if any(pattern in creditor_name for pattern in inkasso_patterns):
                return CreditorType.INKASSO

            # Bank patterns
            bank_patterns = [
                'bank', 'sparbank', 'finansbank', 'kreditt', 'credit',
                'swedbank', 'nordea', 'handelsbanken', 'seb', 'dnb'
            ]
            if any(pattern in creditor_name for pattern in bank_patterns):
                return CreditorType.BANK

            # BNPL (Buy Now Pay Later) patterns
            bnpl_patterns = [
                'klarna', 'afterpay', 'zip', 'sezzle', 'affirm', 'paymi',
                'svea', 'walley', 'collector', 'santander consumer'
            ]
            if any(pattern in creditor_name for pattern in bnpl_patterns):
                return CreditorType.BNPL

        return CreditorType.DEFAULT

    def get_template_features(self, jurisdiction: Jurisdiction, creditor_type: CreditorType) -> Dict[str, bool]:
        """
        Get template features based on jurisdiction and creditor type
        """
        features = {
            'has_schufa_ruling': True,  # All templates now include Schufa ruling
            'has_article_22': True,     # Article 22 support for automated decisions
            'has_local_laws': False,
            'has_enhanced_inkasso': False,
            'supports_nordic_compliance': False
        }

        # Nordic jurisdiction features
        if jurisdiction in [Jurisdiction.NORWAY, Jurisdiction.SWEDEN,
                          Jurisdiction.DENMARK, Jurisdiction.FINLAND]:
            features['has_local_laws'] = True
            features['supports_nordic_compliance'] = True

        # Enhanced inkasso features
        if creditor_type == CreditorType.INKASSO:
            features['has_enhanced_inkasso'] = True

        return features

    def select_template(self, user_data: Dict) -> Tuple[str, Dict[str, any]]:
        """
        Select the most appropriate template based on user data
        Returns (template_filename, metadata)
        """
        # Detect jurisdiction, language, and creditor type
        jurisdiction = self.detect_jurisdiction(user_data)
        language = self.detect_language(user_data, jurisdiction)
        creditor_type = self.detect_creditor_type(user_data)

        # Get template mapping
        jurisdiction_key = jurisdiction.value
        language_key = language.value
        creditor_key = creditor_type.value

        # Try to find exact match
        template_filename = None
        fallback_chain = []

        # Primary attempt: exact match
        if (jurisdiction_key in self.template_mapping and
            language_key in self.template_mapping[jurisdiction_key] and
            creditor_key in self.template_mapping[jurisdiction_key][language_key]):
            template_filename = self.template_mapping[jurisdiction_key][language_key][creditor_key]

        # Fallback 1: same jurisdiction, same language, default creditor type
        elif (jurisdiction_key in self.template_mapping and
              language_key in self.template_mapping[jurisdiction_key]):
            template_filename = self.template_mapping[jurisdiction_key][language_key].get('default')
            fallback_chain.append("creditor_type_fallback")

        # Fallback 2: same jurisdiction, English language
        elif (jurisdiction_key in self.template_mapping and
              'en' in self.template_mapping[jurisdiction_key]):
            template_filename = self.template_mapping[jurisdiction_key]['en'].get(creditor_key) or \
                              self.template_mapping[jurisdiction_key]['en'].get('default')
            fallback_chain.extend(["language_fallback", "creditor_type_fallback"])

        # Fallback 3: EU general, English
        elif 'eu_general' in self.template_mapping and 'en' in self.template_mapping['eu_general']:
            template_filename = self.template_mapping['eu_general']['en'].get(creditor_key) or \
                              self.template_mapping['eu_general']['en'].get('default')
            fallback_chain.extend(["jurisdiction_fallback", "language_fallback"])

        # Final fallback: default Norwegian inkasso template
        if not template_filename:
            template_filename = "gdpr_inkasso.html"
            fallback_chain.append("final_fallback")

        # Verify template exists
        template_path = os.path.join(self.templates_dir, template_filename)
        if not os.path.exists(template_path):
            logger.warning(f"Template {template_filename} not found, using default")
            template_filename = "gdpr_default.html"
            fallback_chain.append("file_not_found_fallback")

        # Build metadata
        features = self.get_template_features(jurisdiction, creditor_type)
        metadata = {
            'detected_jurisdiction': jurisdiction.value,
            'detected_language': language.value,
            'detected_creditor_type': creditor_type.value,
            'template_filename': template_filename,
            'template_path': template_path,
            'fallback_chain': fallback_chain,
            'features': features,
            'confidence_score': self._calculate_confidence_score(user_data, fallback_chain),
            'schufa_ruling_included': True,  # All templates now include this
            'article_22_compliance': True
        }

        logger.info(f"Selected template: {template_filename} for jurisdiction: {jurisdiction.value}, "
                   f"language: {language.value}, creditor: {creditor_type.value}")

        return template_filename, metadata

    def _calculate_confidence_score(self, user_data: Dict, fallback_chain: List[str]) -> float:
        """
        Calculate confidence score for template selection
        """
        base_score = 1.0

        # Reduce confidence for each fallback used
        fallback_penalties = {
            'creditor_type_fallback': 0.1,
            'language_fallback': 0.2,
            'jurisdiction_fallback': 0.3,
            'final_fallback': 0.4,
            'file_not_found_fallback': 0.5
        }

        for fallback in fallback_chain:
            penalty = fallback_penalties.get(fallback, 0.1)
            base_score -= penalty

        # Boost confidence for explicit user preferences
        if 'jurisdiction' in user_data:
            base_score += 0.1
        if 'language' in user_data:
            base_score += 0.1
        if 'creditor_type' in user_data:
            base_score += 0.1

        return max(0.0, min(1.0, base_score))

    def get_available_templates(self) -> Dict[str, List[str]]:
        """
        Get list of all available templates by jurisdiction and language
        """
        available = {}

        if not os.path.exists(self.templates_dir):
            return available

        # Scan template directory
        for filename in os.listdir(self.templates_dir):
            if filename.endswith('.html'):
                # Parse filename for jurisdiction and language info
                parts = filename.replace('.html', '').split('_')

                base_type = 'unknown'
                language_code = 'unknown'

                if len(parts) >= 2:
                    base_type = parts[1]  # inkasso, bank, bnpl, default

                if len(parts) >= 3:
                    language_code = parts[2]  # sv, en, etc.
                elif 'sv' in filename:
                    language_code = 'sv'
                elif 'en' in filename:
                    language_code = 'en'
                else:
                    language_code = 'no'  # default to Norwegian

                key = f"{base_type}_{language_code}"
                if key not in available:
                    available[key] = []
                available[key].append(filename)

        return available

    def validate_template_coverage(self) -> Dict[str, any]:
        """
        Validate template coverage for different jurisdictions and scenarios
        """
        coverage_report = {
            'total_templates': 0,
            'jurisdictions_covered': [],
            'languages_covered': [],
            'creditor_types_covered': [],
            'missing_combinations': [],
            'schufa_compliance': True,
            'article_22_coverage': True
        }

        available = self.get_available_templates()
        coverage_report['total_templates'] = len(available)

        # Extract covered elements
        languages = set()
        creditor_types = set()

        for key in available.keys():
            parts = key.split('_')
            if len(parts) >= 2:
                creditor_types.add(parts[0])
                languages.add(parts[1])

        coverage_report['languages_covered'] = list(languages)
        coverage_report['creditor_types_covered'] = list(creditor_types)
        coverage_report['jurisdictions_covered'] = list(self.template_mapping.keys())

        # Check for missing combinations
        expected_combinations = []
        for jurisdiction in ['norway', 'sweden']:
            for language in ['no', 'sv', 'en']:
                for creditor_type in ['inkasso', 'bank', 'bnpl', 'default']:
                    expected_combinations.append(f"{jurisdiction}_{language}_{creditor_type}")

        missing = []
        for combo in expected_combinations:
            if not any(combo in template for template in available.keys()):
                missing.append(combo)

        coverage_report['missing_combinations'] = missing

        return coverage_report


def create_template_selector() -> TemplateSelector:
    """Factory function to create a template selector"""
    return TemplateSelector()


# Example usage and testing
if __name__ == "__main__":
    selector = create_template_selector()

    # Test cases
    test_cases = [
        {
            'name': 'Norwegian inkasso case',
            'data': {
                'user_email': 'test@example.no',
                'creditor_name': 'ABC Inkasso AS',
                'jurisdiction': 'norway'
            }
        },
        {
            'name': 'Swedish inkasso case',
            'data': {
                'user_email': 'test@example.se',
                'creditor_name': 'XYZ Inkasso AB',
                'language': 'sv'
            }
        },
        {
            'name': 'EU bank case',
            'data': {
                'user_email': 'test@example.com',
                'creditor_name': 'European Bank Ltd',
                'creditor_type': 'bank'
            }
        }
    ]

    for test_case in test_cases:
        print(f"\n--- {test_case['name']} ---")
        template, metadata = selector.select_template(test_case['data'])
        print(f"Template: {template}")
        print(f"Confidence: {metadata['confidence_score']:.2f}")
        print(f"Features: {metadata['features']}")
        if metadata['fallback_chain']:
            print(f"Fallbacks used: {metadata['fallback_chain']}")