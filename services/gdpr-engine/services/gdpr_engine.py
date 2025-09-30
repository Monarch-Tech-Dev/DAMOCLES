import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from jinja2 import Environment, FileSystemLoader, Template
import aiohttp
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging

from models.gdpr import GDPRRequest, Violation, ViolationType
from models.user import User
from models.creditor import Creditor
from services.email_service import EmailService
from services.violation_detector import ViolationDetector
from services.blockchain_client import BlockchainClient
from services.event_client import EventClient
from services.template_selector import TemplateSelector
from database import Database

logger = logging.getLogger(__name__)

class GDPREngine:
    def __init__(self, database: Database):
        self.db = database
        self.email_service = EmailService()
        self.violation_detector = ViolationDetector()
        self.blockchain_client = BlockchainClient()
        self.event_client = EventClient()
        self.template_selector = TemplateSelector()

        # Initialize Jinja2 environment
        self.template_env = Environment(
            loader=FileSystemLoader('templates'),
            autoescape=True
        )

        # Legacy GDPR request templates (for fallback)
        self.legacy_templates = {
            'inkasso': 'gdpr_inkasso.html',
            'bnpl': 'gdpr_bnpl.html',
            'bank': 'gdpr_bank.html',
            'default': 'gdpr_default.html'
        }

    async def generate_gdpr_request(
        self,
        user: User,
        creditor: Creditor,
        user_preferences: Optional[Dict[str, Any]] = None
    ) -> GDPRRequest:
        """Generate personalized GDPR request with intelligent template selection"""

        # Prepare user data for template selector
        user_data = {
            'user_email': user.email,
            'creditor_name': creditor.name,
            'creditor_type': creditor.type.lower() if creditor.type else 'default',
            'organization_number': creditor.organization_number
        }

        # Add user preferences if provided
        if user_preferences:
            user_data.update(user_preferences)

        # Use intelligent template selection
        try:
            template_name, template_metadata = self.template_selector.select_template(user_data)
            logger.info(f"Selected template: {template_name} with confidence: {template_metadata['confidence_score']:.2f}")

            # Log template selection details for debugging
            logger.info(f"Template selection metadata: {template_metadata}")

            template = self.template_env.get_template(template_name)
        except Exception as e:
            logger.warning(f"Template selection failed: {e}, falling back to legacy logic")

            # Legacy fallback logic
            template_name = self.legacy_templates.get(
                creditor.type.lower() if creditor.type else 'default',
                self.legacy_templates['default']
            )

            try:
                template = self.template_env.get_template(template_name)
                template_metadata = {'fallback': True, 'confidence_score': 0.5}
            except Exception:
                # Final fallback to default template
                template = self.template_env.get_template(self.legacy_templates['default'])
                template_metadata = {'fallback': True, 'confidence_score': 0.3}
        
        # Generate unique reference ID
        reference_id = self._generate_reference_id(user, creditor)
        
        # Get user's account info with this creditor if available
        account_info = await self._get_user_account_info(user.id, creditor.id)
        
        # Render GDPR request content
        content = template.render(
            user_name=user.name or "Bruker",  # Use "User" if name not available
            user_email=user.email,
            personal_number="***",  # Masked for security
            creditor_name=creditor.name,
            organization_number=creditor.organization_number,
            account_number=account_info.get('account_number', 'Ukjent'),
            date=datetime.now().strftime('%d.%m.%Y'),
            reference_id=reference_id,
            legal_deadline=30,  # GDPR mandated response time
            contact_email=creditor.privacy_email or creditor.name.lower().replace(' ', '') + '@example.com'
        )
        
        # Calculate response due date (30 days from sending)
        response_due = datetime.now() + timedelta(days=30)
        
        # Create GDPR request record
        gdpr_request = await self.db.create_gdpr_request({
            'id': str(uuid.uuid4()),
            'user_id': user.id,
            'creditor_id': creditor.id,
            'reference_id': reference_id,
            'content': content,
            'status': 'PENDING',
            'sent_at': None,
            'response_due': response_due,
            'created_at': datetime.now()
        })
        
        logger.info(f"Generated GDPR request {reference_id} for user {user.id} to creditor {creditor.name}")

        # Record template generation event
        try:
            await self.event_client.record_template_generated(
                case_id=gdpr_request.id,
                user_id=user.id,
                template_type=template_name,
                jurisdiction="NO",
                articles=["Article 15"]
            )
        except Exception as e:
            logger.warning(f"⚠️ Failed to record template generation event: {str(e)}")

        # Create blockchain evidence for legal compliance
        try:
            case_id = gdpr_request.id
            blockchain_evidence = await self.blockchain_client.create_evidence(
                case_id=case_id,
                document_content=content,
                evidence_type="GDPR_REQUEST",
                metadata={
                    "user_id": user.id,
                    "creditor_id": creditor.id,
                    "reference_id": reference_id,
                    "creditor_name": creditor.name,
                    "created_at": datetime.now().isoformat(),
                    "legal_basis": "GDPR Article 15 - Right of Access"
                }
            )

            if blockchain_evidence:
                # Store blockchain reference in GDPR request
                await self.db.update_gdpr_request(gdpr_request.id, {
                    'blockchain_tx_id': blockchain_evidence.get('txId'),
                    'blockchain_content_hash': blockchain_evidence.get('contentHash')
                })
                logger.info(f"🔗 Blockchain evidence created for GDPR request {reference_id}: {blockchain_evidence.get('txId')}")

                # Record DSAR submission event with blockchain reference
                try:
                    await self.event_client.record_dsar_submitted(
                        case_id=gdpr_request.id,
                        user_id=user.id,
                        creditor_id=creditor.id,
                        creditor_name=creditor.name,
                        reference_id=reference_id,
                        blockchain_tx_id=blockchain_evidence.get('txId')
                    )
                except Exception as e:
                    logger.warning(f"⚠️ Failed to record DSAR submission event: {str(e)}")
            else:
                logger.warning(f"⚠️ Failed to create blockchain evidence for GDPR request {reference_id}")

                # Record DSAR submission event without blockchain reference
                try:
                    await self.event_client.record_dsar_submitted(
                        case_id=gdpr_request.id,
                        user_id=user.id,
                        creditor_id=creditor.id,
                        creditor_name=creditor.name,
                        reference_id=reference_id
                    )
                except Exception as e:
                    logger.warning(f"⚠️ Failed to record DSAR submission event: {str(e)}")

        except Exception as e:
            logger.error(f"❌ Error creating blockchain evidence for GDPR request {reference_id}: {str(e)}")

            # Still record DSAR submission event even if blockchain fails
            try:
                await self.event_client.record_dsar_submitted(
                    case_id=gdpr_request.id,
                    user_id=user.id,
                    creditor_id=creditor.id,
                    creditor_name=creditor.name,
                    reference_id=reference_id
                )
            except Exception as e:
                logger.warning(f"⚠️ Failed to record DSAR submission event: {str(e)}")

        return gdpr_request
    
    async def send_gdpr_request(
        self, 
        gdpr_request: GDPRRequest,
        background_tasks=None
    ):
        """Send GDPR request via email with tracking"""
        
        try:
            # Get user and creditor data
            user = await self.db.get_user(gdpr_request.user_id)
            creditor = await self.db.get_creditor(gdpr_request.creditor_id)
            
            if not user or not creditor:
                raise Exception("User or creditor not found")
            
            # Create email
            subject = f"GDPR Article 15 Forespørsel - {gdpr_request.reference_id}"
            
            # Add tracking pixel
            tracking_pixel_url = self._generate_tracking_pixel_url(gdpr_request.id)
            
            # Enhanced email content with tracking
            email_content = f"""
            {gdpr_request.content}
            
            <br><br>
            <img src="{tracking_pixel_url}" width="1" height="1" style="display:none;" />
            
            <p style="font-size: 10px; color: #999;">
            Dette er en automatisk generert forespørsel fra DAMOCLES platform for forbrukerbeskyttelse.
            Referanse: {gdpr_request.reference_id}
            </p>
            """
            
            # Send email
            await self.email_service.send_gdpr_request_email(
                to_email=creditor.privacy_email or f"post@{creditor.name.lower().replace(' ', '')}.no",
                from_email=user.email,
                from_name=user.name or "DAMOCLES Bruker",
                subject=subject,
                content=email_content,
                cc_emails=['post@datatilsynet.no'],  # CC data protection authority
                tracking_id=gdpr_request.id
            )
            
            # Update request status
            await self.db.update_gdpr_request(gdpr_request.id, {
                'status': 'SENT',
                'sent_at': datetime.now()
            })

            # Record request sent event
            try:
                await self.event_client.record_request_sent(
                    case_id=gdpr_request.id,
                    user_id=user.id,
                    creditor_id=creditor.id,
                    delivery_method="email",
                    tracking_info={
                        "recipient_email": creditor.privacy_email or f"post@{creditor.name.lower().replace(' ', '')}.no",
                        "cc_emails": ['post@datatilsynet.no'],
                        "tracking_pixel_url": tracking_pixel_url
                    }
                )
            except Exception as e:
                logger.warning(f"⚠️ Failed to record request sent event: {str(e)}")

            # Schedule follow-up reminder
            if background_tasks:
                background_tasks.add_task(
                    self._schedule_followup_reminder,
                    gdpr_request.id,
                    delay_days=25  # 5 days before deadline
                )

            logger.info(f"Sent GDPR request {gdpr_request.reference_id}")
            
        except Exception as e:
            logger.error(f"Failed to send GDPR request {gdpr_request.id}: {e}")
            
            # Update status to failed
            await self.db.update_gdpr_request(gdpr_request.id, {
                'status': 'FAILED'
            })
            
            raise e
    
    async def process_gdpr_response(
        self,
        request_id: str,
        response_content: bytes,
        response_format: str
    ):
        """Process and analyze GDPR response"""
        
        try:
            gdpr_request = await self.db.get_gdpr_request(request_id)
            if not gdpr_request:
                raise Exception("GDPR request not found")
            
            # Parse response based on format
            if response_format == 'pdf':
                extracted_data = await self._parse_pdf_response(response_content)
            elif response_format == 'email':
                extracted_data = await self._parse_email_response(response_content)
            elif response_format == 'json':
                extracted_data = await self._parse_json_response(response_content)
            else:
                extracted_data = await self._parse_text_response(response_content)
            
            # Store response
            await self.db.create_gdpr_response({
                'id': str(uuid.uuid4()),
                'request_id': request_id,
                'content': response_content,
                'extracted_data': extracted_data,
                'format': response_format,
                'received_at': datetime.now()
            })

            # Record response received event
            try:
                await self.event_client.record_response_received(
                    case_id=request_id,
                    user_id=gdpr_request.user_id,
                    creditor_id=gdpr_request.creditor_id,
                    response_type=response_format,
                    response_data={
                        "format": response_format,
                        "size_bytes": len(response_content),
                        "received_at": datetime.now().isoformat()
                    }
                )
            except Exception as e:
                logger.warning(f"⚠️ Failed to record response received event: {str(e)}")

            # Detect violations using AI
            violations = await self.violation_detector.analyze(extracted_data)
            
            # Store violations and record events
            for violation_data in violations:
                violation_id = str(uuid.uuid4())
                await self.db.create_violation({
                    'id': violation_id,
                    'gdpr_request_id': request_id,
                    'creditor_id': gdpr_request.creditor_id,
                    'type': violation_data.type,
                    'severity': violation_data.severity,
                    'confidence': violation_data.confidence,
                    'evidence': violation_data.evidence,
                    'legal_reference': violation_data.legal_reference,
                    'estimated_damage': violation_data.estimated_damage,
                    'status': 'PENDING',
                    'created_at': datetime.now()
                })

                # Record compliance violation event
                try:
                    await self.event_client.record_compliance_violation(
                        case_id=request_id,
                        user_id=gdpr_request.user_id,
                        creditor_id=gdpr_request.creditor_id,
                        violation_type=violation_data.type,
                        violation_details={
                            "severity": violation_data.severity,
                            "confidence": violation_data.confidence,
                            "evidence": violation_data.evidence,
                            "legal_reference": violation_data.legal_reference,
                            "estimated_damage": violation_data.estimated_damage,
                            "violation_id": violation_id
                        }
                    )
                except Exception as e:
                    logger.warning(f"⚠️ Failed to record compliance violation event: {str(e)}")
            
            # Update request status
            await self.db.update_gdpr_request(request_id, {
                'status': 'RESPONDED',
                'response_received_at': datetime.now()
            })
            
            # If critical violations found, trigger sword mechanism
            critical_violations = [v for v in violations if v.severity == 'critical']
            if critical_violations:
                await self.trigger_sword_protocol(
                    gdpr_request.creditor_id, 
                    violations
                )
            
            logger.info(f"Processed GDPR response for request {request_id}, found {len(violations)} violations")
            
            return violations
            
        except Exception as e:
            logger.error(f"Failed to process GDPR response for request {request_id}: {e}")
            raise e
    
    async def trigger_sword_protocol(
        self,
        creditor_id: str,
        violations: List[Violation]
    ):
        """Trigger sword mechanism for collective action"""
        
        try:
            # Get creditor violation statistics
            stats = await self.db.get_creditor_violation_stats(creditor_id)

            # Smart threshold calculation
            should_trigger = await self._should_trigger_sword_protocol(
                creditor_id, stats, violations
            )

            if should_trigger:
                # Create blockchain evidence entry
                evidence_hash = await self._create_blockchain_evidence(
                    creditor_id, violations
                )
                
                # Notify all affected users
                affected_users = await self.db.get_users_with_creditor_debts(creditor_id)
                
                for user in affected_users:
                    await self.email_service.send_sword_notification(
                        user.email,
                        creditor_id,
                        stats['total_violations']
                    )
                
                # Trigger settlement negotiations
                await self._trigger_mass_settlement_negotiations(
                    creditor_id, affected_users
                )
                
                logger.info(f"Sword protocol triggered for creditor {creditor_id}")
                
        except Exception as e:
            logger.error(f"Failed to trigger sword protocol: {e}")
            raise e
    
    def _generate_reference_id(self, user: User, creditor: Creditor) -> str:
        """Generate unique reference ID for GDPR request"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M')
        user_hash = str(hash(user.id))[-4:]  # Last 4 digits of user hash
        creditor_hash = str(hash(creditor.id))[-4:]  # Last 4 digits of creditor hash
        
        return f"GDPR-{timestamp}-{user_hash}-{creditor_hash}"
    
    def _generate_tracking_pixel_url(self, request_id: str) -> str:
        """Generate tracking pixel URL"""
        base_url = "https://api.damocles.no"  # In production
        return f"{base_url}/tracking/pixel/{request_id}.png"
    
    async def _get_user_account_info(self, user_id: str, creditor_id: str) -> Dict[str, Any]:
        """Get user's account information with specific creditor"""
        debt = await self.db.get_user_debt_with_creditor(user_id, creditor_id)
        
        if debt:
            return {
                'account_number': debt.get('account_number', 'Ukjent'),
                'original_amount': float(debt.get('original_amount', 0)),
                'current_amount': float(debt.get('current_amount', 0))
            }
        
        return {'account_number': 'Ukjent'}
    
    async def _schedule_followup_reminder(self, request_id: str, delay_days: int):
        """Schedule escalating follow-up sequence for GDPR request"""
        await asyncio.sleep(delay_days * 24 * 60 * 60)

        gdpr_request = await self.db.get_gdpr_request(request_id)

        if gdpr_request and gdpr_request.status == 'SENT':
            days_elapsed = (datetime.now() - gdpr_request.sent_at).days
            await self._escalate_non_response(request_id, days_elapsed)

    async def _escalate_non_response(self, request_id: str, days_elapsed: int):
        """Automated escalation sequence for non-responsive creditors"""
        gdpr_request = await self.db.get_gdpr_request(request_id)
        if not gdpr_request:
            return

        user = await self.db.get_user(gdpr_request.user_id)
        creditor = await self.db.get_creditor(gdpr_request.creditor_id)

        if days_elapsed == 25:
            # Day 25: Friendly reminder
            await self.email_service.send_gdpr_reminder_email(
                user.email,
                creditor.name,
                gdpr_request.reference_id,
                gdpr_request.response_due,
                tone="friendly"
            )
            logger.info(f"Sent friendly reminder for request {request_id}")

        elif days_elapsed == 35:
            # Day 35: Formal notice to creditor and Datatilsynet
            await self._notify_datatilsynet(gdpr_request, user, creditor)
            await self.email_service.send_formal_notice_email(
                creditor.privacy_email,
                user,
                gdpr_request.reference_id,
                days_elapsed
            )
            logger.info(f"Escalated to Datatilsynet for request {request_id}")

        elif days_elapsed == 45:
            # Day 45: Initiate legal proceedings
            await self._initiate_legal_proceedings(gdpr_request, user, creditor)
            logger.info(f"Initiated legal proceedings for request {request_id}")

        elif days_elapsed >= 60:
            # Day 60+: Automatic SWORD protocol trigger
            violation = {
                "type": "failure_to_respond",
                "severity": "critical",
                "confidence": 0.95,
                "evidence": f"No response after {days_elapsed} days",
                "legal_reference": "GDPR Article 12(3)",
                "estimated_damage": 500.0
            }
            await self.trigger_sword_protocol(creditor.id, [violation])

    async def _notify_datatilsynet(self, gdpr_request, user, creditor):
        """Notify Norwegian Data Protection Authority"""
        await self.email_service.send_datatilsynet_complaint(
            subject=f"GDPR Violation - No Response from {creditor.name}",
            creditor_info={
                "name": creditor.name,
                "org_number": creditor.organization_number,
                "email": creditor.privacy_email
            },
            request_details={
                "reference_id": gdpr_request.reference_id,
                "sent_date": gdpr_request.sent_at,
                "user_id": user.id,
                "user_email": user.email
            }
        )

    async def _initiate_legal_proceedings(self, gdpr_request, user, creditor):
        """Initiate legal proceedings through forliksrådet (conciliation court)"""
        # Generate documentation package for small claims court
        legal_package = {
            "case_type": "gdpr_non_compliance",
            "damages_claimed": 3000.0,  # Standard GDPR violation fine
            "evidence": {
                "original_request": gdpr_request.content,
                "tracking_data": f"Sent: {gdpr_request.sent_at}",
                "reference_id": gdpr_request.reference_id
            },
            "creditor_info": {
                "name": creditor.name,
                "org_number": creditor.organization_number,
                "address": creditor.address if hasattr(creditor, 'address') else "Unknown"
            }
        }

        # Store legal case record
        await self.db.create_legal_case({
            "gdpr_request_id": gdpr_request.id,
            "case_type": "forliksrad",
            "status": "initiated",
            "claim_amount": 3000.0,
            "evidence_package": legal_package
        })

        # Notify user of legal action
        await self.email_service.send_legal_action_notification(
            user.email,
            creditor.name,
            gdpr_request.reference_id,
            legal_package
        )
    
    async def _parse_pdf_response(self, content: bytes) -> Dict[str, Any]:
        """Parse PDF GDPR response with OCR fallback"""
        try:
            import pdfplumber
            import pytesseract
            from pdf2image import convert_from_bytes
            import io

            # First attempt: Direct text extraction
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                extracted_text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        extracted_text += page_text + "\n"

                # Extract tables separately
                tables = []
                for page in pdf.pages:
                    page_tables = page.extract_tables()
                    if page_tables:
                        tables.extend(page_tables)

            # Fallback: OCR for scanned PDFs
            if len(extracted_text.strip()) < 50:  # Likely scanned PDF
                logger.info("Low text extraction, attempting OCR")
                images = convert_from_bytes(content, dpi=300)
                ocr_text = ""
                for img in images:
                    # Norwegian language OCR
                    page_text = pytesseract.image_to_string(img, lang='nor+eng')
                    ocr_text += page_text + "\n"

                if len(ocr_text.strip()) > len(extracted_text.strip()):
                    extracted_text = ocr_text

            return {
                "format": "pdf",
                "text": extracted_text,
                "tables": tables,
                "page_count": len(pdf.pages) if 'pdf' in locals() else 0,
                "extraction_method": "ocr" if len(extracted_text.strip()) < 50 else "direct"
            }

        except ImportError as e:
            logger.warning(f"PDF processing libraries not available: {e}")
            return {"format": "pdf", "text": "PDF processing not available", "error": str(e)}
        except Exception as e:
            logger.error(f"PDF parsing failed: {e}")
            return {"format": "pdf", "text": "", "error": str(e)}
    
    async def _parse_email_response(self, content: bytes) -> Dict[str, Any]:
        """Parse email GDPR response"""
        return {"format": "email", "text": content.decode('utf-8', errors='ignore')}
    
    async def _parse_json_response(self, content: bytes) -> Dict[str, Any]:
        """Parse JSON GDPR response"""
        import json
        return json.loads(content.decode('utf-8'))
    
    async def _parse_text_response(self, content: bytes) -> Dict[str, Any]:
        """Parse plain text GDPR response"""
        return {"format": "text", "text": content.decode('utf-8', errors='ignore')}
    
    async def _create_blockchain_evidence(
        self, 
        creditor_id: str, 
        violations: List[Violation]
    ) -> str:
        """Create immutable evidence record on blockchain"""
        # This would interact with Cardano smart contracts
        # For now, return a placeholder hash
        evidence_data = {
            'creditor_id': creditor_id,
            'violations': [v.dict() for v in violations],
            'timestamp': datetime.now().isoformat()
        }
        
        # In production, this would:
        # 1. Upload evidence to IPFS
        # 2. Create transaction on Cardano
        # 3. Return transaction hash
        
        return f"blockchain_hash_{uuid.uuid4()}"
    
    async def _trigger_mass_settlement_negotiations(
        self,
        creditor_id: str,
        affected_users: List[User]
    ):
        """Trigger settlement negotiations for all affected users"""
        
        # This would call the settlement service
        settlement_service_url = "http://settlement-service:8003"
        
        async with aiohttp.ClientSession() as session:
            for user in affected_users:
                try:
                    async with session.post(
                        f"{settlement_service_url}/settlements/auto-negotiate",
                        json={
                            'user_id': user.id,
                            'creditor_id': creditor_id,
                            'trigger': 'sword_protocol'
                        }
                    ) as response:
                        if response.status == 200:
                            logger.info(f"Triggered settlement for user {user.id}")
                        
                except Exception as e:
                    logger.error(f"Failed to trigger settlement for user {user.id}: {e}")

    async def _should_trigger_sword_protocol(
        self,
        creditor_id: str,
        stats: Dict[str, Any],
        recent_violations: List[Violation]
    ) -> bool:
        """Smart SWORD protocol activation based on severity-weighted thresholds"""

        # Get recent violations (last 30 days)
        recent_critical = len([v for v in recent_violations if v.severity == 'critical'])
        recent_high = len([v for v in recent_violations if v.severity == 'high'])

        total_critical = stats.get('critical_violations', 0)
        total_high = stats.get('high_violations', 0)
        total_violations = stats.get('total_violations', 0)

        # Severity-weighted activation criteria
        if recent_critical >= 5 or total_critical >= 10:  # Critical violations
            logger.info(f"SWORD triggered: {total_critical} critical violations for creditor {creditor_id}")
            return True

        if recent_high >= 15 or total_high >= 30:  # High severity violations
            logger.info(f"SWORD triggered: {total_high} high-severity violations for creditor {creditor_id}")
            return True

        # Time-based clustering (20+ violations in 7 days)
        if len(recent_violations) >= 20:
            # Check if violations occurred within 7 days
            recent_dates = [v.created_at for v in recent_violations if hasattr(v, 'created_at')]
            if recent_dates and self._check_time_clustering(recent_dates, days=7):
                logger.info(f"SWORD triggered: Time-clustered violations for creditor {creditor_id}")
                return True

        # Pattern matching (same violation type across multiple users)
        if await self._check_violation_patterns(creditor_id, recent_violations):
            logger.info(f"SWORD triggered: Systematic violation pattern for creditor {creditor_id}")
            return True

        # Traditional threshold as fallback
        if total_violations >= 100:
            logger.info(f"SWORD triggered: Traditional threshold ({total_violations} violations) for creditor {creditor_id}")
            return True

        return False

    def _check_time_clustering(self, violation_dates: List[datetime], days: int) -> bool:
        """Check if violations are clustered in time"""
        if len(violation_dates) < 20:
            return False

        violation_dates.sort()
        time_window = timedelta(days=days)

        for i in range(len(violation_dates) - 19):
            if violation_dates[i + 19] - violation_dates[i] <= time_window:
                return True

        return False

    async def _check_violation_patterns(
        self,
        creditor_id: str,
        recent_violations: List[Violation]
    ) -> bool:
        """Check for systematic violation patterns across users"""

        # Group violations by type
        violation_types = {}
        for violation in recent_violations:
            v_type = violation.type if hasattr(violation, 'type') else violation.get('type')
            if v_type not in violation_types:
                violation_types[v_type] = 0
            violation_types[v_type] += 1

        # Check if same violation type affects 10+ different users
        for v_type, count in violation_types.items():
            if count >= 10:
                # Verify it's across different users (would need user_id tracking)
                logger.info(f"Pattern detected: {v_type} violation found {count} times")
                return True

        return False