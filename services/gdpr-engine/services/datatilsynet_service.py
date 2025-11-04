"""
Datatilsynet Complaint Generator

Automatically generates formal complaints to Datatilsynet (Norwegian Data Protection Authority)
when creditors violate GDPR rights.

Triggered at Day 35 in the escalation timeline when creditors fail to respond to GDPR requests.

Legal Framework:
- GDPR Article 77: Right to lodge a complaint with supervisory authority
- GDPR Article 12(3): Response deadline (30 days)
- Norwegian Personal Data Act (Personopplysningsloven)
- Datatilsynet enforcement powers

Complaint Types:
1. delayed_response - No response within 30 days
2. incomplete_response - Partial or inadequate response
3. refusal_to_comply - Explicit refusal to comply
4. excessive_fees - Charging fees for GDPR requests
5. data_breach - Failure to notify data breach
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import re


class DatatilsynetService:
    """
    Service for generating formal complaints to Datatilsynet
    """

    def __init__(self):
        # Datatilsynet contact information
        self.datatilsynet_email = "postkasse@datatilsynet.no"
        self.datatilsynet_address = "Datatilsynet, Postboks 8177 Dep, 0034 Oslo"
        self.datatilsynet_phone = "+47 22 39 69 00"

        # Violation severity mappings for Datatilsynet
        self.severity_mapping = {
            "low": "Mindre alvorlig overtredelse",
            "medium": "Moderat alvorlig overtredelse",
            "high": "Alvorlig overtredelse",
            "critical": "Svært alvorlig overtredelse"
        }

        # GDPR article descriptions in Norwegian
        self.gdpr_articles_no = {
            "Article 12(3)": "Artikkel 12(3) - Rett til svar innen 30 dager",
            "Article 15": "Artikkel 15 - Rett til innsyn",
            "Article 16": "Artikkel 16 - Rett til retting",
            "Article 17": "Artikkel 17 - Rett til sletting",
            "Article 18": "Artikkel 18 - Rett til begrensning av behandling",
            "Article 20": "Artikkel 20 - Rett til dataportabilitet",
            "Article 21": "Artikkel 21 - Rett til å protestere"
        }

    async def generate_complaint(
        self,
        user_data: Dict[str, Any],
        creditor_data: Dict[str, Any],
        gdpr_request: Dict[str, Any],
        violations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate formal complaint to Datatilsynet

        Args:
            user_data: User information (name, email, etc.)
            creditor_data: Creditor information (name, org number, etc.)
            gdpr_request: GDPR request details
            violations: List of detected violations

        Returns:
            Complaint package with formal letter and evidence
        """

        # Build complaint components
        complaint_reference = self._generate_complaint_reference(gdpr_request)
        complaint_letter = self._build_formal_complaint_letter(
            user_data, creditor_data, gdpr_request, violations
        )
        evidence_package = self._build_evidence_package(
            gdpr_request, violations
        )
        legal_analysis = self._build_legal_analysis(violations)
        recommended_actions = self._recommend_enforcement_actions(
            creditor_data, violations
        )

        # Estimate potential fine
        fine_estimate = self._estimate_administrative_fine(
            creditor_data, violations
        )

        return {
            "complaint_reference": complaint_reference,
            "complaint_letter": complaint_letter,
            "evidence_package": evidence_package,
            "legal_analysis": legal_analysis,
            "recommended_actions": recommended_actions,
            "fine_estimate": fine_estimate,
            "submission_method": "email",
            "recipient": {
                "email": self.datatilsynet_email,
                "address": self.datatilsynet_address,
                "phone": self.datatilsynet_phone
            },
            "created_at": datetime.now().isoformat(),
            "status": "draft"
        }

    def _generate_complaint_reference(self, gdpr_request: Dict) -> str:
        """Generate unique complaint reference number"""
        date_str = datetime.now().strftime("%Y%m%d")
        request_id = gdpr_request.get('referenceId', 'UNKNOWN')
        return f"DT-COMPLAINT-{date_str}-{request_id}"

    def _build_formal_complaint_letter(
        self,
        user_data: Dict,
        creditor_data: Dict,
        gdpr_request: Dict,
        violations: List[Dict]
    ) -> str:
        """
        Build formal complaint letter in Norwegian for Datatilsynet
        """

        # Extract data
        user_name = user_data.get('name', 'Klager')
        user_email = user_data.get('email', '')
        user_address = self._format_user_address(user_data)

        creditor_name = creditor_data.get('name', 'Innkrevingsselskap')
        org_number = creditor_data.get('organizationNumber', 'Ikke oppgitt')
        creditor_email = creditor_data.get('privacyEmail', 'Ikke oppgitt')

        request_reference = gdpr_request.get('referenceId', '')
        sent_date = gdpr_request.get('sentAt', '')
        deadline_date = gdpr_request.get('responseDue', '')

        # Format dates
        sent_date_formatted = self._format_norwegian_date(sent_date)
        deadline_formatted = self._format_norwegian_date(deadline_date)
        today = datetime.now().strftime("%d.%m.%Y")

        # Build violations section
        violations_text = self._format_violations_for_letter(violations)

        # Build formal letter
        letter = f"""
Datatilsynet
Postboks 8177 Dep
0034 Oslo

Sendt per e-post til: {self.datatilsynet_email}

Dato: {today}
Referanse: {request_reference}


KLAGE PÅ BRUDD PÅ PERSONVERNFORORDNINGEN (GDPR)


KLAGER:
Navn: {user_name}
E-post: {user_email}
Adresse: {user_address}


KLAGET INN:
Navn: {creditor_name}
Organisasjonsnummer: {org_number}
E-postadresse: {creditor_email}
Type virksomhet: Inkassoselskap


SAKENS BAKGRUNN:

Den {sent_date_formatted} sendte undertegnede en forespørsel om innsyn i personopplysninger
(GDPR-forespørsel) til {creditor_name} i henhold til personvernforordningen (GDPR)
artikkel 15.

Forespørselen ble sendt med referanse {request_reference} og hadde lovpålagt svarfrist
{deadline_formatted} (30 dager fra mottakelse, jf. GDPR artikkel 12(3)).


OVERTREDELSER:

{violations_text}


RETTSLIG GRUNNLAG:

1. GDPR Artikkel 12(3):
   Den behandlingsansvarlige skal gi informasjon om tiltak som treffes etter en forespørsel
   i henhold til artiklene 15 til 22 uten ugrunnet opphold, og under enhver omstendighet
   innen én måned etter å ha mottatt forespørselen.

2. GDPR Artikkel 15:
   Den registrerte skal ha rett til å få den behandlingsansvarliges bekreftelse på om
   personopplysninger om vedkommende behandles.

3. GDPR Artikkel 77:
   Uten at det berører andre administrative eller rettslige rettsmidler, skal enhver
   registrert ha rett til å klage til en tilsynsmyndighet.


KONSEKVENSER:

Manglende respons har følgende konsekvenser for undertegnede:

1. Umulig å verifisere nøyaktigheten av personopplysninger som behandles
2. Umulig å utøve rettigheter til retting eller sletting
3. Fortsatt behandling av potensielt uriktige eller ulovlige opplysninger
4. Økonomisk skade grunnet urettmessige krav basert på ukjente data
5. Brudd på grunnleggende personvernrettigheter


BEGJÆRING:

Undertegnede ber Datatilsynet om å:

1. Iverksette tilsynssak mot {creditor_name} (org.nr. {org_number})

2. Pålegge {creditor_name} å:
   - Umiddelbart gi fullstendig respons på GDPR-forespørselen
   - Dokumentere alle personopplysninger som behandles
   - Gi innsyn i behandlingsgrunnlag og formål

3. Vurdere administrative sanksjoner i henhold til GDPR artikkel 83:
   - Overtredelsen er alvorlig og systematisk
   - Selskapet har ikke respondert til tross for lovpålagt frist
   - Dette utgjør brudd på grunnleggende personvernrettigheter

4. Påse at {creditor_name} implementerer tiltak for å forhindre fremtidige brudd


VEDLEGG:

1. Kopi av GDPR-forespørsel sendt {sent_date_formatted}
2. Bevis på avsendelse (e-postkvittering)
3. Dokumentasjon av manglende respons
4. Tidslinje for henvendelser og purringer
5. Bevis på negative konsekvenser


KONTAKTINFORMASJON:

E-post: {user_email}
Telefon: {user_data.get('phoneNumber', 'Oppgis ved forespørsel')}

Undertegnede er tilgjengelig for ytterligere opplysninger og møte med Datatilsynet
ved behov.


Med vennlig hilsen,

{user_name}


---
Dette dokumentet er generert automatisk av DAMOCLES - et verktøy for beskyttelse av
personvernrettigheter. Alle opplysninger er basert på dokumentert kommunikasjon og
faktiske hendelser.
"""

        return letter.strip()

    def _format_user_address(self, user_data: Dict) -> str:
        """Format user address for letter"""
        parts = []

        if user_data.get('streetAddress'):
            parts.append(user_data['streetAddress'])

        postal_line = []
        if user_data.get('postalCode'):
            postal_line.append(user_data['postalCode'])
        if user_data.get('city'):
            postal_line.append(user_data['city'])

        if postal_line:
            parts.append(' '.join(postal_line))

        if user_data.get('country') and user_data['country'] != 'Norway':
            parts.append(user_data['country'])

        return ', '.join(parts) if parts else 'Ikke oppgitt'

    def _format_norwegian_date(self, date_str: str) -> str:
        """Format ISO date to Norwegian format (DD.MM.YYYY)"""
        if not date_str:
            return "dato ikke oppgitt"

        try:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt.strftime("%d.%m.%Y")
        except:
            return date_str

    def _format_violations_for_letter(self, violations: List[Dict]) -> str:
        """Format violations list for complaint letter"""
        if not violations:
            return "Ingen spesifikke overtredelser registrert."

        formatted = []

        for i, violation in enumerate(violations, 1):
            v_type = violation.get('type', 'unknown')
            severity = violation.get('severity', 'medium')
            evidence = violation.get('evidence', 'Ikke spesifisert')
            legal_ref = violation.get('legalReference', '')

            # Map violation type to Norwegian description
            type_descriptions = {
                'delayed_response': 'Manglende respons innen lovpålagt frist',
                'incomplete_response': 'Ufullstendig eller mangelfull respons',
                'refusal_to_comply': 'Eksplisitt avslag på å etterkomme forespørsel',
                'excessive_fees': 'Ulovlig gebyr for GDPR-forespørsel',
                'data_breach': 'Manglende varsling om databrudd'
            }

            description = type_descriptions.get(v_type, 'Ukjent overtredelse')
            severity_no = self.severity_mapping.get(severity, severity)

            formatted.append(
                f"{i}. {description}\n"
                f"   Alvorlighetsgrad: {severity_no}\n"
                f"   Rettslig grunnlag: {legal_ref}\n"
                f"   Dokumentasjon: {evidence}\n"
            )

        return '\n'.join(formatted)

    def _build_evidence_package(
        self,
        gdpr_request: Dict,
        violations: List[Dict]
    ) -> Dict[str, Any]:
        """Build comprehensive evidence package"""

        return {
            "gdpr_request": {
                "reference_id": gdpr_request.get('referenceId'),
                "sent_at": gdpr_request.get('sentAt'),
                "deadline": gdpr_request.get('responseDue'),
                "days_overdue": self._calculate_days_overdue(
                    gdpr_request.get('responseDue')
                ),
                "delivery_proof": "E-mail delivery confirmation available",
                "tracking_pixel": gdpr_request.get('trackingPixelViewed', False)
            },
            "violations": [
                {
                    "type": v.get('type'),
                    "severity": v.get('severity'),
                    "legal_reference": v.get('legalReference'),
                    "evidence": v.get('evidence'),
                    "confidence": v.get('confidence'),
                    "estimated_damage": v.get('estimatedDamage', 0)
                }
                for v in violations
            ],
            "timeline": self._build_timeline(gdpr_request),
            "communication_log": [
                {
                    "date": gdpr_request.get('sentAt'),
                    "action": "GDPR request sent",
                    "method": "Email",
                    "proof": "Delivery confirmation"
                },
                {
                    "date": gdpr_request.get('responseDue'),
                    "action": "Legal deadline passed",
                    "method": "Automatic",
                    "proof": "System timestamp"
                }
            ]
        }

    def _calculate_days_overdue(self, deadline_str: str) -> int:
        """Calculate how many days overdue the response is"""
        if not deadline_str:
            return 0

        try:
            deadline = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
            now = datetime.now(deadline.tzinfo)
            delta = (now - deadline).days
            return max(0, delta)
        except:
            return 0

    def _build_timeline(self, gdpr_request: Dict) -> List[Dict]:
        """Build timeline of events"""
        timeline = []

        sent_at = gdpr_request.get('sentAt')
        if sent_at:
            timeline.append({
                "day": 0,
                "date": sent_at,
                "event": "GDPR request sent",
                "status": "completed"
            })

        response_due = gdpr_request.get('responseDue')
        if response_due:
            timeline.append({
                "day": 30,
                "date": response_due,
                "event": "Legal deadline (30 days)",
                "status": "passed"
            })

        # Calculate current day
        if sent_at:
            try:
                sent_date = datetime.fromisoformat(sent_at.replace('Z', '+00:00'))
                now = datetime.now(sent_date.tzinfo)
                current_day = (now - sent_date).days

                timeline.append({
                    "day": current_day,
                    "date": now.isoformat(),
                    "event": "Complaint filed with Datatilsynet",
                    "status": "current"
                })
            except:
                pass

        return timeline

    def _build_legal_analysis(self, violations: List[Dict]) -> Dict[str, Any]:
        """Build legal analysis of violations"""

        total_violations = len(violations)
        severity_counts = {}
        legal_references = set()
        total_damages = 0

        for violation in violations:
            # Count by severity
            severity = violation.get('severity', 'unknown')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1

            # Collect legal references
            legal_ref = violation.get('legalReference', '')
            if legal_ref:
                legal_references.add(legal_ref)

            # Sum damages
            total_damages += violation.get('estimatedDamage', 0)

        # Determine overall severity
        if 'critical' in severity_counts:
            overall_severity = "critical"
        elif 'high' in severity_counts:
            overall_severity = "high"
        elif 'medium' in severity_counts:
            overall_severity = "medium"
        else:
            overall_severity = "low"

        return {
            "total_violations": total_violations,
            "severity_breakdown": severity_counts,
            "overall_severity": overall_severity,
            "legal_references": list(legal_references),
            "total_estimated_damages": total_damages,
            "systematic_pattern": total_violations > 2,
            "enforcement_priority": overall_severity in ["high", "critical"]
        }

    def _recommend_enforcement_actions(
        self,
        creditor_data: Dict,
        violations: List[Dict]
    ) -> List[str]:
        """Recommend enforcement actions for Datatilsynet"""

        actions = []

        # Always recommend investigation
        actions.append(
            "Åpne tilsynssak for å undersøke overtredelsene"
        )

        # Check severity
        severity_counts = {}
        for v in violations:
            sev = v.get('severity', 'low')
            severity_counts[sev] = severity_counts.get(sev, 0) + 1

        if severity_counts.get('critical', 0) > 0 or severity_counts.get('high', 0) > 1:
            actions.append(
                "Vurdere administrative sanksjoner (bøter) i henhold til GDPR art. 83"
            )

        # Check violation score
        violation_score = creditor_data.get('violationScore', 0)
        if violation_score > 5.0:
            actions.append(
                "Gjennomføre grundig revisjon av selskapets behandlingsaktiviteter"
            )

        # Check total violations
        total_violations = creditor_data.get('totalViolations', 0)
        if total_violations > 5:
            actions.append(
                "Undersøke systematiske brudd på personvernet"
            )
            actions.append(
                "Vurdere forbud mot visse behandlingsaktiviteter"
            )

        # Always recommend compliance order
        actions.append(
            "Pålegge umiddelbar etterlevelse av GDPR-forespørselen"
        )

        # Recommend follow-up
        actions.append(
            "Sikre oppfølging for å verifisere etterlevelse"
        )

        return actions

    def _estimate_administrative_fine(
        self,
        creditor_data: Dict,
        violations: List[Dict]
    ) -> Dict[str, Any]:
        """
        Estimate potential administrative fine

        GDPR Article 83:
        - Up to 10,000,000 EUR or 2% of global annual turnover (whichever is higher)
        - Up to 20,000,000 EUR or 4% of global annual turnover (for more serious violations)
        """

        # Base fine calculation factors
        base_fine = 50000  # NOK (starting point)

        # Factor 1: Severity multiplier
        severity_multipliers = {
            "low": 1.0,
            "medium": 2.0,
            "high": 4.0,
            "critical": 8.0
        }

        max_severity = "low"
        for v in violations:
            sev = v.get('severity', 'low')
            if severity_multipliers.get(sev, 0) > severity_multipliers.get(max_severity, 0):
                max_severity = sev

        severity_multiplier = severity_multipliers.get(max_severity, 1.0)

        # Factor 2: Number of violations
        num_violations = len(violations)
        violation_multiplier = min(1.0 + (num_violations * 0.5), 5.0)

        # Factor 3: Repeat offender
        total_historical = creditor_data.get('totalViolations', 0)
        repeat_multiplier = 1.0 + min(total_historical * 0.2, 3.0)

        # Calculate estimate
        estimated_fine = base_fine * severity_multiplier * violation_multiplier * repeat_multiplier

        # Cap at reasonable limits
        min_fine = 25000  # NOK
        max_fine = 5000000  # NOK (for Norwegian creditors)

        estimated_fine = max(min_fine, min(estimated_fine, max_fine))

        return {
            "estimated_fine_nok": round(estimated_fine),
            "minimum_fine_nok": min_fine,
            "maximum_fine_nok": max_fine,
            "factors": {
                "base_amount": base_fine,
                "severity_multiplier": severity_multiplier,
                "violation_count_multiplier": violation_multiplier,
                "repeat_offender_multiplier": repeat_multiplier
            },
            "legal_basis": "GDPR Article 83",
            "note": "Faktisk bot fastsettes av Datatilsynet basert på fullstendig vurdering"
        }

    async def submit_complaint_to_datatilsynet(
        self,
        complaint_package: Dict[str, Any],
        attachments: List[Dict] = None
    ) -> Dict[str, Any]:
        """
        Submit complaint to Datatilsynet

        NOTE: This is a placeholder for actual submission.
        In production, this would:
        1. Send email to postkasse@datatilsynet.no
        2. Include all evidence as PDF attachments
        3. Use official letterhead
        4. Request confirmation of receipt
        """

        # In production, integrate with email service
        # For now, return submission details

        return {
            "status": "ready_for_submission",
            "method": "email",
            "recipient": self.datatilsynet_email,
            "subject": f"Klage på GDPR-brudd - {complaint_package['complaint_reference']}",
            "attachments_count": len(attachments) if attachments else 0,
            "estimated_processing_time": "2-4 uker",
            "next_steps": [
                "Datatilsynet bekrefter mottak av klagen",
                "Innledende vurdering gjennomføres (2-4 uker)",
                "Tilsynssak åpnes hvis det er grunnlag",
                "Innklagede gis mulighet til å uttale seg",
                "Datatilsynet fatter vedtak"
            ],
            "user_rights": [
                "Rett til innsyn i saksdokumenter",
                "Rett til å uttale seg underveis",
                "Rett til å klage på vedtak til Personvernnemnda"
            ]
        }
